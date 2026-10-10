import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, RotateCcw, History } from 'lucide-react';

const hiringColors = {
  'Strongly Recommend': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Recommend':          'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'Need Improvement':   'text-orange-400 bg-orange-500/10 border-orange-500/30',
  'Not Ready':          'text-red-400 bg-red-500/10 border-red-500/30',
};

const scoreColor = (s) => (s >= 8 ? 'text-emerald-400' : s >= 6 ? 'text-yellow-400' : s >= 4 ? 'text-orange-400' : 'text-red-400');
const scoreRing  = (s) => (s >= 8 ? 'ring-emerald-500' : s >= 6 ? 'ring-yellow-500' : s >= 4 ? 'ring-orange-500' : 'ring-red-500');

function QuestionAccordion({ qa, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-800/40 transition-colors"
      >
        <span className={`text-2xl font-bold min-w-[2.5rem] ${scoreColor(qa.score)}`}>{qa.score}</span>
        <span className="flex-1 text-slate-300 text-sm line-clamp-2">{qa.question}</span>
        {open ? <ChevronUp size={16} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in border-t border-slate-700/50 pt-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Your Answer</p>
            <p className="text-slate-300 text-sm leading-relaxed">{qa.answer || '(No answer given)'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assessment Feedback</p>
            <p className="text-slate-300 text-sm leading-relaxed">{qa.feedback}</p>
          </div>

          {qa.howToImprove && (
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                💡 How to Improve This Answer
              </p>
              <p className="text-amber-100/90 text-sm leading-relaxed">{qa.howToImprove}</p>
            </div>
          )}

          {(qa.correctAnswer || qa.betterAnswer) && (
            <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                ✨ Model / Correct Answer
              </p>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {qa.correctAnswer || qa.betterAnswer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Results() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`/api/interview/${sessionId}`)
      .then(({ data }) => setSession(data))
      .catch(() => setError('Failed to load results.'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] gap-3 text-slate-500">
        <Loader2 className="animate-spin" size={20} /> Loading results…
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p className="text-red-400 mb-4">{error || 'Session not found.'}</p>
        <Link to="/" className="btn-secondary inline-flex">Go Home</Link>
      </div>
    );
  }

  const score = session.overallScore;
  const hiringClass = hiringColors[session.hiringDecision] || hiringColors['Need Improvement'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 animate-fade-in">
      {/* Score hero */}
      <div className="card p-8 text-center">
        <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest mb-4">Overall Score</p>
        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ring-4 ${scoreRing(score)} ring-offset-4 ring-offset-slate-900 mb-5`}>
          <div>
            <div className={`text-5xl font-bold ${scoreColor(score)}`}>{score}</div>
            <div className="text-slate-500 text-sm">/10</div>
          </div>
        </div>

        <div className="mb-2">
          <span className={`badge border text-sm px-4 py-1.5 ${hiringClass}`}>
            {session.hiringDecision}
          </span>
        </div>

        <p className="text-slate-400 text-sm mt-3 max-w-lg mx-auto leading-relaxed">
          {session.recommendation}
        </p>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-emerald-400" />
            <h3 className="font-semibold text-slate-200">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {session.strengths?.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-emerald-400 mt-0.5">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-orange-400" />
            <h3 className="font-semibold text-slate-200">Areas to Improve</h3>
          </div>
          <ul className="space-y-2">
            {session.weaknesses?.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-orange-400 mt-0.5">→</span> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question breakdown */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-3">Question Breakdown</h2>
        <div className="space-y-2">
          {session.questions?.map((qa, i) => (
            <QuestionAccordion key={i} qa={qa} index={i} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={() => navigate('/')} className="btn-primary flex-1">
          <RotateCcw size={16} /> Practice Again
        </button>
        <Link to="/history" className="btn-secondary flex-1">
          <History size={16} /> View History
        </Link>
      </div>
    </div>
  );
}
