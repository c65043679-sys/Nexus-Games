// Web Audio Synthesis Helper for Retro Arcade Sounds across all devices
export const playRetroSound = (type: 'coin' | 'laser' | 'levelup' | 'win' | 'powerup' | 'overcharge' | 'plasma' | 'glitch' | 'bassdrop') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    // Dispatch custom audio event for realtime spectrum canvas visualizers
    window.dispatchEvent(new CustomEvent('nexus_audio_synth', { detail: { type } }));

    if (type === 'coin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
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
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, now + i * 0.08);
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0.2, now + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15);
        o.start(now + i * 0.08);
        o.stop(now + i * 0.08 + 0.15);
      });
    } else if (type === 'win') {
      const freqs = [440, 554.37, 659.25, 880];
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(f, now + i * 0.1);
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0.15, now + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);
        o.start(now + i * 0.1);
        o.stop(now + i * 0.1 + 0.2);
      });
    } else if (type === 'powerup') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'overcharge') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'plasma') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1500, now);
      osc.frequency.linearRampToValueAtTime(300, now + 0.18);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'glitch') {
      osc.type = 'sawtooth';
      for (let i = 0; i < 6; i++) {
        osc.frequency.setValueAtTime(200 + Math.random() * 1200, now + i * 0.03);
      }
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'bassdrop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
      osc.start(now);
      osc.stop(now + 0.65);
    }
  } catch (e) {
    console.error('Audio synthesis failed:', e);
  }
};
