import { Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward } from 'lucide-react';

interface SimulationControlsProps {
  isRunning: boolean;
  currentStep: number;
  totalSteps: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onFinish: () => void;
  speed?: number;
  onSpeedChange?: (speed: number) => void;
}

export default function SimulationControls({
  isRunning, currentStep, totalSteps, onPlay, onPause,
  onNext, onPrev, onReset, onFinish, speed = 500, onSpeedChange,
}: SimulationControlsProps) {
  const progress = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="card space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-16">Step {currentStep + 1}/{Math.max(totalSteps, 1)}</span>
        <div className="flex-1 bg-gray-800 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <button onClick={onReset} className="btn-secondary p-2" title="Reset">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button onClick={onPrev} disabled={currentStep === 0} className="btn-secondary p-2" title="Previous step">
          <SkipBack className="w-4 h-4" />
        </button>
        {isRunning ? (
          <button onClick={onPause} className="btn-primary px-6 py-2 flex items-center gap-2">
            <Pause className="w-4 h-4" /> Pause
          </button>
        ) : (
          <button onClick={onPlay} disabled={currentStep >= totalSteps - 1} className="btn-primary px-6 py-2 flex items-center gap-2">
            <Play className="w-4 h-4" /> Play
          </button>
        )}
        <button onClick={onNext} disabled={currentStep >= totalSteps - 1} className="btn-secondary p-2" title="Next step">
          <SkipForward className="w-4 h-4" />
        </button>
        <button onClick={onFinish} className="btn-secondary p-2" title="Jump to end">
          <FastForward className="w-4 h-4" />
        </button>
      </div>

      {/* Speed control */}
      {onSpeedChange && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Speed</span>
          <input
            type="range" min={100} max={2000} step={100}
            value={2100 - speed}
            onChange={e => onSpeedChange(2100 - Number(e.target.value))}
            className="flex-1 accent-blue-500"
          />
          <span className="text-xs text-gray-500">{speed < 400 ? 'Fast' : speed > 1200 ? 'Slow' : 'Normal'}</span>
        </div>
      )}
    </div>
  );
}
