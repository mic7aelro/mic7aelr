/**
 * Accuracy measures for a labeled run. A run that has a column of true labels gets a check of
 * its own: accuracy, a calibration table, and a table of coverage against accuracy.
 */

export interface Prediction {
  label: string | null;
  confidence: number;
}

export interface CalibrationBin {
  /** Lower edge of the confidence range. */
  from: number;
  to: number;
  count: number;
  meanConfidence: number;
  accuracy: number;
}

export interface CurvePoint {
  threshold: number;
  /** Share of rows with confidence at or above the threshold. */
  coverage: number;
  accuracy: number;
  rows: number;
}

export interface Evaluation {
  /** Rows with a usable prediction and a true label. */
  evaluated: number;
  correct: number;
  accuracy: number;
  /** Rows left out: no prediction, or a true label that is not one of the categories. */
  skipped: number;
  calibration: CalibrationBin[];
  curve: CurvePoint[];
  /** The most common mistakes. */
  confusions: { truth: string; predicted: string; count: number }[];
  /** Mean confidence minus accuracy. A positive number means that Jev is overconfident. */
  overconfidence: number;
}

const normalize = (value: string) => value.trim().toLowerCase();
export const CURVE_THRESHOLDS = [0, 0.5, 0.7, 0.8, 0.9, 0.95];
const BIN_EDGES = [0, 0.2, 0.4, 0.6, 0.8, 1];

export function evaluate(predictions: readonly Prediction[], truths: readonly string[], categories: readonly string[]): Evaluation {
  const known = new Map(categories.map((name) => [normalize(name), name]));
  const rows: { predicted: string; truth: string; confidence: number; right: boolean }[] = [];
  let skipped = 0;

  predictions.forEach((prediction, index) => {
    const truth = known.get(normalize(truths[index] ?? ''));
    if (!prediction.label || !truth) {
      skipped += 1;
      return;
    }
    rows.push({ predicted: prediction.label, truth, confidence: prediction.confidence, right: normalize(prediction.label) === normalize(truth) });
  });

  const correct = rows.filter((row) => row.right).length;
  const accuracy = rows.length > 0 ? correct / rows.length : 0;

  const calibration: CalibrationBin[] = [];
  for (let index = 0; index < BIN_EDGES.length - 1; index += 1) {
    const from = BIN_EDGES[index];
    const to = BIN_EDGES[index + 1];
    const inBin = rows.filter((row) => row.confidence >= from && (row.confidence < to || (to === 1 && row.confidence <= 1)));
    if (inBin.length === 0) continue;
    calibration.push({
      from,
      to,
      count: inBin.length,
      meanConfidence: inBin.reduce((sum, row) => sum + row.confidence, 0) / inBin.length,
      accuracy: inBin.filter((row) => row.right).length / inBin.length,
    });
  }

  const curve: CurvePoint[] = CURVE_THRESHOLDS.map((threshold) => {
    const kept = rows.filter((row) => row.confidence >= threshold);
    return {
      threshold,
      rows: kept.length,
      coverage: rows.length > 0 ? kept.length / rows.length : 0,
      accuracy: kept.length > 0 ? kept.filter((row) => row.right).length / kept.length : 0,
    };
  });

  const mistakes = new Map<string, { truth: string; predicted: string; count: number }>();
  for (const row of rows) {
    if (row.right) continue;
    const key = `${row.truth}\u0000${row.predicted}`;
    const entry = mistakes.get(key) ?? { truth: row.truth, predicted: row.predicted, count: 0 };
    entry.count += 1;
    mistakes.set(key, entry);
  }

  const meanConfidence = rows.length > 0 ? rows.reduce((sum, row) => sum + row.confidence, 0) / rows.length : 0;

  return {
    evaluated: rows.length,
    correct,
    accuracy,
    skipped,
    calibration,
    curve,
    confusions: [...mistakes.values()].sort((a, b) => b.count - a.count).slice(0, 8),
    overconfidence: meanConfidence - accuracy,
  };
}
