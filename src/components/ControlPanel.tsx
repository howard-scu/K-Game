import { useGameState } from '../hooks/useGameState';
import { buy, sell } from '../lib/trading';

const FRACTIONS = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '满仓', value: 1 },
] as const;

export default function ControlPanel() {
  const { state, dispatch } = useGameState();

  const candle = state.stock.candles[state.currentIndex];
  const currentPrice = candle?.close ?? 0;
  const totalShares = state.positions.reduce((s, p) => s + p.shares, 0);
  const marketValue = totalShares * currentPrice;
  const totalAsset = state.cash + marketValue;
  const avgCost = state.positions.length > 0
    ? state.positions.reduce((s, p) => s + p.buyPrice * p.shares, 0) / totalShares
    : 0;
  const profitPct = avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0;

  const handleHold = () => {
    dispatch({ type: 'NEXT_CANDLE' });
  };

  const progress = state.currentIndex >= 0
    ? ((state.currentIndex + 1) / state.settings.candleCount) * 100
    : 0;

  return (
    <div className="w-80 bg-[#0d0f1a] border-l border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="text-xs text-text-muted mb-1">操作面板</div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {state.currentIndex >= 0
              ? `第 ${state.currentIndex + 1} / ${state.settings.candleCount} 根`
              : '准备就绪'}
          </span>
          <span className="number text-xs text-accent">
            {state.currentIndex >= 0 ? `${((state.currentIndex + 1) / state.settings.candleCount * 100).toFixed(0)}%` : '0%'}
          </span>
        </div>
        <div className="progress-bar mt-1.5">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Account info */}
      <div className="px-4 py-3 space-y-2 border-b border-border">
        <Row label="可用资金" value={`¥${state.cash.toFixed(2)}`} valueClass="text-text-primary" />
        <Row label="总资产" value={`¥${totalAsset.toFixed(2)}`} valueClass="text-text-primary font-bold" />
        {totalShares > 0 && (
          <>
            <Row label="持仓" value={`${totalShares} 股`} valueClass="text-text-primary" />
            <Row label="成本价" value={`¥${avgCost.toFixed(2)}`} valueClass="text-text-primary secondary" />
            <Row label="当前价" value={`¥${currentPrice.toFixed(2)}`} valueClass="text-text-primary" />
            <Row label="浮动盈亏" value={`${profitPct >= 0 ? '+' : ''}${profitPct.toFixed(2)}%`} valueClass={profitPct >= 0 ? 'text-rose-500' : 'text-teal-400'} />
            <Row label="持仓市值" value={`¥${marketValue.toFixed(2)}`} valueClass="text-text-primary" />
          </>
        )}
      </div>

        <div className="flex-1 flex flex-col px-4 py-3 gap-2.5 overflow-y-auto">
          {/* Current price highlight */}
          <div className="text-center py-2 rounded-lg bg-card border border-border">
            <div className="text-xs text-text-muted mb-0.5">当前价</div>
            <div className="number text-2xl font-bold text-text-primary">
              ¥{currentPrice.toFixed(2)}
            </div>
          </div>

          {/* Buy buttons */}
          <div>
            <div className="text-xs text-text-muted mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              买入
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {FRACTIONS.map(f => {
                const canBuy = state.cash >= currentPrice * 100;
                return (
                  <button
                    key={`buy-${f.value}`}
                    onClick={() => {
                      if (state.cash <= 0) return;
                      const result = buy(state.cash, state.positions, currentPrice, f.value, state.currentIndex);
                      dispatch({ type: 'EXECUTE_ACTION', action: result.action });
                      dispatch({ type: 'NEXT_CANDLE' });
                    }}
                    disabled={!canBuy}
                    className="py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.95] disabled:opacity-25 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-600/90 to-rose-500/90 group-hover:opacity-90 transition-opacity" />
                    <span className="relative z-10 text-white">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sell buttons */}
          <div>
            <div className="text-xs text-text-muted mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              卖出
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {FRACTIONS.map(f => (
                <button
                  key={`sell-${f.value}`}
                  onClick={() => {
                    if (totalShares <= 0) return;
                    const result = sell(state.cash, state.positions, currentPrice, f.value, state.currentIndex);
                    dispatch({ type: 'EXECUTE_ACTION', action: result.action });
                    dispatch({ type: 'NEXT_CANDLE' });
                  }}
                  disabled={totalShares <= 0}
                  className="py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.95] disabled:opacity-25 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600/90 to-teal-500/90 group-hover:opacity-90 transition-opacity" />
                  <span className="relative z-10 text-white">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hold button */}
          <button
            onClick={handleHold}
            className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-[0.98] group relative overflow-hidden border border-border"
          >
            <div className="absolute inset-0 bg-card group-hover:bg-[#1a1d30] transition-colors" />
            <span className="relative z-10 text-text-secondary group-hover:text-text-primary flex items-center justify-center gap-1.5">
              观望
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </span>
          </button>
        </div>
    </div>
  );
}

function Row({ label, value, valueClass = 'text-text-primary' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-xs text-text-muted">{label}</span>
      <span className={`number text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}
