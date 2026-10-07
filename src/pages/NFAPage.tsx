import { useState, useEffect, useRef, useCallback } from 'react';
import { NFA_PRESETS, AutomatonPreset } from '../data/automataPresets';
import type { FASimulationStep } from '../types';
import { simulateNFA } from '../engines/nfa';
import FAEditor from '../components/automata/FAEditor';
import SimulationControls from '../components/shared/SimulationControls';
import ResultBanner from '../components/shared/ResultBanner';
import TransitionTable from '../components/automata/TransitionTable';
import { markTopicVisited } from '../utils/progress';
import { CheckCircle2, XCircle, Play, Sparkles, BookOpen, Layers, ListChecks } from 'lucide-react';

export default function NFAPage() {
  const [selectedPreset, setSelectedPreset] = useState<AutomatonPreset>(NFA_PRESETS[0]);
  const [inputString, setInputString] = useState<string>('01');
  const [steps, setSteps] = useState<FASimulationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(700);
  const [batchResults, setBatchResults] = useState<{ input: string; expected: boolean; actual: boolean; pass: boolean }[] | null>(null);
  const intervalRef = useRef<number>();

  useEffect(() => {
    markTopicVisited('nfa');
  }, []);

  const handleSelectPreset = (preset: AutomatonPreset) => {
    setSelectedPreset(preset);
    setInputString(preset.testCases[0]?.input ?? '');
    setSteps([]);
    setCurrentStep(0);
    setAccepted(null);
    setIsRunning(false);
    setBatchResults(null);
    clearInterval(intervalRef.current);
  };

  const runSimulationOnInput = useCallback((input: string) => {
    setBatchResults(null);
    const result = simulateNFA(selectedPreset.def, input);
    setSteps(result.steps);
    setCurrentStep(0);
    setAccepted(null);
    setIsRunning(false);
  }, [selectedPreset]);

  const handleTestClick = (testInput: string) => {
    setInputString(testInput);
    runSimulationOnInput(testInput);
  };

  const handleRunAllTests = () => {
    const results = selectedPreset.testCases.map(tc => {
      const res = simulateNFA(selectedPreset.def, tc.input);
      return {
        input: tc.input,
        expected: tc.expected,
        actual: res.accepted,
        pass: res.accepted === tc.expected,
      };
    });
    setBatchResults(results);
  };

  const handleClear = () => {
    setSteps([]);
    setCurrentStep(0);
    setAccepted(null);
    setIsRunning(false);
    setBatchResults(null);
    clearInterval(intervalRef.current);
  };

  const handleNext = useCallback(() => {
    setCurrentStep(prev => {
      const next = Math.min(prev + 1, steps.length - 1);
      if (next === steps.length - 1) {
        const lastStep = steps[next];
        const finalIds = selectedPreset.def.states.filter(s => s.isFinal).map(s => s.id);
        const acc = (lastStep?.nfaStates ?? [lastStep?.currentState]).some(id => finalIds.includes(id));
        setAccepted(acc);
      }
      return next;
    });
  }, [steps, selectedPreset.def.states]);

  useEffect(() => {
    if (steps.length > 0 && currentStep === steps.length - 1) {
      const lastStep = steps[currentStep];
      const finalIds = selectedPreset.def.states.filter(s => s.isFinal).map(s => s.id);
      const acc = (lastStep?.nfaStates ?? [lastStep?.currentState]).some(id => finalIds.includes(id));
      setAccepted(acc);
      setIsRunning(false);
      clearInterval(intervalRef.current);
    }
  }, [currentStep, steps, selectedPreset.def.states]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsRunning(false);
            clearInterval(intervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, speed, steps.length]);

  const currentStepData = steps[currentStep];
  const activeStateIds = currentStepData?.nfaStates ?? (currentStepData ? [currentStepData.currentState] : []);

  const transitionRows = selectedPreset.def.transitions.map(t => ({
    id: t.id,
    from: t.from,
    symbol: t.symbol,
    to: t.to,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-purple">Interactive Lab</span>
          <span className="text-xs text-gray-400">Theory of Computation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Predefined NFA Simulator</h1>
        <p className="text-gray-400 text-sm mt-1">
          Explore Nondeterministic Finite Automata with parallel branch exploration and $\varepsilon$-transitions. Choose a predefined machine and test strings.
        </p>
      </div>

      {/* Preset Selector Grid */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          Choose a Predefined NFA
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {NFA_PRESETS.map(preset => {
            const isSelected = preset.id === selectedPreset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-500 bg-purple-950/50 shadow-lg shadow-purple-900/30'
                    : 'border-gray-800 bg-gray-900/80 hover:bg-gray-800 hover:border-gray-700'
                }`}
              >
                <div>
                  <h3 className={`text-xs font-bold ${isSelected ? 'text-purple-300' : 'text-white'}`}>
                    {preset.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-gray-500 font-mono">Σ = {'{'}{preset.alphabet.join(', ')}{'}'}</span>
                  {isSelected && <span className="badge badge-purple text-[9px] py-0 px-1.5">Active</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Preset Info Card */}
      <div className="card bg-gradient-to-r from-gray-900 via-purple-950/20 to-gray-900 border-purple-900/40 p-4 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs text-purple-400 font-semibold tracking-wide">SELECTED AUTOMATON</span>
            <h2 className="text-xl font-bold text-white">{selectedPreset.name}</h2>
          </div>
          <div className="bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700/60 font-mono text-xs text-yellow-300 self-start sm:self-auto">
            {selectedPreset.formula}
          </div>
        </div>
        <p className="text-sm text-gray-300">
          {selectedPreset.description}
        </p>
      </div>

      {/* Main Simulation Section */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Automaton Graph Visualization */}
        <div className="xl:col-span-3 panel overflow-hidden flex flex-col" style={{ height: 480 }}>
          <div className="bg-gray-900/90 border-b border-gray-800 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5 font-medium text-gray-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              NFA State Graph
            </span>
            <span>
              {selectedPreset.def.states.length} states, {selectedPreset.def.transitions.length} transitions
            </span>
          </div>
          <div className="flex-1 w-full relative">
            <FAEditor
              states={selectedPreset.def.states}
              transitions={selectedPreset.def.transitions}
              activeStateIds={activeStateIds}
              activeTransitionId={null}
              onStatesChange={() => {}}
              onTransitionsChange={() => {}}
              mode="simulate"
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Active States in NFA */}
          {currentStepData && (
            <div className="card border-purple-800/60 bg-purple-950/20 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-purple-400 font-semibold">
                <span>SIMULATION STEP {currentStep + 1}/{steps.length}</span>
                {accepted !== null && (
                  <span className={accepted ? 'text-green-400' : 'text-red-400'}>
                    {accepted ? 'ACCEPTED' : 'REJECTED'}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block mb-1">Active States Set (Parallel Paths):</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeStateIds.map(st => (
                    <span key={st} className="badge badge-purple font-mono font-bold text-xs">
                      {st}
                    </span>
                  ))}
                  {activeStateIds.length === 0 && (
                    <span className="text-red-400 text-xs italic">∅ (Dead branch)</span>
                  )}
                </div>
              </div>
              <div className="space-y-1 text-xs pt-1 border-t border-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-400">Symbol Read:</span>
                  <span className="font-mono text-yellow-300">{currentStepData.symbol ?? '— (start)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Remaining Input:</span>
                  <span className="font-mono text-gray-200">{currentStepData.remainingInput || 'ε (empty)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Processed:</span>
                  <span className="font-mono text-green-300">{currentStepData.processedInput || '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* State Semantics Guide */}
          <div className="card space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-300">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              State Definitions & Roles
            </div>
            <div className="space-y-1.5">
              {Object.entries(selectedPreset.stateDescriptions).map(([stId, desc]) => {
                const isActive = activeStateIds.includes(stId);
                return (
                  <div
                    key={stId}
                    className={`p-2 rounded-lg text-xs transition-colors ${
                      isActive ? 'bg-purple-900/40 border border-purple-500/50' : 'bg-gray-800/60'
                    }`}
                  >
                    <div className="font-mono font-bold text-white flex items-center gap-1.5">
                      <span className={isActive ? 'text-purple-300' : 'text-gray-300'}>{stId}:</span>
                      {isActive && <span className="badge badge-purple text-[9px] py-0 px-1">Active</span>}
                    </div>
                    <p className="text-gray-400 text-[11px] mt-0.5 leading-snug">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transition Table */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-400">Transition Function δ</p>
            <TransitionTable
              columns={[
                { key: 'from', label: 'From' },
                { key: 'symbol', label: 'Input' },
                { key: 'to', label: 'To' },
              ]}
              rows={transitionRows}
            />
          </div>
        </div>
      </div>

      {/* Predefined Test Cases & Custom Testing */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-purple-400" />
              Predefined Test Cases
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Click any sample string to trace how the NFA computes multiple paths concurrently.
            </p>
          </div>
          <button
            onClick={handleRunAllTests}
            className="btn-secondary text-xs flex items-center gap-2 self-start sm:self-auto py-1.5"
          >
            <Play className="w-3.5 h-3.5 text-purple-400" />
            Run All Test Cases ({selectedPreset.testCases.length})
          </button>
        </div>

        {/* Quick Test Chips */}
        <div className="flex flex-wrap gap-2">
          {selectedPreset.testCases.map((tc, idx) => {
            const isCurrent = inputString === tc.input;
            return (
              <button
                key={idx}
                onClick={() => handleTestClick(tc.input)}
                className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                  isCurrent
                    ? 'border-purple-500 bg-purple-900/40 text-white shadow-md'
                    : 'border-gray-800 bg-gray-800/80 hover:bg-gray-700 hover:border-gray-600 text-gray-300'
                }`}
              >
                <span className="font-mono font-bold text-white bg-gray-900 px-1.5 py-0.5 rounded border border-gray-700">
                  {tc.input === '' ? 'ε (empty)' : tc.input}
                </span>
                <span className="text-[11px] text-gray-400">{tc.description}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  tc.expected ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'
                }`}>
                  {tc.expected ? 'Accept' : 'Reject'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Batch Results Table */}
        {batchResults && (
          <div className="mt-4 p-4 rounded-xl bg-gray-950/80 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Batch Test Report</h4>
              <span className="badge badge-green">
                {batchResults.filter(r => r.pass).length} / {batchResults.length} Passed
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {batchResults.map((r, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                    r.pass ? 'border-green-900/50 bg-green-950/20' : 'border-red-900/50 bg-red-950/20'
                  }`}
                >
                  <span className="font-mono font-bold text-white">
                    {r.input === '' ? 'ε' : r.input}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 text-[11px]">
                      Expected: {r.expected ? 'Acc' : 'Rej'}
                    </span>
                    {r.pass ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Input Box */}
        <div className="pt-2 border-t border-gray-800 space-y-2">
          <label className="text-xs font-semibold text-gray-400">
            Or Test Any Custom String
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputString}
              onChange={e => setInputString(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runSimulationOnInput(inputString)}
              placeholder={`Enter string over {${selectedPreset.alphabet.join(', ')}}...`}
              className="input flex-1 font-mono text-sm"
            />
            <button
              onClick={() => runSimulationOnInput(inputString)}
              className="btn-primary flex items-center gap-2 whitespace-nowrap px-5"
            >
              <Play className="w-4 h-4" /> Simulate NFA
            </button>
            <button onClick={handleClear} className="btn-secondary px-3">
              Clear
            </button>
          </div>
          <p className="text-[11px] text-gray-500">
            An NFA accepts if at least one parallel computation path reaches an accepting state.
          </p>
        </div>
      </div>

      {/* Step by Step Controls */}
      {steps.length > 0 && (
        <SimulationControls
          isRunning={isRunning}
          currentStep={currentStep}
          totalSteps={steps.length}
          onPlay={() => setIsRunning(true)}
          onPause={() => setIsRunning(false)}
          onNext={handleNext}
          onPrev={() => setCurrentStep(p => Math.max(0, p - 1))}
          onReset={() => { setCurrentStep(0); setIsRunning(false); setAccepted(null); }}
          onFinish={() => setCurrentStep(steps.length - 1)}
          speed={speed}
          onSpeedChange={setSpeed}
        />
      )}

      {/* Result Banner */}
      <ResultBanner
        accepted={accepted}
        message={
          accepted === true
            ? `String "${inputString || 'ε'}" is ACCEPTED by the NFA ✓ (At least one active branch reached an accepting state)`
            : accepted === false
            ? `String "${inputString || 'ε'}" is REJECTED by the NFA ✗ (No active branch reached an accepting state)`
            : undefined
        }
      />
    </div>
  );
}
