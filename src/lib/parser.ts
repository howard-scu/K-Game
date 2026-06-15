import { KLine } from './types';

export function detectFormat(header: string): 'etf' | 'stock' {
  const cols = header.split(',');
  if (cols[0] === 'date' && cols[1] === 'open' && cols[2] === 'close') return 'etf';
  if (cols[0] === '' && cols[1] === 'date') return 'stock';
  throw new Error(`Unknown CSV format: ${header}`);
}

export function parseCSV(content: string): KLine[] {
  const lines = content.trim().split('\n');
  const format = detectFormat(lines[0]);
  const result: KLine[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 6) continue;

    if (format === 'etf') {
      result.push({
        date: cols[0],
        open: parseFloat(cols[1]),
        close: parseFloat(cols[2]),
        high: parseFloat(cols[3]),
        low: parseFloat(cols[4]),
        volume: parseFloat(cols[5]),
      });
    } else {
      result.push({
        date: cols[1],
        open: parseFloat(cols[2]),
        high: parseFloat(cols[3]),
        low: parseFloat(cols[4]),
        close: parseFloat(cols[5]),
        volume: parseFloat(cols[6]),
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
