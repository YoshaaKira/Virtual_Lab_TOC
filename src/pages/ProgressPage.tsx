import { useState, useEffect } from 'react';
import { loadProgress, resetProgress, getTopicLabel } from '../utils/progress';
import type { UserProgress, QuizTopic } from '../types';
import { BarChart3, Award, BookCheck, CheckCircle2, RotateCcw } from 'lucide-react';

const allTopics: QuizTopic[] = [
  'dfa', 'nfa', 'pda', 'turing_machine',
  'regular_expressions', 'cfg', 'closure_properties',
  'pumping_lemma', 'decidability', 'complexity',
];

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress());

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all progress data?')) {
      resetProgress();
      setProgress(loadProgress());
    }
  };

  const visitedCount = Object.values(progress.topicsProgress).filter(t => t.visited).length;
  const completionPercentage = Math.round((visitedCount / allTopics.length) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-green-400" />
            Learning Progress & Analytics
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track your simulation exploration and topic-wise assessment performance.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="btn-secondary text-xs flex items-center gap-2 self-start sm:self-auto text-red-400 hover:text-red-300 border border-red-900/40"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Progress
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Modules Explored</span>
            <BookCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {visitedCount} <span className="text-xs text-gray-500 font-normal">/ {allTopics.length}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="card space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Quizzes Taken</span>
            <Award className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {progress.totalQuizzesTaken}
          </div>
          <p className="text-xs text-gray-500">Completed assessments</p>
        </div>

        <div className="card space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Questions Solved</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {progress.totalQuestionsAnswered}
          </div>
          <p className="text-xs text-gray-500">Total attempts logged</p>
        </div>

        <div className="card space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Overall Accuracy</span>
            <span className="text-green-400 text-xs font-bold">%</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {progress.overallAccuracy}%
          </div>
          <p className="text-xs text-gray-500">Correct answers ratio</p>
        </div>
      </div>

      {/* Topic-wise Breakdown Table */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">Topic Mastery Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs">
                <th className="py-3 px-4 text-left">Topic</th>
                <th className="py-3 px-4 text-center">Lab Status</th>
                <th className="py-3 px-4 text-center">Quizzes Taken</th>
                <th className="py-3 px-4 text-center">Best Score</th>
                <th className="py-3 px-4 text-right">Mastery</th>
              </tr>
            </thead>
            <tbody>
              {allTopics.map(topic => {
                const tp = progress.topicsProgress[topic] || {
                  visited: false,
                  quizSessions: [],
                  bestScore: 0,
                };
                return (
                  <tr key={topic} className="border-b border-gray-800/60 hover:bg-gray-800/30">
                    <td className="py-3 px-4 font-medium text-white">
                      {getTopicLabel(topic)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {tp.visited ? (
                        <span className="badge badge-green">Visited</span>
                      ) : (
                        <span className="badge bg-gray-800 text-gray-400">Unvisited</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-300">
                      {tp.quizSessions?.length || 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${
                        tp.bestScore >= 80 ? 'text-green-400' :
                        tp.bestScore >= 50 ? 'text-yellow-400' :
                        tp.bestScore > 0 ? 'text-red-400' : 'text-gray-500'
                      }`}>
                        {tp.bestScore > 0 ? `${tp.bestScore}%` : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="w-24 ml-auto bg-gray-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            tp.bestScore >= 80 ? 'bg-green-500' :
                            tp.bestScore >= 50 ? 'bg-yellow-500' :
                            tp.bestScore > 0 ? 'bg-red-500' : 'bg-gray-700'
                          }`}
                          style={{ width: `${tp.bestScore}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
