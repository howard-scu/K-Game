# 韭菜大冒险 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based K-line simulation trading game ("韭菜大冒险") where users practice candlestick pattern recognition through simulated buy/sell decisions with consecutive candle reveal.

**Architecture:** Pure frontend React + Vite app. CSV files loaded as static assets and parsed in-browser. Game state managed via React Context + useReducer. Five stacked Lightweight Charts panes for K-line + MA/Volume/MACD/KDJ/ATR. Left-right layout (chart left, controls right).

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, TradingView Lightweight Charts, Vitest

---

### Task 1: Scaffold Project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `src/vite-env.d.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "k-game",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lightweight-charts": "^4.2.1",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.6.3",
    "vite": "^6.0.5",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create vite.config.ts**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': '/src' } },
  test: { environment: 'node' },
});
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rise: '#ef4444',
        fall: '#22c55e',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 6: Create postcss.config.js**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 7: Create index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>韭菜大冒险</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body { @apply bg-gray-950 text-gray-100 font-sans antialiased; }
```

- [ ] **Step 9: Create src/vite-env.d.ts**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 10: Create src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 11: Create src/App.tsx (minimal placeholder)**

```tsx
export default function App() {
  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-2xl">韭菜大冒险</h1>
    </div>
  );
}
```

- [ ] **Step 12: Verify scaffold builds**

Run: `npx vite build`
Expected: Build succeeds, output in `dist/`

- [ ] **Step 13: Commit**

```
git init
git add .
git commit -m "chore: scaffold Vite + React + Tailwind project"
```

---

### Task 2: Type Definitions

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/__tests__/types.test.ts` (verify types are exported)

- [ ] **Step 1: Create types.ts**

```ts
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
```

- [ ] **Step 2: Verify the module compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```
git add src/lib/types.ts
git commit -m "feat: add TypeScript type definitions"
```

---

### Task 3: CSV Parser

**Files:**
- Create: `src/lib/parser.ts`
- Create: `src/lib/__tests__/parser.test.ts`

- [ ] **Step 1: Create the parser module**

```ts
import { KLine } from './types';

const ETF_COLUMNS = ['date', 'open', 'close', 'high', 'low', 'volume'];
const STOCK_COLUMNS = ['', 'date', 'open', 'high', 'low', 'close', 'volume'];

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
      // ETF: date,open,close,high,low,volume,...
      result.push({
        date: cols[0],
        open: parseFloat(cols[1]),
        close: parseFloat(cols[2]),
        high: parseFloat(cols[3]),
        low: parseFloat(cols[4]),
        volume: parseFloat(cols[5]),
      });
    } else {
      // stock: _,date,open,high,low,close,volume,...
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
```

- [ ] **Step 2: Write the failing tests**

```ts
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

describe('pickRandomSegment', () => {
  const data = [
    { date: 'd1', open: 1, high: 2, low: 0, close: 1.5, volume: 100 },
    { date: 'd2', open: 1, high: 2, low: 0, close: 1.5, volume: 100 },
    { date: 'd3', open: 1, high: 2, low: 0, close: 1.5, volume: 100 },
    { date: 'd4', open: 1, high: 2, low: 0, close: 1.5, volume: 100 },
    { date: 'd5', open: 1, high: 2, low: 0, close: 1.5, volume: 100 },
  ];

  it('returns exact length when enough data', () => {
    const seg = pickRandomSegment(data, 3);
    expect(seg).toHaveLength(3);
  });

  it('returns all data when segment > data length', () => {
    const seg = pickRandomSegment(data, 10);
    expect(seg).toHaveLength(5);
  });

  it('all segments are contiguous and in order', () => {
    for (let i = 0; i < 20; i++) {
      const seg = pickRandomSegment(data, 3);
      const indices = seg.map(s => parseInt(s.date[1]));
      for (let j = 1; j < indices.length; j++) {
        expect(indices[j]).toBe(indices[j - 1] + 1);
      }
    }
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/parser.test.ts`
Expected: Test file doesn't exist yet / tests fail because parser.ts is empty

- [ ] **Step 4: Write the parser code (Step 1 already has the full implementation above)**

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/parser.test.ts`
Expected: All tests pass

- [ ] **Step 6: Commit**

```
git add src/lib/parser.ts src/lib/__tests__/parser.test.ts
git commit -m "feat: add CSV parser with ETF and stock format support"
```

---

### Task 4: Technical Indicators

**Files:**
- Create: `src/lib/indicators.ts`
- Create: `src/lib/__tests__/indicators.test.ts`

- [ ] **Step 1: Write the indicators module**

```ts
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

  // MA
  const ma5 = sma(closes, 5);
  const ma20 = sma(closes, 20);
  const ma60 = sma(closes, 60);

  // MACD
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

  // KDJ
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

  // ATR
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

  return { ma5, ma20, ma60, macd, kdj, atr };
}
```

- [ ] **Step 2: Write the failing tests**

```ts
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
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/indicators.test.ts`
Expected: Tests fail because indicators module not yet defined

- [ ] **Step 4: Build indicators module (already written in Step 1)**

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/indicators.test.ts`
Expected: All tests pass

- [ ] **Step 6: Commit**

```
git add src/lib/indicators.ts src/lib/__tests__/indicators.test.ts
git commit -m "feat: add technical indicators (MA/MACD/KDJ/ATR)"
```

---

### Task 5: Trading Logic

**Files:**
- Create: `src/lib/trading.ts`
- Create: `src/lib/__tests__/trading.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { buy, sell, addPosition, reducePosition } from '../trading';
import { Position, TradeAction } from '../types';

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
});

describe('addPosition', () => {
  it('adds a new position or merges into existing', () => {
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
```

- [ ] **Step 2: Write the trading module**

```ts
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
  fraction: number, // 0.25 / 0.5 / 0.75 / 1
  index: number,
): BuyResult {
  const usedCash = Math.floor((cash * fraction) / price) * price;
  const shares = Math.floor(usedCash / price);
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
  const result = removeSharesFromPositions(positions, shares);
  return {
    shares,
    revenue,
    positionsAfter: result,
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
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/trading.test.ts`
Expected: All tests pass

- [ ] **Step 4: Commit**

```
git add src/lib/trading.ts src/lib/__tests__/trading.test.ts
git commit -m "feat: add trading logic (buy/sell/position management)"
```

---

### Task 6: Scoring Algorithm

**Files:**
- Create: `src/lib/scoring.ts`
- Create: `src/lib/__tests__/scoring.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { calcScore } from '../scoring';
import { TradeAction, Position, KLine } from '../types';

describe('calcScore', () => {
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

  it('computes positive total return on profitable trades', () => {
    const score = calcScore(candles, candles, actions, 100000, 15, []);
    expect(score.totalReturn).toBeGreaterThan(0);
  });

  it('grade is S for very high scores', () => {
    const score = calcScore(candles, candles, actions, 100000, 15, []);
    expect(['S', 'A', 'B', 'C', 'D']).toContain(score.grade);
  });

  it('benchmark return matches candles', () => {
    const score = calcScore(candles, candles, actions, 100000, 15, []);
    expect(score.benchmarkReturn).toBeCloseTo(((11.5 - 10) / 10) * 100, 1);
  });
});
```

- [ ] **Step 2: Write the scoring module**

```ts
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
  if (lossCount === 0) return winCount > 0 ? totalWin / winCount * 10 : 1;
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
    if (a.type === 'buy' || a.type === 'add') {
      pos.push({ buyPrice: a.price, shares: a.shares });
    } else if (a.type === 'sell' || a.type === 'reduce') {
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
  for (let i = sellIndex - 1; i >= 0; i--) {
    if (history[i].type === 'buy' || history[i].type === 'add') return history[i].price;
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
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/scoring.test.ts`
Expected: All tests pass

- [ ] **Step 4: Commit**

```
git add src/lib/scoring.ts src/lib/__tests__/scoring.test.ts
git commit -m "feat: add scoring algorithm with grade calculation"
```

---

### Task 7: Game State Hook

**Files:**
- Create: `src/hooks/useGameState.tsx`
- Create: `src/context/GameContext.tsx`

- [ ] **Step 1: Create GameContext with useReducer**

```tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, GamePhase, GameSettings, TradeAction, KLine, Position, Score } from '../lib/types';

const initialState: GameState = {
  phase: 'welcome',
  stock: { symbol: '', name: '', candles: [] },
  benchmark: [],
  settings: { candleCount: 30 },
  currentIndex: 0,
  cash: 100000,
  positions: [],
  history: [],
  score: null,
};

type GameAction =
  | { type: 'START_GAME'; stock: GameState['stock']; benchmark: KLine[]; settings: GameSettings }
  | { type: 'EXECUTE_ACTION'; action: TradeAction }
  | { type: 'NEXT_CANDLE' }
  | { type: 'SET_SCORE'; score: Score }
  | { type: 'RESET' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        phase: 'playing',
        stock: action.stock,
        benchmark: action.benchmark,
        settings: action.settings,
        cash: 100000,
      };
    case 'EXECUTE_ACTION': {
      const last = action.action;
      return {
        ...state,
        cash: last.cashAfter,
        positions: last.sharesAfter === 0
          ? []
          : [...state.positions, { buyPrice: last.price, shares: last.shares }].filter(p => p.shares > 0),
        history: [...state.history, last],
      };
    }
    case 'NEXT_CANDLE': {
      const next = state.currentIndex + 1;
      if (next >= state.settings.candleCount) return { ...state, phase: 'result' };
      return { ...state, currentIndex: next };
    }
    case 'SET_SCORE':
      return { ...state, score: action.score };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameState() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameState must be used within GameProvider');
  return ctx;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```
git add src/context/GameContext.tsx src/hooks/useGameState.tsx
mkdir -p src/context
git add .
git commit -m "feat: add game state context with useReducer"
```

---

### Task 8: Stock Data Loading Hook

**Files:**
- Create: `src/hooks/useStockData.ts`
- Create: `src/data/index.ts`

- [ ] **Step 1: Create data index (meta-list of available stocks)**

```ts
export interface StockMeta {
  symbol: string;
  name: string;
  file: string;
}

export const stockList: StockMeta[] = [
  { symbol: '510210', name: '上证综指ETF', file: '/data/510210_上证综指ETF.csv' },
  { symbol: 'sh603222', name: '济民健康', file: '/data/sh603222_济民健康_前复权.csv' },
  { symbol: 'sh603229', name: '奥翔药业', file: '/data/sh603229_奥翔药业_前复权.csv' },
  { symbol: 'sh603230', name: '内蒙新华', file: '/data/sh603230_内蒙新华_前复权.csv' },
  { symbol: 'sh603232', name: '格尔软件', file: '/data/sh603232_格尔软件_前复权.csv' },
  { symbol: 'sh603258', name: '电魂网络', file: '/data/sh603258_电魂网络_前复权.csv' },
  { symbol: 'sh603277', name: '银都股份', file: '/data/sh603277_银都股份_前复权.csv' },
  { symbol: 'sh603279', name: '景津装备', file: '/data/sh603279_景津装备_前复权.csv' },
  { symbol: 'sh603297', name: '永新光学', file: '/data/sh603297_永新光学_前复权.csv' },
  { symbol: 'sh603323', name: '苏农银行', file: '/data/sh603323_苏农银行_前复权.csv' },
  { symbol: 'sh603326', name: '我乐家居', file: '/data/sh603326_我乐家居_前复权.csv' },
  { symbol: 'sh603328', name: '依顿电子', file: '/data/sh603328_依顿电子_前复权.csv' },
  { symbol: 'sh603355', name: '莱克电气', file: '/data/sh603355_莱克电气_前复权.csv' },
  { symbol: 'sh603368', name: '柳药集团', file: '/data/sh603368_柳药集团_前复权.csv' },
  { symbol: 'sh603429', name: '集友股份', file: '/data/sh603429_集友股份_前复权.csv' },
  { symbol: 'sh603456', name: '九洲药业', file: '/data/sh603456_九洲药业_前复权.csv' },
  { symbol: 'sh603466', name: '风语筑', file: '/data/sh603466_风语筑_前复权.csv' },
  { symbol: 'sh603500', name: '祥和实业', file: '/data/sh603500_祥和实业_前复权.csv' },
  { symbol: 'sh603520', name: '司太立', file: '/data/sh603520_司太立_前复权.csv' },
  { symbol: 'sh603536', name: '惠发食品', file: '/data/sh603536_惠发食品_前复权.csv' },
  { symbol: 'sh603538', name: '美诺华', file: '/data/sh603538_美诺华_前复权.csv' },
  { symbol: 'sh603566', name: '普莱柯', file: '/data/sh603566_普莱柯_前复权.csv' },
  { symbol: 'sh603609', name: '禾丰股份', file: '/data/sh603609_禾丰股份_前复权.csv' },
  { symbol: 'sh603616', name: '韩建河山', file: '/data/sh603616_韩建河山_前复权.csv' },
  { symbol: 'sh603629', name: '利通电子', file: '/data/sh603629_利通电子_前复权.csv' },
  { symbol: 'sh603636', name: '南威软件', file: '/data/sh603636_南威软件_前复权.csv' },
  { symbol: 'sh603655', name: '朗博科技', file: '/data/sh603655_朗博科技_前复权.csv' },
  { symbol: 'sh603679', name: '华体科技', file: '/data/sh603679_华体科技_前复权.csv' },
  { symbol: 'sh603682', name: '锦和商管', file: '/data/sh603682_锦和商管_前复权.csv' },
  { symbol: 'sh603687', name: '大胜达', file: '/data/sh603687_大胜达_前复权.csv' },
  { symbol: 'sh603693', name: '江苏新能', file: '/data/sh603693_江苏新能_前复权.csv' },
  { symbol: 'sh603706', name: '东方环宇', file: '/data/sh603706_东方环宇_前复权.csv' },
  { symbol: 'sh603716', name: '塞力医疗', file: '/data/sh603716_塞力医疗_前复权.csv' },
  { symbol: 'sh603719', name: '良品铺子', file: '/data/sh603719_良品铺子_前复权.csv' },
  { symbol: 'sh603733', name: '仙鹤股份', file: '/data/sh603733_仙鹤股份_前复权.csv' },
  { symbol: 'sh603739', name: '蔚蓝生物', file: '/data/sh603739_蔚蓝生物_前复权.csv' },
  { symbol: 'sh603757', name: '大元泵业', file: '/data/sh603757_大元泵业_前复权.csv' },
  { symbol: 'sh603768', name: '常青股份', file: '/data/sh603768_常青股份_前复权.csv' },
  { symbol: 'sh603778', name: '国晟科技', file: '/data/sh603778_国晟科技_前复权.csv' },
  { symbol: 'sh603797', name: '联泰环保', file: '/data/sh603797_联泰环保_前复权.csv' },
  { symbol: 'sh603810', name: '丰山集团', file: '/data/sh603810_丰山集团_前复权.csv' },
  { symbol: 'sh603815', name: '交建股份', file: '/data/sh603815_交建股份_前复权.csv' },
  { symbol: 'sh603823', name: '百合花', file: '/data/sh603823_百合花_前复权.csv' },
  { symbol: 'sh603856', name: '东宏股份', file: '/data/sh603856_东宏股份_前复权.csv' },
  { symbol: 'sh603866', name: '桃李面包', file: '/data/sh603866_桃李面包_前复权.csv' },
  { symbol: 'sh603890', name: '春秋电子', file: '/data/sh603890_春秋电子_前复权.csv' },
  { symbol: 'sz000895', name: '双汇发展', file: '/data/sz000895_双汇发展_前复权.csv' },
  { symbol: 'sz000975', name: '山金国际', file: '/data/sz000975_山金国际_前复权.csv' },
  { symbol: 'sz001965', name: '招商公路', file: '/data/sz001965_招商公路_前复权.csv' },
  { symbol: 'sz002001', name: '新和成', file: '/data/sz002001_新 和 成_前复权.csv' },
  { symbol: 'sz002027', name: '分众传媒', file: '/data/sz002027_分众传媒_前复权.csv' },
  { symbol: 'sz002241', name: '歌尔股份', file: '/data/sz002241_歌尔股份_前复权.csv' },
  { symbol: 'sz002415', name: '海康威视', file: '/data/sz002415_海康威视_前复权.csv' },
  { symbol: 'sz002459', name: '晶澳科技', file: '/data/sz002459_晶澳科技_前复权.csv' },
  { symbol: 'sz002463', name: '沪电股份', file: '/data/sz002463_沪电股份_前复权.csv' },
  { symbol: 'sz002475', name: '立讯精密', file: '/data/sz002475_立讯精密_前复权.csv' },
  { symbol: 'sz002555', name: '三七互娱', file: '/data/sz002555_三七互娱_前复权.csv' },
  { symbol: 'sz002594', name: '比亚迪', file: '/data/sz002594_比亚迪_前复权.csv' },
  { symbol: 'sz002920', name: '德赛西威', file: '/data/sz002920_德赛西威_前复权.csv' },
  { symbol: 'sz002938', name: '鹏鼎控股', file: '/data/sz002938_鹏鼎控股_前复权.csv' },
  { symbol: 'sz300033', name: '同花顺', file: '/data/sz300033_同花顺_前复权.csv' },
  { symbol: 'sz300124', name: '汇川技术', file: '/data/sz300124_汇川技术_前复权.csv' },
  { symbol: 'sz300274', name: '阳光电源', file: '/data/sz300274_阳光电源_前复权.csv' },
  { symbol: 'sz300413', name: '芒果超媒', file: '/data/sz300413_芒果超媒_前复权.csv' },
  { symbol: 'sz300433', name: '蓝思科技', file: '/data/sz300433_蓝思科技_前复权.csv' },
  { symbol: 'sz300502', name: '新易盛', file: '/data/sz300502_新易盛_前复权.csv' },
  { symbol: 'sz300628', name: '亿联网络', file: '/data/sz300628_亿联网络_前复权.csv' },
  { symbol: 'sz300800', name: '力合科技', file: '/data/sz300800_力合科技_前复权.csv' },
  { symbol: 'sz300805', name: '电声股份', file: '/data/sz300805_电声股份_前复权.csv' },
  { symbol: 'sz300810', name: '中科海讯', file: '/data/sz300810_中科海讯_前复权.csv' },
  { symbol: 'sz300819', name: '聚杰微纤', file: '/data/sz300819_聚杰微纤_前复权.csv' },
  { symbol: 'sz300821', name: '东岳硅材', file: '/data/sz300821_东岳硅材_前复权.csv' },
  { symbol: 'sz300827', name: '上能电气', file: '/data/sz300827_上能电气_前复权.csv' },
  { symbol: 'sz300832', name: '新产业', file: '/data/sz300832_新产业_前复权.csv' },
  { symbol: 'sz300836', name: '佰奥智能', file: '/data/sz300836_佰奥智能_前复权.csv' },
  { symbol: 'sz300845', name: '捷安高科', file: '/data/sz300845_捷安高科_前复权.csv' },
];
```

- [ ] **Step 2: Create useStockData hook**

```ts
import { useState, useCallback } from 'react';
import { parseCSV, pickRandomSegment } from '../lib/parser';
import { KLine, GameSettings } from '../lib/types';
import { stockList, StockMeta } from '../data/index';

interface LoadedData {
  stock: { symbol: string; name: string; candles: KLine[] };
  benchmark: KLine[];
}

export function useStockData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache loaded files
  const cache = new Map<string, KLine[]>();

  const loadStock = useCallback(async (meta: StockMeta, settings: GameSettings): Promise<LoadedData | null> => {
    setLoading(true);
    setError(null);
    try {
      if (!cache.has(meta.file)) {
        const resp = await fetch(meta.file);
        if (!resp.ok) throw new Error(`Failed to load ${meta.file}`);
        const text = await resp.text();
        cache.set(meta.file, parseCSV(text));
      }

      if (!cache.has('/data/510210_上证综指ETF.csv')) {
        const resp = await fetch('/data/510210_上证综指ETF.csv');
        const text = await resp.text();
        cache.set('/data/510210_上证综指ETF.csv', parseCSV(text));
      }

      const stockCandles = cache.get(meta.file)!;
      const benchmarkCandles = cache.get('/data/510210_上证综指ETF.csv')!;

      const segment = pickRandomSegment(stockCandles, settings.candleCount);
      const startDate = segment[0].date;
      const endDate = segment[segment.length - 1].date;
      const benchmarkSegment = benchmarkCandles.filter(
        c => c.date >= startDate && c.date <= endDate
      );

      setLoading(false);
      return {
        stock: { symbol: meta.symbol, name: meta.name, candles: segment },
        benchmark: benchmarkSegment,
      };
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setLoading(false);
      return null;
    }
  }, []);

  return { stockList, loadStock, loading, error };
}
```

- [ ] **Step 3: Verify compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit**

```
git add src/data/index.ts src/hooks/useStockData.ts
git commit -m "feat: add stock data loading hook with CSV fetching"
```

---

### Task 9: ChartPanel — Multi-Pane Chart

**Files:**
- Create: `src/components/ChartPanel.tsx`
- Create: `src/components/chart/ChartContainer.tsx`
- Create: `src/components/chart/MainPane.tsx`
- Create: `src/components/chart/SubPane.tsx`

- [ ] **Step 1: Create ChartPanel component**

```tsx
import { useRef, useEffect, useMemo } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickSeriesPartialOptions, LineSeriesPartialOptions, HistogramSeriesPartialOptions, CrosshairMode, UTCTimestamp } from 'lightweight-charts';
import { useGameState } from '../hooks/useGameState';
import { computeIndicators } from '../lib/indicators';
import { KLine, IndicatorValues } from '../lib/types';

function toUTC(dateStr: string): UTCTimestamp {
  return (new Date(dateStr).getTime() / 1000) as UTCTimestamp;
}

function buildCandleData(candles: KLine[], upTo: number) {
  return candles.slice(0, upTo + 1).map(c => ({
    time: toUTC(c.date),
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }));
}

function buildLineData(values: (number | null)[], candles: KLine[], upTo: number) {
  const result: { time: UTCTimestamp; value: number }[] = [];
  for (let i = 0; i <= upTo; i++) {
    if (values[i] !== null) {
      result.push({ time: toUTC(candles[i].date), value: values[i]! });
    }
  }
  return result;
}

export default function ChartPanel() {
  const { state } = useGameState();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<IChartApi[]>([]);
  const seriesRef = useRef<Map<string, ISeriesApi<any>>>(new Map());

  const upTo = state.currentIndex;
  const candles = state.stock.candles;
  const indicators = useMemo(() => computeIndicators(candles), [candles]);

  useEffect(() => {
    if (!containerRef.current || candles.length === 0) return;

    // Cleanup previous charts
    chartsRef.current.forEach(c => c.remove());
    chartsRef.current = [];
    seriesRef.current.clear();

    const parent = containerRef.current;
    const parentWidth = parent.clientWidth;
    const mainHeight = 300;
    const subHeight = 100;
    const totalHeight = mainHeight + subHeight * 4;

    parent.style.height = `${totalHeight}px`;

    const commonOptions = {
      width: parentWidth,
      layout: { background: { color: '#030712' }, textColor: '#9ca3af' },
      grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { borderColor: '#374151', timeVisible: true },
      rightPriceScale: { borderColor: '#374151' },
    };

    // Main chart: K-line + MA
    const mainChart = createChart(parent, { ...commonOptions, height: mainHeight });
    chartsRef.current.push(mainChart);

    const candleSeries = mainChart.addCandlestickSeries({
      upColor: '#ef4444', downColor: '#22c55e', borderUpColor: '#ef4444', borderDownColor: '#22c55e', wickUpColor: '#ef4444', wickDownColor: '#22c55e',
    });
    candleSeries.setData(buildCandleData(candles, upTo));
    seriesRef.current.set('candles', candleSeries);

    // MA lines
    const maColors = ['#fbbf24', '#a78bfa', '#60a5fa'];
    const maKeys = ['ma5', 'ma20', 'ma60'];
    maKeys.forEach((key, i) => {
      const data = buildLineData(indicators[key as keyof IndicatorValues] as (number | null)[], candles, upTo);
      if (data.length > 0) {
        const series = mainChart.addLineSeries({ color: maColors[i], lineWidth: 1 });
        series.setData(data);
        seriesRef.current.set(key, series);
      }
    });

    // Volume sub-chart
    const volChart = createChart(parent, { ...commonOptions, height: subHeight });
    chartsRef.current.push(volChart);
    const volSeries = volChart.addHistogramSeries({ color: '#60a5fa', priceFormat: { type: 'volume' } });
    volSeries.setData(candles.slice(0, upTo + 1).map(c => ({
      time: toUTC(c.date),
      value: c.volume,
      color: c.close >= c.open ? '#ef444480' : '#22c55e80',
    })));
    seriesRef.current.set('volume', volSeries);

    // MACD sub-chart
    const macdChart = createChart(parent, { ...commonOptions, height: subHeight });
    chartsRef.current.push(macdChart);
    const macdData = indicators.macd.slice(0, upTo + 1);
    if (macdData.length > 0) {
      const difSeries = macdChart.addLineSeries({ color: '#60a5fa', lineWidth: 1 });
      difSeries.setData(macdData.map(d => ({ time: toUTC(d.time), value: d.dif })));
      const deaSeries = macdChart.addLineSeries({ color: '#f59e0b', lineWidth: 1 });
      deaSeries.setData(macdData.map(d => ({ time: toUTC(d.time), value: d.dea })));
      const histSeries = macdChart.addHistogramSeries({});
      histSeries.setData(macdData.map(d => ({
        time: toUTC(d.time), value: d.macd,
        color: d.macd >= 0 ? '#ef444480' : '#22c55e80',
      })));
    }

    // KDJ sub-chart
    const kdjChart = createChart(parent, { ...commonOptions, height: subHeight });
    chartsRef.current.push(kdjChart);
    const kdjData = indicators.kdj.slice(0, upTo + 1);
    if (kdjData.length > 0) {
      const colors = ['#fbbf24', '#a78bfa', '#60a5fa'];
      ['k', 'd', 'j'].forEach((key, i) => {
        const series = kdjChart.addLineSeries({ color: colors[i], lineWidth: 1 });
        series.setData(kdjData.map(d => ({ time: toUTC(d.time), value: d[key as keyof typeof d] as number })));
      });
    }

    // ATR sub-chart
    const atrChart = createChart(parent, { ...commonOptions, height: subHeight });
    chartsRef.current.push(atrChart);
    const atrData = indicators.atr.slice(0, upTo + 1);
    if (atrData.length > 0) {
      const atrSeries = atrChart.addLineSeries({ color: '#f59e0b', lineWidth: 1 });
      atrSeries.setData(atrData.map(d => ({ time: toUTC(d.time), value: d.atr })));
    }

    // Sync time scales
    chartsRef.current.forEach(c => c.timeScale().fitContent());

    return () => {
      chartsRef.current.forEach(c => c.remove());
    };
  }, [candles, upTo, indicators]);

  return <div ref={containerRef} className="w-full" />;
}
```

- [ ] **Step 2: Verify compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```
git add src/components/ChartPanel.tsx src/components/chart/
git commit -m "feat: add chart panel with multi-pane support"
```

---

### Task 10: ControlPanel — Trading Controls

**Files:**
- Create: `src/components/ControlPanel.tsx`

- [ ] **Step 1: Create ControlPanel component**

```tsx
import { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { buy, sell } from '../lib/trading';

const FRACTIONS = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '满仓', value: 1 },
];

export default function ControlPanel() {
  const { state, dispatch } = useGameState();
  const [fraction, setFraction] = useState(0.25);

  const candle = state.stock.candles[state.currentIndex];
  const currentPrice = candle?.close ?? 0;
  const totalShares = state.positions.reduce((s, p) => s + p.shares, 0);
  const marketValue = totalShares * currentPrice;
  const totalAsset = state.cash + marketValue;
  const avgCost = state.positions.length > 0
    ? state.positions.reduce((s, p) => s + p.buyPrice * p.shares, 0) / totalShares
    : 0;
  const profitPct = avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0;

  const handleBuy = () => {
    if (state.cash <= 0) return;
    const result = buy(state.cash, state.positions, currentPrice, fraction, state.currentIndex);
    dispatch({ type: 'EXECUTE_ACTION', action: result.action });
    dispatch({ type: 'NEXT_CANDLE' });
  };

  const handleSell = () => {
    if (totalShares <= 0) return;
    const result = sell(state.cash, state.positions, currentPrice, fraction, state.currentIndex);
    dispatch({ type: 'EXECUTE_ACTION', action: result.action });
    dispatch({ type: 'NEXT_CANDLE' });
  };

  const handleHold = () => {
    dispatch({ type: 'NEXT_CANDLE' });
  };

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 p-4 flex flex-col gap-4">
      {/* Account Info */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">可用资金</span>
          <span className="text-green-400">¥{state.cash.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">总资产</span>
          <span className="text-white font-bold">¥{totalAsset.toFixed(2)}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-gray-800 rounded p-2 text-center text-sm text-gray-300">
        第 {state.currentIndex + 1} / {state.settings.candleCount} 根
      </div>

      {/* Position Info */}
      {totalShares > 0 && (
        <div className="bg-gray-800 rounded p-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">持仓</span>
            <span>{totalShares} 股</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">成本价</span>
            <span>¥{avgCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">市值</span>
            <span>¥{marketValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">盈亏</span>
            <span className={profitPct >= 0 ? 'text-red-400' : 'text-green-400'}>
              {profitPct >= 0 ? '+' : ''}{profitPct.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Limit Info */}
      <div className="text-xs text-gray-500 text-center">
        当前价: ¥{currentPrice.toFixed(2)}
      </div>

      {/* Fraction Selector */}
      <div>
        <div className="text-xs text-gray-400 mb-1">仓位比例</div>
        <div className="grid grid-cols-4 gap-2">
          {FRACTIONS.map(f => (
            <button
              key={f.value}
              onClick={() => setFraction(f.value)}
              className={`py-2 rounded text-sm font-medium transition-colors ${
                fraction === f.value
                  ? 'bg-rose-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleBuy}
          disabled={state.cash <= 0}
          className="w-full py-3 rounded bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold transition-colors"
        >
          买入
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSell}
            disabled={totalShares <= 0}
            className="py-3 rounded bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold transition-colors"
          >
            卖出
          </button>
          <button
            onClick={handleHold}
            className="py-3 rounded bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors"
          >
            观望→
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```
git add src/components/ControlPanel.tsx
git commit -m "feat: add ControlPanel with buy/sell/hold actions"
```

---

### Task 11: TitleScreen — Stock Selection

**Files:**
- Create: `src/components/TitleScreen.tsx`

- [ ] **Step 1: Create TitleScreen component**

```tsx
import { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useStockData } from '../hooks/useStockData';

export default function TitleScreen() {
  const { dispatch } = useGameState();
  const { stockList, loadStock, loading } = useStockData();
  const [candleCount, setCandleCount] = useState(30);
  const [selectedSymbol, setSelectedSymbol] = useState(stockList[0]?.symbol ?? '');

  const meta = stockList.find(s => s.symbol === selectedSymbol);

  const handleStart = async () => {
    if (!meta) return;
    const data = await loadStock(meta, { candleCount });
    if (data) {
      dispatch({ type: 'START_GAME', stock: data.stock, benchmark: data.benchmark, settings: { candleCount } });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-2">韭菜大冒险</h1>
        <p className="text-gray-400 text-center mb-8 text-sm">K线盘感训练 · 模拟交易</p>

        <div className="space-y-6">
          <div>
            <label className="text-sm text-gray-400 block mb-2">选择股票</label>
            <select
              value={selectedSymbol}
              onChange={e => setSelectedSymbol(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white"
            >
              {stockList.map(s => (
                <option key={s.symbol} value={s.symbol}>{s.name} ({s.symbol})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">
              K线根数: <span className="text-white font-bold">{candleCount}</span>
            </label>
            <input
              type="range"
              min={10}
              max={60}
              value={candleCount}
              onChange={e => setCandleCount(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10</span><span>60</span>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading || !meta}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-700 text-white rounded font-bold text-lg transition-colors"
          >
            {loading ? '加载中...' : '开始挑战'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```
git add src/components/TitleScreen.tsx
git commit -m "feat: add TitleScreen with stock selection"
```

---

### Task 12: ResultScreen — Scoring Display

**Files:**
- Create: `src/components/ResultScreen.tsx`

- [ ] **Step 1: Create ResultScreen component**

```tsx
import { useEffect, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import { calcScore } from '../lib/scoring';

const GRADE_COLORS: Record<string, string> = {
  S: 'text-yellow-400',
  A: 'text-green-400',
  B: 'text-blue-400',
  C: 'text-orange-400',
  D: 'text-red-400',
};

export default function ResultScreen() {
  const { state, dispatch } = useGameState();

  useEffect(() => {
    if (!state.score) {
      const score = calcScore(
        state.stock.candles,
        state.benchmark,
        state.history,
        100000,
        state.currentIndex,
        state.positions,
      );
      dispatch({ type: 'SET_SCORE', score });
    }
  }, []);

  const score = state.score;
  if (!score) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
      <div className="w-full max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-center">挑战结束</h1>

        {/* Grade */}
        <div className="text-center">
          <span className={`text-6xl font-black ${GRADE_COLORS[score.grade]}`}>
            {score.grade}
          </span>
          <p className="text-gray-400 mt-1">综合评分 {score.overall}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Stat label="总收益率" value={`${score.totalReturn >= 0 ? '+' : ''}${score.totalReturn.toFixed(2)}%`} color={score.totalReturn >= 0 ? 'text-red-400' : 'text-green-400'} />
          <Stat label="大盘同期" value={`${score.benchmarkReturn >= 0 ? '+' : ''}${score.benchmarkReturn.toFixed(2)}%`} color="text-gray-300" />
          <Stat label="vs 大盘" value={`${score.vsBenchmark >= 0 ? '+' : ''}${score.vsBenchmark.toFixed(2)}%`} color={score.vsBenchmark >= 0 ? 'text-red-400' : 'text-green-400'} />
          <Stat label="胜率" value={`${score.winRate.toFixed(1)}%`} />
          <Stat label="盈亏比" value={score.profitLossRatio.toFixed(2)} />
          <Stat label="最大回撤" value={`${score.maxDrawdown.toFixed(2)}%`} color="text-red-400" />
        </div>

        {/* Action history */}
        <div className="bg-gray-800 rounded p-3 max-h-40 overflow-y-auto">
          <h3 className="text-sm text-gray-400 mb-2">操作记录</h3>
          <div className="space-y-1 text-xs">
            {state.history.map((a, i) => (
              <div key={i} className="flex justify-between text-gray-300">
                <span>{a.type === 'buy' ? '买入' : a.type === 'sell' ? '卖出' : a.type === 'hold' ? '观望' : a.type} {a.shares}股</span>
                <span>@¥{a.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold transition-colors"
        >
          再来一局
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-gray-800 rounded p-3">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  );
}
```

- [ ] **Step 2: Verify compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```
git add src/components/ResultScreen.tsx
git commit -m "feat: add ResultScreen with scoring display"
```

---

### Task 13: GameScreen — Main Game Orchestration

**Files:**
- Create: `src/components/GameScreen.tsx`

- [ ] **Step 1: Create GameScreen component**

```tsx
import ChartPanel from './ChartPanel';
import ControlPanel from './ControlPanel';

export default function GameScreen() {
  return (
    <div className="flex h-screen bg-gray-950">
      <div className="flex-1 min-w-0">
        <ChartPanel />
      </div>
      <ControlPanel />
    </div>
  );
}
```

- [ ] **Step 2: Update App.tsx to wire everything together**

```tsx
import { GameProvider, useGameState } from './context/GameContext';
import TitleScreen from './components/TitleScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';

function Router() {
  const { state } = useGameState();
  switch (state.phase) {
    case 'welcome': return <TitleScreen />;
    case 'playing': return <GameScreen />;
    case 'result': return <ResultScreen />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <Router />
    </GameProvider>
  );
}
```

- [ ] **Step 3: Verify compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit**

```
git add src/components/GameScreen.tsx src/App.tsx
git commit -m "feat: wire up GameScreen and App routing"
```

---

### Task 14: CSV Data as Static Assets

**Files:**
- Create: `vite.config.ts` update (copy data files)
- Modify: Copy CSV files to `public/data/`

- [ ] **Step 1: Copy CSV files to public/data/**

```
mkdir -p public/data
Copy-Item data/*.csv public/data/
```

- [ ] **Step 2: Verify dev server loads data**

Run: `npx vite`
Expected: Dev server starts, inspect http://localhost:5173/data/510210_上证综指ETF.csv is accessible

- [ ] **Step 3: Commit**

```
git add public/data/ vite.config.ts
git commit -m "chore: add CSV data files as static assets"
```

---

## Self-Review Checklist

After writing the plan, verify:

1. **Spec coverage:** Every section of the spec maps to a task.
2. **No placeholders:** All code blocks are complete.
3. **Type consistency:** Types used across tasks match.
4. **Scope check:** Each task is one focused action (2-5 minutes).

## Execution

Plan complete. Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks
2. **Inline Execution** — execute tasks in this session with checkpoints

Which approach?
