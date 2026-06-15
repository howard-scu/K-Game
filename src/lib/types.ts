export interface KLine {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Position {
  buyPrice: number;
  shares: number;
}

export type ActionType = 'buy' | 'sell' | 'add' | 'reduce' | 'hold';

export interface TradeAction {
  type: ActionType;
  index: number;
  price: number;
  shares: number;
  cashAfter: number;
  sharesAfter: number;
}

export type GamePhase = 'welcome' | 'playing' | 'result';

export interface GameSettings {
  candleCount: number;
}

export interface GameState {
  phase: GamePhase;
  stock: { symbol: string; name: string; candles: KLine[] };
  benchmark: KLine[];
  settings: GameSettings;
  currentIndex: number;
  cash: number;
  positions: Position[];
  history: TradeAction[];
  score: Score | null;
}

export interface Score {
  totalReturn: number;
  benchmarkReturn: number;
  vsBenchmark: number;
  winRate: number;
  profitLossRatio: number;
  maxDrawdown: number;
  overall: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
}

export interface MACDData {
  time: string;
  dif: number;
  dea: number;
  macd: number;
}

export interface KDJData {
  time: string;
  k: number;
  d: number;
  j: number;
}

export interface ATRData {
  time: string;
  atr: number;
}

export interface IndicatorValues {
  ma5: (number | null)[];
  ma20: (number | null)[];
  ma60: (number | null)[];
  macd: MACDData[];
  kdj: KDJData[];
  atr: ATRData[];
}
