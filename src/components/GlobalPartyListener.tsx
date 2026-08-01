import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const GlobalPartyListener: React.FC = () => {
  useEffect(() => {
    let lastSeenTs = 0;

    const firePartyEffects = (mode: string = 'fireworks') => {
      if (mode === 'fireworks' || mode === 'all') {
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
