import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GitBranch, Layers, Cpu, Hash, BookText,
  Brain, BarChart3, ArrowRight, FlaskConical
} from 'lucide-react';

const modules = [
  {
    icon: GitBranch,
    title: 'Deterministic Finite Automaton',
    subtitle: 'DFA Simulator',
    description: 'Test predefined DFAs (ending in 01, divisible by 3, even 0s, etc.) with step-by-step state tracing.',
    path: '/dfa',
    color: 'from-blue-600 to-blue-800',
    badge: 'Regular Languages',
    badgeClass: 'badge-blue',
  },
  {
    icon: GitBranch,
    title: 'Nondeterministic Finite Automaton',
    subtitle: 'NFA Simulator',
    description: 'Test predefined NFAs with parallel branch tracing and ε-transitions.',
    path: '/nfa',
    color: 'from-indigo-600 to-indigo-800',
    badge: 'Regular Languages',
    badgeClass: 'badge-purple',
  },
  {
    icon: Layers,
    title: 'Pushdown Automaton',
    subtitle: 'PDA Simulator',
    description: 'Simulate PDAs with real-time stack visualization. Push, pop, and observe state transitions.',
    path: '/pda',
    color: 'from-violet-600 to-violet-800',
    badge: 'Context-Free Languages',
    badgeClass: 'badge-purple',
  },
  {
    icon: Cpu,
    title: 'Turing Machine',
    subtitle: 'TM Simulator',
    description: 'Control an infinite tape machine. Step through read/write/move operations one at a time.',
    path: '/tm',
    color: 'from-orange-600 to-orange-800',
    badge: 'Recursively Enumerable',
    badgeClass: 'badge-yellow',
  },
  {
    icon: Hash,
    title: 'Regular Expressions',
    subtitle: 'Regex Simulator',
    description: 'Test and visualize regular expressions. Find matches, test full string acceptance, explore examples.',
    path: '/regex',
    color: 'from-teal-600 to-teal-800',
    badge: 'Pattern Matching',
    badgeClass: 'badge-green',
  },
  {
    icon: BookText,
    title: 'Context-Free Grammar',
    subtitle: 'CFG Simulator',
    description: 'Define production rules and derive strings. Visualize leftmost derivation step by step.',
    path: '/cfg',
    color: 'from-pink-600 to-pink-800',
    badge: 'Context-Free Languages',
    badgeClass: 'badge-red',
  },
  {
    icon: Brain,
    title: 'Quiz & Assessment',
    subtitle: 'Interactive Quiz',
    description: 'Test your TOC knowledge with topic-wise MCQs. Get instant feedback and detailed explanations.',
    path: '/quiz',
    color: 'from-yellow-600 to-yellow-800',
    badge: 'Self-Assessment',
    badgeClass: 'badge-yellow',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracker',
    subtitle: 'Learning Analytics',
    description: 'Monitor your progress across all topics. Review scores, accuracy, and areas for improvement.',
    path: '/progress',
    color: 'from-green-600 to-green-800',
    badge: 'Analytics',
    badgeClass: 'badge-green',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center mb-4">
          <div className="bg-blue-900/30 border border-blue-700 rounded-2xl p-4">
            <FlaskConical className="w-12 h-12 text-blue-400" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white">
          Virtual Laboratory for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Theory of Computation
          </span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          An interactive platform to build, simulate, and understand computational models —
          DFA, NFA, PDA, Turing Machines, Regular Expressions, and Context-Free Grammars.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <span className="badge badge-blue">Step-by-step simulation</span>
          <span className="badge badge-purple">Interactive graph editor</span>
          <span className="badge badge-green">Instant feedback</span>
          <span className="badge badge-yellow">Quiz & Assessment</span>
        </div>
      </motion.div>

      {/* Module grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        {modules.map(mod => {
          const Icon = mod.icon;
          return (
            <motion.div key={mod.path} variants={item}>
              <Link
                to={mod.path}
                className="block card hover:border-gray-600 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl group h-full"
              >
                <div className={`bg-gradient-to-br ${mod.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-white text-sm leading-tight">{mod.subtitle}</h3>
                  <span className={`${mod.badgeClass} flex-shrink-0`}>{mod.badge}</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed mb-3">{mod.description}</p>
                <div className="flex items-center gap-1 text-blue-400 text-xs font-medium group-hover:gap-2 transition-all">
                  Open Lab <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Chomsky hierarchy diagram */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Chomsky Language Hierarchy</h2>
        <div className="flex flex-col items-center gap-0">
          {[
            { label: 'Recursively Enumerable', sub: 'Turing Machines', color: 'border-orange-500 bg-orange-900/20', width: 'w-full' },
            { label: 'Decidable (Recursive)', sub: 'Decider Turing Machines', color: 'border-yellow-500 bg-yellow-900/20', width: 'w-[85%]' },
            { label: 'Context-Sensitive', sub: 'Linear Bounded Automata', color: 'border-purple-500 bg-purple-900/20', width: 'w-[70%]' },
            { label: 'Context-Free', sub: 'Pushdown Automata & CFG', color: 'border-indigo-500 bg-indigo-900/20', width: 'w-[55%]' },
            { label: 'Regular', sub: 'DFA / NFA / Regex', color: 'border-blue-500 bg-blue-900/20', width: 'w-[40%]' },
          ].map((tier, i) => (
            <div key={i} className={`${tier.width} border-2 ${tier.color} rounded-xl px-4 py-3 text-center mb-1 transition-all`}>
              <div className="font-semibold text-white text-sm">{tier.label}</div>
              <div className="text-xs text-gray-400">{tier.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
