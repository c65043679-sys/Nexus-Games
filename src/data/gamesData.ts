import { Game } from '../types';

export const GAMES: Game[] = [
  {
    id: "polytrack",
    title: "PolyTrack",
    description: "A fast-paced low-poly racing game with track editor.",
    thumbnail: "https://images.unsplash.com/photo-1544654803-b69110bb8154?auto=format&fit=crop&w=800&q=80",
    category: "Racing",
    iframe: "https://polytrack-online.github.io/file/",
    controls: "WASD to Drive, R to Restart",
    featured: true,
    trending: true,
    rating: 4.9
  },
  {
    id: "minecraft-classic",
    title: "Minecraft Classic",
    description: "The original building game. Explore, build, and survive in this timeless blocky world.",
    thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=80",
    category: "Arcade",
    iframe: "https://firebasestorage.googleapis.com/v0/b/classroomx/o/mcc.html?alt=media&token=928a934d-e7b5-4105-93f0-f8248ba099d4",
    controls: "WASD to Move, Left Click to Mine/Build, Right Click to toggle block type",
    rating: 4.9
  },
  {
    id: "basket-random",
    title: "Basket Random",
    description: "Experience basketball like never before with physics-based chaos! Control your players with one button and try to score against the odds.",
    thumbnail: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
    category: "Arcade",
    iframe: "https://files.twoplayergames.org/files/games/other/Basket_Random/index.html",
    controls: "W or Up Arrow to jump and shoot.",
    rating: 4.8,
    allow: "microphone"
  },
  {
    id: "kick-lucky-blocks",
    title: "Kick Lucky Blocks Online",
    description: "Break lucky blocks and discover what's inside in this fun and unpredictable arcade experience.",
    thumbnail: "https://images.unsplash.com/photo-1605773527852-c54f48256e4a?auto=format&fit=crop&w=800&q=80",
    category: "Arcade",
    iframe: "https://files.twoplayergames.org/files/games/h1/kick-lucky-blocks-online/index.html",
    controls: "Mouse click or Space to kick blocks.",
    rating: 4.6,
    allow: "microphone"
  },
  {
    id: "bloxd-io",
    title: "Bloxd.io",
    description: "Bloxd.io is an IO adventure game with Minecraft-style visuals where you can navigate obstacle courses, gather resources, craft tools, battle other players, and much more.",
    thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=80",
    category: "Action",
    iframe: "https://games.crazygames.com/en_US/bloxdhop-io/index.html?v=1.357",
    controls: "WASD to move, Space to jump, Shift to run, C to crouch, E to inventory, T or Enter to chat, B to shop.",
    rating: 4.8,
    allow: "autoplay; payment; fullscreen; microphone; focus-without-user-activation *; screen-wake-lock; gamepad; clipboard-read; clipboard-write; accelerometer; gyroscope;",
    sandbox: "allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox"
  },
  {
    id: "2v2-io",
    title: "2v2.io",
    description: "A fast-paced building and combat game where teamwork and quick reflexes are key to victory.",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    category: "Action",
    iframe: "https://games.crazygames.com/en_US/2v2-io/index.html?v=1.357",
    controls: "WASD to Move, Left Click to Build/Shoot, Space to Jump.",
    rating: 4.5,
    allow: "autoplay; payment; fullscreen; microphone; focus-without-user-activation *; screen-wake-lock; gamepad; clipboard-read; clipboard-write; accelerometer; gyroscope;",
    sandbox: "allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox"
  },
  {
    id: "ragdoll-archers",
    title: "Ragdoll Archers",
    description: "Engage in physics-based archery battles! Use ragdoll mechanics to aim, shoot, and defeat your opponents in this unique combat experience.",
    thumbnail: "https://images.unsplash.com/photo-1541535881962-e66862307921?auto=format&fit=crop&w=800&q=80",
    category: "Action",
    iframe: "https://jasongamesdev.github.io/ragdoll-archers/",
    controls: "Mouse to aim and shoot. Collect arrows and power-ups to gain the upper hand.",
    rating: 4.7
  },
  {
    id: "the-impossible-quiz",
    title: "The Impossible Quiz",
    description: "The classic mind-bending quiz that will test your patience and logic. Can you answer them all correctly?",
    thumbnail: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&w=800&q=80",
    category: "Puzzle",
    iframe: "https://theimpossiblequiz-online.github.io/file/",
    controls: "Mouse click to select answers.",
    rating: 4.6
  },
  {
    id: "subway-surfers",
    title: "Subway Surfers",
    description: "The world-famous endless runner! Dodge trains, jump over obstacles, and collect coins as you dash through the subways.",
    thumbnail: "https://images.unsplash.com/photo-1541560052-5e137f229371?auto=format&fit=crop&w=800&q=80",
    category: "Action",
    iframe: "https://gertdoro.github.io/3hg7dj3bnc82/index.html",
    controls: "Arrow keys or WASD to move and jump/roll.",
    rating: 4.9,
    sandbox: "allow-scripts allow-popups allow-forms allow-same-origin allow-popups-to-escape-sandbox allow-downloads allow-storage-access-by-user-activation"
  },
  {
    id: "sky-riders",
    title: "Sky Riders",
    description: "A high-speed casual vehicle driving game. Put your driving skills to the test as you complete several challenging tracks. Stay focused and avoid falling off!",
    thumbnail: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800&q=80",
    category: "Racing",
    iframe: "https://games.crazygames.com/en_US/sky-riders-buk/index.html?v=1.357",
    controls: "WASD or Arrow Keys to Drive, Space for Handbrake.",
    rating: 4.8,
    allow: "autoplay; payment; fullscreen; microphone; focus-without-user-activation *; screen-wake-lock; gamepad; clipboard-read; clipboard-write; accelerometer; gyroscope;",
    sandbox: "allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox"
  },
  {
    id: "escape-waves",
    title: "Escape Waves",
    description: "Navigate through challenging waves in this intense action game. Test your reflexes and survive as long as you can!",
    thumbnail: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80",
    category: "Action",
    iframe: "https://escapewaves.io/?crazygames=true",
    controls: "WASD or Arrow Keys to move.",
    rating: 4.7,
    allow: "accelerometer; gyroscope; autoplay; payment; fullscreen; microphone; clipboard-read; clipboard-write",
    sandbox: "allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-presentation allow-scripts allow-same-origin allow-downloads allow-popups-to-escape-sandbox"
  },
  {
    id: "2048",
    title: "2048",
    description: "Join the tiles and get to the 2048 tile in this addictive number puzzle game.",
    thumbnail: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&w=800&q=80",
    category: "Puzzle",
    iframe: "https://2048.game-files.crazygames.com/2048/5/index.html",
    controls: "Arrow keys to move tiles.",
    rating: 4.8,
    allow: "accelerometer; gyroscope; autoplay; payment; fullscreen; microphone; clipboard-read; clipboard-write",
    sandbox: "allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-presentation allow-scripts allow-same-origin allow-downloads allow-popups-to-escape-sandbox"
  }
];
