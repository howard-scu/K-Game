import { useEffect } from 'react';
import { GameProvider, useGameState } from './context/GameContext';
import TitleScreen from './components/TitleScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';

function useFullscreen() {
  useEffect(() => {
    import('@capacitor/status-bar').then(({ StatusBar }) => {
      StatusBar.hide();
    }).catch(() => {});
  }, []);
}

function Router() {
  const { state } = useGameState();
  switch (state.phase) {
    case 'welcome': return <TitleScreen />;
    case 'playing': return <GameScreen />;
    case 'result': return <ResultScreen />;
  }
}

export default function App() {
  useFullscreen();
  return (
    <GameProvider>
      <div className="scanlines">
        <Router />
      </div>
    </GameProvider>
  );
}
