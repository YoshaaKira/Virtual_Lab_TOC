import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Play, Info, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { CFGDefinition, CFGParseResult } from '../types';
import { parseCFG, CFG_EXAMPLES } from '../engines/cfg';
import ResultBanner from '../components/shared/ResultBanner';
import { markTopicVisited } from '../utils/progress';

const DEFAULT_CFG: CFGDefinition = {
  productions: [
    { id: 'p1', lhs: 'S', rhs: ['a S b', 'ε'] },
  ],
  startSymbol: 'S',
  terminals: ['a', 'b'],
  nonTerminals: ['S'],
};

// Preset suggested test cases for CFG examples
const EXAMPLE_INPUTS: Record<string, string[]> = {
  'Palindromes over {a,b}': ['a b b a', 'a b a', 'a', 'b b'],
  'Balanced parentheses': ['( )', '( ( ) )', '( ) ( )'],
  'a^n b^n': ['a b', 'a a b b', 'a a a b b b', 'ε'],
  'Simple arithmetic': ['id + id * id', '( id + id ) * id', 'id * id'],
};

export default function CFGPage() {
  const [def, setDef] = useState<CFGDefinition>(DEFAULT_CFG);
  const [input, setInput] = useState('a b');
  const [result, setResult] = useState<CFGParseResult | null>(() => parseCFG(DEFAULT_CFG, 'a b'));
  const [newProd, setNewProd] = useState({ lhs: '', rhs: '' });
  const [currentDerivStep, setCurrentDerivStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [activeExampleTitle, setActiveExampleTitle] = useState<string>('a^n b^n');

  useEffect(() => { markTopicVisited('cfg'); }, []);

  const runParse = (strToParse = input) => {
    const r = parseCFG(def, strToParse);
    setResult(r);
    setCurrentDerivStep(0);
  };

  const addProduction = () => {
    if (!newProd.lhs || !newProd.rhs) return;
    const alts = newProd.rhs.split('|').map(s => s.trim()).filter(Boolean);
    const prod = { id: `p${Date.now()}`, lhs: newProd.lhs.trim(), rhs: alts };
    setDef(d => ({
      ...d,
      productions: [...d.productions, prod],
      nonTerminals: [...new Set([...d.nonTerminals, newProd.lhs.trim()])],
    }));
    setNewProd({ lhs: '', rhs: '' });
  };

  const loadExample = (ex: typeof CFG_EXAMPLES[0]) => {
    setActiveExampleTitle(ex.label);
    const newDef: CFGDefinition = {
      productions: ex.productions,
      startSymbol: ex.startSymbol,
      terminals: ex.terminals,
      nonTerminals: ex.nonTerminals,
    };
    setDef(newDef);
    const sampleInput = EXAMPLE_INPUTS[ex.label]?.[0] ?? '';
    setInput(sampleInput);
    const r = parseCFG(newDef, sampleInput);
    setResult(r);
    setCurrentDerivStep(0);
    setIsAnimating(false);
  };

  useEffect(() => {
    let interval: number;
    if (isAnimating && result && result.derivationSteps.length > 0) {
      interval = window.setInterval(() => {
        setCurrentDerivStep(p => {
          if (p >= result.derivationSteps.length - 1) {
            setIsAnimating(false);
            return p;
          }
          return p + 1;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isAnimating, result, speed]);

  const curDerivStep = result?.derivationSteps[currentDerivStep];
  const hasStartRule = def.productions.some(p => p.lhs === def.startSymbol);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-purple">Chomsky Type-2</span>
          <span className="text-xs text-gray-400">Theory of Computation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Context-Free Grammar (CFG) Simulator</h1>
        <p className="text-gray-400 text-sm mt-1">
          Define production rules $A \to \alpha$, select classic grammars, and watch leftmost derivations step by step.
        </p>
      </div>

      {/* Syntax Tip Banner */}
      <div className="card bg-blue-950/20 border-blue-900/40 p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-300 space-y-1">
            <p className="font-semibold text-white text-sm">How CFG Rules Work in this Simulator:</p>
            <p>1. <strong>Separation:</strong> Tokens must be separated by spaces in productions (e.g. <code className="text-green-300">a S b</code> or <code className="text-green-300">E + T</code>).</p>
            <p>2. <strong>Recursion over Powers:</strong> CFGs do not use mathematical exponents like <code className="text-red-400">a^n</code>. Instead, recursion generates repeated patterns (e.g. <code className="text-green-300">S → a S b | ε</code> generates $a^n b^n$).</p>
            <p>3. <strong>Empty String:</strong> Use <code className="text-yellow-300">ε</code> (or <code className="text-yellow-300">eps</code>) for the empty string (epsilon).</p>
            <p>4. <strong>Start Symbol:</strong> Make sure there is at least one rule with the <strong>Start Symbol</strong> ({def.startSymbol}) on the left-hand side!</p>
          </div>
        </div>
      </div>

      {/* Warning if start symbol has no rules */}
      {!hasStartRule && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-600/60 flex items-center gap-3 text-red-300 text-xs">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <strong>Missing Start Production:</strong> Your start symbol is set to <code className="font-bold text-white font-mono bg-red-900/60 px-1 rounded">{def.startSymbol}</code>, but no rule starts with <code className="font-bold text-white font-mono bg-red-900/60 px-1 rounded">{def.startSymbol}</code>. Derivation cannot begin. Click one of the pre-built examples below or add a production for <code className="font-bold text-white">{def.startSymbol}</code>.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Grammar Definition & Examples */}
        <div className="space-y-4">
          {/* Grammar Configuration */}
          <div className="card space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Grammar $G = (V, \Sigma, P, S)$
            </h3>

            <div className="space-y-2 text-xs bg-gray-950/50 p-3 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Start Symbol $S$:</span>
                <input
                  className="input text-xs w-20 py-1 text-center font-mono font-bold text-yellow-300"
                  value={def.startSymbol}
                  onChange={e => setDef(d => ({ ...d, startSymbol: e.target.value.trim() }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Variables / Non-Terminals $V$:</span>
                <span className="font-mono text-purple-300 font-bold">{def.nonTerminals.join(', ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Terminals $\Sigma$:</span>
                <input
                  className="input text-xs w-32 py-1 font-mono text-center"
                  value={def.terminals.join(' ')}
                  onChange={e => setDef(d => ({ ...d, terminals: e.target.value.split(/\s+/).filter(Boolean) }))}
                  placeholder="e.g. a b"
                />
              </div>
            </div>

            {/* Existing Productions */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-2">Production Rules $P$:</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {def.productions.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-gray-800/80 border border-gray-700/60 rounded-lg p-2.5">
                    <div className="flex items-center gap-2 font-mono text-sm">
                      <span className="font-bold text-purple-300">{p.lhs}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-green-300 font-medium">{p.rhs.join(' | ')}</span>
                    </div>
                    <button
                      onClick={() => setDef(d => ({ ...d, productions: d.productions.filter(x => x.id !== p.id) }))}
                      className="text-gray-500 hover:text-red-400 p-1"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Production */}
            <div className="pt-3 border-t border-gray-800 space-y-2">
              <p className="text-xs text-gray-400 font-medium">Add Production Rule (use | for alternatives):</p>
              <div className="flex gap-2 items-center">
                <input
                  className="input text-xs w-16 text-center font-mono font-bold"
                  placeholder="S"
                  value={newProd.lhs}
                  onChange={e => setNewProd(n => ({ ...n, lhs: e.target.value }))}
                />
                <span className="text-gray-500 font-mono">→</span>
                <input
                  className="input text-xs flex-1 font-mono"
                  placeholder="a S b | ε"
                  value={newProd.rhs}
                  onChange={e => setNewProd(n => ({ ...n, rhs: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addProduction()}
                />
              </div>
              <button onClick={addProduction} className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Rule
              </button>
            </div>
          </div>

          {/* Pre-built Examples */}
          <div className="card space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-white text-sm">Pre-Loaded Classic Grammars</h3>
            </div>
            <div className="space-y-1.5">
              {CFG_EXAMPLES.map((ex, i) => {
                const isSelected = activeExampleTitle === ex.label;
                return (
                  <button
                    key={i}
                    onClick={() => loadExample(ex)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-950/40 text-white'
                        : 'border-gray-800 bg-gray-900/60 hover:bg-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white">{ex.label}</p>
                      {isSelected && <span className="badge badge-blue text-[9px] py-0 px-1">Loaded</span>}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">{ex.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center & Right: Testing & Derivation */}
        <div className="xl:col-span-2 space-y-4">
          {/* Input Panel */}
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300">
                Input String (Separate tokens with spaces)
              </label>
              <span className="text-[11px] text-gray-500 font-mono">
                Tokens: {'{'}{def.terminals.join(', ')}{'}'}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                className="input flex-1 font-mono text-sm"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="e.g. a a b b (for aⁿbⁿ)"
                onKeyDown={e => e.key === 'Enter' && runParse(input)}
              />
              <button
                onClick={() => runParse(input)}
                className="btn-primary flex items-center gap-2 px-5 whitespace-nowrap"
              >
                <Play className="w-4 h-4" /> Derive String
              </button>
            </div>

            {/* Quick Sample String Chips */}
            {EXAMPLE_INPUTS[activeExampleTitle] && (
              <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                <span className="text-gray-500 text-[11px]">Quick Tests:</span>
                {EXAMPLE_INPUTS[activeExampleTitle].map((sampleStr, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(sampleStr);
                      runParse(sampleStr);
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
                      input === sampleStr
                        ? 'border-blue-500 bg-blue-900/50 text-white'
                        : 'border-gray-800 bg-gray-800/80 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    {sampleStr === '' ? 'ε (empty)' : sampleStr}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Derivation Result Banner */}
          {result && (
            <ResultBanner
              accepted={result.accepted}
              message={
                result.accepted
                  ? `String "${input || 'ε'}" is DERIVABLE by the grammar ✓ (${result.derivationSteps.length} derivation steps)`
                  : `String "${input || 'ε'}" CANNOT BE DERIVED ✗ — ${result.error ?? 'No valid derivation found'}`
              }
            />
          )}

          {/* Leftmost Derivation Steps Visualizer */}
          {result && result.derivationSteps.length > 0 && (
            <div className="card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white text-base">Leftmost Derivation Sequence</h3>
                  <p className="text-xs text-gray-400">
                    Step {currentDerivStep + 1} of {result.derivationSteps.length} — Rule: {curDerivStep?.ruleApplied}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setCurrentDerivStep(0); setIsAnimating(true); }}
                    className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" /> Auto Play
                  </button>
                  {isAnimating && (
                    <button
                      onClick={() => setIsAnimating(false)}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      Pause
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentDerivStep + 1) / result.derivationSteps.length) * 100}%` }}
                />
              </div>

              {/* Active Step Highlight Card */}
              {curDerivStep && (
                <div className="bg-blue-950/30 border border-blue-700/60 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-blue-300">
                    <span className="font-semibold">STEP #{currentDerivStep + 1}</span>
                    <span className="bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700/80 font-mono">
                      Applied: {curDerivStep.ruleApplied}
                    </span>
                  </div>
                  <div className="font-mono text-lg text-white font-bold tracking-wide">
                    {curDerivStep.sententialForm}
                  </div>
                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentDerivStep(p => Math.max(0, p - 1))}
                  disabled={currentDerivStep === 0}
                  className="btn-secondary flex-1 text-xs py-2 disabled:opacity-40"
                >
                  ← Previous Step
                </button>
                <button
                  onClick={() => setCurrentDerivStep(p => Math.min(p + 1, result.derivationSteps.length - 1))}
                  disabled={currentDerivStep === result.derivationSteps.length - 1}
                  className="btn-secondary flex-1 text-xs py-2 disabled:opacity-40"
                >
                  Next Step →
                </button>
              </div>

              {/* All Derivation Steps List */}
              <div className="space-y-1 max-h-64 overflow-y-auto pt-2 border-t border-gray-800">
                {result.derivationSteps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentDerivStep(idx); setIsAnimating(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                      idx === currentDerivStep
                        ? 'bg-blue-900/50 border border-blue-600 text-white'
                        : 'hover:bg-gray-800/80 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-[10px] w-5">#{idx + 1}</span>
                      <span className="text-green-300 font-bold">{step.sententialForm}</span>
                    </div>
                    <span className="text-gray-400 text-[11px] bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                      {step.ruleApplied}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
