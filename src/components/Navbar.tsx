import React, { useState } from 'react';
import { Search, Heart, User as UserIcon, PlusCircle, ShieldAlert, Crown, Trophy, Medal } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';
import { useAchievements } from './AchievementsContext';

interface NavbarProps {
  onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const { user, profile, signIn, isOwner } = useAuth();
  const { triggerPanic } = useSettings();
  const { unlocked, unlockAchievement } = useAchievements();
  const location = useLocation();
  const navigate = useNavigate();

  const [logoTapCount, setLogoTapCount] = useState(0);

  const handleLogoClick = (e: React.MouseEvent) => {
    const nextCount = logoTapCount + 1;
    setLogoTapCount(nextCount);

    if (nextCount >= 5) {
      try { unlockAchievement('easter_egg_king'); } catch (err) {}
      setLogoTapCount(0);
    }

    setTimeout(() => {
      setLogoTapCount(0);
    }, 3000);
  };

  const unlockedCount = Object.keys(unlocked).length;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-14 sm:h-16 px-4 sm:px-8 bg-bg-dark/70 backdrop-blur-xl border-b border-white/10">
      <div onClick={handleLogoClick} className="cursor-pointer shrink-0">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-[var(--accent)] text-white rounded-lg flex items-center justify-center font-black text-base shadow-md shadow-[var(--accent)]/30 group-hover:scale-105 transition-all">
            N
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight">
            NEXUS<span className="text-[var(--accent)] ml-0.5">GAMES</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 max-w-xs sm:max-w-md mx-3 sm:mx-8 relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search games..."
          className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50 text-xs transition-all text-white placeholder-slate-400"
          onChange={(e) => {
            onSearch(e.target.value);
            if (e.target.value.trim().length >= 2) {
              try { unlockAchievement('search_master'); } catch (err) {}
            }
            if (location.pathname !== '/') {
              navigate('/');
            }
          }}
        />
      </div>

      <nav className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <Link
          to="/leaderboard"
          title="View Community Leaderboard & Rankings"
          className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-[11px] sm:text-xs font-semibold rounded-full transition-all active:scale-95 shadow-sm"
        >
          <Medal className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Leaderboard</span>
        </Link>

        <Link
          to="/achievements"
          title="View Achievements & XP Level"
          className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-[11px] sm:text-xs font-semibold rounded-full transition-all active:scale-95 shadow-sm"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Achievements</span>
          <span className="px-1.5 py-0.2 bg-amber-400/20 text-amber-300 text-[10px] font-mono rounded-full font-bold">
            {unlockedCount}
          </span>
        </Link>

        {isOwner && (
          <Link
            to="/owner-vault"
            title="Owner Overlord Vault & Control Deck"
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all active:scale-95 shadow-md bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black shadow-amber-500/10 hover:brightness-110"
          >
            <Crown className="w-3.5 h-3.5 text-amber-950 fill-amber-950 shrink-0" />
            <span className="whitespace-nowrap">Owner Vault</span>
          </Link>
        )}

        <button
          onClick={triggerPanic}
          title="Panic Button (Quick Hide)"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-[11px] sm:text-xs font-semibold rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>Panic</span>
        </button>

        <a
          href="https://forms.gle/vbbxSHpEHsYwJyH96"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden xl:flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white text-slate-300 text-[11px] sm:text-xs font-semibold rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Request</span>
        </a>

        {user ? (
          <div className="flex items-center gap-2 ml-1">
            <div className="hidden lg:block text-right">
              <p className="text-[11px] font-bold text-white leading-none mb-0.5 flex items-center gap-1 justify-end">
                {isOwner && <Crown className="w-3 h-3 text-amber-400 inline" />}
                {profile?.nickname || user.displayName}
              </p>
              <p className="text-[9px] text-amber-400/90 font-mono font-bold leading-none">
                {isOwner ? '👑 OWNER' : 'Nexus Member'}
              </p>
            </div>
            <Link to="/settings" className={`relative w-8 h-8 rounded-full border-2 overflow-hidden bg-slate-800 cursor-pointer transition-all ${
              isOwner ? 'border-amber-400 ring-1 ring-amber-400/50 shadow-md shadow-amber-500/20' : 'border-[var(--accent)]/30 hover:border-[var(--accent)]'
            }`}>
              {user.photoURL ? (
                <img src={user.photoURL} alt={profile?.nickname || user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--accent)] text-white">
                   <UserIcon className="w-4 h-4 text-white" />
                </div>
              )}
            </Link>
          </div>
        ) : (
          <button 
            onClick={signIn}
            className="px-3.5 py-1.5 bg-[var(--accent)] hover:brightness-110 text-white text-xs font-bold rounded-full transition-all shadow-md shadow-[var(--accent)]/20 active:scale-95 ml-1"
          >
            Sign In
          </button>
        )}
      </nav>
    </header>
  );
};

