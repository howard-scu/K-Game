import ChartPanel from './ChartPanel';
import ControlPanel from './ControlPanel';
import { useGameState } from '../hooks/useGameState';

export default function GameScreen() {
  const { state } = useGameState();
  const totalShares = state.positions.reduce((s, p) => s + p.shares, 0);
  const candle = state.stock.candles[state.currentIndex >= 0 ? state.currentIndex : 0];
  const currentPrice = candle?.close ?? 0;
  const mktVal = totalShares * currentPrice;
  const totalAsset = state.cash + mktVal;

  return (
    <div className="fixed inset-0 bg-surface flex flex-col">
      {/* Top bar */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-border bg-[#0a0c14] shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent pulse-dot" style={{ animationDuration: '1.5s' }} />
            <span className="text-sm font-medium text-text-primary">{state.stock.name}</span>
            <span className="text-xs text-text-muted font-mono">{state.stock.symbol}</span>
          </div>
          <span className="text-border-light">|</span>
          <span className="text-xs text-text-muted">
            <span className="number text-accent">{state.currentIndex + 1}</span>
            <span className="text-text-muted"> / {state.settings.candleCount}</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <TopStat label="资金" value={`¥${state.cash.toFixed(0)}`} />
          <TopStat label="市值" value={`¥${mktVal.toFixed(0)}`} highlight={mktVal > 0} />
          <TopStat label="总资产" value={`¥${totalAsset.toFixed(0)}`} highlight />
          {totalShares > 0 && (
            <TopStat label="持仓" value={`${totalShares}股`} />
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0">
          <ChartPanel />
        </div>
        <ControlPanel />
      </div>
    </div>
  );
}

function TopStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-xs text-text-muted">{label}</span>
      <span className={`number text-sm font-semibold ${highlight ? 'text-text-primary' : 'text-text-secondary'}`}>{value}</span>
    </div>
  );
}
