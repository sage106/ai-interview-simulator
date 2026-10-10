# 🤖 AI Interview Simulator

> Practice job interviews with an AI powered by **Llama 3** (open-source) via Groq. Get real questions, instant feedback, and a full performance report — free.

Built for **Hacktoberfest 2026 Open-Source AI Challenge**.

---

## ✨ Features

- 📄 **Resume-Driven Customization** — Upload your resume (PDF/TXT) or paste your experience; AI inspects your actual tech stack, past companies, and project achievements to generate tailored, deep-dive interview questions
- 🎯 **Multi-Industry Career Fields** — Pre-configured for Tech, AI & Data, Product & Management, Design, Marketing & Sales, Finance & Accounting, and Healthcare & Sciences. Also supports custom write-in roles for any profession.
- 📊 **3 Experience Levels** — Junior, Mid, Senior
- 💬 **3 Interview Types** — Technical, Behavioral, Mixed
- 💡 **"How to Improve Your Answer" Coaching** — Actionable advice on how you can elevate your specific answer (e.g., structuring with STAR method, citing trade-offs, edge cases, metrics)
- ✨ **Model / Correct Answer** — Full industry-standard ideal response showing what a senior hiring manager looks for
- 🧠 **Per-Answer Scoring** (1–10) with detailed assessment feedback and core evaluation criteria
- 📈 **Comprehensive Evaluation Report** — overall score, hiring decision recommendation, top strengths, areas for improvement
- 💾 **Session History** saved in MongoDB
- ⚡ Powered by **Open-Source AI** via Groq (free, high performance, privacy-friendly)

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express, Multer, pdf-parse |
| Database | MongoDB, Mongoose |
| AI Engine | Groq API (Open-Source LLMs) |

## 🚀 Quick Start

### 1. Get a Groq API Key (free, 2 minutes)
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / log in
3. Create an API key

### 2. Install MongoDB
Make sure MongoDB is running locally on `mongodb://localhost:27017` or use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier).

### 3. Setup the server

```bash
cd server
npm install
cp .env.example .env
# Edit .env — add your GROQ_API_KEY
npm run dev
```

### 4. Setup the client

```bash
cd client
npm install
npm run dev
```

### 5. Open the app
Visit [http://localhost:3000](http://localhost:3000)

---

## 🧠 How It Works

```
User selects role + level + type
        ↓
POST /api/interview/start
  → Groq generates first question (Llama 3.1)
  → Session saved to MongoDB
        ↓
User reads question, types answer, submits
        ↓
POST /api/interview/answer
  → Groq evaluates answer: score/10, feedback, better answer
  → Groq generates next question
  → Repeat for N questions
        ↓
Final: Groq writes performance summary
  → Overall score, hiring decision, strengths/weaknesses
  → Stored in MongoDB, shown on Results page
```

## 📁 Project Structure

```
ai-interview-simulator/
├── server/
│   ├── index.js              # Express app
│   ├── models/Session.js     # MongoDB schema
│   ├── routes/
│   │   ├── interview.js      # Start, answer, fetch
│   │   └── sessions.js       # History
│   └── services/groqService.js  # Llama 3 prompts
└── client/
    └── src/
        ├── pages/
        │   ├── Home.jsx       # Role/level/type selector
        │   ├── Interview.jsx  # Chat interface
        │   ├── Results.jsx    # Final report
        │   └── History.jsx    # Past sessions
        └── components/
            ├── Navbar.jsx
            └── ScoreCard.jsx
```

## 🏷️ Tags
`#hf26challenge` `#javascript` `#react` `#ai` `#opensource`
