import { useState } from 'react';
import { Play, Trash2 } from 'lucide-react';

interface InputPanelProps {
  onRun: (input: string) => void;
  onClear: () => void;
  placeholder?: string;
  label?: string;
  hint?: string;
}

export default function InputPanel({ onRun, onClear, placeholder = 'Enter input string...', label = 'Input String', hint }: InputPanelProps) {
  const [input, setInput] = useState('');

  return (
    <div className="card space-y-3">
      <label className="label">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onRun(input)}
          placeholder={placeholder}
          className="input flex-1 font-mono"
        />
        <button onClick={() => onRun(input)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Play className="w-4 h-4" /> Run
        </button>
        <button onClick={() => { setInput(''); onClear(); }} className="btn-secondary p-2">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
