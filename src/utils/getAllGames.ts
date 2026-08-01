import { Game } from '../types';
import { GAMES } from '../data/gamesData';

export function getAllGames(): Game[] {
  let injected: Game[] = [];
  try {
    const saved = localStorage.getItem('nexus_injected_games');
    if (saved) {
      injected = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load injected games:', e);
  }

  // Combine built-in GAMES with injected games
  return [...injected, ...GAMES];
}
