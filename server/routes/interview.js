const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Session = require('../models/Session');
const { generateQuestion, evaluateAnswer, generateSummary } = require('../services/groqService');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// ─── POST /api/interview/parse-resume ──────────────────────────────────────
router.post('/parse-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded.' });
    }

    let text = '';
    const mime = req.file.mimetype;

    if (mime === 'application/pdf' || req.file.originalname.endsWith('.pdf')) {
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } else {
      // Plain text or markdown
      text = req.file.buffer.toString('utf-8');
    }

    // Clean up excessive whitespace
    const cleaned = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    res.json({ text: cleaned, filename: req.file.originalname });
  } catch (err) {
    console.error('Resume parse error:', err);
    res.status(500).json({ error: 'Failed to extract text from resume. Try copy-pasting your text directly.' });
  }
});

// ─── POST /api/interview/start ─────────────────────────────────────────────
router.post('/start', async (req, res) => {
  try {
    const { role, level, type, totalQuestions = 5, resumeText = '' } = req.body;
    if (!role || !level || !type) {
      return res.status(400).json({ error: 'role, level, and type are required.' });
    }

    const firstQuestion = await generateQuestion(role, level, type, [], resumeText);

    const session = new Session({
      role,
      level,
      type,
      totalQuestions,
      resumeText,
      questions: [{ question: firstQuestion }],
    });
    await session.save();

    res.json({
      sessionId: session._id,
      question: firstQuestion,
      questionNumber: 1,
      totalQuestions,
    });
  } catch (err) {
    console.error('Start error:', err);
    res.status(500).json({ error: 'Failed to start interview. Check your GROQ_API_KEY.' });
  }
});

// ─── POST /api/interview/answer ────────────────────────────────────────────
router.post('/answer', async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    if (session.status === 'completed') {
      return res.status(400).json({ error: 'Interview already completed.' });
    }

    const idx = session.questions.length - 1;
    const currentQuestion = session.questions[idx];

    // Evaluate the answer
    const evaluation = await evaluateAnswer(
      session.role,
      session.level,
      currentQuestion.question,
      answer,
      session.resumeText || ''
    );

    // Persist evaluation on the current question
    session.questions[idx].answer       = answer;
    session.questions[idx].score        = evaluation.score;
    session.questions[idx].feedback     = evaluation.feedback;
    session.questions[idx].howToImprove = evaluation.howToImprove || '';
    session.questions[idx].correctAnswer= evaluation.correctAnswer || evaluation.betterAnswer || '';
    session.questions[idx].betterAnswer = evaluation.correctAnswer || evaluation.betterAnswer || '';
    session.questions[idx].keyPoints    = evaluation.keyPoints || [];
    session.markModified('questions');

    const isLastQuestion = session.questions.length >= session.totalQuestions;

    if (isLastQuestion) {
      // Generate final summary
      const summary = await generateSummary(
        session.role,
        session.level,
        session.questions.map((q) => ({
          question: q.question,
          answer: q.answer,
          score: q.score,
        }))
      );

      session.status         = 'completed';
      session.overallScore   = summary.overallScore;
      session.strengths      = summary.strengths;
      session.weaknesses     = summary.weaknesses;
      session.recommendation = summary.recommendation;
      session.hiringDecision = summary.hiringDecision;

      await session.save();

      return res.json({ evaluation, sessionComplete: true, sessionId: session._id });
    }

    // Otherwise ask the next question
    const prevQuestions = session.questions.map((q) => q.question);
    const nextQuestion = await generateQuestion(
      session.role,
      session.level,
      session.type,
      prevQuestions,
      session.resumeText || ''
    );

    session.questions.push({ question: nextQuestion });
    await session.save();

    res.json({
      evaluation,
      nextQuestion,
      questionNumber: session.questions.length,
      totalQuestions: session.totalQuestions,
      sessionComplete: false,
    });
  } catch (err) {
    console.error('Answer error:', err);
    res.status(500).json({ error: 'Failed to process answer.' });
  }
});

// ─── GET /api/interview/:id ─────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session.' });
  }
});

module.exports = router;
