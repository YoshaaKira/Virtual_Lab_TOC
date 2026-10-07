import express from 'express';
import cors from 'cors';
import { simulateDFA, validateDFA } from '../src/engines/dfa';
import { simulateNFA } from '../src/engines/nfa';
import { simulatePDA } from '../src/engines/pda';
import { simulateTM } from '../engines/../src/engines/turingMachine';
import { testRegex } from '../src/engines/regex';
import { parseCFG } from '../src/engines/cfg';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TOC Virtual Lab API running' });
});

// DFA Endpoints
app.post('/api/dfa/validate', (req, res) => {
  try {
    const result = validateDFA(req.body.definition);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/dfa/simulate', (req, res) => {
  try {
    const { definition, input } = req.body;
    const result = simulateDFA(definition, input || '');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// NFA Endpoints
app.post('/api/nfa/simulate', (req, res) => {
  try {
    const { definition, input } = req.body;
    const result = simulateNFA(definition, input || '');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PDA Endpoints
app.post('/api/pda/simulate', (req, res) => {
  try {
    const { definition, input, acceptMode } = req.body;
    const result = simulatePDA(definition, input || '', acceptMode || 'final_state');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Turing Machine Endpoints
app.post('/api/tm/simulate', (req, res) => {
  try {
    const { definition, input } = req.body;
    const result = simulateTM(definition, input || '');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Regex Endpoints
app.post('/api/regex/match', (req, res) => {
  try {
    const { pattern, input, flags } = req.body;
    const result = testRegex(pattern, input || '', flags || '');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// CFG Endpoints
app.post('/api/cfg/parse', (req, res) => {
  try {
    const { definition, input } = req.body;
    const result = parseCFG(definition, input || '');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
