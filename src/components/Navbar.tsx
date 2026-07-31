import React from 'react';
import { Search, Heart, User as UserIcon, PlusCircle, ShieldAlert } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';

interface NavbarProps {
  onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const { user, profile, signIn } = useAuth();
  const { triggerPanic } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-[72px] px-8 bg-bg-dark/60 backdrop-blur-xl border-b border-white/10">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 bg-[var(--accent)] text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-[var(--accent)]/30 group-hover:scale-105 transition-all">
          N
        </div>
        <span className="text-xl font-bold tracking-tight">
          NEXUS<span className="text-[var(--accent)] ml-0.5">GAMES</span>
        </span>
      </Link>

      <div className="flex-1 max-w-md mx-8 lg:mx-12 relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-4.5 h-4.5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search games..."
          className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 text-sm transition-all text-white placeholder-slate-400"
          onChange={(e) => {
            onSearch(e.target.value);
            if (location.pathname !== '/') {
              navigate('/');
            }
          }}
        />
      </div>

      <nav className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={triggerPanic}
          title="Panic Button (Quick Hide)"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>Panic</span>
        </button>

        <a
          href="https://forms.gle/vbbxSHpEHsYwJyH96"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white text-slate-300 text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <PlusCircle className="w-4 h-4 text-[var(--accent)]" />
          Request Games
        </a>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-white leading-none mb-1">{profile?.nickname || user.displayName}</p>
              <p className="text-[10px] text-slate-500 leading-none">Nexus Member</p>
            </div>
            <Link to="/settings" className="w-10 h-10 rounded-full border-2 border-[var(--accent)]/30 overflow-hidden bg-slate-800 cursor-pointer hover:border-[var(--accent)] transition-colors">
              {user.photoURL ? (
                <img src={user.photoURL} alt={profile?.nickname || user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--accent)] text-white">
                   <UserIcon className="w-5 h-5 text-white" />
                </div>
              )}
            </Link>
          </div>
        ) : (
          <button 
            onClick={signIn}
            className="px-5 py-2 bg-[var(--accent)] hover:brightness-110 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-[var(--accent)]/20 active:scale-95"
          >
            Sign In
          </button>
        )}
      </nav>
    </header>
  );
};

