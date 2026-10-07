import type { FADefinition, FASimulationResult, FASimulationStep } from '../types';

export function simulateDFA(def: FADefinition, input: string): FASimulationResult {
  const steps: FASimulationStep[] = [];
  
  // Find initial state
  const initialState = def.states.find(s => s.isInitial);
  if (!initialState) {
    return { accepted: false, steps: [], finalStates: [], rejectedAt: 'no_initial_state' };
  }

  let currentState = initialState.id;
  let processedInput = '';
  let remainingInput = input;

  // Build transition map for fast lookup: stateId -> symbol -> toStateId
  const transMap: Record<string, Record<string, string>> = {};
  const transIdMap: Record<string, string> = {}; // stateId:symbol -> transId
  for (const t of def.transitions) {
    const symbols = t.symbol.split(',').map(s => s.trim());
    for (const sym of symbols) {
      if (!transMap[t.from]) transMap[t.from] = {};
      transMap[t.from][sym] = t.to;
      transIdMap[`${t.from}:${sym}`] = t.id;
    }
  }

  // Initial step (before reading any symbols)
  steps.push({
    stepIndex: 0,
    currentState,
    remainingInput,
    processedInput: '',
    symbol: null,
    transitionUsed: null,
  });

  for (let i = 0; i < input.length; i++) {
    const symbol = input[i];
    const nextState = transMap[currentState]?.[symbol];
    const transId = transIdMap[`${currentState}:${symbol}`] ?? null;

    if (nextState === undefined) {
      // Dead end / undefined transition
      steps.push({
        stepIndex: steps.length,
        currentState,
        remainingInput: input.slice(i),
        processedInput,
        symbol,
        transitionUsed: null,
      });
      return {
        accepted: false,
        steps,
        finalStates: [],
        rejectedAt: currentState,
      };
    }

    processedInput += symbol;
    currentState = nextState;
    remainingInput = input.slice(i + 1);

    steps.push({
      stepIndex: steps.length,
      currentState,
      remainingInput,
      processedInput,
      symbol,
      transitionUsed: transId,
    });
  }

  const finalState = def.states.find(s => s.id === currentState);
  const accepted = finalState?.isFinal ?? false;

  return {
    accepted,
    steps,
    finalStates: [currentState],
    rejectedAt: accepted ? undefined : currentState,
  };
}

export function validateDFA(def: FADefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const initialStates = def.states.filter(s => s.isInitial);
  if (initialStates.length === 0) errors.push('No initial state defined.');
  if (initialStates.length > 1) errors.push('More than one initial state defined.');
  if (def.states.filter(s => s.isFinal).length === 0) errors.push('No accepting state defined.');
  
  // Check determinism
  const seen = new Set<string>();
  for (const t of def.transitions) {
    const symbols = t.symbol.split(',').map(s => s.trim());
    for (const sym of symbols) {
      const key = `${t.from}:${sym}`;
      if (seen.has(key)) {
        errors.push(`Non-deterministic: state '${t.from}' has multiple transitions on '${sym}'.`);
      }
      seen.add(key);
    }
  }
  return { valid: errors.length === 0, errors };
}
