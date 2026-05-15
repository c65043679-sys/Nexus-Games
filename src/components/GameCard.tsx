import React from 'react';
import { Star as StarIcon, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Game } from '../types';
import { useAuth } from './AuthContext';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { user, profile, toggleFavorite } = useAuth();
  const isFavorited = profile?.favorites?.includes(game.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      toggleFavorite(game.id);
    } else {
      // Potentially show a login prompt? For now, do nothing or user might be confused
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-violet-500/50 transition-all shadow-lg hover:shadow-violet-500/10"
    >
      <button 
        onClick={handleFavoriteClick}
        className={`absolute top-2 right-2 z-10 p-2 rounded-full backdrop-blur-md transition-all border ${
          isFavorited 
            ? 'bg-rose-500/20 border-rose-500/50 text-rose-500 scale-110 shadow-lg shadow-rose-500/20' 
            : 'bg-black/20 border-white/10 text-white/50 hover:text-white hover:bg-black/40'
        } ${!user && 'hidden'}`}
      >
        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
      </button>

      <Link to={`/play/${game.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:scale-105" style={{ backgroundColor: game.color }}>
          <span className="text-4xl font-black text-white/40 group-hover:text-white/60 transition-colors select-none">
            {game.title.charAt(0).toUpperCase()}
          </span>
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
             <div className="w-10 h-10 bg-white text-slate-950 rounded-full flex items-center justify-center shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="m7 4 12 8-12 8V4z"/></svg>
             </div>
          </div>
        </div>
        
        <div className="p-3">
          <h3 className="text-sm font-bold truncate text-slate-100 group-hover:text-violet-400 transition-colors">
            {game.title}
          </h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1">{game.category}</p>
        </div>
      </Link>
    </motion.div>
  );
};
