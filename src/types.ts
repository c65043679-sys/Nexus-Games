export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  color: string;
  category: string;
  iframe: string;
  controls: string;
  featured?: boolean;
  trending?: boolean;
  rating: number;
  allow?: string;
  sandbox?: string;
}

export type Category = 'all' | 'Action' | 'Racing' | 'Arcade' | 'Puzzle' | 'Horror' | 'Sports';
