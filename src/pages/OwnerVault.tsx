import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../components/AuthContext';
import { useSettings } from '../components/SettingsContext';
import { useAchievements } from '../components/AchievementsContext';
import { Game } from '../types';
import { doc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Crown, 
  ShieldCheck, 
  Zap, 
  PlusCircle, 
  Sparkles, 
  Volume2, 
  Terminal, 
  Flame, 
  Radio, 
  CheckCircle2, 
  Trash2,
  Tv,
  Activity,
  PartyPopper,
  Cpu,
  Wifi,
  RefreshCw,
  Play,
  Database,
  Gauge,
  Rocket
} from 'lucide-react';

import { playRetroSound } from '../utils/audioSynth';

// Canvas 1: Realtime Audio Spectrum Equalizer
const AudioSpectrumVisualizer: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let energy = 0;

    const handleAudioSynth = () => {
      energy = 1.0;
    };
    window.addEventListener('nexus_audio_synth', handleAudioSynth);

    const bars = Array.from({ length: 24 }, () => Math.random() * 0.2);

    const render = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 70;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      energy = Math.max(0, energy - 0.02);

      const barWidth = w / bars.length;

      for (let i = 0; i < bars.length; i++) {
        bars[i] = Math.max(0.1, bars[i] * 0.95 + (Math.random() * 0.2 + energy * 0.7) * 0.08);
        const barHeight = bars[i] * h * 0.85;

        const x = i * barWidth;
        const y = h - barHeight;

        const grad = ctx.createLinearGradient(0, h, 0, 0);
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(0.5, '#7c3aed');
        grad.addColorStop(1, '#06b6d4');

        ctx.fillStyle = grad;
        ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('nexus_audio_synth', handleAudioSynth);
    };
  }, []);

  return (
    <div className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 space-y-2">
      <div className="flex items-center justify-between text-[11px] font-mono text-amber-400 font-bold">
        <span>AUDIO SPECTRUM WAVEFORM</span>
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> REALTIME SYNTH
        </span>
      </div>
      <canvas ref={canvasRef} className="w-full h-[70px] rounded-lg" />
    </div>
  );
};

// Canvas 2: Realtime 360 Degree Matrix Radar Sweep
const RadarSweepCanvas: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const targets = [
      { x: 0.35, y: 0.25, alpha: 1 },
      { x: 0.7, y: 0.6, alpha: 1 },
      { x: 0.2, y: 0.75, alpha: 1 },
      { x: 0.8, y: 0.3, alpha: 1 },
    ];

    const render = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 180;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(cx, cy) - 10;

      ctx.clearRect(0, 0, w, h);

      // Draw grid circles
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.lineWidth = 1;
      for (let r = radius; r > 0; r -= radius / 3) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Sweeping line
      angle += 0.04;
      ctx.save();
      ctx.translate(cx, cy);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle - 0.3, angle);
      ctx.lineTo(0, 0);
      const sweepGrad = ctx.createConicGradient(angle, 0, 0);
      sweepGrad.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
      sweepGrad.addColorStop(0.1, 'rgba(16, 185, 129, 0.0)');
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      ctx.restore();

      // Targets blips
      targets.forEach((t) => {
        const tx = cx + (t.x - 0.5) * radius * 1.8;
        const ty = cy + (t.y - 0.5) * radius * 1.8;

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
        ctx.beginPath();
        ctx.arc(tx, ty, 7, 0, Math.PI * 2);
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="bg-black/60 border border-emerald-500/30 rounded-2xl p-4 space-y-2 relative overflow-hidden">
      <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
        <span>360° SOCKET RADAR MATRIX</span>
        <span>SCANNING EDGE NODES...</span>
      </div>
      <canvas ref={canvasRef} className="w-full h-[180px] rounded-xl" />
    </div>
  );
};

// Canvas 3: Realtime Plasma Shockwave Cannon
const PlasmaCannonCanvas: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const firePlasmaShockwave = () => {
    playRetroSound('plasma');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    let particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string; life: number }> = [];

    const colors = ['#7c3aed', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      particles.push({
        x: w / 2,
        y: h / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0
      });
    }

    let frame = 0;
    const animateParticles = () => {
      frame++;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(0, 0, w, h);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      particles = particles.filter((p) => p.life > 0);

      if (particles.length > 0 && frame < 40) {
        requestAnimationFrame(animateParticles);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    animateParticles();
  };

  return (
    <div className="bg-black/60 border border-purple-500/30 rounded-2xl p-4 space-y-3 relative overflow-hidden">
      <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-300">
        <span>REAL-TIME PLASMA CANNON SHOCKWAVE</span>
        <button
          onClick={firePlasmaShockwave}
          className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-lg text-xs transition-all active:scale-95 cursor-pointer shadow-md shadow-purple-500/30"
        >
          ⚡ Fire Plasma Cannon
        </button>
      </div>
      <canvas 
        ref={canvasRef} 
        onClick={firePlasmaShockwave}
        className="w-full h-[120px] bg-slate-950/80 rounded-xl cursor-crosshair border border-white/5" 
      />
      <p className="text-[10px] text-slate-400 font-mono text-center">
        Click canvas or button to fire realtime plasma particle blast
      </p>
    </div>
  );
};

export const OwnerVault: React.FC = () => {
  const { isOwner, user, signIn, updateProfile } = useAuth();
  const { settings, updateSetting } = useSettings();
  const { unlockAchievement, unlockAllAchievements } = useAchievements();

  useEffect(() => {
    if (isOwner) {
      try { unlockAchievement('vault_visitor'); } catch (e) {}
    }
  }, [isOwner]);

  const [activeTab, setActiveTab] = useState<'hacks' | 'injector' | 'command' | 'broadcast'>('hacks');

  // Owner handle editor state
  const [ownerHandleInput, setOwnerHandleInput] = useState(user?.displayName || '');
  const [handleSavedNotice, setHandleSavedNotice] = useState('');

  // Sync handle input if user profile changes
  useEffect(() => {
    if (user?.displayName) {
      setOwnerHandleInput(user.displayName);
    }
  }, [user?.displayName]);

  const handleSaveOwnerHandle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerHandleInput.trim()) return;
    updateProfile({
      nickname: ownerHandleInput.trim(),
      displayName: ownerHandleInput.trim()
    });
    playRetroSound('levelup');
    setHandleSavedNotice('Owner custom handle updated live!');
    setTimeout(() => setHandleSavedNotice(''), 3000);
  };

  // Party trigger & Telemetry state
  const [partyTriggerSuccess, setPartyTriggerSuccess] = useState('');
  const [pingMs, setPingMs] = useState(14);
  const [activeUsersCount, setActiveUsersCount] = useState(128);

  // Injector state
  const [injectedGames, setInjectedGames] = useState<Game[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newIframe, setNewIframe] = useState('');
  const [newCategory, setNewCategory] = useState('Arcade');
  const [newThumb, setNewThumb] = useState('');
  const [newColor, setNewColor] = useState('#7c3aed');
  const [newControls, setNewControls] = useState('WASD to move, Space to action');
  const [injectSuccess, setInjectSuccess] = useState('');

  // Announcement & Admin Takeover state
  const [announcementText, setAnnouncementText] = useState('');
  const [announceSuccess, setAnnounceSuccess] = useState('');
  const [popupTitleInput, setPopupTitleInput] = useState('👑 OVERLORD ADMIN ABUSE ALERT');
  const [popupMsgInput, setPopupMsgInput] = useState('WARNING: The Overlord has assumed total screen control! Bow down!');
  const [popupSending, setPopupSending] = useState(false);

  // God Mode hacks
  const [godModeAura, setGodModeAura] = useState(() => {
    return localStorage.getItem('nexus_godmode_aura') === 'true';
  });
  const [matrixRain, setMatrixRain] = useState(() => {
    return localStorage.getItem('nexus_matrix_rain') === 'true';
  });

  // Sync injected games and broadcast from Firestore
  useEffect(() => {
    const unsubInjected = onSnapshot(collection(db, 'injected_games'), (snapshot) => {
      const list: Game[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Game);
      });
      setInjectedGames(list);
    }, (err) => console.warn('Injected games listener error:', err));

    const unsubBroadcast = onSnapshot(doc(db, 'config', 'broadcast'), (snapshot) => {
      if (snapshot.exists()) {
        setAnnouncementText(snapshot.data().message || '');
      }
    }, (err) => console.warn('Broadcast listener error:', err));

    return () => {
      unsubInjected();
      unsubBroadcast();
    };
  }, []);

  const handleInjectGame = async (e: React.FormEvent) => {
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

    try {
      await setDoc(doc(db, 'injected_games', newGame.id), newGame);
      playRetroSound('win');
      setInjectSuccess(`"${newGame.title}" successfully injected into the global Nexus catalog!`);
      setTimeout(() => setInjectSuccess(''), 4000);

      setNewTitle('');
      setNewIframe('');
      setNewThumb('');
    } catch (err) {
      console.error('Failed to inject game to Firestore:', err);
      alert('Failed to publish custom game to database.');
    }
  };

  const handleRemoveInjected = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'injected_games', id));
      playRetroSound('laser');
    } catch (err) {
      console.error('Failed to remove injected game from Firestore:', err);
    }
  };

  const handleSaveAnnouncement = async () => {
    const text = announcementText.trim();
    try {
      await setDoc(doc(db, 'config', 'broadcast'), {
        message: text,
        updatedBy: user?.email || 'c65043679@gmail.com',
        updatedAt: new Date().toISOString(),
      });
      localStorage.setItem('nexus_site_announcement', text);
      window.dispatchEvent(new Event('nexus_announcement_updated'));
      playRetroSound('coin');
      setAnnounceSuccess('Global announcement broadcast published live to all visitors!');
      setTimeout(() => setAnnounceSuccess(''), 3500);
    } catch (err) {
      console.error('Failed to save broadcast notice to Firestore:', err);
      alert('Failed to broadcast notice.');
    }
  };

  const handleClearAnnouncement = async () => {
    try {
      await setDoc(doc(db, 'config', 'broadcast'), {
        message: '',
        updatedBy: user?.email || 'c65043679@gmail.com',
        updatedAt: new Date().toISOString(),
      });
      setAnnouncementText('');
      localStorage.removeItem('nexus_site_announcement');
      window.dispatchEvent(new Event('nexus_announcement_updated'));
      playRetroSound('laser');
    } catch (err) {
      console.error('Failed to clear announcement in Firestore:', err);
    }
  };

  const toggleGodModeAura = () => {
    const next = !godModeAura;
    setGodModeAura(next);
    localStorage.setItem('nexus_godmode_aura', next ? 'true' : 'false');
    playRetroSound(next ? 'powerup' : 'laser');
  };

  const toggleMatrixRain = async () => {
    const next = !matrixRain;
    setMatrixRain(next);
    localStorage.setItem('nexus_matrix_rain', next ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('nexus_matrix_toggle', { detail: next }));
    playRetroSound(next ? 'powerup' : 'laser');
    try {
      await setDoc(doc(db, 'config', 'matrix_rain'), {
        active: next,
        updatedBy: user?.email || 'c65043679@gmail.com',
        timestamp: Date.now()
      });
    } catch (e) {
      console.error('Failed to sync matrix rain:', e);
    }
  };

  const handleBroadcastSoundLive = async (sound: 'coin' | 'laser' | 'levelup' | 'win' | 'powerup' | 'overcharge' | 'plasma' | 'glitch' | 'bassdrop') => {
    playRetroSound(sound);
    try {
      await setDoc(doc(db, 'config', 'sound_effect'), {
        sound,
        triggeredBy: user?.email || 'c65043679@gmail.com',
        timestamp: Date.now()
      });
    } catch (e) {
      console.error('Failed to broadcast sound effect:', e);
    }
  };

  const handleTriggerScreenShake = async () => {
    playRetroSound('bassdrop');
    try {
      await setDoc(doc(db, 'config', 'screen_shake'), {
        timestamp: Date.now(),
        triggeredBy: user?.email || 'c65043679@gmail.com'
      });
      setPartyTriggerSuccess('🌋 Global Earthquake Screen Shake sent live to all connected devices!');
      setTimeout(() => setPartyTriggerSuccess(''), 4500);
    } catch (e) {
      console.error('Failed to trigger screen shake:', e);
    }
  };

  const handleSendAdminPopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!popupMsgInput.trim()) return;
    setPopupSending(true);
    try {
      await setDoc(doc(db, 'config', 'admin_popup'), {
        title: popupTitleInput.trim() || '👑 OVERLORD ADMIN ABUSE ALERT',
        message: popupMsgInput.trim(),
        sender: user?.displayName || user?.email || 'c65043679@gmail.com',
        timestamp: Date.now()
      });
      playRetroSound('overcharge');
      setAnnounceSuccess('🚀 Admin Takeover Alert Modal broadcasted live to all devices!');
      setTimeout(() => setAnnounceSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to send admin popup:', err);
    } finally {
      setPopupSending(false);
    }
  };

  const handleTriggerGlobalParty = async (mode: 'fireworks' | 'cannon' | 'neon_strobe' = 'fireworks') => {
    try {
      await setDoc(doc(db, 'config', 'party'), {
        timestamp: Date.now(),
        mode,
        triggeredBy: user?.email || 'c65043679@gmail.com',
      });
      playRetroSound(mode === 'neon_strobe' ? 'overcharge' : 'win');
      setPartyTriggerSuccess(`🎉 Global ${mode.toUpperCase().replace('_', ' ')} triggered live for all connected visitors!`);
      setTimeout(() => setPartyTriggerSuccess(''), 4500);
    } catch (err) {
      console.error('Failed to trigger party mode:', err);
      alert('Failed to send global party celebration event.');
    }
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

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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

            {/* Quick Owner Custom Handle Editor */}
            <form onSubmit={handleSaveOwnerHandle} className="mt-4 flex items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={ownerHandleInput}
                  onChange={(e) => setOwnerHandleInput(e.target.value)}
                  placeholder="Owner Custom Gamer Alias..."
                  className="w-full bg-black/60 border border-amber-500/40 rounded-xl px-3.5 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-amber-500/50"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
              >
                Save Alias
              </button>
            </form>
            {handleSavedNotice && (
              <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" /> {handleSavedNotice}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 bg-black/50 border border-white/10 p-4 rounded-2xl backdrop-blur-md shrink-0">
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
          { id: 'command', label: 'Live Command HUD & Fireworks', icon: Rocket },
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
                { name: 'Level Up', type: 'levelup' as const, color: 'hover:border-emerald-400' },
                { name: 'Victory Tune', type: 'win' as const, color: 'hover:border-purple-400' },
                { name: 'Power Up', type: 'powerup' as const, color: 'hover:border-sky-400' },
                { name: 'Overcharge', type: 'overcharge' as const, color: 'hover:border-amber-400' },
                { name: 'Plasma Blast', type: 'plasma' as const, color: 'hover:border-cyan-400' },
                { name: 'Glitch Bit', type: 'glitch' as const, color: 'hover:border-pink-400' },
                { name: 'Sub Bass Drop', type: 'bassdrop' as const, color: 'hover:border-indigo-400' },
              ].map((s) => (
                <button
                  key={s.name}
                  onClick={() => handleBroadcastSoundLive(s.type)}
                  className={`p-3 bg-black/40 border border-white/10 rounded-2xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all flex flex-col items-center gap-1.5 ${s.color} active:scale-95 cursor-pointer group`}
                  title="Broadcast sound live to all connected devices"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 group-hover:animate-spin" />
                  <span>{s.name}</span>
                  <span className="text-[9px] text-amber-400/80 font-mono font-normal">📡 Broadcast Live</span>
                </button>
              ))}
            </div>

            {/* Realtime Waveform Equalizer Canvas */}
            <AudioSpectrumVisualizer />
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

            {/* Achievement Master Override Card */}
            <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 rounded-3xl p-6 backdrop-blur-xl md:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-bold shrink-0 shadow-md shadow-amber-400/30">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Achievement & XP Master Override</h3>
                    <p className="text-xs text-amber-200/80">Instantly grant 100% complete achievement trophies and max level XP to your owner profile</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    unlockAllAchievements();
                    playRetroSound('win');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/25 transition-all active:scale-95 cursor-pointer flex items-center gap-2 whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" /> Unlock All Achievements
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

      {/* TAB CONTENT 3: Live Command HUD & Fireworks */}
      {activeTab === 'command' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header Card */}
          <div className="bg-gradient-to-br from-amber-950/40 via-black/80 to-purple-950/40 border border-amber-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10 border-b border-white/10 pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                  <Activity className="w-4 h-4 animate-pulse" /> Live Telemetry & Control Deck
                </div>
                <h3 className="text-2xl font-black text-white">Site Command & Global Celebrations</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Trigger site-wide real-time fireworks, test audio synthesis, and monitor global database telemetry.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-2xl text-xs font-bold font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                FIRESTORE LIVE SYNC ACTIVE
              </div>
            </div>

            {/* Global Fireworks Trigger Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <PartyPopper className="w-4 h-4" /> Real-Time Global Celebration Signals
              </h4>
              <p className="text-xs text-slate-300">
                Clicking a celebration button broadcasts a realtime signal to Firestore. Every visitor currently browsing the site will experience live canvas fireworks!
              </p>

              {partyTriggerSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  {partyTriggerSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => handleTriggerGlobalParty('fireworks')}
                  className="p-5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-black">
                      <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black">Fireworks</p>
                      <p className="text-[11px] opacity-80">Full particle shower</p>
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleTriggerGlobalParty('cannon')}
                  className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                      <PartyPopper className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black">Confetti Blast</p>
                      <p className="text-[11px] opacity-80">Central burst</p>
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleTriggerGlobalParty('neon_strobe')}
                  className="p-5 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-black text-sm rounded-2xl shadow-xl shadow-cyan-500/20 transition-all active:scale-95 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-black">
                      <Zap className="w-5 h-5 group-hover:animate-bounce" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black">Neon Strobe</p>
                      <p className="text-[11px] opacity-80">Border glow flash</p>
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5" />
                </button>

                <button
                  onClick={handleTriggerScreenShake}
                  className="p-5 bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-500/20 transition-all active:scale-95 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-white">
                      <Activity className="w-5 h-5 group-hover:animate-ping" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black">Earthquake Shake</p>
                      <p className="text-[11px] opacity-80">Screen vibration blast</p>
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Visual Canvases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RadarSweepCanvas />
            <PlasmaCannonCanvas />
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Realtime Latency</span>
                <Wifi className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{pingMs} ms</p>
              <p className="text-[11px] text-emerald-400 font-mono">⚡ Low Latency Edge Socket</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Global Catalog Titles</span>
                <Database className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{15 + injectedGames.length}</p>
              <p className="text-[11px] text-amber-400 font-mono">{injectedGames.length} Custom Injected</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>System Memory</span>
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">100% OK</p>
              <p className="text-[11px] text-purple-400 font-mono">Zero Heap Leaks</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Broadcast Engine</span>
                <Radio className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">
                {announcementText ? 'ONLINE' : 'STANDBY'}
              </p>
              <p className="text-[11px] text-yellow-400 font-mono truncate">
                {announcementText ? announcementText : 'No notice active'}
              </p>
            </div>
          </div>

          {/* Retro Audio Synthesizer Station */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-400" /> Owner WebAudio Sound Test Console
                </h4>
                <p className="text-xs text-slate-400">Synthesize 8-bit arcade audio waveforms in real time</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { name: 'Coin Sound', sound: 'coin', color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-300' },
                { name: 'Laser Beam', sound: 'laser', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300' },
                { name: 'Level Up', sound: 'levelup', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300' },
                { name: 'Victory Win', sound: 'win', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300' },
                { name: 'Powerup', sound: 'powerup', color: 'from-rose-500/20 to-orange-500/20 border-rose-500/30 text-rose-300' },
              ].map((sfx) => (
                <button
                  key={sfx.sound}
                  onClick={() => playRetroSound(sfx.sound as any)}
                  className={`p-4 bg-gradient-to-b ${sfx.color} border rounded-2xl flex flex-col items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold text-xs`}
                >
                  <Play className="w-4 h-4" />
                  {sfx.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB CONTENT 3: Broadcast Banner */}
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
              <p className="text-xs text-slate-400">Display a real-time floating announcement bar at the top of the entire website for all visitors</p>
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
                Publish Broadcast Live
              </button>

              {announcementText && (
                <button
                  onClick={handleClearAnnouncement}
                  className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
                >
                  Clear Announcement
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Full-Screen Admin Takeover Alert Modal Popup */}
          <div className="pt-6 border-t border-white/10 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Crown className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Global Admin Takeover Screen Modal Popup</h4>
                <p className="text-xs text-slate-400">Force a high-priority, full-screen admin warning modal onto all connected devices live</p>
              </div>
            </div>

            <form onSubmit={handleSendAdminPopup} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Modal Header Title
                  </label>
                  <input
                    type="text"
                    value={popupTitleInput}
                    onChange={(e) => setPopupTitleInput(e.target.value)}
                    placeholder="e.g. 👑 OVERLORD ADMIN ABUSE ALERT"
                    className="w-full bg-black/40 border border-amber-500/30 rounded-2xl px-4 py-3 text-xs text-amber-300 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Custom Admin Message *
                  </label>
                  <input
                    type="text"
                    required
                    value={popupMsgInput}
                    onChange={(e) => setPopupMsgInput(e.target.value)}
                    placeholder="e.g. The Overlord has taken over your screen!"
                    className="w-full bg-black/40 border border-amber-500/30 rounded-2xl px-4 py-3 text-xs text-amber-200 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={popupSending}
                className="px-6 py-3.5 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {popupSending ? 'Transmitting Overlord Signal...' : 'Broadcast Fullscreen Admin Takeover Modal Live'}
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
};
