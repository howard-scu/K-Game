import { describe, it, expect } from 'vitest';
import { computeIndicators } from '../indicators';
import { KLine } from '../types';

const makeCandle = (i: number, close: number): KLine => ({
  date: `2024-01-${String(i + 1).padStart(2, '0')}`,
  open: close,
  high: close + 1,
  low: close - 1,
  close,
  volume: 1000,
});

describe('computeIndicators', () => {
  it('returns all five indicator arrays', () => {
    const candles = Array.from({ length: 60 }, (_, i) => makeCandle(i, 10 + Math.sin(i / 5) * 2));
    const ind = computeIndicators(candles);
    expect(ind.ma5).toHaveLength(60);
    expect(ind.ma20).toHaveLength(60);
    expect(ind.ma60).toHaveLength(60);
    expect(ind.macd).toHaveLength(60);
    expect(ind.kdj).toHaveLength(60);
    expect(ind.atr).toHaveLength(60);
  });

  it('ma5 first 4 values are null', () => {
    const candles = Array.from({ length: 10 }, (_, i) => makeCandle(i, 10));
    const ind = computeIndicators(candles);
    for (let i = 0; i < 4; i++) expect(ind.ma5[i]).toBeNull();
    expect(ind.ma5[4]).not.toBeNull();
  });

  it('ma20 first 19 values are null', () => {
    const candles = Array.from({ length: 30 }, (_, i) => makeCandle(i, 10));
    const ind = computeIndicators(candles);
    for (let i = 0; i < 19; i++) expect(ind.ma20[i]).toBeNull();
    expect(ind.ma20[19]).not.toBeNull();
  });

  it('atr is positive for volatile data', () => {
    const candles = Array.from({ length: 30 }, (_, i) => makeCandle(i, 10 + (i % 2 === 0 ? 5 : -5)));
    const ind = computeIndicators(candles);
    expect(ind.atr[0].atr).toBeGreaterThan(0);
  });
});
