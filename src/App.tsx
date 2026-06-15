import { GameProvider, useGameState } from './context/GameContext';
import TitleScreen from './components/TitleScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';

function Router() {
  const { state } = useGameState();
  switch (state.phase) {
    case 'welcome': return <TitleScreen />;
    case 'playing': return <GameScreen />;
    case 'result': return <ResultScreen />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <div className="scanlines">
        <Router />
      </div>
    </GameProvider>
  );
}
