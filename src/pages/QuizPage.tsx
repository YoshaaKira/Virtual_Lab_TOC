import { useState, useEffect } from 'react';
import { quizData } from '../data/quizData';
import type { QuizTopic, QuizQuestion, QuizSession, QuizAttempt } from '../types';
import { saveQuizSession, getTopicLabel } from '../utils/progress';
import { CheckCircle2, XCircle, RotateCcw, Brain, Award, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const topics: QuizTopic[] = [
  'dfa', 'nfa', 'pda', 'turing_machine',
  'regular_expressions', 'cfg', 'pumping_lemma',
  'decidability', 'complexity',
];

export default function QuizPage() {
  const [selectedTopic, setSelectedTopic] = useState<QuizTopic>('dfa');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  useEffect(() => {
    startTopicQuiz(selectedTopic);
  }, [selectedTopic]);

  const startTopicQuiz = (topic: QuizTopic) => {
    const filtered = quizData.filter(q => q.topic === topic);
    setQuestions(filtered);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setAttempts([]);
    setIsQuizComplete(false);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = idx === currentQ.correctIndex;
    const newAttempt: QuizAttempt = {
      questionId: currentQ.id,
      selectedIndex: idx,
      correct: isCorrect,
      timeSpent: 0,
    };

    const nextAttempts = [...attempts, newAttempt];
    setAttempts(nextAttempts);

    if (nextAttempts.length === questions.length) {
      const finalScore = nextAttempts.filter(a => a.correct).length;
      const session: QuizSession = {
        id: `quiz-${Date.now()}`,
        topic: selectedTopic,
        startTime: Date.now(),
        endTime: Date.now(),
        attempts: nextAttempts,
        score: finalScore,
        totalQuestions: questions.length,
      };
      saveQuizSession(session);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsQuizComplete(true);
    }
  };

  const currentQ = questions[currentIndex];
  const score = attempts.filter(a => a.correct).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="w-7 h-7 text-yellow-400" />
          Interactive TOC Quiz & Assessment
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Test your conceptual understanding across automata theory, grammars, and computability.
        </p>
      </div>

      {/* Topic selection tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-800">
        {topics.map(t => (
          <button
            key={t}
            onClick={() => setSelectedTopic(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTopic === t
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {getTopicLabel(t)}
          </button>
        ))}
      </div>

      {/* Quiz Area */}
      {isQuizComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-10 space-y-5"
        >
          <div className="inline-flex p-4 rounded-full bg-yellow-900/40 border border-yellow-600/50 mb-2">
            <Award className="w-12 h-12 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Quiz Completed!</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            You finished the <strong className="text-white">{getTopicLabel(selectedTopic)}</strong> assessment.
          </p>
          <div className="text-4xl font-extrabold text-blue-400">
            {score} / {questions.length}
            <span className="text-lg text-gray-500 font-normal ml-2">
              ({Math.round((score / Math.max(1, questions.length)) * 100)}%)
            </span>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => startTopicQuiz(selectedTopic)}
              className="btn-primary flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Retake Quiz
            </button>
          </div>
        </motion.div>
      ) : currentQ ? (
        <div className="space-y-6">
          {/* Progress bar and counter */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span className="badge badge-yellow capitalize">{currentQ.difficulty}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="card space-y-6">
            <h2 className="text-lg sm:text-xl font-medium text-white leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                let btnStyle = 'border-gray-700 bg-gray-800/80 hover:bg-gray-700 hover:border-gray-600 text-gray-200';
                if (isAnswered) {
                  if (idx === currentQ.correctIndex) {
                    btnStyle = 'border-green-500 bg-green-950/60 text-green-200';
                  } else if (idx === selectedOption) {
                    btnStyle = 'border-red-500 bg-red-950/60 text-red-200';
                  } else {
                    btnStyle = 'border-gray-800 bg-gray-900/50 text-gray-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all duration-200 ${btnStyle}`}
                  >
                    <span className="text-sm sm:text-base">{option}</span>
                    {isAnswered && idx === currentQ.correctIndex && (
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 ml-3" />
                    )}
                    {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 ml-3" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t border-gray-800"
                >
                  <div className={`p-4 rounded-xl text-sm leading-relaxed ${
                    selectedOption === currentQ.correctIndex
                      ? 'bg-green-950/40 border border-green-800/60 text-green-300'
                      : 'bg-red-950/40 border border-red-800/60 text-red-300'
                  }`}>
                    <p className="font-semibold mb-1">
                      {selectedOption === currentQ.correctIndex ? 'Correct! 🎉' : 'Incorrect ❌'}
                    </p>
                    <p className="text-gray-300 text-xs sm:text-sm">{currentQ.explanation}</p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNext}
                      className="btn-primary flex items-center gap-2"
                    >
                      {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="card text-center py-8 text-gray-400">
          No questions available for this topic yet.
        </div>
      )}
    </div>
  );
}
