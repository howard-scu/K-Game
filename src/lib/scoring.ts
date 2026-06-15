import { KLine, TradeAction, Position, Score } from './types';

export function calcScore(
  candles: KLine[],
  benchmarkCandles: KLine[],
  history: TradeAction[],
  initialCash: number,
  currentIndex: number,
  positions: Position[],
): Score {
  const finalAssetValue = calcFinalAsset(candles, history, initialCash, currentIndex, positions);
  const totalReturn = ((finalAssetValue - initialCash) / initialCash) * 100;

  const benchmarkStart = benchmarkCandles[0]?.close ?? 1;
  const benchmarkEnd = benchmarkCandles[currentIndex]?.close ?? benchmarkStart;
  const benchmarkReturn = ((benchmarkEnd - benchmarkStart) / benchmarkStart) * 100;
  const vsBenchmark = totalReturn - benchmarkReturn;

  const winRate = calcWinRate(history);
  const profitLossRatio = calcProfitLossRatio(history);
  const maxDrawdown = calcMaxDrawdown(history, initialCash, candles, currentIndex, positions);

  const rawScore =
    clamp(scale(totalReturn, -20, 40, 0, 100), 0, 100) * 0.3 +
    clamp(scale(vsBenchmark, -20, 30, 0, 100), 0, 100) * 0.2 +
    winRate * 0.2 +
    clamp(profitLossRatio * 20, 0, 100) * 0.15 +
    clamp(scale(100 - maxDrawdown, 0, 50, 0, 100), 0, 100) * 0.15;

  const overall = Math.round(rawScore);
  const grade = calcGrade(overall);

  return { totalReturn, benchmarkReturn, vsBenchmark, winRate, profitLossRatio, maxDrawdown, overall, grade };
}

function calcFinalAsset(
  candles: KLine[],
  history: TradeAction[],
  initialCash: number,
  currentIndex: number,
  positions: Position[],
): number {
  const lastHistory = history.length > 0 ? history[history.length - 1] : null;
  const cash = lastHistory?.cashAfter ?? initialCash;
  const totalShares = positions.reduce((s, p) => s + p.shares, 0);
  const currentPrice = candles[currentIndex]?.close ?? 0;
  return cash + totalShares * currentPrice;
}

function calcWinRate(history: TradeAction[]): number {
  const sells = history.filter(a => a.type === 'sell');
  if (sells.length === 0) return 50;
  const wins = sells.filter(a => a.price > findBuyPrice(history, a.index));
  return (wins.length / sells.length) * 100;
}

function calcProfitLossRatio(history: TradeAction[]): number {
  const sells = history.filter(a => a.type === 'sell');
  if (sells.length === 0) return 1;
  let totalWin = 0, winCount = 0, totalLoss = 0, lossCount = 0;
  for (const s of sells) {
    const buyPrice = findBuyPrice(history, s.index);
    const profit = (s.price - buyPrice) / buyPrice;
    if (profit >= 0) { totalWin += profit; winCount++; }
    else { totalLoss += Math.abs(profit); lossCount++; }
  }
  if (lossCount === 0) return winCount > 0 ? (totalWin / winCount) * 10 : 1;
  if (winCount === 0) return 0;
  return (totalWin / winCount) / (totalLoss / lossCount);
}

function calcMaxDrawdown(
  history: TradeAction[],
  initialCash: number,
  candles: KLine[],
  currentIndex: number,
  positions: Position[],
): number {
  let peak = initialCash;
  let maxDrawdown = 0;
  for (let i = 0; i <= currentIndex; i++) {
    const relevantHistory = history.filter(a => a.index <= i);
    const lastHistory = relevantHistory.length > 0 ? relevantHistory[relevantHistory.length - 1] : null;
    const cash = lastHistory?.cashAfter ?? initialCash;
    const pos = filterPositionsUpTo(positions, history, i);
    const totalShares = pos.reduce((s, p) => s + p.shares, 0);
    const price = candles[i]?.close ?? 0;
    const assetValue = cash + totalShares * price;
    if (assetValue > peak) peak = assetValue;
    const drawdown = ((peak - assetValue) / peak) * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  return maxDrawdown;
}

function filterPositionsUpTo(positions: Position[], history: TradeAction[], upToIndex: number): Position[] {
  let pos = [...positions];
  for (const a of history) {
    if (a.index > upToIndex) break;
    if (a.type === 'buy') {
      pos.push({ buyPrice: a.price, shares: a.shares });
    } else if (a.type === 'sell') {
      let rem = a.shares;
      const newPos: Position[] = [];
      for (const p of pos) {
        if (rem <= 0) { newPos.push(p); continue; }
        if (p.shares <= rem) { rem -= p.shares; }
        else { newPos.push({ ...p, shares: p.shares - rem }); rem = 0; }
      }
      pos = newPos;
    }
  }
  return pos;
}

function findBuyPrice(history: TradeAction[], sellIndex: number): number {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].index < sellIndex && history[i].type === 'buy') return history[i].price;
  }
  return 0;
}

function scale(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function calcGrade(score: number): Score['grade'] {
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}
