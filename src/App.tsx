import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import DFAPage from './pages/DFAPage';
import NFAPage from './pages/NFAPage';
import PDAPage from './pages/PDAPage';
import TuringMachinePage from './pages/TuringMachinePage';
import RegexPage from './pages/RegexPage';
import CFGPage from './pages/CFGPage';
import QuizPage from './pages/QuizPage';
import ProgressPage from './pages/ProgressPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="dfa" element={<DFAPage />} />
          <Route path="nfa" element={<NFAPage />} />
          <Route path="pda" element={<PDAPage />} />
          <Route path="tm" element={<TuringMachinePage />} />
          <Route path="regex" element={<RegexPage />} />
          <Route path="cfg" element={<CFGPage />} />
          <Route path="quiz" element={<QuizPage />} />
          <Route path="progress" element={<ProgressPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
