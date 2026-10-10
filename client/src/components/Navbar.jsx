import { Link, useLocation } from 'react-router-dom';
import { BrainCircuit, History, Home } from 'lucide-react';

export default function Navbar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
      pathname === path
        ? 'text-indigo-400 bg-indigo-500/10'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <BrainCircuit className="text-indigo-400" size={22} />
          <span>
            Interview<span className="text-indigo-400">AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          <Link to="/" className={linkClass('/')}>
            <Home size={15} /> Home
          </Link>
          <Link to="/history" className={linkClass('/history')}>
            <History size={15} /> History
          </Link>
        </nav>
      </div>
    </header>
  );
}
