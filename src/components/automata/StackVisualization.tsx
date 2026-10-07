import { motion, AnimatePresence } from 'framer-motion';

interface StackVisualizationProps {
  stack: string[];
  lastAction?: 'push' | 'pop' | 'replace' | 'none';
}

export default function StackVisualization({ stack, lastAction }: StackVisualizationProps) {
  const displayStack = stack.length > 0 ? stack : ['(empty)'];

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-400 flex items-center justify-between">
        <span>Stack</span>
        {lastAction && lastAction !== 'none' && (
          <span className={`badge ${
            lastAction === 'push' ? 'badge-green' :
            lastAction === 'pop' ? 'badge-red' : 'badge-yellow'
          }`}>
            {lastAction.toUpperCase()}
          </span>
        )}
      </div>

      <div className="border border-gray-700 rounded-lg overflow-hidden min-h-[120px] flex flex-col-reverse">
        <div className="bg-gray-800 text-center text-xs text-gray-500 py-1 border-t border-gray-700">
          Bottom of Stack
        </div>
        <AnimatePresence mode="popLayout">
          {displayStack.map((sym, idx) => (
            <motion.div
              key={`${idx}-${sym}`}
              initial={{ opacity: 0, x: idx === 0 ? -20 : 0, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`stack-cell ${
                idx === 0
                  ? lastAction === 'push' ? 'border-t-green-500' :
                    lastAction === 'pop' ? 'border-t-red-500' : 'border-t-blue-500'
                  : ''
              }`}
            >
              <span className="font-mono font-bold text-gray-200">{sym}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="bg-gray-800 text-center text-xs text-gray-500 py-1">
          Top of Stack
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Depth: {stack.length}
      </div>
    </div>
  );
}
