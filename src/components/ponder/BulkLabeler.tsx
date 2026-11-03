'use client';

import { useMemo, useRef, useState } from 'react';
import styles from '@/app/ponder/Ponder.module.css';
import {
  estimateRun,
  FIDELITY,
  LIST_PRICE_PER_MILLION_TOKENS,
  MAX_CONTEXT_LENGTH,
  parseCategories,
  type FidelityId,
  type LabelResult,
} from '@/lib/bulk-label';
import { evaluate } from '@/lib/bulk-metrics';
import { parseCsv, toCsv, type Table } from '@/lib/csv';

/** Limits for one run in the browser. The server has its own limits. */
const MAX_ROWS = 20_000;
const MAX_ESTIMATED_TOKENS = 15_000_000;
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const CHUNK_ROWS = 200;
const PARALLEL_CHUNKS = 2;
const VISIBLE_ROWS = 100;

const SAMPLE_CATEGORIES = [
  'astro-ph: Astrophysics: stars, galaxies, cosmology, planets',
  'cond-mat: Condensed matter physics: materials, solids, quantum matter',
  'cs: Computer science: algorithms, machine learning, vision, systems',
  'hep: High energy physics: particles, quantum field theory, string theory',
  'math: Mathematics: proofs, combinatorics, analysis, algebra',
  'physics: Other physics: optics, fluids, applied and classical physics',
  'quant-ph: Quantum physics: quantum information and computing',
  'stat: Statistics: statistical methods and theory',
].join('\n');

type Phase = 'idle' | 'running' | 'stopped' | 'done';

const percent = (value: number) => `${Math.round(value * 100)}%`;
const dollars = (tokens: number) => {
  const value = (tokens / 1_000_000) * LIST_PRICE_PER_MILLION_TOKENS;
  return value < 0.01 ? 'under $0.01' : `about $${value.toFixed(2)}`;
};

export function BulkLabeler() {
  const [source, setSource] = useState('');
  const [fileName, setFileName] = useState('');
  const [hasHeader, setHasHeader] = useState(true);
  const [textColumn, setTextColumn] = useState(-1);
  const [truthColumn, setTruthColumn] = useState(-1);
  const [categoriesText, setCategoriesText] = useState('');
  const [context, setContext] = useState('');
  const [fidelity, setFidelity] = useState<FidelityId>('balanced');
  const [threshold, setThreshold] = useState(0.7);
  const [phase, setPhase] = useState<Phase>('idle');
  const [results, setResults] = useState<(LabelResult | undefined)[]>([]);
  const [tokens, setTokens] = useState({ input: 0, output: 0 });
  const [retried, setRetried] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [onlyReview, setOnlyReview] = useState(false);
  const stop = useRef(false);
  const startedAt = useRef(0);

  // Read the table from the text of the file. The first line is the header, unless the box is off.
  const table: Table | null = useMemo(() => {
    if (!source.trim()) return null;
    const parsed = parseCsv(source);
    if (parsed.header.length === 0) return null;
    if (hasHeader) return parsed;
    return { ...parsed, header: parsed.header.map((_, index) => `Column ${index + 1}`), rows: [parseCsv(source).header, ...parsed.rows] };
  }, [source, hasHeader]);

  const categories = useMemo(() => parseCategories(categoriesText), [categoriesText]);
  const texts = useMemo(() => (table && textColumn >= 0 ? table.rows.map((row) => row[textColumn] ?? '') : []), [table, textColumn]);
  const batchSize = FIDELITY.find((option) => option.id === fidelity)!.batchSize;
  const estimate = useMemo(
    () => (texts.length > 0 && !categories.error ? estimateRun(texts, categories.categories, context) : null),
    [texts, categories, context],
  );

  const tooManyRows = texts.length > MAX_ROWS;
  const tooBig = Boolean(estimate && estimate.tokens > MAX_ESTIMATED_TOKENS);
  const ready = Boolean(table && textColumn >= 0 && !categories.error && estimate && !tooManyRows && !tooBig && phase !== 'running');
  const doneRows = results.filter(Boolean).length;
  const labelled = results.filter((result): result is LabelResult => Boolean(result));

  const evaluation = useMemo(() => {
    if (!table || truthColumn < 0 || categories.error || labelled.length === 0) return null;
    const predictions = results.map((result) => result ?? { label: null, confidence: 0 });
    return evaluate(predictions, table.rows.map((row) => row[truthColumn] ?? ''), categories.categories.map((category) => category.name));
  }, [table, truthColumn, categories, results, labelled.length]);

  async function readFile(file: File) {
    setError(null);
    if (file.size > MAX_FILE_BYTES) {
      setError('This file is over 25 MB. Use a smaller file.');
      return;
    }
    setFileName(file.name);
    setSource(await file.text());
    setTextColumn(-1);
    setTruthColumn(-1);
    reset();
  }

  async function loadSample() {
    setError(null);
    try {
      const response = await fetch('/samples/arxiv-abstracts.csv');
      const text = await response.text();
      const parsed = parseCsv(text);
      setSource(text);
      setFileName('arxiv-abstracts.csv (120 rows)');
      setHasHeader(true);
      setTextColumn(parsed.header.indexOf('abstract'));
      setTruthColumn(parsed.header.indexOf('field'));
      setCategoriesText(SAMPLE_CATEGORIES);
      setContext('The texts are research paper abstracts.');
      reset();
    } catch {
      setError('Could not load the sample.');
    }
  }

  function reset() {
    setPhase('idle');
    setResults([]);
    setTokens({ input: 0, output: 0 });
    setRetried(0);
    setElapsed(0);
    setOnlyReview(false);
  }

  async function run() {
    if (!ready || !table) return;
    reset();
    setError(null);
    setPhase('running');
    stop.current = false;
    startedAt.current = Date.now();

    const chunks = Array.from({ length: Math.ceil(texts.length / CHUNK_ROWS) }, (_, index) => index * CHUNK_ROWS);
    let next = 0;
    let failedMessage: string | null = null;

    const worker = async () => {
      while (next < chunks.length && !stop.current && !failedMessage) {
        const start = chunks[next];
        next += 1;
        try {
          const response = await fetch('/api/ponder/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rows: texts.slice(start, start + CHUNK_ROWS),
              categories: categories.categories,
              batchSize,
              context,
            }),
          });
          const data = (await response.json()) as { results?: LabelResult[]; retried?: number; usage?: { inputTokens: number; outputTokens: number }; error?: string };
          if (!response.ok || !data.results) throw new Error(data.error ?? 'The run failed.');
          const chunkResults = data.results;
          setResults((list) => {
            const copy = list.slice();
            chunkResults.forEach((result, offset) => { copy[start + offset] = result; });
            return copy;
          });
          setTokens((total) => ({ input: total.input + (data.usage?.inputTokens ?? 0), output: total.output + (data.usage?.outputTokens ?? 0) }));
          setRetried((total) => total + (data.retried ?? 0));
          setElapsed((Date.now() - startedAt.current) / 1000);
        } catch (problem) {
          failedMessage = problem instanceof Error ? problem.message : 'The run failed.';
        }
      }
    };

    await Promise.all(Array.from({ length: PARALLEL_CHUNKS }, worker));
    setElapsed((Date.now() - startedAt.current) / 1000);
    if (failedMessage) setError(failedMessage);
    setPhase(stop.current || failedMessage ? 'stopped' : 'done');
  }

  function download() {
    if (!table) return;
    const header = [...table.header, 'jev_label', 'jev_confidence', 'jev_top3', 'jev_needs_review'];
    const rows = table.rows.map((row, index) => {
      const result = results[index];
      if (!result) return [...row, '', '', '', ''];
      const top = result.top.map((entry) => `${entry.name}:${entry.p.toFixed(2)}`).join(' | ');
      return [...row, result.label ?? '', result.label ? result.confidence.toFixed(3) : '', top, !result.label || result.confidence < threshold ? 'yes' : 'no'];
    });
    const blob = new Blob([toCsv(header, rows)], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName.replace(/\.[^.]+$/, '') || 'labels'}-jev.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  const reviewCount = labelled.filter((result) => !result.label || result.confidence < threshold).length;
  const rowsToShow = useMemo(() => {
    const list: { index: number; result: LabelResult }[] = [];
    for (let index = 0; index < results.length && list.length < VISIBLE_ROWS; index += 1) {
      const result = results[index];
      if (!result) continue;
      if (onlyReview && result.label && result.confidence >= threshold) continue;
      list.push({ index, result });
    }
    return list;
  }, [results, onlyReview, threshold]);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Ponder 03</p>
          <h1>Bulk Labeler.</h1>
        </div>
        <div className={styles.heroAside}>
          <p>Upload a spreadsheet. Choose your categories. Jev labels every row, and tells you how sure it is.</p>
          <p>Add a column of true labels, and the page also measures how accurate Jev was.</p>
        </div>
      </section>

      <section className={styles.blBoard}>
        {/* 1. Data */}
        <div className={styles.blStep}>
          <h2><span>1</span>Your data</h2>
          <div className={styles.blRow}>
            <label className={styles.blFile}>
              <input type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" onChange={(event) => { const file = event.target.files?.[0]; if (file) void readFile(file); }} />
              <span>Choose a CSV file</span>
            </label>
            <button className={styles.blGhost} type="button" onClick={() => void loadSample()} disabled={phase === 'running'}>Use a sample: 120 arXiv abstracts</button>
          </div>
          {fileName && <p className={styles.fieldHelp}>{fileName}: {table ? `${table.rows.length.toLocaleString()} rows, ${table.header.length} columns.` : 'no data found.'}</p>}
          {table && (
            <>
              <label className={styles.toggle}>
                <input type="checkbox" checked={hasHeader} onChange={(event) => { setHasHeader(event.target.checked); setTextColumn(-1); setTruthColumn(-1); reset(); }} />
                <span>The first row is a header</span>
              </label>
              <div className={styles.blGrid}>
                <div className={styles.blField}>
                  <label className={styles.fieldLabel} htmlFor="text-column">Column to label</label>
                  <select id="text-column" className={styles.blSelect} value={textColumn} onChange={(event) => { setTextColumn(Number(event.target.value)); reset(); }}>
                    <option value={-1}>Choose a column</option>
                    {table.header.map((name, index) => <option key={index} value={index}>{name || `Column ${index + 1}`}</option>)}
                  </select>
                </div>
                <div className={styles.blField}>
                  <label className={styles.fieldLabel} htmlFor="truth-column">True labels (optional)</label>
                  <select id="truth-column" className={styles.blSelect} value={truthColumn} onChange={(event) => setTruthColumn(Number(event.target.value))}>
                    <option value={-1}>None</option>
                    {table.header.map((name, index) => <option key={index} value={index}>{name || `Column ${index + 1}`}</option>)}
                  </select>
                </div>
              </div>
              {textColumn >= 0 && <p className={styles.blSample}>“{(texts[0] ?? '').slice(0, 160)}{(texts[0] ?? '').length > 160 ? '…' : ''}”</p>}
            </>
          )}
        </div>

        {/* 2. Categories */}
        <div className={styles.blStep}>
          <h2><span>2</span>Your categories</h2>
          <label className={styles.fieldLabel} htmlFor="categories">One category on each line. Add a description after a colon.</label>
          <textarea
            id="categories"
            className={styles.scramble}
            value={categoriesText}
            onChange={(event) => { setCategoriesText(event.target.value); reset(); }}
            rows={6}
            spellCheck={false}
            placeholder={'billing: payments, invoices, refunds\ntechnical: bugs and outages\nsales: pricing questions'}
          />
          <p className={categoriesText && categories.error ? styles.fieldError : styles.fieldHelp}>
            {categoriesText ? categories.error ?? `${categories.categories.length} categories.` : 'A short description helps Jev when two categories sound alike.'}
          </p>
          <div className={styles.blField}>
            <label className={styles.fieldLabel} htmlFor="context">What are the rows? (optional)</label>
            <input id="context" className={styles.wlInput} value={context} maxLength={MAX_CONTEXT_LENGTH} onChange={(event) => setContext(event.target.value)} placeholder="For example: The texts are customer support emails." />
          </div>
        </div>

        {/* 3. Settings */}
        <div className={styles.blStep}>
          <h2><span>3</span>Speed and care</h2>
          <div className={styles.tabs} role="radiogroup" aria-label="Speed and care">
            {FIDELITY.map((option) => (
              <button key={option.id} type="button" role="radio" aria-checked={fidelity === option.id} className={fidelity === option.id ? styles.tabActive : styles.tab} onClick={() => setFidelity(option.id)} disabled={phase === 'running'}>
                {option.label}<span>{option.batchSize} rows in a request</span>
              </button>
            ))}
          </div>
          <p className={styles.fieldHelp}>{FIDELITY.find((option) => option.id === fidelity)!.note} A test on 120 real abstracts found that more rows in a request give slightly different answers.</p>
        </div>

        {/* 4. Run */}
        <div className={styles.blStep}>
          <h2><span>4</span>Run</h2>
          {estimate && (
            <p className={tooManyRows || tooBig ? styles.fieldError : styles.fieldHelp}>
              {estimate.rows.toLocaleString()} rows and about {Math.round(estimate.tokens / 1000).toLocaleString()} thousand input tokens. Estimated cost: {dollars(estimate.tokens)}, at the list price of ${LIST_PRICE_PER_MILLION_TOKENS} for a million tokens.
              {tooManyRows && ` Use at most ${MAX_ROWS.toLocaleString()} rows in one run.`}
              {tooBig && ' This run is too large. Use fewer rows or fewer categories.'}
            </p>
          )}
          <div className={styles.blRow}>
            {phase === 'running' ? (
              <button className={styles.blStop} type="button" onClick={() => { stop.current = true; }}>Stop</button>
            ) : (
              <button className={styles.solveButton} type="button" onClick={() => void run()} disabled={!ready}>Label the rows</button>
            )}
          </div>
          {error && <p className={styles.fieldError} role="alert">{error}</p>}
        </div>
      </section>

      {(phase !== 'idle') && (
        <section className={styles.blResults} aria-live="polite">
          <div className={styles.blProgress}>
            <div className={styles.bar}><span style={{ width: `${texts.length ? (doneRows / texts.length) * 100 : 0}%` }} /></div>
            <p className={styles.fieldHelp}>
              {phase === 'running' ? 'Jev is labeling: ' : phase === 'stopped' ? 'Stopped: ' : 'Done: '}
              {doneRows.toLocaleString()} of {texts.length.toLocaleString()} rows
              {elapsed > 0 && `, ${(doneRows / elapsed).toFixed(0)} rows a second`}.
              {' '}Jev reported {tokens.input.toLocaleString()} input tokens. That is {dollars(tokens.input)} at the list price. Check your TypeSafe billing page for the real amount.
              {retried > 0 && ` ${retried} rows needed a second request.`}
            </p>
          </div>

          {labelled.length > 0 && (
            <>
              <div className={styles.blSummary}>
                <div><span>Labeled</span><strong>{labelled.length.toLocaleString()}</strong></div>
                <div><span>Needs review</span><strong>{reviewCount.toLocaleString()}</strong></div>
                <div>
                  <span>Confidence limit</span>
                  <input type="range" min={0.3} max={0.99} step={0.01} value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} aria-label="Confidence limit for review" />
                  <em>{percent(threshold)}</em>
                </div>
                <button className={styles.blGhost} type="button" onClick={download}>Download CSV</button>
              </div>

              {evaluation && evaluation.evaluated > 0 && (
                <div className={styles.blEval}>
                  <h3>Accuracy check</h3>
                  <p className={styles.blBig}>{percent(evaluation.accuracy)} <small>{evaluation.correct} of {evaluation.evaluated} rows match your true labels{evaluation.skipped > 0 ? `. ${evaluation.skipped} rows were left out: no label, or a true label that is not in your categories` : ''}.</small></p>
                  <p className={styles.fieldHelp}>
                    Jev&apos;s confidence was {Math.abs(Math.round(evaluation.overconfidence * 100))} points {evaluation.overconfidence > 0.02 ? 'above' : evaluation.overconfidence < -0.02 ? 'below' : 'close to'}
                    {Math.abs(evaluation.overconfidence) > 0.02 ? ' its accuracy on average' : ' its accuracy'}. {evaluation.overconfidence > 0.02 ? 'Treat high confidence with care.' : ''}
                  </p>

                  <div className={styles.blTables}>
                    <div>
                      <h4>Keep only the sure rows</h4>
                      <table className={styles.blTable}>
                        <thead><tr><th>Confidence</th><th>Rows kept</th><th>Accuracy</th></tr></thead>
                        <tbody>
                          {evaluation.curve.filter((point) => point.rows > 0).map((point) => (
                            <tr key={point.threshold}><td>{point.threshold === 0 ? 'All rows' : `${percent(point.threshold)} or more`}</td><td>{percent(point.coverage)}</td><td>{percent(point.accuracy)}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <h4>Is the confidence honest?</h4>
                      <table className={styles.blTable}>
                        <thead><tr><th>Jev said</th><th>Rows</th><th>Right</th></tr></thead>
                        <tbody>
                          {evaluation.calibration.map((bin) => (
                            <tr key={bin.from}><td>{percent(bin.from)} to {percent(bin.to)}</td><td>{bin.count}</td><td>{percent(bin.accuracy)}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {evaluation.confusions.length > 0 && (
                    <>
                      <h4>Most common mistakes</h4>
                      <ul className={styles.blMistakes}>
                        {evaluation.confusions.map((mistake) => (
                          <li key={`${mistake.truth}-${mistake.predicted}`}><code>{mistake.truth}</code> labeled as <code>{mistake.predicted}</code><span>{mistake.count} {mistake.count === 1 ? 'row' : 'rows'}</span></li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              <div className={styles.blListHead}>
                <h3>Rows</h3>
                <label className={styles.toggle}>
                  <input type="checkbox" checked={onlyReview} onChange={(event) => setOnlyReview(event.target.checked)} />
                  <span>Show only rows that need review</span>
                </label>
              </div>
              <ol className={styles.blRows}>
                {rowsToShow.map(({ index, result }) => {
                  const review = !result.label || result.confidence < threshold;
                  return (
                    <li key={index} className={review ? styles.blReview : undefined}>
                      <span className={styles.blText}>{(texts[index] ?? '').slice(0, 140)}</span>
                      <code className={styles.blLabel}>{result.label ?? 'no answer'}</code>
                      <span className={styles.blConfidence}>{result.label ? percent(result.confidence) : '–'}</span>
                    </li>
                  );
                })}
              </ol>
              <p className={styles.fieldHelp}>Showing the first {rowsToShow.length} rows. The download has every row.</p>
            </>
          )}
        </section>
      )}
    </main>
  );
}
