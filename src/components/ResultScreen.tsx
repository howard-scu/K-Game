import { useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { calcScore } from '../lib/scoring';

const GRADE_META: Record<string, { label: string; color: string; desc: string }> = {
  S: { label: 'S', color: 'text-accent', desc: '股神附体' },
  A: { label: 'A', color: 'text-teal-400', desc: '高手风范' },
  B: { label: 'B', color: 'text-blue-400', desc: '初窥门径' },
  C: { label: 'C', color: 'text-orange-400', desc: '还需修炼' },
  D: { label: 'D', color: 'text-rose-500', desc: '韭菜本韭' },
};

const GRADE_GRADIENT: Record<string, string> = {
  S: 'from-accent to-amber-400',
  A: 'from-teal-400 to-emerald-400',
  B: 'from-blue-400 to-indigo-400',
  C: 'from-orange-400 to-amber-500',
  D: 'from-rose-500 to-pink-500',
};

function useScore() {
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
  return state.score;
}

export default function ResultScreen() {
  const { state, dispatch } = useGameState();
  const score = useScore();
  if (!score) return null;

  const meta = GRADE_META[score.grade] ?? GRADE_META.D;

  return (
    <div className="fixed inset-0 bg-surface overflow-hidden flex flex-col items-center justify-center">
      {/* Grid bg */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Grade display */}
        <div className="text-center mb-8 animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <div className={`text-[5rem] font-black leading-none mb-2 grade-glow-${score.grade} number ${meta.color}`}>
            {meta.label}
          </div>
          <p className="text-text-muted text-sm mb-1">{meta.desc}</p>
          <p className={`number text-lg font-semibold ${meta.color}`}>
            综合评分 {score.overall.toFixed(0)}
          </p>

          {/* Grade bar */}
          <div className="progress-bar max-w-xs mx-auto mt-4">
            <div className={`progress-bar-fill bg-gradient-to-r ${GRADE_GRADIENT[score.grade]}`} style={{ width: `${score.overall}%` }} />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <StatBox
            label="总收益率"
            value={`${score.totalReturn >= 0 ? '+' : ''}${score.totalReturn.toFixed(2)}%`}
            color={score.totalReturn >= 0 ? 'text-rose-500' : 'text-teal-400'}
            delay={0.2}
          />
          <StatBox
            label="大盘同期"
            value={`${score.benchmarkReturn >= 0 ? '+' : ''}${score.benchmarkReturn.toFixed(2)}%`}
            delay={0.25}
          />
          <StatBox
            label="vs 大盘"
            value={`${score.vsBenchmark >= 0 ? '+' : ''}${score.vsBenchmark.toFixed(2)}%`}
            color={score.vsBenchmark >= 0 ? 'text-rose-500' : 'text-teal-400'}
            delay={0.3}
          />
          <StatBox
            label="胜率"
            value={`${score.winRate.toFixed(1)}%`}
            delay={0.35}
          />
          <StatBox
            label="盈亏比"
            value={score.profitLossRatio.toFixed(2)}
            delay={0.4}
          />
          <StatBox
            label="最大回撤"
            value={`${score.maxDrawdown.toFixed(2)}%`}
            color="text-rose-500"
            delay={0.45}
          />
        </div>

        {/* Trade history */}
        <div className="glass-card rounded-xl max-h-36 overflow-y-auto mb-6 animate-slide-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
          <div className="sticky top-0 bg-[#151729]/90 backdrop-blur px-4 py-2 border-b border-border">
            <span className="text-xs text-text-muted">操作记录</span>
          </div>
          <div className="px-4 py-2 space-y-1">
            {state.history.length === 0 ? (
              <div className="text-xs text-text-muted py-2 text-center">无操作</div>
            ) : (
              state.history.map((a, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${a.type === 'buy' ? 'bg-rose-500' : a.type === 'sell' ? 'bg-teal-400' : 'bg-text-muted'}`} />
                    <span className={`text-xs font-medium ${a.type === 'buy' ? 'text-rose-400' : a.type === 'sell' ? 'text-teal-400' : 'text-text-muted'}`}>
                      {a.type === 'buy' ? '买入' : a.type === 'sell' ? '卖出' : '观望'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="number text-xs text-text-secondary">{a.shares}股</span>
                    <span className="number text-xs text-text-muted">¥{a.price.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="animate-slide-up relative w-full py-3.5 rounded-xl font-bold text-base tracking-wide transition-all duration-300 overflow-hidden group"
          style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent to-amber-500 opacity-90 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 text-black flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            再来一局
          </span>
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value, color = 'text-text-primary', delay }: { label: string; value: string; color?: string; delay: number }) {
  return (
    <div
      className="glass-card rounded-xl px-4 py-3 animate-slide-up"
      style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
    >
      <div className="text-xs text-text-muted mb-0.5">{label}</div>
      <div className={`number text-lg font-bold ${color}`}>{value}</div>
    </div>
  );
}
