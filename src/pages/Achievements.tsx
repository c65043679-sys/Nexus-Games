import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAchievements, ACHIEVEMENTS_CATALOG, Achievement } from '../components/AchievementsContext';
import { useAuth } from '../components/AuthContext';
import { 
  Trophy, 
  Star, 
  Sparkles, 
  Zap, 
  Crown, 
  ShieldAlert, 
  Palette, 
  Eye, 
  Radio, 
  Flame, 
  Lock, 
  CheckCircle2, 
  Rocket, 
  Award,
  Filter,
  Check,
  Bookmark,
  Gamepad2,
  Search,
  Maximize,
  FileText,
  ShieldCheck,
  KeyRound
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Rocket,
  Star,
  Palette,
  ShieldAlert,
  Eye,
  Zap,
  Crown,
  Sparkles,
  Lock,
  Flame,
  Trophy,
  Radio,
  Bookmark,
  Gamepad2,
  Search,
  Maximize,
  FileText,
  ShieldCheck
};

const TIER_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  Bronze: { bg: 'bg-amber-900/20', text: 'text-amber-400', border: 'border-amber-700/40', badge: 'bg-amber-700/30 text-amber-300' },
  Silver: { bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-400/40', badge: 'bg-slate-500/30 text-slate-200' },
  Gold: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40', badge: 'bg-yellow-500/30 text-yellow-300' },
  Platinum: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-400/40', badge: 'bg-purple-500/30 text-purple-200' },
};

export const Achievements: React.FC = () => {
  const { isOwner } = useAuth();
  const { unlocked, progressData, totalXp, level, levelTitle, unlockAchievement, unlockAllAchievements, getProgress } = useAchievements();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked' | 'secret'>('all');

  useEffect(() => {
    try { unlockAchievement('vault_visitor'); } catch (e) {}
  }, []);

  const unlockedCount = Object.keys(unlocked).length;
  const totalCount = ACHIEVEMENTS_CATALOG.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const nextLevelXp = level * 250;
  const currentLevelProgress = totalXp % 250;

  const filteredList = ACHIEVEMENTS_CATALOG.filter((ach) => {
    const isAchUnlocked = !!unlocked[ach.id];
    if (filter === 'unlocked') return isAchUnlocked;
    if (filter === 'locked') return !isAchUnlocked && !ach.secret;
    if (filter === 'secret') return ach.secret;
    return true;
  });

  return (
    <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-amber-950/40 via-black/80 to-purple-950/40 border border-amber-500/30 rounded-3xl p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {isOwner && (
          <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold shrink-0 shadow-md shadow-amber-400/30">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                  Overlord Admin Privilege
                </p>
                <p className="text-xs text-slate-300">
                  As the site owner, you have master overrides to instantly unlock all achievement trophies.
                </p>
              </div>
            </div>
            <button
              onClick={() => unlockAllAchievements()}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/30 transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Unlock All Achievements
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10 border-b border-white/10 pb-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-black font-black shadow-xl shadow-amber-500/30 shrink-0">
              <Trophy className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                <Award className="w-4 h-4" /> Nexus Member Level {level}
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">{levelTitle}</h1>
              <p className="text-xs text-slate-300 mt-1">
                Unlock achievements across Nexus Games to earn XP and level up your status.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">Total XP</p>
              <p className="text-2xl font-black text-amber-400 font-mono">{totalXp} XP</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">Trophies</p>
              <p className="text-2xl font-black text-white font-mono">{unlockedCount} / {totalCount}</p>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="space-y-2 relative z-10">
          <div className="flex justify-between text-xs font-bold font-mono text-slate-300">
            <span>Level {level} Progress ({currentLevelProgress} / 250 XP)</span>
            <span className="text-amber-400">{progressPercent}% Overall Mastered</span>
          </div>
          <div className="w-full bg-black/60 border border-white/10 rounded-full h-3.5 overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-500 shadow-md shadow-amber-500/50"
              style={{ width: `${(currentLevelProgress / 250) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filter Trophies:</span>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          {[
            { id: 'all', label: `All (${totalCount})` },
            { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
            { id: 'locked', label: `Locked (${totalCount - unlockedCount})` },
            { id: 'secret', label: 'Secret' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((ach) => {
          const isAchUnlocked = !!unlocked[ach.id];
          const unlockData = unlocked[ach.id];
          const IconComponent = ICON_MAP[ach.iconName] || Trophy;
          const tierStyle = TIER_COLORS[ach.tier] || TIER_COLORS.Bronze;

          const currentProg = getProgress(ach.id);
          const maxProg = ach.maxProgress || 1;

          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 backdrop-blur-xl ${
                isAchUnlocked
                  ? 'bg-gradient-to-br from-white/10 via-black/60 to-white/5 border-amber-500/40 shadow-xl shadow-amber-500/10'
                  : 'bg-black/40 border-white/5 opacity-70 hover:opacity-100 hover:border-white/20'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  isAchUnlocked
                    ? 'bg-gradient-to-br from-amber-400 to-yellow-600 border-amber-300 text-black shadow-lg shadow-amber-500/30'
                    : 'bg-white/5 border-white/10 text-slate-500'
                }`}>
                  <IconComponent className="w-6 h-6" />
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${tierStyle.badge}`}>
                    {ach.tier}
                  </span>
                  <span className="px-2.5 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] font-bold font-mono rounded-full">
                    +{ach.xp} XP
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  {ach.secret && !isAchUnlocked ? '??? Secret Achievement' : ach.title}
                  {isAchUnlocked && <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {ach.secret && !isAchUnlocked 
                    ? 'This secret achievement remains hidden until triggered.' 
                    : ach.description}
                </p>
              </div>

              {/* Card Footer Status */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                {isAchUnlocked ? (
                  <div className="flex items-center justify-between w-full text-emerald-400 font-bold font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Unlocked
                    </span>
                    <span className="text-slate-400 font-normal">
                      {new Date(unlockData.unlockedAt).toLocaleDateString()}
                    </span>
                  </div>
                ) : ach.maxProgress ? (
                  <div className="w-full space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono font-bold">
                      <span>Progress</span>
                      <span>{currentProg} / {maxProg}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                      <div 
                        className="bg-[var(--accent)] h-full transition-all"
                        style={{ width: `${Math.min(100, (currentProg / maxProg) * 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full text-slate-500 font-mono text-[11px]">
                    <span>Status: Locked</span>
                    <button
                      onClick={() => unlockAchievement(ach.id)}
                      className="text-[10px] text-amber-400/70 hover:text-amber-300 hover:underline cursor-pointer"
                    >
                      [Test Unlock]
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
