import type { FADefinition } from '../types';

export interface AutomatonPreset {
  id: string;
  name: string;
  category: 'DFA' | 'NFA';
  formula: string;
  description: string;
  alphabet: string[];
  def: FADefinition;
  stateDescriptions: Record<string, string>;
  testCases: { input: string; expected: boolean; description: string }[];
}

export const DFA_PRESETS: AutomatonPreset[] = [
  {
    id: 'dfa-ends-01',
    name: 'Strings Ending with "01"',
    category: 'DFA',
    formula: 'L = { w ∈ {0, 1}* | w ends with "01" }',
    description: 'Accepts all binary strings that terminate with the sequence 01. The automaton tracks the longest matching suffix.',
    alphabet: ['0', '1'],
    def: {
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 100, y: 220 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: false, x: 340, y: 220 },
        { id: 'q2', label: 'q2', isInitial: false, isFinal: true, x: 580, y: 220 },
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q0', symbol: '1' },
        { id: 't2', from: 'q0', to: 'q1', symbol: '0' },
        { id: 't3', from: 'q1', to: 'q1', symbol: '0' },
        { id: 't4', from: 'q1', to: 'q2', symbol: '1' },
        { id: 't5', from: 'q2', to: 'q1', symbol: '0' },
        { id: 't6', from: 'q2', to: 'q0', symbol: '1' },
      ],
      alphabet: ['0', '1'],
    },
    stateDescriptions: {
      q0: 'Start / Suffix does not match "0" or "01"',
      q1: 'Last symbol read was "0"',
      q2: 'Last two symbols read were "01" (ACCEPTING)',
    },
    testCases: [
      { input: '01', expected: true, description: 'Minimal matching string' },
      { input: '001', expected: true, description: 'Multiple 0s followed by 1' },
      { input: '1101', expected: true, description: 'Leading 1s ending in 01' },
      { input: '10101', expected: true, description: 'Alternating ending in 01' },
      { input: '', expected: false, description: 'Empty string (too short)' },
      { input: '0', expected: false, description: 'Single 0' },
      { input: '10', expected: false, description: 'Ends in 10' },
      { input: '010', expected: false, description: 'Ends in 0, not 1' },
    ],
  },
  {
    id: 'dfa-even-zeros',
    name: 'Even Number of 0s',
    category: 'DFA',
    formula: 'L = { w ∈ {0, 1}* | count(0) is even }',
    description: 'Accepts binary strings containing an even quantity of 0s (0, 2, 4, ...). Any count of 1s is permitted.',
    alphabet: ['0', '1'],
    def: {
      states: [
        { id: 'q_even', label: 'q_even', isInitial: true, isFinal: true, x: 160, y: 220 },
        { id: 'q_odd', label: 'q_odd', isInitial: false, isFinal: false, x: 480, y: 220 },
      ],
      transitions: [
        { id: 't1', from: 'q_even', to: 'q_even', symbol: '1' },
        { id: 't2', from: 'q_even', to: 'q_odd', symbol: '0' },
        { id: 't3', from: 'q_odd', to: 'q_odd', symbol: '1' },
        { id: 't4', from: 'q_odd', to: 'q_even', symbol: '0' },
      ],
      alphabet: ['0', '1'],
    },
    stateDescriptions: {
      q_even: 'Even number of 0s observed so far (ACCEPTING)',
      q_odd: 'Odd number of 0s observed so far',
    },
    testCases: [
      { input: '', expected: true, description: 'Empty string (0 is an even number of 0s)' },
      { input: '111', expected: true, description: 'Only 1s (zero 0s)' },
      { input: '00', expected: true, description: 'Exactly two 0s' },
      { input: '10101', expected: true, description: 'Two 0s interspersed with 1s' },
      { input: '0', expected: false, description: 'Single 0 (odd)' },
      { input: '000', expected: false, description: 'Three 0s (odd)' },
      { input: '101', expected: false, description: 'One 0 with 1s (odd)' },
    ],
  },
  {
    id: 'dfa-contains-101',
    name: 'Contains Substring "101"',
    category: 'DFA',
    formula: 'L = { w ∈ {0, 1}* | w contains "101" }',
    description: 'Accepts all strings that have "101" appearing somewhere as a contiguous substring. Once found, stays in the accept state.',
    alphabet: ['0', '1'],
    def: {
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 80, y: 220 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: false, x: 260, y: 220 },
        { id: 'q2', label: 'q2', isInitial: false, isFinal: false, x: 440, y: 220 },
        { id: 'q3', label: 'q3', isInitial: false, isFinal: true, x: 620, y: 220 },
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q0', symbol: '0' },
        { id: 't2', from: 'q0', to: 'q1', symbol: '1' },
        { id: 't3', from: 'q1', to: 'q1', symbol: '1' },
        { id: 't4', from: 'q1', to: 'q2', symbol: '0' },
        { id: 't5', from: 'q2', to: 'q0', symbol: '0' },
        { id: 't6', from: 'q2', to: 'q3', symbol: '1' },
        { id: 't7', from: 'q3', to: 'q3', symbol: '0,1' },
      ],
      alphabet: ['0', '1'],
    },
    stateDescriptions: {
      q0: 'No part of "101" matched yet',
      q1: 'Matched prefix "1"',
      q2: 'Matched prefix "10"',
      q3: 'Matched full "101" (ACCEPTING — Trap State)',
    },
    testCases: [
      { input: '101', expected: true, description: 'Exact substring 101' },
      { input: '01010', expected: true, description: '101 flanked by 0s' },
      { input: '11011', expected: true, description: '101 preceded and followed by 1s' },
      { input: '00101', expected: true, description: '101 at the end' },
      { input: '1001', expected: false, description: 'Contains 1001, not 101' },
      { input: '1100', expected: false, description: 'No 101' },
      { input: '0000', expected: false, description: 'All zeros' },
    ],
  },
  {
    id: 'dfa-div-by-3',
    name: 'Binary Numbers Divisible by 3',
    category: 'DFA',
    formula: 'L = { w ∈ {0, 1}* | val(w) mod 3 = 0 }',
    description: 'Interprets the binary string as an integer (reading MSB to LSB) and accepts if the value is divisible by 3.',
    alphabet: ['0', '1'],
    def: {
      states: [
        { id: 'rem0', label: 'rem0', isInitial: true, isFinal: true, x: 120, y: 150 },
        { id: 'rem1', label: 'rem1', isInitial: false, isFinal: false, x: 420, y: 120 },
        { id: 'rem2', label: 'rem2', isInitial: false, isFinal: false, x: 270, y: 320 },
      ],
      transitions: [
        { id: 't1', from: 'rem0', to: 'rem0', symbol: '0' },
        { id: 't2', from: 'rem0', to: 'rem1', symbol: '1' },
        { id: 't3', from: 'rem1', to: 'rem2', symbol: '0' },
        { id: 't4', from: 'rem1', to: 'rem0', symbol: '1' },
        { id: 't5', from: 'rem2', to: 'rem1', symbol: '0' },
        { id: 't6', from: 'rem2', to: 'rem2', symbol: '1' },
      ],
      alphabet: ['0', '1'],
    },
    stateDescriptions: {
      rem0: 'Current value mod 3 == 0 (ACCEPTING)',
      rem1: 'Current value mod 3 == 1',
      rem2: 'Current value mod 3 == 2',
    },
    testCases: [
      { input: '0', expected: true, description: 'Value 0 (0 mod 3 == 0)' },
      { input: '11', expected: true, description: 'Value 3 (3 mod 3 == 0)' },
      { input: '110', expected: true, description: 'Value 6 (6 mod 3 == 0)' },
      { input: '1001', expected: true, description: 'Value 9 (9 mod 3 == 0)' },
      { input: '1100', expected: true, description: 'Value 12 (12 mod 3 == 0)' },
      { input: '1', expected: false, description: 'Value 1 (1 mod 3 == 1)' },
      { input: '10', expected: false, description: 'Value 2 (2 mod 3 == 2)' },
      { input: '100', expected: false, description: 'Value 4 (4 mod 3 == 1)' },
      { input: '101', expected: false, description: 'Value 5 (5 mod 3 == 2)' },
    ],
  },
  {
    id: 'dfa-starts-ab',
    name: 'Strings Starting with "ab"',
    category: 'DFA',
    formula: 'L = { w ∈ {a, b}* | w starts with "ab" }',
    description: 'Requires the first two characters to be precisely "a" followed by "b". Divergent strings enter a dead trap state.',
    alphabet: ['a', 'b'],
    def: {
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 80, y: 160 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: false, x: 280, y: 160 },
        { id: 'q2', label: 'q2', isInitial: false, isFinal: true, x: 480, y: 160 },
        { id: 'q_dead', label: 'q_trap', isInitial: false, isFinal: false, x: 280, y: 320 },
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q1', symbol: 'a' },
        { id: 't2', from: 'q0', to: 'q_dead', symbol: 'b' },
        { id: 't3', from: 'q1', to: 'q2', symbol: 'b' },
        { id: 't4', from: 'q1', to: 'q_dead', symbol: 'a' },
        { id: 't5', from: 'q2', to: 'q2', symbol: 'a,b' },
        { id: 't6', from: 'q_dead', to: 'q_dead', symbol: 'a,b' },
      ],
      alphabet: ['a', 'b'],
    },
    stateDescriptions: {
      q0: 'Start — waiting for first symbol "a"',
      q1: 'Saw first symbol "a" — waiting for "b"',
      q2: 'Prefix "ab" validated (ACCEPTING — Loops indefinitely)',
      q_dead: 'Dead / Trap state — prefix was not "ab" (REJECT)',
    },
    testCases: [
      { input: 'ab', expected: true, description: 'Exact prefix "ab"' },
      { input: 'aba', expected: true, description: '"ab" followed by a' },
      { input: 'abbb', expected: true, description: '"ab" followed by bs' },
      { input: 'abab', expected: true, description: '"ab" followed by ab' },
      { input: 'a', expected: false, description: 'Single "a" (missing b)' },
      { input: 'ba', expected: false, description: 'Starts with b' },
      { input: 'b', expected: false, description: 'Single b' },
      { input: '', expected: false, description: 'Empty string' },
    ],
  },
  {
    id: 'dfa-len-mult-3',
    name: 'String Length Multiple of 3',
    category: 'DFA',
    formula: 'L = { w ∈ {0, 1}* | |w| mod 3 = 0 }',
    description: 'Accepts all strings whose length is a multiple of 3 (0, 3, 6, 9, ...).',
    alphabet: ['0', '1'],
    def: {
      states: [
        { id: 'mod0', label: 'len0', isInitial: true, isFinal: true, x: 120, y: 220 },
        { id: 'mod1', label: 'len1', isInitial: false, isFinal: false, x: 340, y: 220 },
        { id: 'mod2', label: 'len2', isInitial: false, isFinal: false, x: 560, y: 220 },
      ],
      transitions: [
        { id: 't1', from: 'mod0', to: 'mod1', symbol: '0,1' },
        { id: 't2', from: 'mod1', to: 'mod2', symbol: '0,1' },
        { id: 't3', from: 'mod2', to: 'mod0', symbol: '0,1' },
      ],
      alphabet: ['0', '1'],
    },
    stateDescriptions: {
      mod0: 'Length mod 3 == 0 (ACCEPTING)',
      mod1: 'Length mod 3 == 1',
      mod2: 'Length mod 3 == 2',
    },
    testCases: [
      { input: '', expected: true, description: 'Length 0' },
      { input: '101', expected: true, description: 'Length 3' },
      { input: '000000', expected: true, description: 'Length 6' },
      { input: '1', expected: false, description: 'Length 1' },
      { input: '11', expected: false, description: 'Length 2' },
      { input: '0101', expected: false, description: 'Length 4' },
    ],
  },
];

export const NFA_PRESETS: AutomatonPreset[] = [
  {
    id: 'nfa-ends-01',
    name: 'Strings Ending with "01" (Nondeterministic)',
    category: 'NFA',
    formula: 'L = { w ∈ {0, 1}* | w ends with "01" }',
    description: 'Classic NFA example. State q0 nondeterministically chooses to either remain in q0 on seeing 0, or guess that this 0 is the start of the final "01".',
    alphabet: ['0', '1'],
    def: {
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 100, y: 220 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: false, x: 340, y: 220 },
        { id: 'q2', label: 'q2', isInitial: false, isFinal: true, x: 580, y: 220 },
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q0', symbol: '0,1' },
        { id: 't2', from: 'q0', to: 'q1', symbol: '0' },
        { id: 't3', from: 'q1', to: 'q2', symbol: '1' },
      ],
      alphabet: ['0', '1'],
    },
    stateDescriptions: {
      q0: 'Prefix state — reads any symbols and branches on 0',
      q1: 'Branch path after guessing second-to-last symbol is 0',
      q2: 'Accept state — verified last symbol was 1 (ACCEPTING)',
    },
    testCases: [
      { input: '01', expected: true, description: 'Minimal matching 01' },
      { input: '101', expected: true, description: 'Leading 1 ending in 01' },
      { input: '0001', expected: true, description: 'Multiple 0s ending in 01' },
      { input: '1101', expected: true, description: 'Two 1s then 01' },
      { input: '0', expected: false, description: 'Single 0' },
      { input: '10', expected: false, description: 'Ends with 10' },
      { input: '010', expected: false, description: 'Ends with 0' },
    ],
  },
  {
    id: 'nfa-contains-010',
    name: 'Contains Substring "010"',
    category: 'NFA',
    formula: 'L = { w ∈ {0, 1}* | w contains "010" }',
    description: 'An NFA that searches for the substring 010. Spawns branches without backtracking.',
    alphabet: ['0', '1'],
    def: {
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 80, y: 220 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: false, x: 260, y: 220 },
        { id: 'q2', label: 'q2', isInitial: false, isFinal: false, x: 440, y: 220 },
        { id: 'q3', label: 'q3', isInitial: false, isFinal: true, x: 620, y: 220 },
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q0', symbol: '0,1' },
        { id: 't2', from: 'q0', to: 'q1', symbol: '0' },
        { id: 't3', from: 'q1', to: 'q2', symbol: '1' },
        { id: 't4', from: 'q2', to: 'q3', symbol: '0' },
        { id: 't5', from: 'q3', to: 'q3', symbol: '0,1' },
      ],
      alphabet: ['0', '1'],
    },
    stateDescriptions: {
      q0: 'Scanning input',
      q1: 'Candidate "0" found',
      q2: 'Candidate "01" found',
      q3: '"010" validated (ACCEPTING)',
    },
    testCases: [
      { input: '010', expected: true, description: 'Exact 010' },
      { input: '110101', expected: true, description: '010 inside string' },
      { input: '0010', expected: true, description: '010 at end' },
      { input: '0110', expected: false, description: 'Two 1s in middle' },
      { input: '101', expected: false, description: '101, not 010' },
    ],
  },
  {
    id: 'nfa-third-from-end',
    name: 'Third Symbol from End is "1"',
    category: 'NFA',
    formula: 'L = { w ∈ {0, 1}* | |w| ≥ 3 and 3rd symbol from end is 1 }',
    description: 'An NFA with only 4 states that solves a problem requiring 2³ = 8 states in an equivalent DFA!',
    alphabet: ['0', '1'],
    def: {
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 80, y: 220 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: false, x: 260, y: 220 },
        { id: 'q2', label: 'q2', isInitial: false, isFinal: false, x: 440, y: 220 },
        { id: 'q3', label: 'q3', isInitial: false, isFinal: true, x: 620, y: 220 },
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q0', symbol: '0,1' },
        { id: 't2', from: 'q0', to: 'q1', symbol: '1' },
        { id: 't3', from: 'q1', to: 'q2', symbol: '0,1' },
        { id: 't4', from: 'q2', to: 'q3', symbol: '0,1' },
      ],
      alphabet: ['0', '1'],
    },
    stateDescriptions: {
      q0: 'Arbitrary prefix before the 3rd-from-end symbol',
      q1: 'Branch where current symbol was 1 (candidate 3rd from end)',
      q2: '2nd symbol from end read',
      q3: 'Last symbol read (ACCEPTING if reached at end of string)',
    },
    testCases: [
      { input: '100', expected: true, description: '3rd from end is 1' },
      { input: '111', expected: true, description: 'All 1s, length 3' },
      { input: '0101', expected: true, description: 'Length 4, 3rd from end is 1' },
      { input: '000', expected: false, description: '3rd from end is 0' },
      { input: '10', expected: false, description: 'Length < 3' },
      { input: '1010', expected: false, description: 'Length 4, 3rd from end is 0' },
    ],
  },
];
