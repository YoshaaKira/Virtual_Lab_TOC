import { useState, useEffect, useRef, useCallback } from 'react';
import { DFA_PRESETS, AutomatonPreset } from '../data/automataPresets';
import type { FASimulationStep, FASimulationResult } from '../types';
import { simulateDFA } from '../engines/dfa';
import FAEditor from '../components/automata/FAEditor';
import SimulationControls from '../components/shared/SimulationControls';
import TransitionTable from '../components/automata/TransitionTable';
import { markTopicVisited } from '../utils/progress';
import { CheckCircle2, XCircle, Play, Sparkles, BookOpen, Layers, ListChecks, ArrowRight } from 'lucide-react';

export default function DFAPage() {
  const [selectedPreset, setSelectedPreset] = useState<AutomatonPreset>(DFA_PRESETS[0]);
  const [inputString, setInputString] = useState<string>('01');
  const [simulationResult, setSimulationResult] = useState<FASimulationResult | null>(() => simulateDFA(DFA_PRESETS[0].def, '01'));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(700);
  const [batchResults, setBatchResults] = useState<{ input: string; expected: boolean; actual: boolean; pass: boolean }[] | null>(null);
  const intervalRef = useRef<number>();

  useEffect(() => {
    markTopicVisited('dfa');
  }, []);

  const runSimulationOnInput = useCallback((input: string) => {
    setBatchResults(null);
    const result = simulateDFA(selectedPreset.def, input);
    setSimulationResult(result);
    setCurrentStep(0);
    setIsRunning(false);
  }, [selectedPreset]);

  // When switching presets, reset simulation state with first test case
  const handleSelectPreset = (preset: AutomatonPreset) => {
    setSelectedPreset(preset);
    const firstInput = preset.testCases[0]?.input ?? '';
    setInputString(firstInput);
    const result = simulateDFA(preset.def, firstInput);
    setSimulationResult(result);
    setCurrentStep(0);
    setIsRunning(false);
    setBatchResults(null);
    clearInterval(intervalRef.current);
  };

  const handleTestClick = (testInput: string) => {
    setInputString(testInput);
    runSimulationOnInput(testInput);
  };

  const handleRunAllTests = () => {
    const results = selectedPreset.testCases.map(tc => {
      const res = simulateDFA(selectedPreset.def, tc.input);
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
    setInputString('');
    const result = simulateDFA(selectedPreset.def, '');
    setSimulationResult(result);
    setCurrentStep(0);
    setIsRunning(false);
    setBatchResults(null);
    clearInterval(intervalRef.current);
  };

  const steps = simulationResult?.steps ?? [];

  const handleNext = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  useEffect(() => {
    if (steps.length > 0 && currentStep === steps.length - 1) {
      setIsRunning(false);
      clearInterval(intervalRef.current);
    }
  }, [currentStep, steps.length]);

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

  const currentStepData: FASimulationStep | undefined = steps[currentStep];
  const activeStateIds = currentStepData ? [currentStepData.currentState] : [];
  const activeTransitionId = currentStepData?.transitionUsed ?? null;

  const finalStep = steps[steps.length - 1];
  const finalStateObj = selectedPreset.def.states.find(s => s.id === finalStep?.currentState);
  const isOverallAccepted = simulationResult?.accepted ?? false;

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
          <span className="badge badge-blue">Interactive Lab</span>
          <span className="text-xs text-gray-400">Theory of Computation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Predefined DFA Simulator</h1>
        <p className="text-gray-400 text-sm mt-1">
          Select any standard Deterministic Finite Automaton from our curated library, test it with pre-built sample strings, or step through your own input.
        </p>
      </div>

      {/* Preset Selector Grid */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          Choose a Predefined DFA
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5">
          {DFA_PRESETS.map(preset => {
            const isSelected = preset.id === selectedPreset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/50 shadow-lg shadow-blue-900/30'
                    : 'border-gray-800 bg-gray-900/80 hover:bg-gray-800 hover:border-gray-700'
                }`}
              >
                <div>
                  <h3 className={`text-xs font-bold ${isSelected ? 'text-blue-300' : 'text-white'}`}>
                    {preset.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-gray-500 font-mono">Σ = {'{'}{preset.alphabet.join(', ')}{'}'}</span>
                  {isSelected && <span className="badge badge-blue text-[9px] py-0 px-1.5">Active</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Preset Info Card */}
      <div className="card bg-gradient-to-r from-gray-900 via-blue-950/20 to-gray-900 border-blue-900/40 p-4 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs text-blue-400 font-semibold tracking-wide">SELECTED AUTOMATON</span>
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

      {/* Verdict & Path Banner */}
      {simulationResult && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isOverallAccepted
            ? 'bg-green-950/30 border-green-500/50 text-green-200'
            : 'bg-red-950/30 border-red-500/50 text-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {isOverallAccepted ? (
              <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">
                  String <code className="bg-gray-900/80 px-2 py-0.5 rounded text-white border border-gray-700">{inputString === '' ? 'ε (empty)' : inputString}</code> is {isOverallAccepted ? 'ACCEPTED ✓' : 'REJECTED ✗'}
                </span>
              </div>
              <p className="text-xs opacity-80 mt-0.5">
                {isOverallAccepted
                  ? `Machine halted in accepting final state "${finalStep?.currentState}".`
                  : `Machine halted in non-accepting state "${finalStep?.currentState}".`}
              </p>
            </div>
          </div>

          {/* Trace path */}
          <div className="flex items-center flex-wrap gap-1 text-xs font-mono bg-gray-900/80 px-3 py-1.5 rounded-lg border border-gray-800 text-gray-300">
            <span className="text-gray-500 mr-1 text-[11px]">Path:</span>
            {steps.map((st, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-yellow-400 text-[10px]">→({st.symbol})→</span>}
                <span className={`px-1.5 py-0.5 rounded font-bold ${
                  i === currentStep
                    ? 'bg-blue-600 text-white shadow'
                    : i === steps.length - 1
                    ? isOverallAccepted ? 'bg-green-900/70 text-green-300' : 'bg-red-900/70 text-red-300'
                    : 'bg-gray-800 text-gray-300'
                }`}>
                  {st.currentState}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Simulation Section: Graph & Diagnostics */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Automaton Graph Visualization */}
        <div className="xl:col-span-3 panel overflow-hidden flex flex-col" style={{ height: 480 }}>
          <div className="bg-gray-900/90 border-b border-gray-800 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5 font-medium text-gray-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Automaton State Graph (Active state glows in blue)
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
              activeTransitionId={activeTransitionId}
              onStatesChange={() => {}}
              onTransitionsChange={() => {}}
              mode="simulate"
            />
          </div>
        </div>

        {/* Right Sidebar: State Meanings & Transition Table */}
        <div className="space-y-4">
          {/* Step tracker card */}
          {currentStepData && (
            <div className="card border-blue-800/60 bg-blue-950/20 space-y-2">
              <div className="flex items-center justify-between text-xs text-blue-400 font-semibold">
                <span>STEP {currentStep + 1} OF {steps.length}</span>
                <span className="text-gray-400">
                  {currentStep === steps.length - 1 ? (isOverallAccepted ? 'Accept State' : 'Reject State') : 'In Progress'}
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-400">Current State:</span>
                  <span className="font-mono font-bold text-blue-300">
                    {currentStepData.currentState}
                    {finalStateObj?.isFinal && currentStep === steps.length - 1 && ' (Final)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-400">Read Symbol:</span>
                  <span className="font-mono text-yellow-300">{currentStepData.symbol ?? '— (start)'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-400">Remaining Input:</span>
                  <span className="font-mono text-gray-200">{currentStepData.remainingInput || 'ε (empty)'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Processed Prefix:</span>
                  <span className="font-mono text-green-300">{currentStepData.processedInput || '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* State Semantics Guide */}
          <div className="card space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-300">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              State Definitions & Meaning
            </div>
            <div className="space-y-1.5">
              {Object.entries(selectedPreset.stateDescriptions).map(([stId, desc]) => {
                const isActive = activeStateIds.includes(stId);
                return (
                  <div
                    key={stId}
                    className={`p-2 rounded-lg text-xs transition-colors ${
                      isActive ? 'bg-blue-900/40 border border-blue-500/50' : 'bg-gray-800/60'
                    }`}
                  >
                    <div className="font-mono font-bold text-white flex items-center gap-1.5">
                      <span className={isActive ? 'text-blue-300' : 'text-gray-300'}>{stId}:</span>
                      {isActive && <span className="badge badge-blue text-[9px] py-0 px-1">Active</span>}
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
              highlightRowId={activeTransitionId}
            />
          </div>
        </div>
      </div>

      {/* Predefined Test Cases & Custom Testing */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-green-400" />
              Predefined Test Cases
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Click any sample string below to test and step through it immediately.
            </p>
          </div>
          <button
            onClick={handleRunAllTests}
            className="btn-secondary text-xs flex items-center gap-2 self-start sm:self-auto py-1.5"
          >
            <Play className="w-3.5 h-3.5 text-blue-400" />
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
                    ? 'border-blue-500 bg-blue-900/40 text-white shadow-md'
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
                  {tc.expected ? 'Should Accept' : 'Should Reject'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Batch Results Table (if Run All clicked) */}
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
                    {r.input === '' ? 'ε (empty)' : r.input}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 text-[11px]">
                      Expected: {r.expected ? 'Accept' : 'Reject'}
                    </span>
                    {r.pass ? (
                      <span className="flex items-center gap-1 text-green-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400 font-semibold">
                        <XCircle className="w-3.5 h-3.5" /> Fail
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Input String Box */}
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
              <Play className="w-4 h-4" /> Simulate String
            </button>
            <button onClick={handleClear} className="btn-secondary px-3">
              Clear
            </button>
          </div>
          <p className="text-[11px] text-gray-500">
            Alphabet for this machine: <span className="font-mono text-gray-300">{'{'}{selectedPreset.alphabet.join(', ')}{'}'}</span>. Use the playback controls below to observe state transitions.
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
          onReset={() => { setCurrentStep(0); setIsRunning(false); }}
          onFinish={() => setCurrentStep(steps.length - 1)}
          speed={speed}
          onSpeedChange={setSpeed}
        />
      )}
    </div>
  );
}
