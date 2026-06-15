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
