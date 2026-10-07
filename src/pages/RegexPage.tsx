import React, { useState, useEffect } from 'react';
import { testRegex, REGEX_EXAMPLES } from '../engines/regex';
import type { RegexTestResult } from '../types';
import { markTopicVisited } from '../utils/progress';
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react';

export default function RegexPage() {
  const [pattern, setPattern] = useState('(a|b)*b');
  const [flags, setFlags] = useState('');
  const [input, setInput] = useState('ababb');
  const [result, setResult] = useState<RegexTestResult | null>(null);
  const [testCases, setTestCases] = useState<{ input: string; result: RegexTestResult }[]>([]);

  useEffect(() => { markTopicVisited('regular_expressions'); }, []);

  const runTest = () => {
    const r = testRegex(pattern, input, flags);
    setResult(r);
    setTestCases(tc => [{ input, result: r }, ...tc.slice(0, 9)]);
  };

  const loadExample = (ex: typeof REGEX_EXAMPLES[0]) => {
    setPattern(ex.pattern);
    setResult(null);
  };

  const highlightMatches = (text: string, res: RegexTestResult) => {
    if (!res || !res.isValid || res.matches.length === 0) return text;
    const parts: React.ReactNode[] = [];
    let last = 0;
    for (const m of res.matches) {
      if (m.start > last) parts.push(<span key={`t${last}`}>{text.slice(last, m.start)}</span>);
      parts.push(
        <span key={`m${m.start}`} className="bg-yellow-500/40 text-yellow-200 rounded px-0.5 border border-yellow-500/50">
          {text.slice(m.start, m.end)}
        </span>
      );
      last = m.end;
    }
    if (last < text.length) parts.push(<span key={`t${last}`}>{text.slice(last)}</span>);
    return parts;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Regular Expression Simulator</h1>
        <p className="text-gray-400 text-sm">Enter a regex pattern and test string to find matches and check acceptance</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main area */}
        <div className="xl:col-span-2 space-y-4">
          {/* Pattern input */}
          <div className="card space-y-3">
            <div>
              <label className="label">Regular Expression Pattern</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                  <span className="px-3 text-gray-500 font-mono">/</span>
                  <input
                    className="flex-1 bg-transparent py-2 text-green-300 font-mono focus:outline-none"
                    value={pattern}
                    onChange={e => setPattern(e.target.value)}
                    placeholder="Enter regex pattern..."
                    spellCheck={false}
                  />
                  <span className="px-1 text-gray-500 font-mono">/</span>
                  <input
                    className="w-12 bg-transparent py-2 text-blue-300 font-mono focus:outline-none text-center"
                    value={flags}
                    onChange={e => setFlags(e.target.value.replace(/[^gimsuy]/g, ''))}
                    placeholder="gi"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Test String</label>
              <textarea
                className="input min-h-[80px] font-mono resize-y"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Enter string to test..."
              />
            </div>

            <button onClick={runTest} className="btn-primary w-full">Test Pattern</button>
          </div>

          {/* Result */}
          {result && (
            <div className="card space-y-3">
              <div className={`flex items-center gap-2 font-semibold ${
                !result.isValid ? 'text-red-400' :
                result.fullMatch ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {!result.isValid ? <XCircle className="w-5 h-5" /> :
                 result.fullMatch ? <CheckCircle2 className="w-5 h-5" /> :
                 result.matches.length > 0 ? <CheckCircle2 className="w-5 h-5" /> :
                 <XCircle className="w-5 h-5" />}
                {!result.isValid ? `Invalid regex: ${result.error}` :
                 result.fullMatch ? 'Full string accepted by pattern' :
                 result.matches.length > 0 ? `${result.matches.length} match(es) found (not full match)` :
                 'No match found'}
              </div>

              {result.isValid && (
                <div>
                  <p className="label">Highlighted Matches</p>
                  <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm break-all">
                    {highlightMatches(input, result)}
                  </div>
                </div>
              )}

              {result.matches.length > 0 && (
                <div>
                  <p className="label">Match Details</p>
                  <div className="space-y-1">
                    {result.matches.map((m, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs bg-gray-800 rounded px-3 py-2">
                        <span className="badge badge-blue">Match {i + 1}</span>
                        <span className="font-mono text-yellow-300">{m.match}</span>
                        <span className="text-gray-500">pos {m.start}–{m.end}</span>
                        {m.groups.length > 0 && <span className="text-gray-500">groups: [{m.groups.join(', ')}]</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Test history */}
          {testCases.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-white mb-3">Recent Tests</h3>
              <div className="space-y-2">
                {testCases.map((tc, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    {tc.result.fullMatch ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                     tc.result.matches.length > 0 ? <CheckCircle2 className="w-4 h-4 text-yellow-400" /> :
                     <XCircle className="w-4 h-4 text-red-400" />}
                    <span className="font-mono text-gray-300 flex-1">{tc.input || '(empty)'}</span>
                    <span className="text-xs text-gray-500">{tc.result.matches.length} match(es)</span>
                    <button onClick={() => { setInput(tc.input); setResult(tc.result); }} className="text-xs text-blue-400 hover:text-blue-300">
                      Reload
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Examples */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-white">Examples</h3>
            </div>
            <div className="space-y-2">
              {REGEX_EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => loadExample(ex)}
                  className="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-700"
                >
                  <p className="text-sm font-medium text-white">{ex.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{ex.description}</p>
                  <code className="text-xs text-green-400 font-mono">{ex.pattern}</code>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-3">Quick Reference</h3>
            <div className="space-y-1 text-xs font-mono">
              {[
                ['a', 'Literal a'],
                ['a|b', 'a or b'],
                ['ab', 'a then b'],
                ['a*', '0 or more a'],
                ['a+', '1 or more a'],
                ['a?', '0 or 1 a'],
                ['[abc]', 'any of a, b, c'],
                ['[^abc]', 'not a, b, or c'],
                ['.', 'any character'],
                ['^', 'start of string'],
                ['$', 'end of string'],
                ['(a|b)', 'group'],
                ['\\d', 'digit'],
                ['\\w', 'word char'],
                ['\\s', 'whitespace'],
              ].map(([sym, desc]) => (
                <div key={sym} className="flex gap-2">
                  <span className="text-green-400 w-16 flex-shrink-0">{sym}</span>
                  <span className="text-gray-400">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
