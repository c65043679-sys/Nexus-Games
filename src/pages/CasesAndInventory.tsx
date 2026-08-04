import React, { useState, useRef } from 'react';
import { Package, Sparkles, Check, Lock, Gift, RefreshCw, Trophy, Crown, Flame, Zap, ArrowRight, Star, ShieldCheck, ChevronRight, Eye, Info, Crosshair, Coins, Tag, CheckSquare, Square, Trash2, CheckCircle2, XCircle, DollarSign, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AVATARS_CATALOG, CASES_CATALOG, RARITY_CONFIG, AvatarItem, CaseItem, Rarity } from '../data/avatarsData';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { useAuth } from '../components/AuthContext';
import { useAchievements } from '../components/AchievementsContext';
import { soundManager } from '../utils/soundEffects';
import { useSettings } from '../components/SettingsContext';

interface InspectedItem {
  item: AvatarItem;
  floatVal?: string;
  wearGrade?: string;
}

export const CasesAndInventory: React.FC = () => {
  const { profile, equipAvatar, unlockAvatar, lockAvatar, isOwner } = useAuth();
  const { gamePoints, spendGamePoints, addGamePoints, availableXp, spendXp, refundXp } = useAchievements();
  const { settings } = useSettings();

  const [activeTab, setActiveTab] = useState<'cases' | 'inventory'>('cases');
  const [selectedRarityFilter, setSelectedRarityFilter] = useState<string>('all');

  // Unboxing Modal & Spinner state
  const [activeCase, setActiveCase] = useState<CaseItem | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [reelAvatars, setReelAvatars] = useState<AvatarItem[]>([]);
  const [wonAvatar, setWonAvatar] = useState<AvatarItem | null>(null);
  const [wonFloat, setWonFloat] = useState<string>('0.0134');
  const [wonWear, setWonWear] = useState<string>('Factory New');
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [duplicateRefund, setDuplicateRefund] = useState<number>(0);
  const [usedCurrency, setUsedCurrency] = useState<'pts' | 'xp'>('pts');
  const [showResultModal, setShowResultModal] = useState<boolean>(false);

  // Inspect & Sell Modal
  const UNSELLABLE_AVATAR_IDS = ['initiate_core', 'og_explorer', 'beta_tester'];
  const isUnsellable = (avatarId: string) => UNSELLABLE_AVATAR_IDS.includes(avatarId);

  const [inspectedItem, setInspectedItem] = useState<InspectedItem | null>(null);
  const [sellingAvatar, setSellingAvatar] = useState<{ item: AvatarItem; floatVal: string; wearGrade: string } | null>(null);

  // Multi-Select & Batch Sell State
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedForSale, setSelectedForSale] = useState<string[]>([]);
  const [showBatchSellModal, setShowBatchSellModal] = useState<boolean>(false);

  const reelRef = useRef<HTMLDivElement | null>(null);
  const reelContainerRef = useRef<HTMLDivElement | null>(null);

  const unlockedIds = profile?.unlockedAvatars || ['initiate_core', 'og_explorer', 'beta_tester'];
  const equippedId = profile?.equippedAvatar || 'initiate_core';

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode((prev) => !prev);
    setSelectedForSale([]);
  };

  const toggleSelectAvatar = (avatarId: string) => {
    if (isUnsellable(avatarId)) return;
    setSelectedForSale((prev) =>
      prev.includes(avatarId)
        ? prev.filter((id) => id !== avatarId)
        : [...prev, avatarId]
    );
  };

  const selectAllSellable = () => {
    const sellableIds = filteredAvatars
      .filter((item) => unlockedIds.includes(item.id) && !isUnsellable(item.id))
      .map((item) => item.id);
    setSelectedForSale(sellableIds);
  };

  const deselectAll = () => {
    setSelectedForSale([]);
  };

  const calculateBatchTotalPayout = () => {
    return selectedForSale.reduce((sum, id) => {
      const item = AVATARS_CATALOG.find((a) => a.id === id);
      if (!item) return sum;
      const { floatStr } = getAvatarFloatAndWear(id);
      return sum + calculateSellPrice(item.rarity, floatStr);
    }, 0);
  };

  const handleConfirmBatchSell = () => {
    if (selectedForSale.length === 0) return;
    const totalPayout = calculateBatchTotalPayout();

    selectedForSale.forEach((id) => {
      lockAvatar(id);
      if (inspectedItem?.item.id === id) {
        setInspectedItem(null);
      }
    });

    addGamePoints(totalPayout);
    soundManager.playLevelUp(settings.uiSoundEffects);
    setShowBatchSellModal(false);
    setSelectedForSale([]);
    setIsMultiSelectMode(false);
  };

  // Helper to pick a winning avatar based on TRUE DROP PROBABILITIES
  const pickWinningAvatar = (c: CaseItem): AvatarItem => {
    const candidates = AVATARS_CATALOG.filter((a) => c.possibleAvatars.includes(a.id));
    if (candidates.length === 0) return AVATARS_CATALOG[0];

    // Use exact drop weights from RARITY_CONFIG
    const totalWeight = candidates.reduce((sum, item) => sum + (RARITY_CONFIG[item.rarity]?.weight || 10), 0);
    let rand = Math.random() * totalWeight;

    for (const item of candidates) {
      const w = RARITY_CONFIG[item.rarity]?.weight || 10;
      if (rand < w) return item;
      rand -= w;
    }

    return candidates[0];
  };

  // Generate realistic Float Value & Wear across all wear tiers
  const generateItemFloat = () => {
    const randTier = Math.random();
    let minFloat = 0.0001;
    let maxFloat = 0.0699;
    let wear = 'Factory New';

    if (randTier < 0.22) {
      // Factory New: 0.0001 - 0.0699
      minFloat = 0.0001;
      maxFloat = 0.0699;
      wear = 'Factory New';
    } else if (randTier < 0.50) {
      // Minimal Wear: 0.0701 - 0.1499
      minFloat = 0.0701;
      maxFloat = 0.1499;
      wear = 'Minimal Wear';
    } else if (randTier < 0.80) {
      // Field-Tested: 0.1501 - 0.3799
      minFloat = 0.1501;
      maxFloat = 0.3799;
      wear = 'Field-Tested';
    } else if (randTier < 0.92) {
      // Well-Worn: 0.3801 - 0.4499
      minFloat = 0.3801;
      maxFloat = 0.4499;
      wear = 'Well-Worn';
    } else {
      // Battle-Scarred: 0.4501 - 0.9899
      minFloat = 0.4501;
      maxFloat = 0.9899;
      wear = 'Battle-Scarred';
    }

    const floatNum = minFloat + Math.random() * (maxFloat - minFloat);
    const floatStr = floatNum.toFixed(6);
    return { floatStr, wear };
  };

  // Deterministic float and wear generator for previewing/inspecting catalog items
  const getAvatarFloatAndWear = (avatarId: string) => {
    let hash = 0;
    for (let i = 0; i < avatarId.length; i++) {
      hash = (hash << 5) - hash + avatarId.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    const floatNum = ((absHash % 98000) + 1000) / 100000; // 0.01000 to 0.99000
    const floatStr = floatNum.toFixed(6);

    let wear = 'Factory New';
    if (floatNum > 0.07 && floatNum <= 0.15) wear = 'Minimal Wear';
    else if (floatNum > 0.15 && floatNum <= 0.38) wear = 'Field-Tested';
    else if (floatNum > 0.38 && floatNum <= 0.45) wear = 'Well-Worn';
    else if (floatNum > 0.45) wear = 'Battle-Scarred';

    return { floatStr, wear };
  };

  // Wear multiplier helper based on exact float value
  const getWearMultiplier = (floatNum: number) => {
    if (floatNum < 0.01) return 2.0; // Ultra low float Factory New bonus!
    if (floatNum < 0.07) return 1.5 + ((0.07 - floatNum) / 0.07) * 0.5; // Factory New: 1.5x - 2.0x
    if (floatNum < 0.15) return 1.25 + ((0.15 - floatNum) / 0.08) * 0.25; // Minimal Wear: 1.25x - 1.5x
    if (floatNum < 0.38) return 1.0 + ((0.38 - floatNum) / 0.23) * 0.25; // Field-Tested: 1.0x - 1.25x
    if (floatNum < 0.45) return 0.85 + ((0.45 - floatNum) / 0.07) * 0.15; // Well-Worn: 0.85x - 1.0x
    return 0.60 + ((1.00 - Math.min(1, floatNum)) / 0.55) * 0.25; // Battle-Scarred: 0.60x - 0.85x
  };

  // Calculate sell price factoring in both rarity base value and wear float modifier
  const calculateSellPrice = (rarityKey: Rarity, floatVal?: string | number) => {
    const baseValue = RARITY_CONFIG[rarityKey]?.sellValue || 20;
    const numFloat = typeof floatVal === 'string' ? parseFloat(floatVal) : (typeof floatVal === 'number' ? floatVal : 0.25);
    const validFloat = isNaN(numFloat) ? 0.25 : numFloat;
    const multiplier = getWearMultiplier(validFloat);
    return Math.max(1, Math.round(baseValue * multiplier));
  };

  // Handler to sell unwanted avatars back for Game Points based on rarity and float
  const handleConfirmSell = (target: { item: AvatarItem; floatVal: string; wearGrade: string }) => {
    if (isUnsellable(target.item.id)) {
      setSellingAvatar(null);
      return;
    }
    const sellValue = calculateSellPrice(target.item.rarity, target.floatVal);

    // Refund Game Points back into player balance (NOT XP)
    addGamePoints(sellValue);
    // Lock / remove item from player armory
    lockAvatar(target.item.id);

    soundManager.playLevelUp(settings.uiSoundEffects);
    setSellingAvatar(null);
    if (inspectedItem?.item.id === target.item.id) {
      setInspectedItem(null);
    }
  };

  const handleOpenCase = (c: CaseItem, currency: 'pts' | 'xp' = 'pts') => {
    if (!isOwner) {
      if (currency === 'pts') {
        if (gamePoints < c.cost) {
          soundManager.playError(settings.uiSoundEffects);
          alert(`You need ${c.cost} Game Points to unbox this crate. Play games or earn achievements to get more points!`);
          return;
        }
        const success = spendGamePoints(c.cost);
        if (!success) return;
      } else {
        if (availableXp < c.cost) {
          soundManager.playError(settings.uiSoundEffects);
          alert(`You need ${c.cost} Achievement XP to unbox this crate. Complete achievements or level up to earn more XP!`);
          return;
        }
        const success = spendXp(c.cost);
        if (!success) return;
      }
    }

    setUsedCurrency(currency);
    soundManager.playCaseOpen(settings.uiSoundEffects);

    // Determine winning avatar
    const winningItem = pickWinningAvatar(c);
    const { floatStr, wear } = generateItemFloat();
    setWonFloat(floatStr);
    setWonWear(wear);

    // Generate roulette reel of 50 items with winner placed at index 38
    const reel: AvatarItem[] = [];
    const pool = AVATARS_CATALOG.filter((a) => c.possibleAvatars.includes(a.id));
    for (let i = 0; i < 50; i++) {
      if (i === 38) {
        reel.push(winningItem);
      } else {
        // Weighted random fill for surrounding items
        const randomPick = pool[Math.floor(Math.random() * pool.length)];
        reel.push(randomPick);
      }
    }

    setActiveCase(c);
    setReelAvatars(reel);
    setWonAvatar(winningItem);
    setIsSpinning(true);
    setShowResultModal(false);

    // Check duplicate status
    const alreadyOwned = unlockedIds.includes(winningItem.id);
    const refund = Math.floor(c.cost * 0.5);
    setIsDuplicate(alreadyOwned);
    setDuplicateRefund(refund);

    // Spin animation with real-time sound ticking
    const spinTime = 5200; // 5.2 seconds
    let lastTickCardIndex = -1;

    setTimeout(() => {
      if (reelRef.current) {
        // Precise card alignment: each card is 128px + gap 12px = 140px.
        // Card index 38 center position from start = 38 * 140 + 64 px.
        const containerWidth = reelContainerRef.current ? reelContainerRef.current.clientWidth : 768;
        const cardCenterInReel = 38 * 140 + 64;
        const containerCenter = containerWidth / 2;
        const baseOffset = cardCenterInReel - containerCenter;
        // Small random jitter within +/- 15px so it lands near the card center
        const jitter = (Math.random() * 30 - 15);
        const targetOffset = baseOffset + jitter;

        reelRef.current.style.transition = 'transform 5.2s cubic-bezier(0.05, 0.85, 0.15, 1)';
        reelRef.current.style.transform = `translateX(-${targetOffset}px)`;

        // Ticking audio loop based on reel position
        const tickInterval = setInterval(() => {
          if (!reelRef.current) return;
          const rect = reelRef.current.getBoundingClientRect();
          const parentRect = reelContainerRef.current ? reelContainerRef.current.getBoundingClientRect() : reelRef.current.parentElement?.getBoundingClientRect();
          if (!parentRect) return;

          const needleX = parentRect.left + parentRect.width / 2;
          const relativeX = needleX - rect.left;
          const currentCardIndex = Math.floor(relativeX / 140);

          if (currentCardIndex !== lastTickCardIndex && currentCardIndex >= 0 && currentCardIndex < 50) {
            lastTickCardIndex = currentCardIndex;
            soundManager.playTick(settings.uiSoundEffects);
          }
        }, 30);

        setTimeout(() => {
          clearInterval(tickInterval);
        }, spinTime);
      }
    }, 50);

    // Spin complete callback
    setTimeout(() => {
      setIsSpinning(false);
      setShowResultModal(true);

      // Unlock avatar or issue refund
      if (alreadyOwned) {
        if (currency === 'pts') {
          addGamePoints(refund);
        } else {
          refundXp(refund);
        }
      } else {
        unlockAvatar(winningItem.id);
      }

      // Play Reveal audio & confetti
      soundManager.playItemReveal(winningItem.rarity, settings.uiSoundEffects);

      if (['rare', 'epic', 'legendary', 'mythic', 'exotic', 'transcendent'].includes(winningItem.rarity)) {
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }
    }, spinTime + 100);
  };

  const closeUnboxModal = () => {
    setActiveCase(null);
    setShowResultModal(false);
    setIsSpinning(false);
  };

  const filteredAvatars = AVATARS_CATALOG.filter((item) => {
    if (selectedRarityFilter === 'all') return true;
    if (selectedRarityFilter === 'unlocked') return unlockedIds.includes(item.id);
    if (selectedRarityFilter === 'locked') return !unlockedIds.includes(item.id);
    return item.rarity === selectedRarityFilter;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 min-h-[calc(100vh-80px)] font-sans">
      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Package className="w-4 h-4 text-amber-400" /> Crate Spinner & Profile Armory
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Crate Openings & Inventory
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Unbox authentic Mil-Spec, Classified, Covert, and ★ Special Rare Blade icons! Spend Game Points or Achievement XP with real roulette wheel mechanics and drop probabilities.
          </p>
        </div>

        {/* User Balances Card */}
        <div className="z-10 flex flex-wrap items-center gap-4 bg-slate-950/90 border border-white/15 p-4 rounded-2xl shrink-0 backdrop-blur-md shadow-xl">
          {/* Game Points */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Game Points</p>
              <p className="text-xl font-black text-amber-400 font-mono">{gamePoints} Pts</p>
            </div>
          </div>

          <div className="w-px h-8 bg-white/10 hidden sm:block" />

          {/* Achievement XP */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-400/40 flex items-center justify-center text-violet-300 font-bold shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available XP</p>
              <p className="text-xl font-black text-violet-400 font-mono">{availableXp} XP</p>
            </div>
          </div>
        </div>

        {/* Background subtle ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('cases')}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'cases'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" /> Weapon & Armor Crates
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Gift className="w-4 h-4" /> My Profile Armory ({unlockedIds.length} / {AVATARS_CATALOG.length})
        </button>
      </div>

      {/* TAB 1: UNBOX CASES */}
      {activeTab === 'cases' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Official Crate Vaults
            </h2>
            <span className="text-xs text-slate-400">Exact drop rates: Mil-Spec 79.9%, Restricted 16%, Classified 3.2%, Covert 0.64%, Special Blade 0.26%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CASES_CATALOG.map((crate) => {
              const canAffordPts = isOwner || gamePoints >= crate.cost;
              const canAffordXp = isOwner || availableXp >= crate.cost;

              return (
                <div
                  key={crate.id}
                  className={`relative rounded-3xl bg-gradient-to-b ${crate.bgGradient} border ${crate.accentBorder} p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-2xl group`}
                >
                  <div className="space-y-4">
                    {/* Header Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${isOwner ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' : crate.badgeColor}`}>
                        {isOwner ? 'FREE (Owner VIP)' : `${crate.cost} Pts / XP`}
                      </span>
                      <Package className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                    </div>

                    {/* Crate Visual representation */}
                    <div className="py-6 flex justify-center">
                      <div className="w-28 h-28 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-center relative shadow-2xl group-hover:scale-105 transition-transform">
                        <Package className="w-14 h-14 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
                        <Sparkles className="w-5 h-5 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-white">{crate.name}</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{crate.description}</p>
                    </div>

                    {/* Possible drops preview with color stripes */}
                    <div className="space-y-2 pt-3 border-t border-white/10">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contains Finishes:</p>
                      <div className="grid grid-cols-1 gap-1.5 max-h-52 overflow-y-auto pr-1">
                        {crate.possibleAvatars.map((avId) => {
                          const av = AVATARS_CATALOG.find((a) => a.id === avId);
                          if (!av) return null;
                          const rarity = RARITY_CONFIG[av.rarity];
                          return (
                            <div
                              key={avId}
                              onClick={() => {
                                const { floatStr, wear } = getAvatarFloatAndWear(av.id);
                                setInspectedItem({ item: av, floatVal: floatStr, wearGrade: wear });
                              }}
                              className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-white/5 hover:border-white/20 transition-all cursor-pointer group/item"
                            >
                              <span className="text-[11px] font-bold text-white truncate min-w-0 flex-1 group-hover/item:text-amber-300 transition-colors">
                                {av.name}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${rarity.badgeBg}`}>
                                  {rarity.gradeLabel}
                                </span>
                                <div className={`w-2 h-2 rounded-full shrink-0 ${rarity.barColor}`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Dual Unbox Buttons */}
                  <div className="mt-6 space-y-2">
                    <button
                      onClick={() => handleOpenCase(crate, 'pts')}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        canAffordPts
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 font-black'
                          : 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      {isOwner ? 'Unbox (Free for Owner)' : (canAffordPts ? `Unbox (${crate.cost} Pts)` : `Need ${crate.cost - gamePoints} Pts`)}
                    </button>

                    <button
                      onClick={() => handleOpenCase(crate, 'xp')}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        canAffordXp
                          ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/20 active:scale-95 font-black'
                          : 'bg-slate-900 text-slate-500 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5 text-violet-300" />
                      {isOwner ? 'Unbox Free with XP' : (canAffordXp ? `Unbox with ${crate.cost} XP` : `Need ${crate.cost - availableXp} XP`)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Active Equipped Avatar Display Card */}
          <div className="bg-slate-950/90 border border-white/10 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-center gap-5">
              <AvatarDisplay avatarId={equippedId} size="xl" />
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Active Equipped Profile Icon
                </span>
                <h3 className="text-xl font-black text-white mt-1.5">
                  {AVATARS_CATALOG.find((a) => a.id === equippedId)?.name || 'Initiate Core'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  {AVATARS_CATALOG.find((a) => a.id === equippedId)?.description}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs font-bold text-slate-400">Unlocked Collection</p>
              <p className="text-2xl font-black text-amber-400 font-mono">
                {unlockedIds.length} / {AVATARS_CATALOG.length}
              </p>
            </div>
          </div>

          {/* Rarity Filter Tabs & Multi-Select Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-1">Grade Filter:</span>
              {['all', 'unlocked', 'locked', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'exotic', 'transcendent'].map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedRarityFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    selectedRarityFilter === f
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {f === 'common' ? 'Mil-Spec' : f === 'uncommon' ? 'Restricted' : f === 'rare' ? 'Classified' : f === 'epic' ? 'Covert' : f === 'legendary' ? '★ Knife' : f === 'transcendent' ? '★ Transcendent' : f}
                </button>
              ))}
            </div>

            {/* Multi-Select Action Toggle */}
            <div className="flex items-center gap-2">
              {isMultiSelectMode && (
                <>
                  <button
                    onClick={selectAllSellable}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Select All ({filteredAvatars.filter(i => unlockedIds.includes(i.id) && !isUnsellable(i.id)).length})
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-400 border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </>
              )}
              <button
                onClick={toggleMultiSelectMode}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  isMultiSelectMode
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                {isMultiSelectMode ? 'Exit Batch Sell' : 'Batch Sell Mode'}
              </button>
            </div>
          </div>

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredAvatars.map((item) => {
              const isUnlocked = unlockedIds.includes(item.id);
              const isEquipped = equippedId === item.id;
              const rarity = RARITY_CONFIG[item.rarity];
              const isSelected = selectedForSale.includes(item.id);
              const unsellable = isUnsellable(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isMultiSelectMode && isUnlocked && !unsellable) {
                      toggleSelectAvatar(item.id);
                    }
                  }}
                  className={`relative rounded-2xl border flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                    isMultiSelectMode && isUnlocked && !unsellable ? 'cursor-pointer select-none' : ''
                  } ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)] scale-[1.02]'
                      : isEquipped
                      ? 'bg-amber-500/10 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.25)]'
                      : isUnlocked
                      ? `${rarity.bgColor} ${rarity.borderColor} hover:border-white/40`
                      : 'bg-slate-950/80 border-white/10 opacity-60'
                  }`}
                >
                  <div className="p-5 space-y-3">
                    {/* Top Grade Badge, Status & Checkbox */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${rarity.badgeBg}`}>
                        {rarity.gradeLabel}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isMultiSelectMode && isUnlocked && !unsellable ? (
                          <div className={`p-1 rounded-md border transition-all ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold'
                              : 'bg-slate-900 text-slate-400 border-white/20'
                          }`}>
                            <CheckSquare className="w-4 h-4" />
                          </div>
                        ) : isEquipped ? (
                          <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                            EQUIPPED
                          </span>
                        ) : !isUnlocked ? (
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        ) : unsellable ? (
                          <span className="text-[9px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-white/10">
                            Untradeable
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Avatar Icon Display */}
                    <div className="py-2 flex justify-center">
                      <AvatarDisplay avatarId={item.id} size="xl" showGlow={isUnlocked} />
                    </div>

                    {/* Title & Complete Description */}
                    <div className="space-y-1.5 text-left">
                      <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-normal break-words">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Rarity Stripe & Actions */}
                  <div className="space-y-2">
                    <div className="px-5 pb-4 flex items-center gap-2">
                      {isMultiSelectMode && isUnlocked && !unsellable ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectAvatar(item.id);
                          }}
                          className={`w-full py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10'
                          }`}
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          {isSelected ? 'Selected for Sale' : 'Select for Batch Sale'}
                        </button>
                      ) : isEquipped ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <button
                            disabled
                            className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default"
                          >
                            Equipped Active
                          </button>
                          {!isUnsellable(item.id) && (() => {
                            const { floatStr, wear } = getAvatarFloatAndWear(item.id);
                            const itemSellPrice = calculateSellPrice(item.rarity, floatStr);
                            return (
                              <button
                                onClick={() => setSellingAvatar({ item, floatVal: floatStr, wearGrade: wear })}
                                className="px-2.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                                title={`Sell for +${itemSellPrice} Game Points (${wear})`}
                              >
                                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                                <span>+{itemSellPrice}</span>
                              </button>
                            );
                          })()}
                        </div>
                      ) : isUnlocked ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <button
                            onClick={() => {
                              equipAvatar(item.id);
                              soundManager.playClick(settings.uiSoundEffects);
                            }}
                            className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer font-black"
                          >
                            Equip
                          </button>
                          {!isUnsellable(item.id) && (() => {
                            const { floatStr, wear } = getAvatarFloatAndWear(item.id);
                            const itemSellPrice = calculateSellPrice(item.rarity, floatStr);
                            return (
                              <button
                                onClick={() => setSellingAvatar({ item, floatVal: floatStr, wearGrade: wear })}
                                className="px-2.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                                title={`Sell for +${itemSellPrice} Game Points (${wear})`}
                              >
                                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                                <span>+{itemSellPrice}</span>
                              </button>
                            );
                          })()}
                          <button
                            onClick={() => {
                              const { floatStr, wear } = getAvatarFloatAndWear(item.id);
                              setInspectedItem({ item, floatVal: floatStr, wearGrade: wear });
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0"
                            title="Inspect Item"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const { floatStr, wear } = getAvatarFloatAndWear(item.id);
                            setInspectedItem({ item, floatVal: floatStr, wearGrade: `Locked (${wear})` });
                          }}
                          className="w-full py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-400 border border-white/5 transition-colors cursor-pointer"
                        >
                          Inspect Details
                        </button>
                      )}
                    </div>

                    {/* Bottom Rarity Bar */}
                    <div className={`h-1.5 w-full ${rarity.barColor}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FLOATING STICKY BATCH SELL BAR */}
      {(isMultiSelectMode || selectedForSale.length > 0) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9000] w-[92%] max-w-2xl bg-slate-900/95 border-2 border-emerald-500/50 backdrop-blur-2xl rounded-2xl p-3.5 sm:p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-300">
                <span className="text-emerald-400 font-black text-sm">{selectedForSale.length}</span> Avatars Selected
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                Total Resale Value:
                <span className="text-emerald-400 font-black flex items-center gap-0.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  +{calculateBatchTotalPayout()} Pts
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={deselectAll}
              disabled={selectedForSale.length === 0}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-all cursor-pointer shrink-0"
            >
              Clear Selection
            </button>
            <button
              onClick={() => setShowBatchSellModal(true)}
              disabled={selectedForSale.length === 0}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 shrink-0"
            >
              <Coins className="w-4 h-4" />
              Sell Selected ({selectedForSale.length})
            </button>
          </div>
        </div>
      )}

      {/* UNBOXING ROULETTE SPINNER MODAL */}
      {activeCase && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4">
          <div className="max-w-xl w-full bg-slate-950 border-2 border-amber-400/60 rounded-2xl p-4 md:p-5 space-y-3.5 shadow-2xl relative overflow-hidden text-center animate-in fade-in zoom-in-95 duration-300">
            {/* Ambient Background Light Rays */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-1">
              <div className="inline-flex items-center justify-center p-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 mb-0.5 animate-bounce">
                <Package className="w-5 h-5 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              </div>
              <h3 className="text-lg font-black text-white flex items-center justify-center gap-2 tracking-tight">
                Unboxing {activeCase.name}
              </h3>
            </div>

            {/* Roulette Reel Container */}
            <div ref={reelContainerRef} className="relative w-full h-36 bg-slate-900/90 rounded-xl border border-white/15 overflow-hidden flex items-center shadow-xl">
              {/* Center Winner Yellow Indicator Needle */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-amber-400 z-40 shadow-[0_0_15px_#fbbf24] -translate-x-1/2 pointer-events-none">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[9px] border-t-amber-400" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[9px] border-b-amber-400" />
              </div>

              {/* Scrolling Horizontal Reel */}
              <div
                ref={reelRef}
                className="flex items-center gap-3 px-8 whitespace-nowrap absolute left-0"
              >
                {reelAvatars.map((av, idx) => {
                  const r = RARITY_CONFIG[av.rarity];
                  return (
                    <div
                      key={idx}
                      className={`w-32 h-28 rounded-xl border-2 ${r.borderColor} ${r.bgColor} flex flex-col items-center justify-between p-1.5 shrink-0 relative overflow-hidden shadow-lg`}
                    >
                      <div className="pt-0.5">
                        <AvatarDisplay avatarId={av.id} size="md" showGlow={false} />
                      </div>
                      <div className="w-full text-center space-y-0.5 pb-1">
                        <span className="text-[10px] font-black text-white truncate w-full block">{av.name}</span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded inline-block ${r.badgeBg}`}>
                          {r.gradeLabel}
                        </span>
                      </div>
                      {/* Bottom Rarity Bar */}
                      <div className={`absolute bottom-0 left-0 right-0 h-1 ${r.barColor}`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spin Status message */}
            {isSpinning && (
              <p className="text-amber-400 font-mono text-[11px] font-bold animate-pulse flex items-center justify-center gap-1.5 pt-1">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Unlocking Lock & Decelerating Reel...
              </p>
            )}

            {/* Revealed Item Modal */}
            {showResultModal && wonAvatar && (
              <div className="bg-slate-900/90 border-2 border-amber-400/50 p-4 rounded-xl space-y-2.5 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden shadow-xl">
                {/* Glowing aura behind victory icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl animate-pulse pointer-events-none" />

                <div className="flex justify-center py-1 relative z-10 transition-transform">
                  <AvatarDisplay avatarId={wonAvatar.id} size="xl" showGlow={true} />
                </div>

                <div className="space-y-1 relative z-10">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block ${RARITY_CONFIG[wonAvatar.rarity].badgeBg}`}>
                    {RARITY_CONFIG[wonAvatar.rarity].gradeLabel} UNLOCKED
                  </span>
                  <h4 className="text-lg font-black text-white">{wonAvatar.name}</h4>
                  <p className="text-[11px] text-slate-300 max-w-sm mx-auto leading-relaxed font-medium">{wonAvatar.description}</p>
                  
                  <div className="pt-1 flex items-center justify-center gap-3 text-[10px] font-mono text-slate-400">
                    <span>Wear: <strong className="text-amber-300">{wonWear}</strong></span>
                    <span>•</span>
                    <span>Float: <strong className="text-slate-200">{wonFloat}</strong></span>
                  </div>
                </div>

                {/* Duplicate Notification */}
                {isDuplicate ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-2 px-3 rounded-lg text-amber-300 text-[11px] font-bold relative z-10">
                    ♻️ Item already in armory! Converted to +{duplicateRefund} {usedCurrency === 'pts' ? 'Game Points' : 'XP'} Refund!
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 px-3 rounded-lg text-emerald-300 text-[11px] font-bold relative z-10">
                    ✨ New Finish Added to Armory Inventory!
                  </div>
                )}

                <div className="flex items-center justify-center gap-2.5 pt-1 relative z-10 flex-wrap">
                  {!isDuplicate && (
                    <button
                      onClick={() => {
                        equipAvatar(wonAvatar.id);
                        closeUnboxModal();
                      }}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
                    >
                      Equip Immediately
                    </button>
                  )}
                  {!isDuplicate && !isUnsellable(wonAvatar.id) && (() => {
                    const unboxSellPrice = calculateSellPrice(wonAvatar.rarity, wonFloat);
                    return (
                      <button
                        onClick={() => {
                          setSellingAvatar({ item: wonAvatar, floatVal: wonFloat, wearGrade: wonWear });
                          closeUnboxModal();
                        }}
                        className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <Coins className="w-3.5 h-3.5 text-emerald-400" />
                        Sell for +{unboxSellPrice} Pts
                      </button>
                    );
                  })()}
                  <button
                    onClick={closeUnboxModal}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer active:scale-95"
                  >
                    Close Crate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INSPECT ITEM MODAL */}
      {inspectedItem && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-white/20 rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${RARITY_CONFIG[inspectedItem.item.rarity].badgeBg}`}>
                {RARITY_CONFIG[inspectedItem.item.rarity].gradeLabel}
              </span>
              <button
                onClick={() => setInspectedItem(null)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-center py-4">
              <AvatarDisplay avatarId={inspectedItem.item.id} size="2xl" showGlow={true} />
            </div>

            <div className="space-y-2 text-center">
              <h3 className="text-xl font-black text-white">{inspectedItem.item.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">{inspectedItem.item.description}</p>
            </div>

            <div className="bg-slate-950 border border-white/10 p-3 rounded-xl space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Finish Rarity:</span>
                <span className="text-white font-bold">{RARITY_CONFIG[inspectedItem.item.rarity].label}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Drop Chance:</span>
                <span className="text-amber-400 font-bold">{RARITY_CONFIG[inspectedItem.item.rarity].weight}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Float Wear:</span>
                <span className="text-emerald-400 font-bold">{inspectedItem.wearGrade || 'Factory New'} ({inspectedItem.floatVal || '0.0134'})</span>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-white/10 pt-1 mt-1">
                <span>Resale Value:</span>
                {isUnsellable(inspectedItem.item.id) ? (
                  <span className="text-amber-400/80 font-bold italic">Untradeable / Non-Sellable</span>
                ) : (
                  <span className="text-emerald-400 font-black flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    +{calculateSellPrice(inspectedItem.item.rarity, inspectedItem.floatVal)} Game Points
                  </span>
                )}
              </div>
            </div>

            {(profile?.unlockedAvatars || []).includes(inspectedItem.item.id) && !isUnsellable(inspectedItem.item.id) && (() => {
              const inspectSellPrice = calculateSellPrice(inspectedItem.item.rarity, inspectedItem.floatVal);
              return (
                <button
                  onClick={() => setSellingAvatar({ item: inspectedItem.item, floatVal: inspectedItem.floatVal, wearGrade: inspectedItem.wearGrade || 'Factory New' })}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  <Coins className="w-4 h-4" />
                  Sell Item for +{inspectSellPrice} Game Points
                </button>
              );
            })()}

            <button
              onClick={() => setInspectedItem(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer"
            >
              Close Inspection
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM SELL AVATAR MODAL */}
      {sellingAvatar && (() => {
        const sellPrice = calculateSellPrice(sellingAvatar.item.rarity, sellingAvatar.floatVal);
        const basePrice = RARITY_CONFIG[sellingAvatar.item.rarity].sellValue;
        const floatNum = parseFloat(sellingAvatar.floatVal) || 0.25;
        const multiplier = getWearMultiplier(floatNum);
        const pct = Math.round((multiplier - 1) * 100);
        const pctFormatted = pct >= 0 ? `+${pct}%` : `${pct}%`;

        return (
          <div className="fixed inset-0 z-[100001] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="max-w-sm w-full bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 space-y-4 shadow-2xl relative text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Coins className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">Sell {sellingAvatar.item.name}?</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Are you sure you want to sell this <span className={RARITY_CONFIG[sellingAvatar.item.rarity].textColor}>{RARITY_CONFIG[sellingAvatar.item.rarity].gradeLabel}</span> finish from your armory?
                </p>
              </div>

              <div className="bg-slate-950 border border-emerald-500/30 p-3 rounded-xl space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Base Rarity Price:</span>
                  <span className="text-slate-200 font-bold">+{basePrice} Pts</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Wear & Float Modifier:</span>
                  <span className={`font-bold ${pct >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {sellingAvatar.wearGrade} ({pctFormatted})
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Float Value:</span>
                  <span className="text-slate-300 font-bold">{sellingAvatar.floatVal}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 text-slate-200">
                  <span className="text-slate-400 font-bold">Total Payout:</span>
                  <span className="text-emerald-400 font-black text-sm flex items-center gap-1">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    +{sellPrice} Game Points
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => setSellingAvatar(null)}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmSell(sellingAvatar)}
                  className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  Confirm Sale
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* BATCH CONFIRM SELL MODAL */}
      {showBatchSellModal && selectedForSale.length > 0 && (() => {
        const batchPayout = calculateBatchTotalPayout();
        const selectedItems = selectedForSale
          .map((id) => AVATARS_CATALOG.find((a) => a.id === id))
          .filter(Boolean) as AvatarItem[];

        return (
          <div className="fixed inset-0 z-[100002] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Coins className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Batch Sell Confirmation</h3>
                      <p className="text-xs text-slate-400">Review selected armory items to sell</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBatchSellModal(false)}
                    className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-slate-950 border border-white/10 rounded-2xl p-3 max-h-56 overflow-y-auto divide-y divide-white/5 space-y-1">
                  {selectedItems.map((item) => {
                    const { floatStr, wear } = getAvatarFloatAndWear(item.id);
                    const price = calculateSellPrice(item.rarity, floatStr);
                    const rarity = RARITY_CONFIG[item.rarity];

                    return (
                      <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2.5">
                          <AvatarDisplay avatarId={item.id} size="sm" showGlow={false} />
                          <div className="text-left">
                            <p className="font-bold text-white leading-tight">{item.name}</p>
                            <p className={`text-[10px] ${rarity.textColor}`}>{rarity.gradeLabel} • {wear}</p>
                          </div>
                        </div>
                        <span className="text-emerald-400 font-black shrink-0">+{price} Pts</span>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-300/80 font-medium">Total Bulk Payout</p>
                    <p className="text-2xl font-black text-emerald-400 font-mono flex items-center gap-1.5">
                      <Coins className="w-6 h-6 text-emerald-400" />
                      +{batchPayout} Game Points
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40">
                    {selectedItems.length} Items
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowBatchSellModal(false)}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBatchSell}
                  className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/30 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4" />
                  Confirm Batch Sale (+{batchPayout} Pts)
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
};
