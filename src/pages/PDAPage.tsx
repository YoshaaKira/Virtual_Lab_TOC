import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { PDADefinition, PDASimulationStep } from '../types';
import { simulatePDA } from '../engines/pda';
import StackVisualization from '../components/automata/StackVisualization';
import SimulationControls from '../components/shared/SimulationControls';
import ResultBanner from '../components/shared/ResultBanner';
import InputPanel from '../components/shared/InputPanel';
import { markTopicVisited } from '../utils/progress';

const DEFAULT_PDA: PDADefinition = {
  states: [
    { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 80, y: 200 },
    { id: 'q1', label: 'q1', isInitial: false, isFinal: false, x: 280, y: 200 },
    { id: 'q2', label: 'q2', isInitial: false, isFinal: true, x: 480, y: 200 },
  ],
  transitions: [
    { id: 't1', from: 'q0', to: 'q0', inputSymbol: 'a', stackTop: 'Z', pushSymbol: 'AZ' },
    { id: 't2', from: 'q0', to: 'q0', inputSymbol: 'a', stackTop: 'A', pushSymbol: 'AA' },
    { id: 't3', from: 'q0', to: 'q1', inputSymbol: 'ε', stackTop: 'ε', pushSymbol: 'ε' },
    { id: 't4', from: 'q1', to: 'q1', inputSymbol: 'b', stackTop: 'A', pushSymbol: 'ε' },
    { id: 't5', from: 'q1', to: 'q2', inputSymbol: 'ε', stackTop: 'Z', pushSymbol: 'Z' },
  ],
  inputAlphabet: ['a', 'b'],
  stackAlphabet: ['A', 'Z'],
  initialStackSymbol: 'Z',
};

export default function PDAPage() {
  const [def, setDef] = useState<PDADefinition>(DEFAULT_PDA);
  const [steps, setSteps] = useState<PDASimulationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [acceptMode, setAcceptMode] = useState<'final_state' | 'empty_stack'>('final_state');
  const [newTrans, setNewTrans] = useState({ from: '', to: '', input: '', stackTop: '', push: '' });
  const intervalRef = useRef<number>();

  useEffect(() => { markTopicVisited('pda'); }, []);

  const runSimulation = useCallback((input: string) => {
    const result = simulatePDA(def, input, acceptMode);
    setSteps(result.steps);
    setCurrentStep(0);
    setAccepted(null);
  }, [def, acceptMode]);

  const handleClear = () => {
    setSteps([]);
    setCurrentStep(0);
    setAccepted(null);
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (steps.length > 0 && currentStep === steps.length - 1) {
      const last = steps[currentStep];
      const stateObj = def.states.find(s => s.id === last.currentState);
      const finAcc = acceptMode === 'final_state' && !!stateObj?.isFinal && last.remainingInput === '';
      const emptyAcc = acceptMode === 'empty_stack' && last.stack.length === 0 && last.remainingInput === '';
      setAccepted(finAcc || emptyAcc);
      setIsRunning(false);
    }
  }, [currentStep, steps, def.states, acceptMode]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setCurrentStep(p => { if (p >= steps.length - 1) { setIsRunning(false); return p; } return p + 1; });
      }, speed);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, speed, steps.length]);

  const cur = steps[currentStep];

  const addTransition = () => {
    if (!newTrans.from || !newTrans.to) return;
    const t = {
      id: `t${Date.now()}`,
      from: newTrans.from,
      to: newTrans.to,
      inputSymbol: newTrans.input || 'ε',
      stackTop: newTrans.stackTop || 'ε',
      pushSymbol: newTrans.push || 'ε',
    };
    setDef(d => ({ ...d, transitions: [...d.transitions, t] }));
    setNewTrans({ from: '', to: '', input: '', stackTop: '', push: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">PDA Simulator</h1>
        <p className="text-gray-400 text-sm">Pushdown Automaton — Observe state transitions and stack operations in real time</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: States & Transitions definition */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-white mb-3">States</h3>
            <div className="space-y-2">
              {def.states.map(s => (
                <div key={s.id} className={`flex items-center gap-2 p-2 rounded-lg border ${
                  cur?.currentState === s.id ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'
                }`}>
                  <span className="font-mono font-bold text-white">{s.label}</span>
                  {s.isInitial && <span className="badge badge-blue">Initial</span>}
                  {s.isFinal && <span className="badge badge-green">Final</span>}
                  {cur?.currentState === s.id && <span className="badge badge-blue ml-auto">Active</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-3">Add Transition</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[['From', 'from'], ['To', 'to'], ['Input (ε=empty)', 'input'],
                ['Stack Top', 'stackTop'], ['Push', 'push']].map(([label, key]) => (
                <div key={key}>
                  <label className="label text-xs">{label}</label>
                  <input
                    className="input text-xs"
                    value={newTrans[key as keyof typeof newTrans]}
                    onChange={e => setNewTrans(n => ({ ...n, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <button onClick={addTransition} className="btn-primary mt-3 w-full">
              <Plus className="w-4 h-4 inline mr-1" />Add
            </button>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-3">Acceptance Mode</h3>
            <div className="space-y-2">
              {(['final_state', 'empty_stack'] as const).map(m => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={acceptMode === m} onChange={() => setAcceptMode(m)} className="accent-blue-500" />
                  <span className="text-sm text-gray-300">
                    {m === 'final_state' ? 'Accept by Final State' : 'Accept by Empty Stack'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Transition table */}
        <div className="card">
          <h3 className="font-semibold text-white mb-3">Transition Function δ</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-2 py-1 text-left text-gray-400">From</th>
                  <th className="px-2 py-1 text-left text-gray-400">Input</th>
                  <th className="px-2 py-1 text-left text-gray-400">Stack</th>
                  <th className="px-2 py-1 text-left text-gray-400">To</th>
                  <th className="px-2 py-1 text-left text-gray-400">Push</th>
                  <th className="px-2 py-1"></th>
                </tr>
              </thead>
              <tbody>
                {def.transitions.map(t => (
                  <tr key={t.id} className={`border-b border-gray-800 ${
                    cur?.transitionUsed === t.id ? 'bg-blue-900/40 text-blue-300' : 'hover:bg-gray-800'
                  }`}>
                    <td className="px-2 py-1 font-mono">{t.from}</td>
                    <td className="px-2 py-1 font-mono">{t.inputSymbol}</td>
                    <td className="px-2 py-1 font-mono">{t.stackTop}</td>
                    <td className="px-2 py-1 font-mono">{t.to}</td>
                    <td className="px-2 py-1 font-mono">{t.pushSymbol}</td>
                    <td className="px-2 py-1">
                      <button onClick={() => setDef(d => ({ ...d, transitions: d.transitions.filter(x => x.id !== t.id) }))} className="text-red-500 hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {cur && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg space-y-2">
              <p className="text-xs text-gray-400 font-medium">Simulation State</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-500">State: </span><span className="font-mono text-blue-300">{cur.currentState}</span></div>
                <div><span className="text-gray-500">Remaining: </span><span className="font-mono">{cur.remainingInput || '(empty)'}</span></div>
                {cur.stackChange && <div className="col-span-2"><span className="text-gray-500">Stack change: </span><span className="font-mono text-yellow-300">{cur.stackChange}</span></div>}
              </div>
            </div>
          )}
        </div>

        {/* Right: Stack visualization */}
        <div className="card">
          <h3 className="font-semibold text-white mb-3">Stack</h3>
          <StackVisualization
            stack={cur?.stack ?? (def.initialStackSymbol ? [def.initialStackSymbol] : [])}
            lastAction={cur?.action}
          />
        </div>
      </div>

      {/* Quick Test Chips */}
      <div className="card space-y-2">
        <span className="text-xs font-semibold text-gray-400">Sample Test Cases (Default: aⁿbⁿ)</span>
        <div className="flex flex-wrap gap-2">
          {[
            { str: 'ab', acc: true, label: 'n=1' },
            { str: 'aabb', acc: true, label: 'n=2' },
            { str: 'aaabbb', acc: true, label: 'n=3' },
            { str: 'aab', acc: false, label: 'a²b¹ (Reject)' },
            { str: 'abb', acc: false, label: 'a¹b² (Reject)' },
            { str: 'ba', acc: false, label: 'b before a (Reject)' },
          ].map((tc, idx) => (
            <button
              key={idx}
              onClick={() => runSimulation(tc.str)}
              className="px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-800/80 hover:bg-gray-700 text-xs flex items-center gap-2"
            >
              <span className="font-mono font-bold text-white">{tc.str}</span>
              <span className="text-[11px] text-gray-400">{tc.label}</span>
              <span className={`text-[10px] font-semibold px-1 rounded ${tc.acc ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'}`}>
                {tc.acc ? 'Accept' : 'Reject'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <InputPanel onRun={runSimulation} onClear={handleClear} placeholder="e.g. aaabbb" hint="Test the PDA on this input. Default example recognizes aⁿbⁿ." />

      {steps.length > 0 && (
        <SimulationControls
          isRunning={isRunning} currentStep={currentStep} totalSteps={steps.length}
          onPlay={() => setIsRunning(true)} onPause={() => setIsRunning(false)}
          onNext={() => setCurrentStep(p => Math.min(p + 1, steps.length - 1))}
          onPrev={() => setCurrentStep(p => Math.max(0, p - 1))}
          onReset={() => { setCurrentStep(0); setIsRunning(false); setAccepted(null); }}
          onFinish={() => setCurrentStep(steps.length - 1)}
          speed={speed} onSpeedChange={setSpeed}
        />
      )}
      <ResultBanner accepted={accepted} />
    </div>
  );
}
