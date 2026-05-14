import React from 'react';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-violet-500/50 transition-all shadow-lg hover:shadow-violet-500/10"
    >
      <Link to={`/play/${game.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-800">
          <img
            src={game.thumbnail}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
             <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
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
