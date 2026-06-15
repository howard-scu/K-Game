import { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useStockData } from '../hooks/useStockData';

const TICKER_TAPE = ['510210', '510050', '510300', '510500', '510880', '510900', '511880', '512010', '512100', '512170', '512480', '512660', '513050', '513100', '513180', '513500', '515050', '515790', '516160', '518880'];

export default function TitleScreen() {
  const { dispatch } = useGameState();
  const { stockList, loadStock, loading } = useStockData();
  const [candleCount, setCandleCount] = useState(30);

  const handleStart = async () => {
    const meta = stockList[Math.floor(Math.random() * stockList.length)];
    const data = await loadStock(meta, { candleCount });
    if (data) {
      dispatch({ type: 'START_GAME', stock: data.stock, benchmark: data.benchmark, settings: { candleCount } });
    }
  };

  return (
    <div className="fixed inset-0 bg-surface overflow-hidden flex flex-col items-center justify-center">
      {/* Ticker tape */}
      <div className="absolute top-0 left-0 w-full h-8 overflow-hidden border-b border-border">
        <div className="ticker-animate flex whitespace-nowrap h-full items-center">
          {[...Array(3)].map((_, i) => (
            <span key={i} className="inline-flex gap-8 px-4 text-xs text-text-muted number">
              {TICKER_TAPE.map((t, j) => (
                <span key={j} className="inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-accent/60" />
                  {t}
                  <span className="text-accent/40">{Math.random() > 0.5 ? '+' : ''}{(Math.random() * 3 - 1.5).toFixed(2)}%</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-60" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo area */}
        <div className="text-center mb-10 animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border mb-5 glow-amber">
            <span className="text-3xl font-black text-accent font-display">韭</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2 font-display">
            <span className="text-accent">韭菜</span>
            <span className="text-text-primary">大冒险</span>
          </h1>
          <p className="text-text-muted text-sm tracking-wide">K线盘感训练 · 模拟交易</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="pulse-dot" />
            <span className="text-xs text-text-muted">{stockList.length} 只标的</span>
          </div>
        </div>

        {/* Candle count */}
        <div className="glass-card rounded-xl p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm text-text-secondary">K 线根数</label>
            <span className="number text-xl font-bold text-accent">{candleCount}</span>
          </div>
          <input
            type="range"
            min={10}
            max={60}
            value={candleCount}
            onChange={e => setCandleCount(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-text-muted mt-2 px-0.5 number">
            <span>10</span>
            <span>20</span>
            <span>30</span>
            <span>40</span>
            <span>50</span>
            <span>60</span>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={loading}
          className="animate-slide-up relative w-full py-3.5 rounded-xl font-bold text-base tracking-wide transition-all duration-300 overflow-hidden group"
          style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent to-amber-500 opacity-90 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_60%)]" />
          <span className="relative z-10 text-white flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                加载中...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                开始挑战
              </>
            )}
          </span>
        </button>

        {/* Footer hint */}
        <p className="text-center text-text-muted/60 text-xs mt-6 animate-slide-up" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
          随机股票 · 逐根揭示 · 多维评分
        </p>
      </div>
    </div>
  );
}
