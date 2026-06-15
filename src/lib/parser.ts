import { KLine } from './types';

export function detectFormat(header: string): 'etf' | 'stock' {
  const cols = header.split(',');
  if (cols[0] === 'date' && cols[1] === 'open' && cols[2] === 'close') return 'etf';
  if (cols[0] === '' && cols[1] === 'date') return 'stock';
  throw new Error(`Unknown CSV format: ${header}`);
}

function toNum(v: string): number {
  const n = parseFloat(v);
  if (isNaN(n)) throw new Error(`Invalid numeric value: "${v}"`);
  return n;
}

export function parseCSV(content: string): KLine[] {
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  const lines = content.trim().split('\n');
  const format = detectFormat(lines[0]);
  const result: KLine[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 6) continue;

    if (format === 'etf') {
      result.push({
        date: cols[0],
        open: toNum(cols[1]),
        close: toNum(cols[2]),
        high: toNum(cols[3]),
        low: toNum(cols[4]),
        volume: toNum(cols[5]),
      });
    } else {
      result.push({
        date: cols[1],
        open: toNum(cols[2]),
        high: toNum(cols[3]),
        low: toNum(cols[4]),
        close: toNum(cols[5]),
        volume: toNum(cols[6]),
      });
    }
  }

  return result;
}

export function pickRandomSegment(candles: KLine[], length: number): KLine[] {
  if (candles.length <= length) return [...candles];
  const start = Math.floor(Math.random() * (candles.length - length));
  return candles.slice(start, start + length);
}
