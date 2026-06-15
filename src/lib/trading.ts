import { Position, TradeAction } from './types';

export interface BuyResult {
  shares: number;
  usedCash: number;
  positionsAfter: Position[];
  action: TradeAction;
}

export function buy(
  cash: number,
  positions: Position[],
  price: number,
  fraction: number,
  index: number,
): BuyResult {
  const f = Math.min(fraction, 1);
  const shares = Math.floor((cash * f) / price);
  const actualUsed = shares * price;
  return {
    shares,
    usedCash: actualUsed,
    positionsAfter: [...positions, { buyPrice: price, shares }],
    action: {
      type: 'buy',
      index,
      price,
      shares,
      cashAfter: cash - actualUsed,
      sharesAfter: positions.reduce((s, p) => s + p.shares, 0) + shares,
    },
  };
}

export interface SellResult {
  shares: number;
  revenue: number;
  positionsAfter: Position[];
  action: TradeAction;
}

export function sell(
  cash: number,
  positions: Position[],
  price: number,
  fraction: number,
  index: number,
): SellResult {
  const totalShares = positions.reduce((s, p) => s + p.shares, 0);
  const shares = Math.floor(totalShares * fraction);
  const revenue = shares * price;
  return {
    shares,
    revenue,
    positionsAfter: removeSharesFromPositions(positions, shares),
    action: {
      type: 'sell',
      index,
      price,
      shares,
      cashAfter: cash + revenue,
      sharesAfter: totalShares - shares,
    },
  };
}

export function addPosition(positions: Position[], price: number, shares: number): Position[] {
  return [...positions, { buyPrice: price, shares }];
}

export function reducePosition(positions: Position[], index: number, shares: number): Position[] {
  const updated = [...positions];
  const p = updated[index];
  if (p.shares <= shares) {
    updated.splice(index, 1);
  } else {
    updated[index] = { ...p, shares: p.shares - shares };
  }
  return updated;
}

function removeSharesFromPositions(positions: Position[], sharesToRemove: number): Position[] {
  const result: Position[] = [];
  let remaining = sharesToRemove;
  for (const p of positions) {
    if (remaining <= 0) { result.push(p); continue; }
    if (p.shares <= remaining) {
      remaining -= p.shares;
    } else {
      result.push({ buyPrice: p.buyPrice, shares: p.shares - remaining });
      remaining = 0;
    }
  }
  return result;
}
