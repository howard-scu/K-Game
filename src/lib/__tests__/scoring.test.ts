import { describe, it, expect } from 'vitest';
import { calcScore } from '../scoring';
import { TradeAction, KLine } from '../types';

const candles: KLine[] = Array.from({ length: 30 }, (_, i) => ({
  date: `2024-01-${String(i + 1).padStart(2, '0')}`,
  open: 10 + i * 0.1,
  high: 10 + i * 0.1 + 0.5,
  low: 10 + i * 0.1 - 0.5,
  close: 10 + i * 0.1,
  volume: 1000,
}));

const actions: TradeAction[] = [
  { type: 'buy', index: 0, price: 10, shares: 5000, cashAfter: 50000, sharesAfter: 5000 },
  { type: 'sell', index: 15, price: 11.5, shares: 5000, cashAfter: 107500, sharesAfter: 0 },
];

describe('calcScore', () => {
  it('computes positive total return on profitable trades', () => {
    const score = calcScore(candles, candles, actions, 100000, 15, []);
    expect(score.totalReturn).toBeGreaterThan(0);
  });

  it('grade is a valid grade', () => {
    const score = calcScore(candles, candles, actions, 100000, 15, []);
    expect(['S', 'A', 'B', 'C', 'D']).toContain(score.grade);
  });

  it('benchmark return matches candles', () => {
    const score = calcScore(candles, candles, actions, 100000, 15, []);
    expect(score.benchmarkReturn).toBeCloseTo(((11.5 - 10) / 10) * 100, 1);
  });

  it('includes all score fields', () => {
    const score = calcScore(candles, candles, actions, 100000, 15, []);
    expect(score).toHaveProperty('totalReturn');
    expect(score).toHaveProperty('benchmarkReturn');
    expect(score).toHaveProperty('vsBenchmark');
    expect(score).toHaveProperty('winRate');
    expect(score).toHaveProperty('profitLossRatio');
    expect(score).toHaveProperty('maxDrawdown');
    expect(score).toHaveProperty('overall');
    expect(score).toHaveProperty('grade');
  });
});
