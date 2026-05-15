import React, { useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Info, Gamepad2, Star, Maximize2, Save, CheckCircle2, Heart } from 'lucide-react';
import { GAMES } from '../data/gamesData';
import { motion } from 'motion/react';
import { useAuth } from '../components/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const Play: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile, toggleFavorite } = useAuth();
  const game = GAMES.find((g) => g.id === id);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isFavorited = profile?.favorites?.includes(game?.id || '');

  const handleToggleFavorite = async () => {
    if (game?.id) {
      await toggleFavorite(game.id);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleSaveData = async () => {
    if (!user || !game) return;
    
    setIsSaving(true);
    try {
      const saveRef = doc(db, 'users', user.uid, 'saves', game.id);
      await setDoc(saveRef, {
        userId: user.uid,
        gameId: game.id,
        updatedAt: serverTimestamp(),
        lastPlayed: serverTimestamp(),
        // In a real app, you'd extract state from the game iframe if possible
        // Here we simulate saving "progression" data
        data: {
          score: Math.floor(Math.random() * 1000),
          level: 1,
          timestamp: Date.now()
        }
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving game data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!game) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Game Not Found</h1>
        <Link to="/" className="text-accent hover:underline flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Go back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="text-sm font-semibold uppercase tracking-widest">Retreat to Nexus</span>
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border ${
                  isFavorited 
                    ? 'bg-rose-500/20 border-rose-500/30 text-rose-500' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Favorited' : 'Favorite'}
              </button>
              <button
                onClick={handleSaveData}
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border ${
                saveSuccess 
                  ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : saveSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saveSuccess ? 'Progress Saved' : 'Save Status'}
            </button>
          </>
        )}
      </div>
    </div>

      <div 
        ref={containerRef}
        className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl shadow-violet-500/10 border border-white/10 group/player"
      >
        <iframe
          src={game.iframe}
          className="w-full h-full border-none"
          title={game.title}
          allowFullScreen
          allow={game.allow}
          sandbox={game.sandbox || "allow-scripts allow-same-origin allow-popups allow-forms"}
        />
        
        {/* Fullscreen Overlay Button */}
        <button 
          onClick={toggleFullscreen}
          className="absolute bottom-6 right-6 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/80 opacity-0 group-hover/player:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/player:translate-y-0 shadow-lg"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tight text-white">{game.title}</h1>
            <div className="flex gap-2">
               <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">{game.category}</span>
               <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">•</span>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Browser Environment</span>
            </div>
          </div>
          <p className="text-slate-400 leading-relaxed text-lg font-medium">
            {game.description}
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-violet-400">
              <Gamepad2 className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-widest text-xs">Input Methods</h3>
            </div>
            <div className="text-sm text-slate-300 bg-black/40 p-4 rounded-xl leading-relaxed border border-white/5 italic">
              {game.controls}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-slate-400">
              <Info className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-widest text-xs">Game Vitals</h3>
            </div>
            <div className="space-y-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                <span className="opacity-50">Genre</span>
                <span className="text-white px-2 py-1 bg-violet-600/20 rounded-md border border-violet-500/20">{game.category}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                <span className="opacity-50">Stability</span>
                <span className="text-green-400">Optimal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
