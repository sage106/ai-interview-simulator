import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ExternalLink, BrainCircuit } from 'lucide-react';

const scoreColor = (s) =>
  s >= 8 ? 'text-emerald-400' : s >= 6 ? 'text-yellow-400' : s >= 4 ? 'text-orange-400' : 'text-red-400';

const hiringBadge = {
  'Strongly Recommend': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  'Recommend':          'bg-blue-500/10 border-blue-500/30 text-blue-400',
  'Need Improvement':   'bg-orange-500/10 border-orange-500/30 text-orange-400',
  'Not Ready':          'bg-red-500/10 border-red-500/30 text-red-400',
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)  return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    axios
      .get('/api/sessions')
      .then(({ data }) => setSessions(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] gap-3 text-slate-500">
        <Loader2 className="animate-spin" size={20} /> Loading history…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Past Sessions</h1>
        <Link to="/" className="btn-primary text-sm py-2 px-4">
          <BrainCircuit size={15} /> New Interview
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <BrainCircuit size={40} className="mx-auto mb-4 text-slate-700" />
          <p className="text-lg font-medium text-slate-400 mb-1">No sessions yet</p>
          <p className="text-sm mb-6">Complete your first interview to see it here.</p>
          <Link to="/" className="btn-primary inline-flex">Start an Interview</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s._id} className="card p-5 flex items-center gap-5 hover:border-slate-600 transition-colors">
              {/* Score */}
              <div className="text-center flex-shrink-0 w-14">
                <div className={`text-3xl font-bold ${scoreColor(s.overallScore)}`}>
                  {s.overallScore}
                </div>
                <div className="text-slate-600 text-xs">/10</div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-semibold text-slate-200 text-sm">{s.role}</span>
                  <span className="badge bg-slate-800 border border-slate-700 text-slate-400">{s.level}</span>
                  <span className="badge bg-slate-800 border border-slate-700 text-slate-400">{s.type}</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`badge border text-xs ${hiringBadge[s.hiringDecision] || hiringBadge['Need Improvement']}`}>
                    {s.hiringDecision}
                  </span>
                  <span className="text-xs text-slate-600">{s.totalQuestions} questions • {timeAgo(s.createdAt)}</span>
                </div>
              </div>

              {/* Link */}
              <Link
                to={`/results/${s._id}`}
                className="btn-secondary text-xs py-2 px-3 flex-shrink-0"
              >
                View <ExternalLink size={12} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
