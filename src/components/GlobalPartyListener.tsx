import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAchievements } from './AchievementsContext';
import { playRetroSound } from '../utils/audioSynth';
import { Crown, Sparkles, AlertTriangle, X, Radio, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const GlobalPartyListener: React.FC = () => {
  const { unlockAchievement } = useAchievements();
  const [adminPopup, setAdminPopup] = useState<{ title: string; message: string; sender: string; timestamp: number } | null>(null);

  useEffect(() => {
    let lastPartyTs = 0;
    let lastShakeTs = 0;
    let lastSoundTs = 0;
    let lastPopupTs = 0;

    const firePartyEffects = (mode: string = 'fireworks') => {
      if (mode === 'neon_strobe') {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '999999';
        overlay.style.border = '12px solid #06b6d4';
        overlay.style.boxShadow = 'inset 0 0 50px #06b6d4, 0 0 50px #06b6d4';
        overlay.style.transition = 'all 0.2s ease';
        overlay.className = 'animate-pulse';
        document.body.appendChild(overlay);

        let count = 0;
        const colors = ['#06b6d4', '#7c3aed', '#f59e0b', '#ef4444', '#10b981', '#ec4899'];
        const interval = setInterval(() => {
          count++;
          const color = colors[count % colors.length];
          overlay.style.borderColor = color;
          overlay.style.boxShadow = `inset 0 0 60px ${color}, 0 0 60px ${color}`;
          if (count > 15) {
            clearInterval(interval);
            overlay.remove();
          }
        }, 180);

        confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 }, zIndex: 9999 });
      } else if (mode === 'fireworks' || mode === 'all') {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) {
            return clearInterval(interval);
          }
          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.4 + 0.1, y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.4 + 0.5, y: Math.random() - 0.2 } });
        }, 250);
      } else {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          zIndex: 9999
        });
      }
    };

    // 1. Party Fireworks Listener
    const unsubParty = onSnapshot(doc(db, 'config', 'party'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const ts = data.timestamp || 0;
        if (ts > 0 && ts !== lastPartyTs) {
          lastPartyTs = ts;
          if (Date.now() - ts < 30000) {
            firePartyEffects(data.mode);
            try { unlockAchievement('party_starter'); } catch (e) {}
          }
        }
      }
    });

    // 2. Screen Shake / Earthquake Listener
    const unsubShake = onSnapshot(doc(db, 'config', 'screen_shake'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const ts = data.timestamp || 0;
        if (ts > 0 && ts !== lastShakeTs) {
          lastShakeTs = ts;
          if (Date.now() - ts < 30000) {
            document.body.classList.add('animate-screen-shake');
            playRetroSound('bassdrop');
            setTimeout(() => {
              document.body.classList.remove('animate-screen-shake');
            }, 3500);
          }
        }
      }
    });

    // 3. Sound Effects Synthesizer Listener
    const unsubSound = onSnapshot(doc(db, 'config', 'sound_effect'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const ts = data.timestamp || 0;
        if (ts > 0 && ts !== lastSoundTs) {
          lastSoundTs = ts;
          if (Date.now() - ts < 30000 && data.sound) {
            playRetroSound(data.sound);
          }
        }
      }
    });

    // 4. Live Admin Takeover Popup Listener
    const unsubPopup = onSnapshot(doc(db, 'config', 'admin_popup'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const ts = data.timestamp || 0;
        if (ts > 0 && ts !== lastPopupTs && data.message) {
          lastPopupTs = ts;
          if (Date.now() - ts < 60000) {
            setAdminPopup({
              title: data.title || '👑 OVERLORD ADMIN ABUSE ALERT',
              message: data.message,
              sender: data.sender || 'c65043679@gmail.com',
              timestamp: ts
            });
            playRetroSound('overcharge');
            confetti({ particleCount: 100, spread: 90, origin: { y: 0.4 }, zIndex: 999999 });
          }
        }
      }
    });

    return () => {
      unsubParty();
      unsubShake();
      unsubSound();
      unsubPopup();
    };
  }, []);

  return (
    <AnimatePresence>
      {adminPopup && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="max-w-lg w-full bg-slate-950 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/30 text-center relative overflow-hidden space-y-5"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setAdminPopup(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Crown Icon Header */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black flex items-center justify-center mx-auto shadow-lg shadow-amber-500/40">
              <Crown className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                <Radio className="w-3 h-3 animate-pulse text-amber-400" />
                <span>Live Admin Broadcast</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {adminPopup.title}
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/30 text-amber-200 text-sm font-semibold leading-relaxed shadow-inner">
              "{adminPopup.message}"
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-white/10">
              <span>Transmitted By: <span className="text-amber-400 font-bold">{adminPopup.sender}</span></span>
              <span>Nexus Security Clearance Level 10</span>
            </div>

            <button
              onClick={() => setAdminPopup(null)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Acknowledge Overlord Command
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
