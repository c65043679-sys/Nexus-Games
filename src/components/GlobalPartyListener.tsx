import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAchievements } from './AchievementsContext';

export const GlobalPartyListener: React.FC = () => {
  const { unlockAchievement } = useAchievements();

  useEffect(() => {
    let lastSeenTs = 0;

    const firePartyEffects = (mode: string = 'fireworks') => {
      if (mode === 'neon_strobe') {
        // Flash neon border overlay
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

        // Also fire quick confetti
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
        // Cannon blast
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          zIndex: 9999
        });
      }
    };

    let unsub: (() => void) | null = null;
    try {
      unsub = onSnapshot(doc(db, 'config', 'party'), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const ts = data.timestamp || 0;
          if (ts > 0 && ts !== lastSeenTs) {
            lastSeenTs = ts;
            // Trigger effect if received within last 30 seconds
            if (Date.now() - ts < 30000) {
              firePartyEffects(data.mode);
              try { unlockAchievement('party_starter'); } catch (e) {}
            }
          }
        }
      }, (err) => {
        console.warn('Party listener offline:', err);
      });
    } catch (e) {
      console.error('Party listener init failed:', e);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  return null;
};
