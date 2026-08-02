import React, { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const MatrixRainCanvas: React.FC = () => {
  const [isActive, setIsActive] = useState(() => {
    return localStorage.getItem('nexus_matrix_rain') === 'true';
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // 1. BroadcastChannel for instant local & proxy sync
    let bc: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('nexus_effects_channel');
        bc.onmessage = (event) => {
          if (event.data && typeof event.data.matrixRain === 'boolean') {
            setIsActive(event.data.matrixRain);
            localStorage.setItem('nexus_matrix_rain', event.data.matrixRain ? 'true' : 'false');
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    // 2. Custom window event
    const handleToggle = (e: CustomEvent) => {
      setIsActive(!!e.detail);
    };
    window.addEventListener('nexus_matrix_toggle' as any, handleToggle);

    // 3. Storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nexus_matrix_rain') {
        setIsActive(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorage);

    // 4. Firestore snapshot
    let unsub: (() => void) | null = null;
    try {
      unsub = onSnapshot(doc(db, 'config', 'effects'), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (typeof data.matrixRain === 'boolean') {
            setIsActive(data.matrixRain);
            localStorage.setItem('nexus_matrix_rain', data.matrixRain ? 'true' : 'false');
          }
        }
      }, (err) => {
        console.warn('Matrix rain listener error:', err);
      });
    } catch (e) {
      console.error('Matrix rain snapshot error:', e);
    }

    return () => {
      if (bc) bc.close();
      window.removeEventListener('nexus_matrix_toggle' as any, handleToggle);
      window.removeEventListener('storage', handleStorage);
      if (unsub) unsub();
    };
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const characters = '0123456789ABCDEFNEXUSOVERLORD';
    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 15, 25, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        
        // Lead character is white/bright, tail is glowing green
        ctx.fillStyle = Math.random() > 0.9 ? '#ffffff' : '#00ff66';
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 6;

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-30 opacity-80"
    />
  );
};

