const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'qwen/qwen3.8-27b';

// ─── Generate a single interview question ────────────────────────────────────
const generateQuestion = async (role, level, type, previousQuestions = [], resumeText = '') => {
  const alreadyAsked =
    previousQuestions.length > 0
      ? `\nQuestions already asked (do NOT repeat these):\n${previousQuestions
          .map((q, i) => `${i + 1}. ${q}`)
          .join('\n')}\n\nAsk a completely new question.`
      : '';

  const typeGuide = {
    technical:  'Focus on technical skills, coding concepts, frameworks, architectures, or specific technologies mentioned in the candidate resume or expected of the role.',
    behavioral: 'Focus on past experiences, challenges, teamwork, leadership, and soft skills using STAR-method scenarios based on their resume background.',
    mixed:      'Alternate between technical depth on their projects/skills and behavioral questions on their past experience.',
  };

  const resumeContext = resumeText && resumeText.trim().length > 0
    ? `\n\nCandidate's Resume Content:\n"""\n${resumeText.slice(0, 3000)}\n"""\nIMPORTANT: Deeply personalize this question to their actual projects, listed technologies, and career timeline from their resume while matching the target ${level} ${role}.`
    : '';

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.85,
    max_tokens: 220,
    messages: [
      {
        role: 'system',
        content: `You are an experienced technical hiring manager conducting a ${level}-level ${type} interview for a ${role} position. ${typeGuide[type]} Ask ONE clear, challenging, direct interview question. Return ONLY the question — no intro, no conversational filler, no numbering, no quote marks.`,
      },
      {
        role: 'user',
        content: `Generate a ${type} interview question for a ${level} ${role}.${resumeContext}${alreadyAsked}`,
      },
    ],
  });

  return completion.choices[0].message.content.trim();
};

// ─── Evaluate a candidate's answer ───────────────────────────────────────────
const evaluateAnswer = async (role, level, question, answer, resumeText = '') => {
  const resumeNote = resumeText && resumeText.trim().length > 0
    ? `\nCandidate's Resume Context: """\n${resumeText.slice(0, 1500)}\n"""\nEvaluate if their answer reflects the depth expected for their claimed background.`
    : '';

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    max_tokens: 750,
    messages: [
      {
        role: 'system',
        content: `You are an expert interviewer evaluating a ${level} ${role} candidate. Respond with ONLY valid JSON — no markdown fences, no extra text — in this exact format:
{
  "score": <integer 1-10>,
  "feedback": "<2-3 sentences assessing their answer, pointing out what was good and what was lacking>",
  "howToImprove": "<Specific, actionable advice on HOW the candidate can elevate this answer (e.g. structure using STAR method, mention specific trade-offs, clarify edge cases, cite metrics)>",
  "correctAnswer": "<The ideal, comprehensive model answer demonstrating senior industry mastery>",
  "keyPoints": ["<key takeaway 1>", "<key takeaway 2>", "<key takeaway 3>"]
}`,
      },
      {
        role: 'user',
        content: `Question: ${question}\n\nCandidate's answer: ${answer || '(no answer provided)'}${resumeNote}`,
      },
    ],
  });

  const raw = completion.choices[0].message.content.trim();

  // Robustly extract JSON even if the model adds surrounding text
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      return {
        score: typeof parsed.score === 'number' ? parsed.score : 5,
        feedback: parsed.feedback || '',
        howToImprove: parsed.howToImprove || '',
        correctAnswer: parsed.correctAnswer || parsed.betterAnswer || '',
        betterAnswer: parsed.correctAnswer || parsed.betterAnswer || '',
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      };
    } catch (_) { /* fall through to default */ }
  }

  return {
    score: 5,
    feedback: 'Evaluation could not be parsed. Please try again.',
    howToImprove: 'Focus on structuring your thoughts clearly and providing concrete examples.',
    correctAnswer: '',
    betterAnswer: '',
    keyPoints: [],
  };
};

// ─── Generate final interview summary ────────────────────────────────────────
const generateSummary = async (role, level, questionsAndAnswers) => {
  const qaText = questionsAndAnswers
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nAnswer: ${qa.answer}\nScore: ${qa.score}/10`)
    .join('\n\n');

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    max_tokens: 600,
    messages: [
      {
        role: 'system',
        content: `You are an expert interviewer writing a final performance review. Respond with ONLY valid JSON:
{
  "overallScore": <number with one decimal>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<area to improve 1>", "<area to improve 2>"],
  "recommendation": "<2-3 sentence personalised career recommendation>",
  "hiringDecision": "<one of: Strongly Recommend | Recommend | Need Improvement | Not Ready>"
}`,
      },
      {
        role: 'user',
        content: `Candidate applied for ${level} ${role} position.\n\n${qaText}\n\nWrite the final assessment.`,
      },
    ],
  });

  const raw = completion.choices[0].message.content.trim();
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (_) { /* fall through */ }
  }

  const avg =
    questionsAndAnswers.reduce((s, qa) => s + qa.score, 0) / (questionsAndAnswers.length || 1);
  return {
    overallScore: Math.round(avg * 10) / 10,
    strengths: ['Communication'],
    weaknesses: ['Needs more practice'],
    recommendation: 'Keep practising and revisit core concepts.',
    hiringDecision: 'Need Improvement',
  };
};

module.exports = { generateQuestion, evaluateAnswer, generateSummary };
