import { Fragment, type ReactNode } from 'react';
import styles from '@/app/writing/Writing.module.css';

function inlineFormat(text: string) {
  const parts = text.split(/(\*\*.+?\*\*|\+\+.+?\+\+|_.+?_)/g).filter(Boolean);
  return parts.map((part, index): ReactNode => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('++') && part.endsWith('++')) return <u key={index}>{part.slice(2, -2)}</u>;
    if (part.startsWith('_') && part.endsWith('_')) return <em key={index}>{part.slice(1, -1)}</em>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export function WritingBody({ body }: { body: string }) {
  const normalizedBody = body
    .replace(/_([^_]*\n[^_]*?)_/g, (_, value: string) => value.split('\n').map((line) => `_${line}_`).join('\n'))
    .replace(/\*\*([^*]*\n[^*]*?)\*\*/g, (_, value: string) => value.split('\n').map((line) => `**${line}**`).join('\n'))
    .replace(/\+\+([^+]*\n[^+]*?)\+\+/g, (_, value: string) => value.split('\n').map((line) => `++${line}++`).join('\n'));
  const lines = normalizedBody.split('\n');
  const content: ReactNode[] = [];
  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const value = inlineFormat(heading[2]);
      content.push(heading[1].length === 1 ? <h2 key={index}>{value}</h2> : heading[1].length === 2 ? <h3 key={index}>{value}</h3> : <h4 key={index}>{value}</h4>);
      index += 1;
      continue;
    }
    if (/^-\s+/.test(line)) {
      const items: ReactNode[] = [];
      while (index < lines.length && /^-\s+/.test(lines[index])) { items.push(<li key={index}>{inlineFormat(lines[index].replace(/^-\s+/, ''))}</li>); index += 1; }
      content.push(<ul key={`ul-${index}`}>{items}</ul>);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const start = Number(line.match(/^(\d+)\./)?.[1] || 1);
      const items: ReactNode[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) { items.push(<li key={index}>{inlineFormat(lines[index].replace(/^\d+\.\s+/, ''))}</li>); index += 1; }
      content.push(<ol key={`ol-${index}`} start={start}>{items}</ol>);
      continue;
    }
    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !/^(#{1,3})\s+|^-\s+|^\d+\.\s+/.test(lines[index])) { paragraph.push(lines[index]); index += 1; }
    content.push(<p key={`p-${index}`}>{paragraph.map((value, lineIndex) => <Fragment key={lineIndex}>{lineIndex > 0 && <br />}{inlineFormat(value)}</Fragment>)}</p>);
  }
  return <div className={styles.articleBody}>{content}</div>;
}
