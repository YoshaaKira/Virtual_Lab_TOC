import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TapeVisualizationProps {
  tape: string[];
  headPosition: number;
  blankSymbol?: string;
}

export default function TapeVisualization({ tape, headPosition, blankSymbol = '_' }: TapeVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const activeCell = containerRef.current.querySelector('.tape-cell.active');
      activeCell?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [headPosition]);

  const displayTape = [...tape];
  // Pad left and right for display
  const startPad = Math.max(0, 2 - headPosition);
  const padded = [...Array(startPad).fill(blankSymbol), ...displayTape, blankSymbol, blankSymbol];
  const adjustedHead = headPosition + startPad;

  return (
    <div className="space-y-3">
      {/* Head indicator */}
      <div className="flex items-end gap-0 overflow-x-auto pb-2" ref={containerRef}>
        {padded.map((sym, idx) => (
          <div key={idx} className="flex flex-col items-center">
            {idx === adjustedHead && (
              <motion.div
                layoutId="head-indicator"
                className="text-blue-400 text-xs font-bold mb-1"
                initial={{ y: -5 }}
                animate={{ y: 0 }}
              >
                ▼
              </motion.div>
            )}
            {idx !== adjustedHead && <div className="h-5" />}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${idx}-${sym}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`tape-cell ${idx === adjustedHead ? 'active' : ''}`}
              >
                {sym || blankSymbol}
              </motion.div>
            </AnimatePresence>
            <div className="text-xs text-gray-600 mt-1 w-12 text-center">{idx - startPad}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 border border-blue-400 bg-blue-900/50 rounded-sm" />
          <span>Head position</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 border border-gray-600 bg-gray-800 rounded-sm" />
          <span>Tape cell</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono">{blankSymbol}</span>
          <span>= blank</span>
        </div>
      </div>
    </div>
  );
}
