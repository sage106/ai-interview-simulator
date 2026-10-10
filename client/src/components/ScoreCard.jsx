import { useState } from 'react';
import { Lightbulb, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Target } from 'lucide-react';

const scoreColor = (score) => {
  if (score >= 8) return 'text-emerald-400';
  if (score >= 6) return 'text-yellow-400';
  if (score >= 4) return 'text-orange-400';
  return 'text-red-400';
};

const scoreBg = (score) => {
  if (score >= 8) return 'bg-emerald-500/10 border-emerald-500/30';
  if (score >= 6) return 'bg-yellow-500/10 border-yellow-500/30';
  if (score >= 4) return 'bg-orange-500/10 border-orange-500/30';
  return 'bg-red-500/10 border-red-500/30';
};

const scoreLabel = (score) => {
  if (score >= 8) return 'Strong Response';
  if (score >= 6) return 'Good Attempt';
  if (score >= 4) return 'Needs Work';
  return 'Incomplete';
};

export default function ScoreCard({ evaluation, questionText }) {
  const { score, feedback, howToImprove, correctAnswer, betterAnswer, keyPoints } = evaluation;
  const idealAnswer = correctAnswer || betterAnswer;

  const [showCorrect, setShowCorrect] = useState(false);

  return (
    <div className={`card border p-5 animate-slide-up ${scoreBg(score)}`}>
      {/* Score header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Your Score</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${scoreColor(score)}`}>{score}</span>
            <span className="text-slate-500 text-lg">/10</span>
          </div>
        </div>
        <span className={`badge border ${scoreBg(score)} ${scoreColor(score)}`}>
          {scoreLabel(score)}
        </span>
      </div>

      {/* Score bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 mb-5">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${
            score >= 8 ? 'bg-emerald-500' : score >= 6 ? 'bg-yellow-500' : score >= 4 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${score * 10}%` }}
        />
      </div>

      <div className="space-y-4">
        {/* Assessment feedback */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Target size={13} className="text-slate-400" /> Assessment Feedback
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">{feedback}</p>
        </div>

        {/* SEGMENT 1: How to Improve Your Answer */}
        {howToImprove && (
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs uppercase tracking-wider mb-1.5">
              <Lightbulb size={14} className="text-amber-400" />
              How You Can Improve This Answer
            </div>
            <p className="text-amber-100/90 text-sm leading-relaxed">
              {howToImprove}
            </p>
          </div>
        )}

        {/* Key Takeaways */}
        {keyPoints && keyPoints.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Key Criteria</p>
            <ul className="space-y-1.5">
              {keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-indigo-400 mt-0.5">•</span> {pt}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* SEGMENT 2: Ideal / Correct Answer */}
        {idealAnswer && (
          <div className="border border-slate-700/80 bg-slate-850 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowCorrect(!showCorrect)}
              className="w-full flex items-center justify-between p-3.5 bg-slate-800/60 hover:bg-slate-800 transition text-left"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                <Sparkles size={14} />
                Ideal / Model Answer
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                {showCorrect ? 'Hide' : 'Reveal Model Answer'}
                {showCorrect ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>

            {showCorrect && (
              <div className="p-4 bg-slate-900/90 border-t border-slate-700/60 text-slate-200 text-sm leading-relaxed whitespace-pre-line animate-fade-in">
                {idealAnswer}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
