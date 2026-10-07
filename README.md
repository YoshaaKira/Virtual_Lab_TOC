<<<<<<< HEAD
# Virtual Laboratory for Theory of Computation (TOC Virtual Lab)

An interactive, web-based learning and experimentation platform designed to help students master core Theory of Computation concepts through dynamic visualization, hands-on simulation, step-by-step tracing, and conceptual self-assessment.

---

## 🚀 Features

### 1. Deterministic Finite Automata (DFA) — Predefined Library & Testing
- **Curated Predefined DFAs**: Includes classic machines ready to test right out of the box:
  - *Strings Ending with "01"* ($L = \{w \in \{0,1\}^* \mid w \text{ ends with } 01\}$)
  - *Even Number of 0s* ($L = \{w \in \{0,1\}^* \mid \text{count}(0) \text{ is even}\}$)
  - *Contains Substring "101"* ($L = \{w \in \{0,1\}^* \mid w \text{ contains } 101\}$)
  - *Binary Numbers Divisible by 3* ($L = \{w \in \{0,1\}^* \mid \text{val}(w) \pmod 3 = 0\}$)
  - *Strings Starting with "ab"* ($L = \{w \in \{a,b\}^* \mid w \text{ begins with } ab\}$)
  - *String Length Multiple of 3* ($L = \{w \in \{0,1\}^* \mid |w| \pmod 3 = 0\}$)
- **One-Click Test Cases**: Pre-packaged test strings with expected Accept/Reject outputs for instant testing.
- **Batch Test Suite**: Run all test cases in one click to view a Pass/Fail verification report.
- **Step-by-Step State Tracing**: Trace any custom or preset string step-by-step with state glowing, read symbol, remaining string, and transition table $\delta$.
- **State Meaning Guide**: In-depth explanation of what each state represents conceptually.

### 2. Nondeterministic Finite Automata (NFA) — Predefined Library & Testing
- **Curated Predefined NFAs**:
  - *Strings Ending with "01" (Nondeterministic branch demonstration)*
  - *Contains Substring "010"*
  - *Third Symbol from End is "1"* (Demonstrates 4-state NFA vs. 8-state DFA equivalence)
- **Parallel Active State Tracing**: Visualizes sets of active states simultaneously as input strings are processed.
- **Batch & Custom Testing**: Pre-packaged test cases plus custom input simulator.

### 3. Pushdown Automata (PDA)
- **Real-Time LIFO Stack Visualization**: Animated push, pop, and replace operations with top-of-stack visual indicators.
- **Dual Acceptance Modes**: Supports acceptance by **Final State** or **Empty Stack**.
- **Interactive Transition Editor**: Define rules of the form $\delta(q, a, Z) = (p, \gamma)$ with support for $\varepsilon$.

### 4. Turing Machine (TM)
- **Bidirectional Tape Visualizer**: Scrollable infinite tape with animated read/write head.
- **Symbol Read / Write & Head Movement**: Inspect head position indicators and directional moves ($L$, $R$, $S$).
- **State Feedback**: Pre-loaded with standard deciders (such as $a^n b^n$) and instant detection of accept, reject, or halt conditions.

### 5. Regular Expression Simulator
- **Live Pattern Testing**: Instant regex matching with full match detection and sub-pattern grouping.
- **Visual Match Highlighting**: Highlight matching spans directly in input text.
- **Pre-Loaded Examples & Quick Reference**: Common academic patterns (even zeros, words ending in specific characters, identifiers).

### 6. Context-Free Grammar (CFG)
- **Grammar Rule Builder**: Define non-terminals, terminals, start symbols, and production rules $A \rightarrow \alpha \mid \beta$.
- **Leftmost Derivation Step-Through**: Step forward, backward, or auto-animate the derivation from start symbol $S$ to terminal sentential forms.
- **Classic Grammars Included**: Palindromes, balanced parentheses, $a^n b^n$, arithmetic expressions.

### 7. Interactive Quiz & Assessment Module
- **Topic-Wise MCQs**: DFA, NFA, PDA, Turing Machines, Regular Expressions, CFG, Pumping Lemma, Decidability, and Complexity Theory.
- **Instant Explanations**: Immediate feedback upon selecting an answer with conceptual explanations.
- **Scoring & Performance**: Summary cards with percentage and retake capability.

### 8. Progress Tracking & Learning Analytics
- **Local Persistence**: Tracks visited modules, quiz attempts, best scores, and overall accuracy using `localStorage`.
- **Mastery Breakdown**: Visual topic-wise progress indicators and learning statistics.

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, React Flow, Framer Motion, Lucide Icons
- **Backend API**: Node.js, Express, TypeScript (executed with `tsx`)
- **Build Tool**: Vite

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Frontend Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### 3. Run Backend Express API (Optional)
```bash
npm run server
```
The Express simulation API runs at `http://localhost:3001`.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized static bundle in the `dist/` directory.

---

## 🌐 Express Simulation REST Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint |
| `POST` | `/api/dfa/validate` | Validates DFA completeness & determinism |
| `POST` | `/api/dfa/simulate` | Simulates DFA step-by-step on an input string |
| `POST` | `/api/nfa/simulate` | Simulates NFA with $\varepsilon$-closures |
| `POST` | `/api/pda/simulate` | Simulates PDA transitions and stack state |
| `POST` | `/api/tm/simulate` | Simulates Turing Machine tape execution |
| `POST` | `/api/regex/match` | Matches regex patterns with highlighted spans |
| `POST` | `/api/cfg/parse` | Derives strings using CFG leftmost derivation |
=======
# Virtual_Lab_TOC
>>>>>>> 30eb7b7b81f1b3e5186e2454e93bae51a821eef0
