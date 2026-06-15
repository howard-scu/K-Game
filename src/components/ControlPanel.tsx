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

      {state.currentIndex === -1 ? (
        <button
          onClick={handleHold}
          className="w-full py-4 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg transition-colors mt-4"
        >
          揭示第一根K线
        </button>
      ) : (
        <>
          <div className="bg-gray-800 rounded p-2 text-center text-sm text-gray-300">
            第 {state.currentIndex + 1} / {state.settings.candleCount} 根
          </div>

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

          <div className="text-xs text-gray-500 text-center">
            当前价: ¥{currentPrice.toFixed(2)}
          </div>

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
        </>
      )}
    </div>
  );
}
