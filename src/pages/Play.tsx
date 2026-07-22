import React, { useRef, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Info, Gamepad2, Maximize2, Minimize2, Save, CheckCircle2, Heart, Zap } from 'lucide-react';
import { GAMES } from '../data/gamesData';
import { useAuth } from '../components/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { GameCard } from '../components/GameCard';

export const Play: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile, toggleFavorite } = useAuth();
  const game = GAMES.find((g) => g.id === id);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.target.clientWidth);
        setContainerHeight(entry.target.clientHeight);
      }
    });
    
    resizeObserver.observe(containerRef.current);
    setContainerWidth(containerRef.current.clientWidth);
    setContainerHeight(containerRef.current.clientHeight);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [id]);

  useEffect(() => {
    // Focus game iframe when loading or switching games
    const timer = setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.focus();
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [id]);

  // Get related games (same category) and prioritize top/featured ones
  const relatedGames = game 
    ? GAMES.filter(g => g.category === game.category && g.id !== game.id)
        .sort((a, b) => {
          // Prioritize featured games
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          // Then trending
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          // Then by rating
          return (b.rating || 0) - (a.rating || 0);
        })
        .slice(0, 10) 
    : [];

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
    <div className="flex-1 max-w-[1440px] mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="text-sm font-semibold uppercase tracking-widest text-slate-500">Nexus Core</span>
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
              {saveSuccess ? 'Saved' : 'Save'}
            </button>
          </>
        )}
      </div>
    </div>

    <div className="flex flex-col xl:flex-row gap-10">
      {/* Main Column */}
      <div className="flex-1 min-w-0 space-y-8">
        <div 
          ref={containerRef}
          onClick={() => iframeRef.current?.focus()}
          className={`relative bg-black overflow-hidden group/player cursor-pointer transition-all w-full ${
            isFullscreen 
              ? 'w-screen h-screen rounded-none border-none' 
              : `rounded-3xl shadow-2xl shadow-violet-500/10 border border-white/10 ${
                  game.aspectRatio === 'portrait' ? 'aspect-[3/4] max-w-md mx-auto max-h-[70vh]' : 
                  game.aspectRatio === 'square' ? 'aspect-square max-w-2xl mx-auto max-h-[70vh]' : 
                  game.aspectRatio === 'four-three' ? 'aspect-[4/3] max-w-4xl mx-auto max-h-[70vh]' :
                  game.aspectRatio === 'five-four' ? 'aspect-[5/4] max-w-4xl mx-auto max-h-[70vh]' :
                  'aspect-video max-w-5xl mx-auto max-h-[70vh]'
                }`
          }`}
        >
          {(() => {
            const isHubProFlash = game.iframe.includes('hub-pro.github.io/games/') && 
              !game.iframe.includes('/slope/') && 
              !game.iframe.includes('/supermario64/') && 
              !game.iframe.includes('/superhot/') && 
              !game.iframe.includes('/animalcrossing') && 
              !game.iframe.includes('/aceattorney/');

            const nativeW = game.nativeWidth || (isHubProFlash ? 1000 : undefined);
            const nativeH = game.nativeHeight || (isHubProFlash ? 800 : undefined);
            const hasNativeDimensions = !!(nativeW && nativeH);

            const iframeScale = hasNativeDimensions && containerWidth > 0 && containerHeight > 0
              ? Math.min(containerWidth / nativeW, containerHeight / nativeH)
              : 1;

            const scaledWidth = hasNativeDimensions ? nativeW * iframeScale : 0;
            const scaledHeight = hasNativeDimensions ? nativeH * iframeScale : 0;
            
            const leftOffset = hasNativeDimensions && containerWidth > 0
              ? (containerWidth - scaledWidth) / 2
              : 0;
              
            const topOffset = hasNativeDimensions && containerHeight > 0
              ? (containerHeight - scaledHeight) / 2
              : 0;

            return (
              <iframe
                ref={iframeRef}
                src={game.iframe}
                scrolling="no"
                className="w-full h-full border-none"
                style={hasNativeDimensions ? {
                  width: `${nativeW}px`,
                  height: `${nativeH}px`,
                  transform: `scale(${iframeScale})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  top: `${topOffset}px`,
                  left: `${leftOffset}px`,
                  border: 'none',
                  overflow: 'hidden'
                } : { 
                  transform: game.scale ? `scale(${game.scale})` : 'none',
                  transformOrigin: 'center center',
                  width: game.scale ? `${100 / game.scale}%` : '100%',
                  height: game.scale ? `${100 / game.scale}%` : '100%',
                  position: game.scale ? 'absolute' : 'relative',
                  left: game.scale ? '50%' : 'auto',
                  top: game.scale ? '50%' : 'auto',
                  translate: game.scale ? '-50% -50%' : 'none'
                }}
                title={game.title}
                allowFullScreen
                allow={game.allow || "autoplay; fullscreen; accelerometer; gyroscope; gamepad; pointer-lock"}
                sandbox={game.sandbox || "allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox"}
              />
            );
          })()}
          
          {/* Fullscreen Overlay Button */}
          <button 
            onClick={toggleFullscreen}
            className="absolute bottom-6 right-6 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/80 opacity-0 group-hover/player:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/player:translate-y-0 shadow-lg"
            title={isFullscreen ? "Exit Fullscreen" : "Toggle Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">{game.title}</h1>
              <div className="flex gap-2">
                 <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">{game.category}</span>
                 <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">•</span>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Nexus Content</span>
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
                <h3 className="font-bold uppercase tracking-widest text-[10px]">Controls</h3>
              </div>
              <div className="text-sm text-slate-300 bg-black/40 p-4 rounded-xl leading-relaxed border border-white/5 italic">
                {game.controls}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-slate-400">
                <Info className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-widest text-[10px]">Information</h3>
              </div>
              <div className="space-y-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                  <span className="opacity-50">Genre</span>
                  <span className="text-white px-2 py-1 bg-violet-600/20 rounded-md border border-violet-500/20">{game.category}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                  <span className="opacity-50">Performance</span>
                  <span className="text-green-400">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Column */}
      <aside className="w-full xl:w-[320px] shrink-0">
        <div className="sticky top-8 space-y-4">
          <div className="px-1 mb-4">
            <h3 className="text-xl font-bold text-white tracking-tight">Play next</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 no-scrollbar">
            {relatedGames.map((relatedGame) => (
              <Link 
                key={relatedGame.id} 
                to={`/play/${relatedGame.id}`}
                className="group relative aspect-[800/517] rounded-xl overflow-hidden bg-slate-900 border border-white/5 transition-all duration-300 hover:scale-[1.02] hover:z-10 hover:shadow-2xl hover:shadow-black/50"
                title={relatedGame.title}
              >
                {/* Background color based on game color */}
                <div 
                  className="w-full h-full flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:brightness-125"
                  style={{ backgroundColor: relatedGame.color }}
                >
                  {relatedGame.thumbnail ? (
                    <img 
                      src={relatedGame.thumbnail} 
                      alt={relatedGame.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-2xl font-black text-white/20 select-none transition-opacity group-hover:opacity-40">
                      {relatedGame.title.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Shine Sweep Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out z-10" />
                
                {/* Icon Badge Overlay (mimicking the image) */}
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-20 transition-transform group-hover:scale-110">
                  <div className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center shadow-md">
                    <Gamepad2 className="w-3 h-3 text-slate-800" />
                  </div>
                  {relatedGame.featured && (
                    <div className="px-1.5 py-0.5 rounded-md bg-yellow-400 text-[8px] font-black text-slate-900 uppercase shadow-md">
                      Top
                    </div>
                  )}
                </div>

                {/* Game Title Caption Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end">
                  <span className="text-[10px] font-bold text-white leading-tight truncate w-full shadow-sm">
                    {relatedGame.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </aside>
    </div>
  </div>
);
};
