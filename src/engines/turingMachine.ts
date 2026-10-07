import type { TMDefinition, TMSimulationResult, TMSimulationStep } from '../types';

const MAX_STEPS = 1000;

export function simulateTM(def: TMDefinition, input: string): TMSimulationResult {
  const BLANK = def.blankSymbol || '_';
  const initialState = def.states.find(s => s.isInitial);
  if (!initialState) {
    return { accepted: false, rejected: true, halted: true, steps: [], finalTape: [], finalHeadPosition: 0 };
  }

  // Initialize tape
  let tape: string[] = input.length > 0 ? input.split('') : [BLANK];
  let head = 0;
  let state = initialState.id;
  const steps: TMSimulationStep[] = [];

  // Ensure tape is long enough
  const ensureTape = () => {
    if (head < 0) {
      tape.unshift(BLANK);
      head = 0;
    }
    while (head >= tape.length) {
      tape.push(BLANK);
    }
  };

  // Build transition map
  const transMap: Record<string, Record<string, typeof def.transitions[0]>> = {};
  for (const t of def.transitions) {
    if (!transMap[t.fromState]) transMap[t.fromState] = {};
    transMap[t.fromState][t.readSymbol] = t;
  }

  // Initial step
  ensureTape();
  steps.push({
    stepIndex: 0,
    currentState: state,
    tape: [...tape],
    headPosition: head,
    readSymbol: tape[head],
    writeSymbol: null,
    direction: null,
    transitionUsed: null,
  });

  for (let i = 0; i < MAX_STEPS; i++) {
    const stateObj = def.states.find(s => s.id === state);
    if (stateObj?.isAccept) {
      return { accepted: true, rejected: false, halted: true, steps, finalTape: tape, finalHeadPosition: head };
    }
    if (stateObj?.isReject) {
      return { accepted: false, rejected: true, halted: true, steps, finalTape: tape, finalHeadPosition: head };
    }

    ensureTape();
    const readSym = tape[head];
    const trans = transMap[state]?.[readSym] ?? transMap[state]?.[BLANK];

    if (!trans) {
      // No transition — implicit reject
      return { accepted: false, rejected: true, halted: true, steps, finalTape: tape, finalHeadPosition: head };
    }

    // Apply transition
    tape[head] = trans.writeSymbol;
    const prevHead = head;
    if (trans.direction === 'R') head++;
    else if (trans.direction === 'L') head--;
    state = trans.toState;

    ensureTape();

    steps.push({
      stepIndex: steps.length,
      currentState: state,
      tape: [...tape],
      headPosition: head,
      readSymbol: tape[prevHead],
      writeSymbol: trans.writeSymbol,
      direction: trans.direction,
      transitionUsed: trans.id,
    });
  }

  // Max steps reached — treat as rejection (loop detected)
  return { accepted: false, rejected: false, halted: false, steps, finalTape: tape, finalHeadPosition: head };
}
