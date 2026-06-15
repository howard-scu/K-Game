import { describe, it, expect } from 'vitest';
import { detectFormat, parseCSV, pickRandomSegment } from '../parser';

const ETF_CSV = `date,open,close,high,low,volume,amount
2019-01-02,0.443,0.425,0.445,0.425,225,67812.0
2019-01-03,0.425,0.413,0.441,0.413,2188,649178.0`;

const STOCK_CSV = `,date,open,high,low,close,volume,amount
0,2022-01-04,12.72,13.59,12.57,12.62,36463709.0,674638763.0
1,2022-01-05,12.6,12.62,12.05,12.06,23865319.0,411555098.0`;

describe('detectFormat', () => {
  it('detects ETF format', () => {
    expect(detectFormat(ETF_CSV.split('\n')[0])).toBe('etf');
  });

  it('detects stock format', () => {
    expect(detectFormat(STOCK_CSV.split('\n')[0])).toBe('stock');
  });
});

describe('parseCSV', () => {
  it('parses ETF CSV correctly (note: open→close→high→low order)', () => {
    const result = parseCSV(ETF_CSV);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      date: '2019-01-02',
      open: 0.443,
      close: 0.425,
      high: 0.445,
      low: 0.425,
      volume: 225,
    });
  });

  it('parses stock CSV correctly (open→high→low→close order)', () => {
    const result = parseCSV(STOCK_CSV);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      date: '2022-01-04',
      open: 12.72,
      high: 13.59,
      low: 12.57,
      close: 12.62,
      volume: 36463709,
    });
  });
});

describe('parseCSV error handling', () => {
  it('throws on unknown CSV format', () => {
    expect(() => detectFormat('foo,bar,baz')).toThrow('Unknown CSV format');
  });

  it('throws on non-numeric value', () => {
    const badCsv = 'date,open,close,high,low,volume\n2024-01-01,abc,0.5,0.6,0.4,100';
    expect(() => parseCSV(badCsv)).toThrow('Invalid numeric value');
  });
});

describe('pickRandomSegment', () => {
  const data = [
    { date: '2024-01-01', open: 1, high: 2, low: 0, close: 1.5, volume: 100 },
    { date: '2024-01-02', open: 1, high: 2, low: 0, close: 1.5, volume: 100 },
    { date: '2024-01-03', open: 1, high: 2, low: 0, close: 1.5, volume: 100 },
    { date: '2024-01-04', open: 1, high: 2, low: 0, close: 1.5, volume: 100 },
    { date: '2024-01-05', open: 1, high: 2, low: 0, close: 1.5, volume: 100 },
  ];

  it('returns exact length when enough data', () => {
    const seg = pickRandomSegment(data, 3);
    expect(seg).toHaveLength(3);
  });

  it('returns all data when segment > data length', () => {
    const seg = pickRandomSegment(data, 10);
    expect(seg).toHaveLength(5);
  });

  it('returns contiguous slice', () => {
    for (let i = 0; i < 10; i++) {
      const seg = pickRandomSegment(data, 3);
      for (let j = 1; j < seg.length; j++) {
        const cur = new Date(seg[j].date);
        const prev = new Date(seg[j - 1].date);
        expect(cur.getTime() - prev.getTime()).toBe(86400000);
      }
    }
  });
});
