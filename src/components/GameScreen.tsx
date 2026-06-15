import ChartPanel from './ChartPanel';
import ControlPanel from './ControlPanel';

export default function GameScreen() {
  return (
    <div className="flex h-screen bg-gray-950">
      <div className="flex-1 min-w-0">
        <ChartPanel />
      </div>
      <ControlPanel />
    </div>
  );
}
