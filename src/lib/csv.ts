/**
 * A small CSV reader and writer. It handles quoted fields, doubled quotes, line breaks inside
 * quotes, a byte order mark, and comma, tab, or semicolon separators.
 */

export interface Table {
  header: string[];
  rows: string[][];
  delimiter: string;
}

const DELIMITERS = [',', '\t', ';'];

/** Pick the separator that appears most often in the first line, outside quotes. */
export function detectDelimiter(text: string): string {
  const counts = new Map(DELIMITERS.map((delimiter) => [delimiter, 0]));
  let inQuotes = false;
  for (const char of text) {
    if (char === '"') inQuotes = !inQuotes;
    else if (!inQuotes && (char === '\n' || char === '\r')) break;
    else if (!inQuotes && counts.has(char)) counts.set(char, (counts.get(char) ?? 0) + 1);
  }
  const [best, count] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return count > 0 ? best : ',';
}

export function parseCsv(input: string): Table {
  const text = input.replace(/^﻿/, '');
  const delimiter = detectDelimiter(text);
  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let inQuotes = false;

  const endField = () => {
    record.push(field);
    field = '';
  };
  const endRecord = () => {
    endField();
    // Skip blank lines.
    if (!(record.length === 1 && record[0] === '')) records.push(record);
    record = [];
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"' && field === '') {
      inQuotes = true;
    } else if (char === delimiter) {
      endField();
    } else if (char === '\n') {
      endRecord();
    } else if (char === '\r') {
      if (text[index + 1] === '\n') index += 1;
      endRecord();
    } else {
      field += char;
    }
  }
  if (field !== '' || record.length > 0) endRecord();

  if (records.length === 0) return { header: [], rows: [], delimiter };
  const [header, ...rows] = records;
  const width = header.length;
  return {
    header: header.map((name) => name.trim()),
    rows: rows.map((row) => Array.from({ length: width }, (_, column) => row[column] ?? '')),
    delimiter,
  };
}

/** Quote a field when it holds a comma, a quote, or a line break. */
const quote = (value: string) => (/[",\n\r\t;]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export function toCsv(header: readonly string[], rows: readonly (readonly string[])[]): string {
  return [header, ...rows].map((row) => row.map(quote).join(',')).join('\r\n');
}
