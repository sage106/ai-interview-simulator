import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { BrainCircuit, Send, Loader2, ChevronRight, User, Mic } from 'lucide-react';
import ScoreCard from '../components/ScoreCard';

// Typing indicator component
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export default function Interview() {
  const { sessionId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [question, setQuestion]           = useState(state?.question || '');
  const [questionNumber, setQuestionNumber] = useState(state?.questionNumber || 1);
  const [totalQuestions, setTotalQuestions] = useState(state?.totalQuestions || 5);
  const [answer, setAnswer]               = useState('');
  const [evaluation, setEvaluation]       = useState(null);
  const [phase, setPhase]                 = useState('answering'); // answering | evaluating | feedback | complete
  const [error, setError]                 = useState('');

  // Chat log for display: { type: 'ai'|'user'|'score', content, evaluation }
  const [chatLog, setChatLog] = useState([
    { type: 'ai', content: state?.question || '' },
  ]);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, phase]);

  // Auto-focus textarea
  useEffect(() => {
    if (phase === 'answering') textareaRef.current?.focus();
  }, [phase]);

  const handleSubmit = async () => {
    if (!answer.trim() || phase !== 'answering') return;
    setError('');

    // Show user's answer in chat
    const userAnswer = answer.trim();
    setChatLog((prev) => [...prev, { type: 'user', content: userAnswer }]);
    setAnswer('');
    setPhase('evaluating');

    try {
      const { data } = await api.post('/api/interview/answer', {
        sessionId,
        answer: userAnswer,
      });

      // Show score card
      setChatLog((prev) => [...prev, { type: 'score', evaluation: data.evaluation }]);
      setEvaluation(data.evaluation);

      if (data.sessionComplete) {
        setPhase('complete');
      } else {
        setPhase('feedback');
        // Store next question info to reveal after user clicks Next
        setQuestion(data.nextQuestion);
        setQuestionNumber(data.questionNumber);
        setTotalQuestions(data.totalQuestions);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      setPhase('answering');
    }
  };

  const handleNext = () => {
    setChatLog((prev) => [...prev, { type: 'ai', content: question }]);
    setEvaluation(null);
    setPhase('answering');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
  };

  const progress = ((questionNumber - (phase === 'answering' ? 1 : 0)) / totalQuestions) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              {state?.role || 'Interview'}
            </span>
            <span className="badge bg-slate-800 border border-slate-700 text-slate-400">
              {state?.level}
            </span>
            <span className="badge bg-slate-800 border border-slate-700 text-slate-400">
              {state?.type}
            </span>
            {state?.hasResume && (
              <span className="badge bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                📄 Resume-tailored
              </span>
            )}
          </div>
          <span className="text-sm text-slate-500 font-medium">
            {Math.min(questionNumber, totalQuestions)}/{totalQuestions}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        {chatLog.map((msg, i) => {
          if (msg.type === 'ai') {
            return (
              <div key={i} className="flex gap-3 animate-slide-up">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <BrainCircuit size={15} className="text-indigo-400" />
                </div>
                <div className="card p-4 max-w-[85%]">
                  <p className="text-slate-200 leading-relaxed text-sm">{msg.content}</p>
                </div>
              </div>
            );
          }
          if (msg.type === 'user') {
            return (
              <div key={i} className="flex gap-3 justify-end animate-slide-up">
                <div className="bg-indigo-600 rounded-2xl rounded-tr-sm p-4 max-w-[85%]">
                  <p className="text-white leading-relaxed text-sm">{msg.content}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={15} className="text-slate-400" />
                </div>
              </div>
            );
          }
          if (msg.type === 'score') {
            return (
              <div key={i} className="animate-slide-up">
                <ScoreCard evaluation={msg.evaluation} />
              </div>
            );
          }
          return null;
        })}

        {/* Typing indicator while evaluating */}
        {phase === 'evaluating' && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
              <BrainCircuit size={15} className="text-indigo-400" />
            </div>
            <div className="card">
              <TypingDots />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm animate-fade-in">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="mt-4">
        {phase === 'answering' && (
          <div className="card p-3 flex gap-3 items-end animate-fade-in">
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer… (Ctrl+Enter to submit)"
              rows={3}
              className="flex-1 bg-transparent text-slate-200 placeholder-slate-600 text-sm resize-none focus:outline-none leading-relaxed"
            />
            <button
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="btn-primary px-4 py-2.5 flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        )}

        {phase === 'feedback' && (
          <button onClick={handleNext} className="btn-primary w-full py-3 animate-fade-in">
            Next Question <ChevronRight size={16} />
          </button>
        )}

        {phase === 'complete' && (
          <button
            onClick={() => navigate(`/results/${sessionId}`)}
            className="btn-primary w-full py-3 text-base animate-fade-in bg-emerald-600 hover:bg-emerald-500"
          >
            🎉 View Full Results <ChevronRight size={16} />
          </button>
        )}

        {phase === 'evaluating' && (
          <div className="flex items-center justify-center gap-2 py-3 text-slate-500 text-sm">
            <Loader2 size={15} className="animate-spin" /> AI is evaluating your answer…
          </div>
        )}
      </div>
    </div>
  );
}
