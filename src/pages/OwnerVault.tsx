import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../components/AuthContext';
import { useSettings } from '../components/SettingsContext';
import { GameCard } from '../components/GameCard';
import { Game } from '../types';
import { 
  Crown, 
  ShieldCheck, 
  Zap, 
  PlusCircle, 
  Sparkles, 
  Volume2, 
  Lock, 
  KeyRound, 
  Terminal, 
  Flame, 
  Radio, 
  CheckCircle2, 
  Trash2, 
  Gamepad2,
  Tv,
  Eye,
  Sliders
} from 'lucide-react';

// Web Audio Synthesis Helper for Retro 8-bit Sounds
const playRetroSound = (type: 'coin' | 'laser' | 'levelup' | 'win' | 'powerup') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'coin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'laser') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'levelup') {
      osc.type = 'triangle';
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      });
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'win') {
      osc.type = 'square';
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      });
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'powerup') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.error('Audio synthesis failed:', e);
  }
};

// Built-in VIP Exclusive Games for Owner
const OWNER_VIP_GAMES: Game[] = [
  {
    id: 'owner-vip-cyber-runner',
    title: '👑 Cyber Runner 2099 (VIP Edition)',
    description: 'Exclusive VIP high-speed cybernetic survival simulator built directly into the Nexus Owner Vault.',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    color: '#7c3aed',
    category: 'Arcade',
    iframe: 'https://html5.gamedistribution.com/f04c62e557b744b196ebcfed42d05777/',
    controls: 'Arrow Keys or WASD to navigate obstacles.',
    rating: 5.0,
    featured: true,
    trending: true,
  },
  {
    id: 'owner-vip-matrix-defense',
    title: '👑 Matrix Defense Overlord',
    description: 'High-octane space defense shooter unlocked exclusively for the Nexus Site Owner.',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    color: '#10b981',
    category: 'Action',
    iframe: 'https://html5.gamedistribution.com/62e0d37e6f854b73a388b1f84260907a/',
    controls: 'Mouse Aim & Left Click to shoot.',
    rating: 5.0,
    featured: true,
  },
  {
    id: 'owner-vip-quantum-drift',
    title: '👑 Quantum Drift VIP',
    description: 'Ultra-fast hyperdrift arcade racing unlocked in the Owner Vault.',
    thumbnail: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
    color: '#3b82f6',
    category: 'Racing',
    iframe: 'https://html5.gamedistribution.com/152912445b2e4f0a99ff1e204a9e5db4/',
    controls: 'WASD / Arrow keys to drift around corners.',
    rating: 5.0,
  }
];

export const OwnerVault: React.FC = () => {
  const { isOwner, user, signIn } = useAuth();
  const { settings, updateSetting } = useSettings();

  const [activeTab, setActiveTab] = useState<'hacks' | 'injector' | 'vip' | 'broadcast'>('hacks');

  // Injector state
  const [injectedGames, setInjectedGames] = useState<Game[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_injected_games');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [newTitle, setNewTitle] = useState('');
  const [newIframe, setNewIframe] = useState('');
  const [newCategory, setNewCategory] = useState('Arcade');
  const [newThumb, setNewThumb] = useState('');
  const [newColor, setNewColor] = useState('#7c3aed');
  const [newControls, setNewControls] = useState('WASD to move, Space to action');
  const [injectSuccess, setInjectSuccess] = useState('');

  // Announcement state
  const [announcementText, setAnnouncementText] = useState(() => {
    return localStorage.getItem('nexus_site_announcement') || '';
  });
  const [announceSuccess, setAnnounceSuccess] = useState('');

  // God Mode hacks
  const [godModeAura, setGodModeAura] = useState(() => {
    return localStorage.getItem('nexus_godmode_aura') === 'true';
  });
  const [matrixRain, setMatrixRain] = useState(() => {
    return localStorage.getItem('nexus_matrix_rain') === 'true';
  });

  const handleInjectGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newIframe.trim()) return;

    const newGame: Game = {
      id: `custom-injected-${Date.now()}`,
      title: newTitle.trim(),
      description: 'Owner-Injected Special Custom Title.',
      thumbnail: newThumb.trim() || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
      color: newColor,
      category: newCategory,
      iframe: newIframe.trim(),
      controls: newControls.trim() || 'Standard Keyboard & Mouse',
      rating: 5.0,
      featured: true,
      trending: true,
    };

    const updated = [newGame, ...injectedGames];
    setInjectedGames(updated);
    localStorage.setItem('nexus_injected_games', JSON.stringify(updated));

    // Also dispatch event so main catalog updates dynamically
    window.dispatchEvent(new Event('nexus_games_updated'));

    playRetroSound('win');
    setInjectSuccess(`"${newGame.title}" successfully injected into the Nexus catalog!`);
    setTimeout(() => setInjectSuccess(''), 4000);

    setNewTitle('');
    setNewIframe('');
    setNewThumb('');
  };

  const handleRemoveInjected = (id: string) => {
    const updated = injectedGames.filter(g => g.id !== id);
    setInjectedGames(updated);
    localStorage.setItem('nexus_injected_games', JSON.stringify(updated));
    window.dispatchEvent(new Event('nexus_games_updated'));
    playRetroSound('laser');
  };

  const handleSaveAnnouncement = () => {
    localStorage.setItem('nexus_site_announcement', announcementText.trim());
    window.dispatchEvent(new Event('nexus_announcement_updated'));
    playRetroSound('coin');
    setAnnounceSuccess('Global announcement broadcast published!');
    setTimeout(() => setAnnounceSuccess(''), 3500);
  };

  const toggleGodModeAura = () => {
    const next = !godModeAura;
    setGodModeAura(next);
    localStorage.setItem('nexus_godmode_aura', next ? 'true' : 'false');
    playRetroSound(next ? 'powerup' : 'laser');
  };

  const toggleMatrixRain = () => {
    const next = !matrixRain;
    setMatrixRain(next);
    localStorage.setItem('nexus_matrix_rain', next ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('nexus_matrix_toggle', { detail: next }));
    playRetroSound(next ? 'powerup' : 'laser');
  };

  if (!isOwner) {
    return (
      <div className="flex-1 min-h-[80vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-black/80 border border-amber-500/30 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl shadow-amber-500/10 text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
            <Crown className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              Owner Vault Restricted
            </h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This classified control deck is strictly reserved for the owner account:
              <br />
              <span className="text-amber-400 font-mono font-bold text-sm block mt-1">c65043679@gmail.com</span>
            </p>
            {user && (
              <p className="text-xs text-slate-500 mt-3 bg-white/5 p-2 rounded-xl border border-white/10">
                Currently signed in as: <span className="text-slate-300 font-semibold">{user.email}</span>
              </p>
            )}
          </div>

          <button
            onClick={() => signIn()}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            Sign in as c65043679@gmail.com
          </button>

          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">
            Nexus Security Clearance Level 10 Required
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 sm:p-10 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Header Banner */}
      <header className="relative overflow-hidden bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-black border border-amber-500/30 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl shadow-amber-500/10">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Crown className="w-64 h-64 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
              <Crown className="w-3.5 h-3.5" />
              Owner Overlord Status Active
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Nexus Owner Vault & Control Deck
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Welcome back, <span className="text-amber-400 font-bold">{user?.displayName || 'Site Owner'}</span> (<span className="font-mono text-xs">{user?.email || 'c65043679@gmail.com'}</span>). You have full override privileges across the entire Nexus Games platform.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/50 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-black flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
              👑
            </div>
            <div>
              <p className="text-xs font-bold text-white">Owner Privilege Level</p>
              <p className="text-[11px] text-amber-400 font-mono font-bold uppercase tracking-wider">Level 10 - Unrestricted God Mode</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'hacks', label: 'God Mode Hacks', icon: Zap },
          { id: 'injector', label: 'Custom Game Injector', icon: PlusCircle },
          { id: 'vip', label: 'VIP Exclusive Games', icon: Gamepad2 },
          { id: 'broadcast', label: 'Site Broadcast Banner', icon: Radio },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                playRetroSound('coin');
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/20 font-black scale-105' 
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: God Mode Hacks */}
      {activeTab === 'hacks' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Audio Soundboard */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5 backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Owner 8-Bit Retro Soundboard</h3>
                <p className="text-xs text-slate-400">Trigger arcade audio synthesizer effects live</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'Coin Pickup', type: 'coin' as const, color: 'hover:border-yellow-400' },
                { name: 'Laser Cannon', type: 'laser' as const, color: 'hover:border-red-400' },
                { name: 'Level Up Fanfare', type: 'levelup' as const, color: 'hover:border-emerald-400' },
                { name: 'Victory Tune', type: 'win' as const, color: 'hover:border-purple-400' },
                { name: 'Power Up Surge', type: 'powerup' as const, color: 'hover:border-sky-400' },
              ].map((s) => (
                <button
                  key={s.name}
                  onClick={() => playRetroSound(s.type)}
                  className={`p-3.5 bg-black/40 border border-white/10 rounded-2xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all flex flex-col items-center gap-2 ${s.color} active:scale-95`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Hacks */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5 backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Visual Engine Toggles</h3>
                <p className="text-xs text-slate-400">Custom shaders and golden owner aura</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
                <div>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    God Mode Golden Aura
                  </p>
                  <p className="text-xs text-slate-400">Add a glowing golden aura frame to game players</p>
                </div>
                <button
                  onClick={toggleGodModeAura}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    godModeAura ? 'bg-amber-500' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all absolute top-1 ${
                    godModeAura ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
                <div>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <Tv className="w-4 h-4 text-emerald-400" />
                    Matrix Green Code Background
                  </p>
                  <p className="text-xs text-slate-400">Display matrix digital code stream on background</p>
                </div>
                <button
                  onClick={toggleMatrixRain}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    matrixRain ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all absolute top-1 ${
                    matrixRain ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB CONTENT 2: Custom Game Injector */}
      {activeTab === 'injector' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Live Custom Game Injector</h3>
                <p className="text-xs text-slate-400">Inject any HTML5 or iframe game directly into the Nexus catalog</p>
              </div>
            </div>

            {injectSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {injectSuccess}
              </div>
            )}

            <form onSubmit={handleInjectGame} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Game Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Cyber Blade 2099"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    iFrame Game Embed URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={newIframe}
                    onChange={(e) => setNewIframe(e.target.value)}
                    placeholder="https://example.com/game/index.html"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Arcade">Arcade</option>
                    <option value="Action">Action</option>
                    <option value="Racing">Racing</option>
                    <option value="Sports">Sports</option>
                    <option value="Puzzle">Puzzle</option>
                    <option value="Horror">Horror</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Thumbnail Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newThumb}
                    onChange={(e) => setNewThumb(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Controls Description
                  </label>
                  <input
                    type="text"
                    value={newControls}
                    onChange={(e) => setNewControls(e.target.value)}
                    placeholder="WASD to move, Space to shoot"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Inject Game Into Catalog
              </button>
            </form>
          </div>

          {/* List of Injected Games */}
          {injectedGames.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                Owner Injected Titles ({injectedGames.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {injectedGames.map((game) => (
                  <div 
                    key={game.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={game.thumbnail} 
                        alt={game.title} 
                        className="w-12 h-12 rounded-xl object-cover shrink-0" 
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{game.title}</p>
                        <p className="text-xs text-amber-400 font-mono">{game.category}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveInjected(game.id)}
                      className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all cursor-pointer"
                      title="Remove game"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* TAB CONTENT 3: VIP Exclusive Games */}
      {activeTab === 'vip' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Crown className="w-6 h-6 text-amber-400" />
                Owner VIP Exclusive Vault Collection
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                These titles are reserved strictly for the Nexus Owner.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OWNER_VIP_GAMES.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB CONTENT 4: Broadcast Banner */}
      {activeTab === 'broadcast' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Global Banner Broadcast Notice</h3>
              <p className="text-xs text-slate-400">Display a floating announcement bar at the top of the entire website</p>
            </div>
          </div>

          {announceSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {announceSuccess}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Announcement Message (Leave empty to hide)
              </label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="📢 OWNER ANNOUNCEMENT: Welcome to Nexus Games! Double XP Weekend Active!"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveAnnouncement}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
              >
                Publish Broadcast
              </button>

              {announcementText && (
                <button
                  onClick={() => {
                    setAnnouncementText('');
                    localStorage.removeItem('nexus_site_announcement');
                    window.dispatchEvent(new Event('nexus_announcement_updated'));
                  }}
                  className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
                >
                  Clear Announcement
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
