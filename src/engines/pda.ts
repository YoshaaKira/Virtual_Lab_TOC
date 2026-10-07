import type { PDADefinition, PDASimulationResult, PDASimulationStep } from '../types';

interface PDAConfig {
  state: string;
  inputIndex: number;
  stack: string[];
  steps: PDASimulationStep[];
}

const EPSILON = 'ε';
const MAX_STEPS = 500;

export function simulatePDA(
  def: PDADefinition,
  input: string,
  acceptMode: 'final_state' | 'empty_stack' = 'final_state'
): PDASimulationResult {
  const initialState = def.states.find(s => s.isInitial);
  if (!initialState) {
    return { accepted: false, steps: [], acceptanceMode: acceptMode };
  }

  const initialConfig: PDAConfig = {
    state: initialState.id,
    inputIndex: 0,
    stack: def.initialStackSymbol ? [def.initialStackSymbol] : ['Z'],
    steps: [],
  };

  // BFS/DFS simulation
  const queue: PDAConfig[] = [initialConfig];
  let totalSteps = 0;

  while (queue.length > 0 && totalSteps < MAX_STEPS) {
    const config = queue.shift()!;
    totalSteps++;

    const { state, inputIndex, stack, steps } = config;
    const inputSymbol = inputIndex < input.length ? input[inputIndex] : EPSILON;
    const stackTop = stack.length > 0 ? stack[0] : EPSILON;
    const remaining = input.slice(inputIndex);

    // Check acceptance
    if (inputIndex >= input.length) {
      const stateObj = def.states.find(s => s.id === state);
      const finalAccept = acceptMode === 'final_state' && stateObj?.isFinal;
      const emptyAccept = acceptMode === 'empty_stack' && stack.length === 0;
      if (finalAccept || emptyAccept) {
        return { accepted: true, steps, acceptanceMode: acceptMode };
      }
    }

    // Find matching transitions
    for (const t of def.transitions) {
      if (t.from !== state) continue;

      const inputMatch = t.inputSymbol === EPSILON || t.inputSymbol === '' || t.inputSymbol === inputSymbol;
      const stackMatch = t.stackTop === EPSILON || t.stackTop === '' || t.stackTop === stackTop;

      if (!inputMatch || !stackMatch) continue;

      const newStack = [...stack];
      let action: PDASimulationStep['action'] = 'none';
      let stackChange = '';

      // Pop stack top if not epsilon
      if (t.stackTop !== EPSILON && t.stackTop !== '' && newStack.length > 0) {
        newStack.shift();
        action = 'pop';
        stackChange = `-${t.stackTop}`;
      }

      // Push new symbol(s)
      if (t.pushSymbol && t.pushSymbol !== EPSILON && t.pushSymbol !== '') {
        const toPush = t.pushSymbol.split('').reverse();
        newStack.unshift(...toPush.reverse());
        action = action === 'pop' ? 'replace' : 'push';
        stackChange += `+${t.pushSymbol}`;
      }

      const newInputIndex = t.inputSymbol !== EPSILON && t.inputSymbol !== '' ? inputIndex + 1 : inputIndex;

      const newStep: PDASimulationStep = {
        stepIndex: steps.length,
        currentState: t.to,
        remainingInput: input.slice(newInputIndex),
        stack: [...newStack],
        transitionUsed: t.id,
        action,
        stackChange,
      };

      queue.push({
        state: t.to,
        inputIndex: newInputIndex,
        stack: newStack,
        steps: [...steps, newStep],
      });
    }
  }

  return { accepted: false, steps: [], acceptanceMode: acceptMode };
}
