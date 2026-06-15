import { useEffect } from 'react';
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

        <div className="text-center">
          <span className={`text-6xl font-black ${GRADE_COLORS[score.grade]}`}>
            {score.grade}
          </span>
          <p className="text-gray-400 mt-1">综合评分 {score.overall}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="总收益率" value={`${score.totalReturn >= 0 ? '+' : ''}${score.totalReturn.toFixed(2)}%`} color={score.totalReturn >= 0 ? 'text-red-400' : 'text-green-400'} />
          <Stat label="大盘同期" value={`${score.benchmarkReturn >= 0 ? '+' : ''}${score.benchmarkReturn.toFixed(2)}%`} color="text-gray-300" />
          <Stat label="vs 大盘" value={`${score.vsBenchmark >= 0 ? '+' : ''}${score.vsBenchmark.toFixed(2)}%`} color={score.vsBenchmark >= 0 ? 'text-red-400' : 'text-green-400'} />
          <Stat label="胜率" value={`${score.winRate.toFixed(1)}%`} />
          <Stat label="盈亏比" value={score.profitLossRatio.toFixed(2)} />
          <Stat label="最大回撤" value={`${score.maxDrawdown.toFixed(2)}%`} color="text-red-400" />
        </div>

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
