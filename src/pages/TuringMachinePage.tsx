import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { TMDefinition, TMSimulationStep } from '../types';
import { simulateTM } from '../engines/turingMachine';
import TapeVisualization from '../components/automata/TapeVisualization';
import SimulationControls from '../components/shared/SimulationControls';
import ResultBanner from '../components/shared/ResultBanner';
import InputPanel from '../components/shared/InputPanel';
import { markTopicVisited } from '../utils/progress';

// Default TM: Accepts strings of the form a^n b^n
const DEFAULT_TM: TMDefinition = {
  states: [
    { id: 'q0', label: 'q0', isInitial: true, isAccept: false, isReject: false },
    { id: 'q1', label: 'q1', isInitial: false, isAccept: false, isReject: false },
    { id: 'q2', label: 'q2', isInitial: false, isAccept: false, isReject: false },
    { id: 'q3', label: 'q3', isInitial: false, isAccept: false, isReject: false },
    { id: 'qA', label: 'qA', isInitial: false, isAccept: true, isReject: false },
    { id: 'qR', label: 'qR', isInitial: false, isAccept: false, isReject: true },
  ],
  transitions: [
    { id: 't1', fromState: 'q0', readSymbol: 'a', writeSymbol: 'X', direction: 'R', toState: 'q1' },
    { id: 't2', fromState: 'q0', readSymbol: 'Y', writeSymbol: 'Y', direction: 'R', toState: 'q3' },
    { id: 't3', fromState: 'q0', readSymbol: '_', writeSymbol: '_', direction: 'R', toState: 'qA' },
    { id: 't4', fromState: 'q1', readSymbol: 'a', writeSymbol: 'a', direction: 'R', toState: 'q1' },
    { id: 't5', fromState: 'q1', readSymbol: 'Y', writeSymbol: 'Y', direction: 'R', toState: 'q1' },
    { id: 't6', fromState: 'q1', readSymbol: 'b', writeSymbol: 'Y', direction: 'L', toState: 'q2' },
    { id: 't7', fromState: 'q2', readSymbol: 'a', writeSymbol: 'a', direction: 'L', toState: 'q2' },
    { id: 't8', fromState: 'q2', readSymbol: 'Y', writeSymbol: 'Y', direction: 'L', toState: 'q2' },
    { id: 't9', fromState: 'q2', readSymbol: 'X', writeSymbol: 'X', direction: 'R', toState: 'q0' },
    { id: 't10', fromState: 'q3', readSymbol: 'Y', writeSymbol: 'Y', direction: 'R', toState: 'q3' },
    { id: 't11', fromState: 'q3', readSymbol: '_', writeSymbol: '_', direction: 'R', toState: 'qA' },
  ],
  inputAlphabet: ['a', 'b'],
  tapeAlphabet: ['a', 'b', 'X', 'Y', '_'],
  blankSymbol: '_',
};

export default function TuringMachinePage() {
  const [def, setDef] = useState<TMDefinition>(DEFAULT_TM);
  const [steps, setSteps] = useState<TMSimulationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [newTrans, setNewTrans] = useState({ from: '', read: '', write: '', dir: 'R', to: '' });
  const intervalRef = useRef<number>();

  useEffect(() => { markTopicVisited('turing_machine'); }, []);

  const runSimulation = useCallback((input: string) => {
    const result = simulateTM(def, input);
    setSteps(result.steps);
    setCurrentStep(0);
    setAccepted(null);
  }, [def]);

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
      setAccepted(!!stateObj?.isAccept);
      setIsRunning(false);
    }
  }, [currentStep, steps, def.states]);

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
    const t = { id: `t${Date.now()}`, fromState: newTrans.from, readSymbol: newTrans.read || '_', writeSymbol: newTrans.write || '_', direction: newTrans.dir as 'L' | 'R' | 'S', toState: newTrans.to };
    setDef(d => ({ ...d, transitions: [...d.transitions, t] }));
    setNewTrans({ from: '', read: '', write: '', dir: 'R', to: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Turing Machine Simulator</h1>
        <p className="text-gray-400 text-sm">Default TM accepts {'{'}aⁿbⁿ | n ≥ 0{'}'} — watch the tape head read, write, and move</p>
      </div>

      {/* Tape */}
      <div className="card">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          Tape
          {cur && (
            <span className="badge badge-blue ml-2">State: {cur.currentState}</span>
          )}
          {cur?.writeSymbol && (
            <span className="badge badge-yellow">Wrote: {cur.writeSymbol}</span>
          )}
          {cur?.direction && (
            <span className="badge badge-purple">Moved: {cur.direction === 'L' ? '← Left' : cur.direction === 'R' ? 'Right →' : 'Stay'}</span>
          )}
        </h3>
        <TapeVisualization
          tape={cur?.tape ?? ([] as string[])}
          headPosition={cur?.headPosition ?? 0}
          blankSymbol={def.blankSymbol}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* States */}
        <div className="card">
          <h3 className="font-semibold text-white mb-3">States</h3>
          <div className="grid grid-cols-2 gap-2">
            {def.states.map(s => (
              <div key={s.id} className={`p-2 rounded-lg border text-center ${
                cur?.currentState === s.id
                  ? 'border-blue-500 bg-blue-900/40 text-blue-300'
                  : s.isAccept ? 'border-green-700 bg-green-900/20'
                  : s.isReject ? 'border-red-700 bg-red-900/20'
                  : 'border-gray-700 bg-gray-800'
              }`}>
                <div className="font-mono font-bold text-sm">{s.label}</div>
                <div className="text-xs text-gray-400">
                  {s.isInitial && 'Start'} {s.isAccept && '✓ Accept'} {s.isReject && '× Reject'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transition table */}
        <div className="card">
          <h3 className="font-semibold text-white mb-3">δ(state, symbol) = (state, symbol, direction)</h3>
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-900">
                <tr className="border-b border-gray-700">
                  {['From', 'Read', 'Write', 'Dir', 'To'].map(h => <th key={h} className="px-2 py-1 text-left text-gray-400">{h}</th>)}
                  <th />
                </tr>
              </thead>
              <tbody>
                {def.transitions.map(t => (
                  <tr key={t.id} className={`border-b border-gray-800 ${
                    cur?.transitionUsed === t.id ? 'bg-blue-900/40 text-blue-300' : 'hover:bg-gray-800'
                  }`}>
                    <td className="px-2 py-1 font-mono">{t.fromState}</td>
                    <td className="px-2 py-1 font-mono">{t.readSymbol}</td>
                    <td className="px-2 py-1 font-mono">{t.writeSymbol}</td>
                    <td className="px-2 py-1 font-mono">{t.direction}</td>
                    <td className="px-2 py-1 font-mono">{t.toState}</td>
                    <td className="px-2 py-1">
                      <button onClick={() => setDef(d => ({ ...d, transitions: d.transitions.filter(x => x.id !== t.id) }))} className="text-red-500">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add transition */}
        <div className="card">
          <h3 className="font-semibold text-white mb-3">Add Transition</h3>
          <div className="space-y-2">
            {[['From State', 'from'], ['Read Symbol', 'read'], ['Write Symbol', 'write'], ['To State', 'to']].map(([lbl, key]) => (
              <div key={key}>
                <label className="label text-xs">{lbl}</label>
                <input className="input text-xs" value={newTrans[key as keyof typeof newTrans]} onChange={e => setNewTrans(n => ({ ...n, [key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="label text-xs">Direction</label>
              <select className="input text-xs" value={newTrans.dir} onChange={e => setNewTrans(n => ({ ...n, dir: e.target.value }))}>
                <option value="R">Right (R)</option>
                <option value="L">Left (L)</option>
                <option value="S">Stay (S)</option>
              </select>
            </div>
            <button onClick={addTransition} className="btn-primary w-full mt-2">
              <Plus className="w-4 h-4 inline mr-1" />Add Transition
            </button>
          </div>
        </div>
      </div>

      {/* Quick Test Chips */}
      <div className="card space-y-2">
        <span className="text-xs font-semibold text-gray-400">Sample Test Cases (Default: aⁿbⁿ Decider)</span>
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

      <InputPanel onRun={runSimulation} onClear={handleClear} placeholder="e.g. aaabbb" hint="Input symbols should be from the input alphabet. Blank = '_'." />

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
      <ResultBanner accepted={accepted} message={
        accepted === true ? 'String Accepted ✓ — Reached accept state'
        : accepted === false ? 'String Rejected ✗ — Reached reject/stuck state'
        : undefined
      } />
    </div>
  );
}
