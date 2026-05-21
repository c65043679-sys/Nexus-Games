import React from 'react';
import { Search, Heart, User as UserIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface NavbarProps {
  onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const { user, profile, signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-[72px] px-8 bg-bg-dark/60 backdrop-blur-xl border-b border-white/10">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
          N
        </div>
        <span className="text-xl font-bold tracking-tight">
          NEXUS<span className="text-violet-400">GAMES</span>
        </span>
      </Link>

      <div className="flex-1 max-w-md mx-12 relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-4.5 h-4.5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search games..."
          className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm transition-all text-white placeholder-slate-400"
          onChange={(e) => {
            onSearch(e.target.value);
            if (location.pathname !== '/') {
              navigate('/');
            }
          }}
        />
      </div>

      <nav className="flex items-center gap-6">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-white leading-none mb-1">{profile?.nickname || user.displayName}</p>
              <p className="text-[10px] text-slate-500 leading-none">Nexus Member</p>
            </div>
            <Link to="/settings" className="w-10 h-10 rounded-full border-2 border-violet-500/30 overflow-hidden bg-slate-800 cursor-pointer hover:border-violet-500 transition-colors">
              {user.photoURL ? (
                <img src={user.photoURL} alt={profile?.nickname || user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-blue-500">
                   <UserIcon className="w-5 h-5 text-white" />
                </div>
              )}
            </Link>
          </div>
        ) : (
          <button 
            onClick={signIn}
            className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-violet-600/20 active:scale-95"
          >
            Sign In
          </button>
        )}
      </nav>
    </header>
  );
};
