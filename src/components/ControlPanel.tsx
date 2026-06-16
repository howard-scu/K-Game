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
  const positionRatio = totalAsset > 0 ? marketValue / totalAsset : 0;

  const handleHold = () => {
    dispatch({ type: 'NEXT_CANDLE' });
  };

  return (
    <div className="flex flex-col h-full px-4 py-2.5 gap-1.5 justify-between">
      {/* Row 1: Price + account summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2.5">
          <span className="number text-2xl font-bold text-text-primary">
            ¥{currentPrice.toFixed(2)}
          </span>
          {totalShares > 0 && (
            <span className={`number text-sm font-semibold ${profitPct >= 0 ? 'text-rose-500' : 'text-teal-400'}`}>
              {profitPct >= 0 ? '+' : ''}{profitPct.toFixed(2)}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <MiniStat label="资金" value={`¥${state.cash.toFixed(0)}`} />
          <MiniStat label="总资产" value={`¥${totalAsset.toFixed(0)}`} />
        </div>
      </div>

      {/* Row 2: Position bar */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-text-muted shrink-0">仓位</span>
        <div className="flex-1 h-2.5 rounded-full bg-card overflow-hidden border border-border">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${(positionRatio * 100).toFixed(1)}%`,
              background: 'linear-gradient(90deg, #0077BB, #CC3311)',
            }}
          />
        </div>
        <span className="number text-text-secondary">
          {(positionRatio * 100).toFixed(0)}%
        </span>
        {totalShares > 0 && (
          <span className="text-text-muted">
            {totalShares}股 · 成本¥{avgCost.toFixed(2)}
          </span>
        )}
        {totalShares === 0 && <span className="text-text-muted">空仓</span>}
      </div>

      {/* Row 3: Buy */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted font-medium shrink-0">买入</span>
        <span className="w-2 h-0.5 rounded bg-rose-500 shrink-0" />
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
              className="flex-1 py-2 rounded-md text-xs font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-20 disabled:cursor-not-allowed bg-rose-600/90 text-white hover:bg-rose-500"
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Row 4: Sell */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted font-medium shrink-0">卖出</span>
        <span className="w-2 h-0.5 rounded bg-teal-400 shrink-0" />
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
            className="flex-1 py-2 rounded-md text-xs font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-20 disabled:cursor-not-allowed bg-teal-600/90 text-white hover:bg-teal-500"
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Row 5: 观望 — full width */}
      <button
        onClick={handleHold}
        className="w-full py-2 rounded-md text-xs font-semibold transition-all duration-150 active:scale-[0.98] border border-border bg-card hover:bg-[#1a1d30] text-text-secondary hover:text-text-primary flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        观望此票，下一根
      </button>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-text-muted">{label}</span>
      <span className="number text-text-primary font-medium">{value}</span>
    </div>
  );
}
