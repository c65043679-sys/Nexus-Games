import React from 'react';
import { LayoutGrid, Flame, Car, Gamepad, Puzzle, User as UserIcon, LogIn, LogOut, ShieldCheck, Skull, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Category } from '../types';
import { useAuth } from './AuthContext';

interface SidebarProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const CATEGORIES: { id: Category; name: string; icon: React.ReactNode }[] = [
  { id: 'all', name: 'All Games', icon: <LayoutGrid className="w-5 h-5" /> },
  { id: 'Action', name: 'Action', icon: <Flame className="w-5 h-5" /> },
  { id: 'Racing', name: 'Racing', icon: <Car className="w-5 h-5" /> },
  { id: 'Arcade', name: 'Arcade', icon: <Gamepad className="w-5 h-5" /> },
  { id: 'Puzzle', name: 'Puzzle', icon: <Puzzle className="w-5 h-5" /> },
  { id: 'Horror', name: 'Horror', icon: <Skull className="w-5 h-5" /> },
  { id: 'Sports', name: 'Sports', icon: <Trophy className="w-5 h-5" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onCategoryChange }) => {
  const { user, signIn, logout, isAdmin } = useAuth();

  return (
    <aside className="w-[240px] shrink-0 hidden md:flex flex-col p-6 border-r border-white/10 bg-slate-900/40 backdrop-blur-md min-h-screen gap-8">
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Discover</p>
        <ul className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <li
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-300 border-violet-500/20'
                    : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={isActive ? 'text-violet-400' : ''}>
                  {cat.icon}
                </div>
                <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {cat.name}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 text-center cursor-default">
          Nexus v2.4.0
        </p>
        
        <div className="space-y-4 mt-4">
          {!user ? (
            <button
              onClick={signIn}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <LogIn className="w-5 h-5" />
              <span className="text-sm font-medium">Player Sign In</span>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-1 py-1">
                <div className="w-10 h-10 rounded-full border border-violet-500/30 overflow-hidden bg-violet-500/10 flex items-center justify-center">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-violet-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
                  <p className="text-[10px] text-slate-500 truncate">Explorer</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Log Out</span>
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-white/5">
            <Link 
              to="/admin"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all shadow-lg ${
                isAdmin 
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20 hover:bg-violet-600/30' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-bold">Admin Console</span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};
