import type { UserProgress, QuizTopic, QuizSession, TopicProgress } from '../types';

const STORAGE_KEY = 'toc_lab_progress';

const defaultTopicProgress = (topic: QuizTopic): TopicProgress => ({
  topic,
  visited: false,
  quizSessions: [],
  bestScore: 0,
  lastVisited: undefined,
});

const allTopics: QuizTopic[] = [
  'dfa', 'nfa', 'pda', 'turing_machine',
  'regular_expressions', 'cfg', 'closure_properties',
  'pumping_lemma', 'decidability', 'complexity',
];

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UserProgress;
  } catch {}
  return createDefaultProgress();
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {}
}

export function createDefaultProgress(): UserProgress {
  const topicsProgress = Object.fromEntries(
    allTopics.map(t => [t, defaultTopicProgress(t)])
  ) as Record<QuizTopic, TopicProgress>;
  return {
    topicsProgress,
    totalQuizzesTaken: 0,
    totalQuestionsAnswered: 0,
    overallAccuracy: 0,
  };
}

export function markTopicVisited(topic: QuizTopic): void {
  const progress = loadProgress();
  progress.topicsProgress[topic].visited = true;
  progress.topicsProgress[topic].lastVisited = Date.now();
  saveProgress(progress);
}

export function saveQuizSession(session: QuizSession): void {
  const progress = loadProgress();
  const tp = progress.topicsProgress[session.topic];
  tp.quizSessions.push(session);
  const percentage = Math.round((session.score / session.totalQuestions) * 100);
  if (percentage > tp.bestScore) tp.bestScore = percentage;

  // Update totals
  progress.totalQuizzesTaken += 1;
  progress.totalQuestionsAnswered += session.attempts.length;
  const totalCorrect = progress.topicsProgress
    ? Object.values(progress.topicsProgress)
        .flatMap(t => t.quizSessions)
        .flatMap(s => s.attempts)
        .filter(a => a.correct).length
    : 0;
  progress.overallAccuracy = progress.totalQuestionsAnswered > 0
    ? Math.round((totalCorrect / progress.totalQuestionsAnswered) * 100)
    : 0;

  saveProgress(progress);
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getTopicLabel(topic: QuizTopic): string {
  const labels: Record<QuizTopic, string> = {
    dfa: 'DFA',
    nfa: 'NFA',
    pda: 'Pushdown Automata',
    turing_machine: 'Turing Machines',
    regular_expressions: 'Regular Expressions',
    cfg: 'Context-Free Grammars',
    closure_properties: 'Closure Properties',
    pumping_lemma: 'Pumping Lemma',
    decidability: 'Decidability',
    complexity: 'Complexity Theory',
  };
  return labels[topic] ?? topic;
}
