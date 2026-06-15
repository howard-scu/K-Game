import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, GameSettings, TradeAction, KLine, Score } from '../lib/types';

const initialState: GameState = {
  phase: 'welcome',
  stock: { symbol: '', name: '', candles: [], backgroundCandles: [] },
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
