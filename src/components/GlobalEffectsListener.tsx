import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const GlobalEffectsListener: React.FC = () => {
  const [godModeAura, setGodModeAura] = useState(() => {
    return localStorage.getItem('nexus_godmode_aura') === 'true';
  });

  useEffect(() => {
    let unsub: (() => void) | null = null;
    try {
      unsub = onSnapshot(doc(db, 'config', 'effects'), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (typeof data.godModeAura === 'boolean') {
            setGodModeAura(data.godModeAura);
            localStorage.setItem('nexus_godmode_aura', data.godModeAura ? 'true' : 'false');
            window.dispatchEvent(new CustomEvent('nexus_godmode_toggle', { detail: data.godModeAura }));
          }
          if (typeof data.matrixRain === 'boolean') {
            localStorage.setItem('nexus_matrix_rain', data.matrixRain ? 'true' : 'false');
            window.dispatchEvent(new CustomEvent('nexus_matrix_toggle', { detail: data.matrixRain }));
          }
        }
      }, (err) => {
        console.warn('Global effects listener warning:', err);
      });
    } catch (e) {
      console.error('Global effects snapshot error:', e);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  if (!godModeAura) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 border-4 border-amber-400/70 shadow-[inset_0_0_100px_rgba(251,191,36,0.4)] animate-pulse transition-all duration-700" />
  );
};
