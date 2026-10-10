const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer:   { type: String, default: '' },
  score:        { type: Number, default: 0 },
  feedback:     { type: String, default: '' },
  howToImprove: { type: String, default: '' },
  correctAnswer:{ type: String, default: '' },
  betterAnswer: { type: String, default: '' },
  keyPoints:    [String],
});

const sessionSchema = new mongoose.Schema({
  role:           { type: String, required: true },
  level:          { type: String, required: true, enum: ['junior', 'mid', 'senior'] },
  type:           { type: String, required: true, enum: ['technical', 'behavioral', 'mixed'] },
  totalQuestions: { type: Number, default: 5 },
  status:         { type: String, default: 'in-progress', enum: ['in-progress', 'completed'] },
  questions:      [questionSchema],
  overallScore:   { type: Number, default: 0 },
  strengths:      [String],
  weaknesses:     [String],
  recommendation: { type: String, default: '' },
  hiringDecision: { type: String, default: '' },
  resumeText:     { type: String, default: '' },
  createdAt:      { type: Date, default: Date.now },
});

module.exports = mongoose.model('Session', sessionSchema);
