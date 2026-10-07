// ─── Finite Automaton Types ───────────────────────────────────────────────────

export interface FAState {
  id: string;
  label: string;
  isInitial: boolean;
  isFinal: boolean;
  x: number;
  y: number;
}

export interface FATransition {
  id: string;
  from: string;
  to: string;
  symbol: string; // comma-separated for multiple symbols
}

export interface FADefinition {
  states: FAState[];
  transitions: FATransition[];
  alphabet: string[];
}

export interface FASimulationStep {
  stepIndex: number;
  currentState: string;
  remainingInput: string;
  processedInput: string;
  symbol: string | null;
  transitionUsed: string | null; // transition id
  nfaStates?: string[]; // for NFA (set of active states)
}

export interface FASimulationResult {
  accepted: boolean;
  steps: FASimulationStep[];
  finalStates: string[];
  rejectedAt?: string; // state where rejection occurred
}

// ─── PDA Types ────────────────────────────────────────────────────────────────

export interface PDAState {
  id: string;
  label: string;
  isInitial: boolean;
  isFinal: boolean;
  x: number;
  y: number;
}

export interface PDATransition {
  id: string;
  from: string;
  to: string;
  inputSymbol: string;   // input symbol to read (ε for empty)
  stackTop: string;      // stack symbol to pop (ε for don't pop)
  pushSymbol: string;    // symbol(s) to push (ε for don't push)
}

export interface PDADefinition {
  states: PDAState[];
  transitions: PDATransition[];
  inputAlphabet: string[];
  stackAlphabet: string[];
  initialStackSymbol: string;
}

export interface PDASimulationStep {
  stepIndex: number;
  currentState: string;
  remainingInput: string;
  stack: string[];        // top of stack is first element
  transitionUsed: string | null;
  action: 'push' | 'pop' | 'replace' | 'none';
  stackChange: string;
}

export interface PDASimulationResult {
  accepted: boolean;
  steps: PDASimulationStep[];
  acceptanceMode: 'final_state' | 'empty_stack';
}

// ─── Turing Machine Types ─────────────────────────────────────────────────────

export interface TMState {
  id: string;
  label: string;
  isInitial: boolean;
  isAccept: boolean;
  isReject: boolean;
}

export interface TMTransition {
  id: string;
  fromState: string;
  readSymbol: string;
  writeSymbol: string;
  direction: 'L' | 'R' | 'S'; // Left, Right, Stay
  toState: string;
}

export interface TMDefinition {
  states: TMState[];
  transitions: TMTransition[];
  inputAlphabet: string[];
  tapeAlphabet: string[];
  blankSymbol: string;
}

export interface TMSimulationStep {
  stepIndex: number;
  currentState: string;
  tape: string[];
  headPosition: number;
  readSymbol: string;
  writeSymbol: string | null;
  direction: 'L' | 'R' | 'S' | null;
  transitionUsed: string | null;
}

export interface TMSimulationResult {
  accepted: boolean;
  rejected: boolean;
  halted: boolean;
  steps: TMSimulationStep[];
  finalTape: string[];
  finalHeadPosition: number;
}

// ─── Regular Expression Types ─────────────────────────────────────────────────

export interface RegexMatch {
  match: string;
  start: number;
  end: number;
  groups: string[];
}

export interface RegexTestResult {
  pattern: string;
  input: string;
  isValid: boolean;
  matches: RegexMatch[];
  fullMatch: boolean;
  error?: string;
}

// ─── CFG Types ────────────────────────────────────────────────────────────────

export interface CFGProduction {
  id: string;
  lhs: string;      // non-terminal
  rhs: string[];    // array of sentential forms (alternatives)
}

export interface CFGDefinition {
  productions: CFGProduction[];
  startSymbol: string;
  terminals: string[];
  nonTerminals: string[];
}

export interface DerivationStep {
  stepIndex: number;
  sententialForm: string;
  ruleApplied: string;
  expandedNonTerminal: string;
}

export interface CFGParseResult {
  accepted: boolean;
  derivationSteps: DerivationStep[];
  parseTree?: ParseTreeNode;
  error?: string;
}

export interface ParseTreeNode {
  symbol: string;
  children?: ParseTreeNode[];
  isTerminal: boolean;
}

// ─── Quiz Types ───────────────────────────────────────────────────────────────

export type QuizTopic =
  | 'dfa'
  | 'nfa'
  | 'pda'
  | 'turing_machine'
  | 'regular_expressions'
  | 'cfg'
  | 'closure_properties'
  | 'pumping_lemma'
  | 'decidability'
  | 'complexity';

export interface QuizQuestion {
  id: string;
  topic: QuizTopic;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizAttempt {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  timeSpent: number; // seconds
}

export interface QuizSession {
  id: string;
  topic: QuizTopic;
  startTime: number;
  endTime?: number;
  attempts: QuizAttempt[];
  score: number;
  totalQuestions: number;
}

// ─── Progress Types ───────────────────────────────────────────────────────────

export interface TopicProgress {
  topic: QuizTopic;
  visited: boolean;
  quizSessions: QuizSession[];
  bestScore: number;
  lastVisited?: number;
}

export interface UserProgress {
  topicsProgress: Record<QuizTopic, TopicProgress>;
  totalQuizzesTaken: number;
  totalQuestionsAnswered: number;
  overallAccuracy: number;
}
