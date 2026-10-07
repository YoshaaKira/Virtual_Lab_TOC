import type { CFGDefinition, CFGParseResult, DerivationStep, ParseTreeNode } from '../types';

const EPSILON = 'ε';
const MAX_DEPTH = 20;

// Simple recursive descent derivation for demonstration
export function parseCFG(def: CFGDefinition, input: string): CFGParseResult {
  if (def.productions.length === 0) {
    return { accepted: false, derivationSteps: [], error: 'No productions defined.' };
  }

  const steps: DerivationStep[] = [];
  
  // Build production map
  const prodMap: Record<string, string[][]> = {};
  for (const p of def.productions) {
    prodMap[p.lhs] = p.rhs.map(r => r === EPSILON ? [] : r.split(' ').filter(Boolean));
  }

  const startSymbol = def.startSymbol;
  if (!prodMap[startSymbol]) {
    return { accepted: false, derivationSteps: [], error: `Start symbol '${startSymbol}' has no productions.` };
  }

  const tokens = input.trim() === '' ? [] : input.trim().split(/\s+/);
  
  // Try to derive the string using leftmost derivation + backtracking
  let stepIdx = 0;

  function derive(
    sententialForm: string[],
    tokenIndex: number,
    depth: number
  ): { success: boolean; tree: ParseTreeNode } {
    if (depth > MAX_DEPTH) return { success: false, tree: { symbol: '?', isTerminal: true } };

    // Find leftmost non-terminal
    const ntIdx = sententialForm.findIndex(sym => def.nonTerminals.includes(sym));
    
    if (ntIdx === -1) {
      // All terminals — check if they match the input
      const success = JSON.stringify(sententialForm) === JSON.stringify(tokens.slice(tokenIndex, tokenIndex + sententialForm.length))
        && tokenIndex + sententialForm.length === tokens.length;
      return { success, tree: { symbol: sententialForm.join(' '), isTerminal: true } };
    }

    const nt = sententialForm[ntIdx];
    const productions = prodMap[nt] || [];

    for (const prod of productions) {
      const newForm = [...sententialForm.slice(0, ntIdx), ...prod, ...sententialForm.slice(ntIdx + 1)];
      const ruleText = `${nt} → ${prod.length === 0 ? EPSILON : prod.join(' ')}`;

      steps.push({
        stepIndex: stepIdx++,
        sententialForm: newForm.length === 0 ? EPSILON : newForm.join(' '),
        ruleApplied: ruleText,
        expandedNonTerminal: nt,
      });

      const result = derive(newForm, tokenIndex, depth + 1);
      if (result.success) {
        return {
          success: true,
          tree: {
            symbol: nt,
            isTerminal: false,
            children: prod.map(s => ({ symbol: s, isTerminal: def.terminals.includes(s) || s === EPSILON })),
          },
        };
      }
      // Backtrack: remove the step we just added
      steps.pop();
      stepIdx--;
    }

    return { success: false, tree: { symbol: nt, isTerminal: false } };
  }

  // Initial step
  steps.push({
    stepIndex: stepIdx++,
    sententialForm: startSymbol,
    ruleApplied: 'Start',
    expandedNonTerminal: startSymbol,
  });

  const { success, tree } = derive([startSymbol], 0, 0);

  return {
    accepted: success,
    derivationSteps: steps,
    parseTree: tree,
    error: success ? undefined : `Could not derive '${input}' from grammar.`,
  };
}

export const CFG_EXAMPLES = [
  {
    label: 'Palindromes over {a,b}',
    description: 'L = { w | w = w^R, w ∈ {a,b}* }',
    productions: [
      { id: '1', lhs: 'S', rhs: ['a S a', 'b S b', 'a', 'b', 'ε'] },
    ],
    startSymbol: 'S',
    terminals: ['a', 'b'],
    nonTerminals: ['S'],
  },
  {
    label: 'Balanced parentheses',
    description: 'L = { strings of balanced parentheses }',
    productions: [
      { id: '1', lhs: 'S', rhs: ['S S', '( S )', 'ε'] },
    ],
    startSymbol: 'S',
    terminals: ['(', ')'],
    nonTerminals: ['S'],
  },
  {
    label: 'a^n b^n',
    description: 'L = { a^n b^n | n ≥ 0 }',
    productions: [
      { id: '1', lhs: 'S', rhs: ['a S b', 'ε'] },
    ],
    startSymbol: 'S',
    terminals: ['a', 'b'],
    nonTerminals: ['S'],
  },
  {
    label: 'Simple arithmetic',
    description: 'Basic arithmetic expressions',
    productions: [
      { id: '1', lhs: 'E', rhs: ['E + T', 'T'] },
      { id: '2', lhs: 'T', rhs: ['T * F', 'F'] },
      { id: '3', lhs: 'F', rhs: ['( E )', 'id'] },
    ],
    startSymbol: 'E',
    terminals: ['+', '*', '(', ')', 'id'],
    nonTerminals: ['E', 'T', 'F'],
  },
];
