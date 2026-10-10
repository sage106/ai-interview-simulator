import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  BrainCircuit,
  Loader2,
  ChevronRight,
  Zap,
  FileText,
  Upload,
  CheckCircle2,
  X,
  FileUp,
  Sparkles
} from 'lucide-react';

const ROLE_CATEGORIES = {
  '💻 Tech & Software': [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps & Cloud Engineer',
    'Mobile App Developer (iOS/Android)',
    'QA & Automation Engineer',
    'Cybersecurity Analyst',
    'Database Administrator',
  ],
  '🤖 AI & Data Science': [
    'Machine Learning Engineer',
    'Data Scientist',
    'Data Analyst',
    'AI / NLP Engineer',
    'Business Intelligence (BI) Developer',
    'Data Platform Engineer',
  ],
  '💼 Product & Business': [
    'Product Manager (PM)',
    'Technical Project Manager (TPM)',
    'Scrum Master / Agile Coach',
    'Business Analyst',
    'Management Consultant',
    'Operations Manager',
  ],
  '🎨 Design & Creative': [
    'UI/UX Designer',
    'Product Designer',
    'Visual & Graphic Designer',
    'Design System Lead',
    'Content Strategist',
  ],
  '📈 Marketing & Sales': [
    'Digital Marketing Manager',
    'SEO & Growth Specialist',
    'Account Executive / B2B Sales',
    'Customer Success Manager (CSM)',
    'Social Media Strategist',
  ],
  '💰 Finance & Operations': [
    'Financial Analyst',
    'Accountant / Controller',
    'Investment Banking Analyst',
    'HR & People Operations Manager',
    'Talent Acquisition Specialist',
  ],
  '🩺 Healthcare & Sciences': [
    'Clinical Research Associate',
    'Healthcare Administrator',
    'Biomedical Engineer',
    'Public Health Specialist',
  ],
};

const LEVELS = [
  { value: 'junior', label: 'Junior', desc: '0–2 years' },
  { value: 'mid',    label: 'Mid',    desc: '2–5 years' },
  { value: 'senior', label: 'Senior', desc: '5+ years' },
];

const TYPES = [
  { value: 'technical',  label: '💻 Technical',  desc: 'Coding, system design, CS fundamentals' },
  { value: 'behavioral', label: '🤝 Behavioral', desc: 'STAR method, teamwork, soft skills' },
  { value: 'mixed',      label: '⚡ Mixed',      desc: 'Both technical and behavioral' },
];

const QUESTION_COUNTS = [3, 5, 8];

export default function Home() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    role: 'Full Stack Developer',
    level: 'mid',
    type: 'mixed',
    totalQuestions: 5,
  });

  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRole, setCustomRole] = useState('');

  // Resume state
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeMode, setResumeMode] = useState('upload'); // 'upload' | 'text'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle PDF/TXT file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploadingResume(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const { data } = await api.post('/api/interview/parse-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResumeText(data.text);
      setResumeFileName(data.filename || file.name);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Could not parse file. You can also paste your resume text directly.'
      );
    } finally {
      setUploadingResume(false);
    }
  };

  const removeResume = () => {
    setResumeText('');
    setResumeFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStart = async () => {
    const finalRole = isCustomRole ? customRole.trim() : form.role;
    if (!finalRole) {
      setError('Please specify a job role.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        role: finalRole,
        resumeText: resumeText.trim(),
      };

      const { data } = await api.post('/api/interview/start', payload);

      navigate(`/interview/${data.sessionId}`, {
        state: {
          question: data.question,
          questionNumber: data.questionNumber,
          totalQuestions: data.totalQuestions,
          role: finalRole,
          level: form.level,
          type: form.type,
          hasResume: Boolean(resumeText.trim()),
        },
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start. Please check your setup and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
          <Zap size={12} /> Powered by Open-Source AI (Groq)
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Ace your next
          <span className="text-indigo-400"> interview</span>
          <br />with AI practice
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Upload your resume for hyper-personalized interview questions, instant AI evaluations, and comprehensive scoring.
        </p>
      </div>

      {/* Form Card */}
      <div className="card p-7 space-y-7">
        {/* Role Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-slate-300">Target Career Role</label>
            <button
              type="button"
              onClick={() => {
                setIsCustomRole(!isCustomRole);
                if (!isCustomRole && !customRole) setCustomRole(form.role);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
            >
              {isCustomRole ? '← Choose from predefined roles' : '+ Type custom role'}
            </button>
          </div>

          {!isCustomRole ? (
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
            >
              {Object.entries(ROLE_CATEGORIES).map(([category, roles]) => (
                <optgroup key={category} label={category} className="bg-slate-900 text-slate-400 font-semibold py-1">
                  {roles.map((r) => (
                    <option key={r} value={r} className="bg-slate-800 text-slate-100 py-1 font-normal">
                      {r}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="e.g. Electrical Engineer, Brand Copywriter, Nurse Practitioner, Chef..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
            />
          )}
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Experience Level</label>
          <div className="grid grid-cols-3 gap-3">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setForm({ ...form, level: l.value })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  form.level === l.value
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="font-semibold text-sm">{l.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{l.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Resume Upload Section (NEW) */}
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-400" />
              <label className="text-sm font-semibold text-indigo-200">
                Tailor to Your Resume <span className="text-xs text-indigo-400 font-normal">(Optional)</span>
              </label>
            </div>
            <div className="flex text-xs bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setResumeMode('upload')}
                className={`px-2.5 py-1 rounded-md transition ${
                  resumeMode === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Upload PDF
              </button>
              <button
                type="button"
                onClick={() => setResumeMode('text')}
                className={`px-2.5 py-1 rounded-md transition ${
                  resumeMode === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            When provided, questions will be asked about your actual projects, tech stack, and career history.
          </p>

          {resumeMode === 'upload' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload-input"
              />

              {!resumeFileName ? (
                <label
                  htmlFor="resume-upload-input"
                  className={`border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition bg-slate-900/50 ${
                    uploadingResume ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  {uploadingResume ? (
                    <div className="flex items-center gap-2 text-indigo-400 text-sm py-1">
                      <Loader2 size={18} className="animate-spin" />
                      Parsing resume content...
                    </div>
                  ) : (
                    <>
                      <FileUp size={24} className="text-indigo-400 mb-2" />
                      <span className="text-sm font-medium text-slate-300">
                        Click to upload resume (PDF, TXT)
                      </span>
                      <span className="text-xs text-slate-500 mt-1">
                        Up to 5MB • Automatically extracted & analyzed
                      </span>
                    </>
                  )}
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-200 truncate">
                      {resumeFileName}
                    </span>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                      Parsed
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeResume}
                    className="p-1 text-slate-400 hover:text-red-400 transition"
                    title="Remove resume"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume work history, projects, and skills summary here..."
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
              {resumeText && (
                <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                  <span>{resumeText.length} characters</span>
                  <button
                    type="button"
                    onClick={() => setResumeText('')}
                    className="text-red-400 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interview Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Interview Type</label>
          <div className="space-y-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setForm({ ...form, type: t.value })}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  form.type === t.value
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="flex-1">
                  <div className="font-semibold text-sm">{t.label}</div>
                  <div className="text-xs opacity-70">{t.desc}</div>
                </div>
                {form.type === t.value && (
                  <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Question count */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Number of Questions</label>
          <div className="flex gap-3">
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => setForm({ ...form, totalQuestions: n })}
                className={`flex-1 py-2.5 rounded-xl border font-semibold text-sm transition-all ${
                  form.totalQuestions === n
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'
                }`}
              >
                {n} Qs
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={loading || uploadingResume}
          className="btn-primary w-full text-base py-3.5"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Preparing customized questions…</>
          ) : (
            <><BrainCircuit size={18} /> Start Interview <ChevronRight size={16} /></>
          )}
        </button>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-slate-600 mt-6">
        Uses open-source LLM via Groq — high performance, free, privacy-friendly.
      </p>
    </div>
  );
}
