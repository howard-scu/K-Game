import { KLine, IndicatorValues, MACDData, KDJData, ATRData } from './types';

function sma(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(null); continue; }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j];
    result.push(sum / period);
  }
  return result;
}

function ema(data: number[], period: number): number[] {
  const result: number[] = [];
  const k = 2 / (period + 1);
  for (let i = 0; i < data.length; i++) {
    if (i === 0) { result.push(data[0]); continue; }
    result.push(data[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

export function computeIndicators(candles: KLine[]): IndicatorValues {
  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);

  const ma5 = sma(closes, 5);
  const ma20 = sma(closes, 20);
  const ma60 = sma(closes, 60);

  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const macd: MACDData[] = [];
  const dif = ema12.map((v, i) => v - ema26[i]);
  const dea = ema(dif, 9);
  for (let i = 0; i < candles.length; i++) {
    macd.push({
      time: candles[i].date,
      dif: dif[i],
      dea: dea[i],
      macd: 2 * (dif[i] - dea[i]),
    });
  }

  const kdj: KDJData[] = [];
  let prevK = 50, prevD = 50;
  for (let i = 0; i < candles.length; i++) {
    if (i < 8) {
      kdj.push({ time: candles[i].date, k: 50, d: 50, j: 50 });
      continue;
    }
    let low9 = Infinity, high9 = -Infinity;
    for (let j = i - 8; j <= i; j++) {
      low9 = Math.min(low9, lows[j]);
      high9 = Math.max(high9, highs[j]);
    }
    const rsv = high9 === low9 ? 50 : ((closes[i] - low9) / (high9 - low9)) * 100;
    const k = (2 / 3) * prevK + (1 / 3) * rsv;
    const d = (2 / 3) * prevD + (1 / 3) * k;
    const j = 3 * k - 2 * d;
    kdj.push({ time: candles[i].date, k, d, j });
    prevK = k;
    prevD = d;
  }

  const atr: ATRData[] = [];
  let prevAtr = 0;
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      prevAtr = candles[i].high - candles[i].low;
      atr.push({ time: candles[i].date, atr: prevAtr });
      continue;
    }
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1]),
    );
    prevAtr = (prevAtr * 13 + tr) / 14;
    atr.push({ time: candles[i].date, atr: prevAtr });
  }

  const obv: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) { obv.push(candles[i].volume); continue; }
    const delta = candles[i].close > candles[i - 1].close ? candles[i].volume
      : candles[i].close < candles[i - 1].close ? -candles[i].volume : 0;
    obv.push(obv[i - 1] + delta);
  }

  const obvMa12 = sma(obv, 12);

  return { ma5, ma20, ma60, obv, obvMa12, macd, kdj, atr };
}
