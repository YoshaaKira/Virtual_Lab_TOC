import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Star, ArrowRight } from 'lucide-react';

interface StateNodeData {
  label: string;
  isInitial: boolean;
  isFinal: boolean;
  isActive: boolean;
  onLabelChange: (label: string) => void;
  onToggleInitial: () => void;
  onToggleFinal: () => void;
  onDelete: () => void;
}

const StateNode = memo(({ data }: { data: StateNodeData }) => {
  const [editing, setEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(data.label);

  const handleDoubleClick = () => {
    setTempLabel(data.label);
    setEditing(true);
  };

  const handleSubmit = () => {
    data.onLabelChange(tempLabel || data.label);
    setEditing(false);
  };

  return (
    <div className={`relative select-none ${
      data.isActive ? 'state-active' : ''
    }`}>
      {/* Initial state arrow indicator */}
      {data.isInitial && (
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-blue-400">
          <ArrowRight className="w-5 h-5" />
        </div>
      )}

      {/* Outer ring for final state */}
      {data.isFinal && (
        <div className={`absolute inset-0 rounded-full border-2 ${
          data.isActive ? 'border-blue-400' : 'border-gray-400'
        } scale-110 pointer-events-none`} />
      )}

      {/* Main circle */}
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center border-2 cursor-pointer transition-all duration-200 ${
          data.isActive
            ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900'
            : data.isInitial
            ? 'bg-indigo-900 border-indigo-500 text-white'
            : data.isFinal
            ? 'bg-green-900 border-green-500 text-white'
            : 'bg-gray-800 border-gray-600 text-gray-200'
        }`}
        onDoubleClick={handleDoubleClick}
      >
        {editing ? (
          <input
            autoFocus
            value={tempLabel}
            onChange={e => setTempLabel(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); e.stopPropagation(); }}
            className="w-10 bg-transparent text-center text-xs outline-none text-white"
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className="text-xs font-bold">{data.label}</span>
        )}
      </div>

      {/* Action buttons (appear on hover via CSS) */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={data.onToggleInitial}
          title="Toggle initial"
          className={`p-0.5 rounded text-xs ${
            data.isInitial ? 'text-blue-400' : 'text-gray-500 hover:text-blue-400'
          }`}
        >
          <ArrowRight className="w-3 h-3" />
        </button>
        <button
          onClick={data.onToggleFinal}
          title="Toggle final"
          className={`p-0.5 rounded text-xs ${
            data.isFinal ? 'text-green-400' : 'text-gray-500 hover:text-green-400'
          }`}
        >
          <Star className="w-3 h-3" />
        </button>
        <button
          onClick={data.onDelete}
          title="Delete"
          className="p-0.5 rounded text-gray-500 hover:text-red-400"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <Handle type="target" position={Position.Left} className="!bg-gray-600" />
      <Handle type="source" position={Position.Right} className="!bg-gray-600" />
    </div>
  );
});

StateNode.displayName = 'StateNode';
export default StateNode;
