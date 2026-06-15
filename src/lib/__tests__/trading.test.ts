import { describe, it, expect } from 'vitest';
import { buy, sell, addPosition, reducePosition } from '../trading';
import { Position } from '../types';

const EMPTY_POSITIONS: Position[] = [];

describe('buy', () => {
  it('buys with a fraction of available cash', () => {
    const result = buy(100000, EMPTY_POSITIONS, 12.5, 0.5, 0);
    expect(result.usedCash).toBeCloseTo(50000, 1);
    expect(result.shares).toBeCloseTo(4000, 0);
    expect(result.action.type).toBe('buy');
  });

  it('buys max shares with full cash', () => {
    const result = buy(100000, EMPTY_POSITIONS, 10, 1, 0);
    expect(result.shares).toBe(10000);
  });

  it('rounds down to whole shares', () => {
    const result = buy(1000, EMPTY_POSITIONS, 3, 1, 0);
    expect(result.shares).toBe(333);
    expect(result.usedCash).toBe(999);
  });
});

describe('sell', () => {
  it('sells a fraction of holdings', () => {
    const positions: Position[] = [{ buyPrice: 10, shares: 1000 }];
    const result = sell(50000, positions, 12, 0.5, 0);
    expect(result.shares).toBe(500);
    expect(result.revenue).toBe(6000);
  });

  it('sells all when fraction is 1', () => {
    const positions: Position[] = [{ buyPrice: 10, shares: 1000 }];
    const result = sell(50000, positions, 12, 1, 0);
    expect(result.shares).toBe(1000);
    expect(result.positionsAfter).toHaveLength(0);
  });

  it('removes from FIFO across multiple positions', () => {
    const positions: Position[] = [
      { buyPrice: 10, shares: 500 },
      { buyPrice: 12, shares: 500 },
    ];
    const result = sell(50000, positions, 15, 0.6, 0);
    expect(result.shares).toBe(600);
    expect(result.positionsAfter).toHaveLength(1);
    expect(result.positionsAfter[0].buyPrice).toBe(12);
    expect(result.positionsAfter[0].shares).toBe(400);
  });
});

describe('addPosition', () => {
  it('appends a new position', () => {
    const positions: Position[] = [{ buyPrice: 10, shares: 1000 }];
    const result = addPosition(positions, 12, 500);
    expect(result).toHaveLength(2);
  });
});

describe('reducePosition', () => {
  it('removes position when selling all shares', () => {
    const positions: Position[] = [{ buyPrice: 10, shares: 1000 }, { buyPrice: 12, shares: 500 }];
    const result = reducePosition(positions, 0, 1000);
    expect(result).toHaveLength(1);
    expect(result[0].shares).toBe(500);
  });
});
