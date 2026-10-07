import type { FADefinition, FASimulationResult, FASimulationStep } from '../types';

function epsilonClosure(states: Set<string>, def: FADefinition): Set<string> {
  const closure = new Set(states);
  const stack = [...states];
  while (stack.length > 0) {
    const s = stack.pop()!;
    for (const t of def.transitions) {
      if (t.from === s && (t.symbol === 'ε' || t.symbol === 'eps' || t.symbol === '')) {
        if (!closure.has(t.to)) {
          closure.add(t.to);
          stack.push(t.to);
        }
      }
    }
  }
  return closure;
}

function move(states: Set<string>, symbol: string, def: FADefinition): Set<string> {
  const result = new Set<string>();
  for (const s of states) {
    for (const t of def.transitions) {
      if (t.from === s) {
        const syms = t.symbol.split(',').map(x => x.trim());
        if (syms.includes(symbol)) {
          result.add(t.to);
        }
      }
    }
  }
  return result;
}

export function simulateNFA(def: FADefinition, input: string): FASimulationResult {
  const steps: FASimulationStep[] = [];
  const initialState = def.states.find(s => s.isInitial);
  if (!initialState) {
    return { accepted: false, steps: [], finalStates: [] };
  }

  let currentStates = epsilonClosure(new Set([initialState.id]), def);

  steps.push({
    stepIndex: 0,
    currentState: [...currentStates][0],
    nfaStates: [...currentStates],
    remainingInput: input,
    processedInput: '',
    symbol: null,
    transitionUsed: null,
  });

  let processedInput = '';

  for (let i = 0; i < input.length; i++) {
    const symbol = input[i];
    const nextStates = epsilonClosure(move(currentStates, symbol, def), def);

    processedInput += symbol;
    currentStates = nextStates;

    steps.push({
      stepIndex: steps.length,
      currentState: [...currentStates][0] ?? '',
      nfaStates: [...currentStates],
      remainingInput: input.slice(i + 1),
      processedInput,
      symbol,
      transitionUsed: null,
    });

    if (currentStates.size === 0) break;
  }

  const finalStateIds = def.states.filter(s => s.isFinal).map(s => s.id);
  const accepted = [...currentStates].some(s => finalStateIds.includes(s));

  return {
    accepted,
    steps,
    finalStates: [...currentStates].filter(s => finalStateIds.includes(s)),
  };
}
