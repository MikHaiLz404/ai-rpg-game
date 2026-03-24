import { create } from 'zustand';
import { GamePhase, Player } from '@/types';

export const MAX_TURNS = 20;
export const MAX_CHOICES_PER_DAY = 3;

export interface DivineSkill {
  name: string;
  description: string;
  multiplier: number;
  type: 'physical' | 'magical';
  godId: string;
}

interface Companion {
  id: string;
  name: string;
  bond: number;
  level: number;
  unlockedSkills: DivineSkill[];
  claimedThresholds: number[];
}

interface Customer {
  id: string;
  name: string;
  request: string;
  offeredGold: number;
  wantedItemIds: string[];
  isGod: boolean;
}

interface Dialogue {
  speaker: string;
  text: string;
  portrait?: string;
}

export interface AILog {
  id: string;
  timestamp: number;
  action: string;
  model: string;
  source: 'openclaw' | 'openrouter' | 'fallback' | 'error' | 'unknown';
  prompt: string;
  response: string;
  tokensInput: number;
  tokensOutput: number;
}

export interface DailyEventEffect {
  type: 'gold_boost' | 'restock_penalty' | 'restock_discount' | 'ip_boost' | 'bond_penalty' | 'none';
  value: number;
  target?: string;
}

interface GameStore {
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  gold: number;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  items: string[];
  addItem: (item: string) => void;
  removeItem: (item: string) => void;
  companions: Companion[];
  addBond: (id: string, amount: number) => void;
  unlockSkill: (godId: string, skill: DivineSkill) => void;
  markThresholdClaimed: (godId: string, threshold: number) => void;
  getBondBonus: (id: string) => { atk: number; def: number };
  currentCustomer: Customer | null;
  setCustomer: (customer: Customer | null) => void;

  day: number;
  choicesLeft: number;
  interventionPoints: number;
  addIP: (amount: number) => void;
  useIP: (amount: number) => boolean;
  arenaWins: number;
  incrementArenaWins: () => void;
  lastDailyEvent: string | null;
  currentDailyEventEffect: DailyEventEffect | null;
  setDailyEvent: (title: string, effect: DailyEventEffect) => void;
  setLastDailyEvent: (event: string | null) => void;
  consumeChoice: () => void;
  endDay: () => void;
  isBusy: boolean;
  setIsBusy: (busy: boolean) => void;
  customersServed: number;
  isShiftActive: boolean;
  startShift: () => void;
  endShift: () => void;
  incrementServed: () => void;

  gameOver: 'win' | 'lose' | null;
  gameOverReason: 'time' | 'bankruptcy' | null;
  vampireDefeated: boolean;
  defeatVampire: () => void;
  setGameOver: (result: 'win' | 'lose' | null) => void;

  restockCostMultiplier: number;

  showProphecy: boolean;
  setShowProphecy: (show: boolean) => void;

  dialogue: Dialogue | null;
  setDialogue: (dialogue: Dialogue | null) => void;

  explorationLog: string[];
  addExplorationLog: (entries: string[]) => void;

  // Exploration Room State
  explorationEnergy: number;
  setExplorationEnergy: (energy: number) => void;
  reduceEnergy: (amount: number) => void;
  isExploringRoom: boolean;
  setIsExploringRoom: (exploring: boolean) => void;

  // Kane's Stats (For Exploration Scaling)
  kaneStats: { hp: number; maxHp: number; atk: number; def: number };
  updateKaneStats: (stats: Partial<{ hp: number; maxHp: number; atk: number; def: number }>) => void;
  boostSkill: (skillName: string, multiplierAdd: number) => void;

  // AI Logs Implementation
  aiLogs: AILog[];
  addAILog: (log: Omit<AILog, 'id' | 'timestamp'>) => void;
  clearAILogs: () => void;
  totalTokensInput: number;
  totalTokensOutput: number;
  showAITerminal: boolean;
  setShowAITerminal: (show: boolean) => void;
  hasNewLog: boolean;
  setHasNewLog: (hasNew: boolean) => void;

  loadSaveData: (data: any) => void;
  resetGame: () => void;
}

const INITIAL_COMPANIONS: Companion[] = [
  { id: 'leo', name: 'เลโอ', bond: 5, level: 1, unlockedSkills: [], claimedThresholds: [] },
  { id: 'arena', name: 'อารีน่า', bond: 3, level: 1, unlockedSkills: [], claimedThresholds: [] },
  { id: 'draco', name: 'ดราโก้', bond: 2, level: 1, unlockedSkills: [], claimedThresholds: [] },
  { id: 'kane', name: 'เคน', bond: 1, level: 1, unlockedSkills: [], claimedThresholds: [] },
];

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'shop',
  setPhase: (phase) => set({ phase }),

  gold: 500,
  addGold: (amount) => set((state) => ({
    gold: state.gold + amount,
  })),
  spendGold: (amount) => {
    const state = get();
    if (state.gold >= amount) {
      set({
        gold: state.gold - amount,
      });
      return true;
    }
    return false;
  },

  items: ['potion_health', 'potion_health', 'soap', 'mirror', 'flower', 'flower'],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (item) => set((state) => {
    const index = state.items.indexOf(item);
    if (index > -1) {
      const newItems = [...state.items];
      newItems.splice(index, 1);
      return { items: newItems };
    }
    return state;
  }),

  companions: INITIAL_COMPANIONS,

  addBond: (id, amount) => set((state) => {
    const effect = state.currentDailyEventEffect;
    let finalAmount = amount;
    if (effect?.type === 'bond_penalty') finalAmount = Math.floor(amount * effect.value);
    
    return {
      companions: state.companions.map(c => {
        if (c.id === id) {
          const newBond = c.bond + finalAmount;
          const newLevel = Math.floor(newBond / 10) + 1;
          return { ...c, bond: newBond, level: newLevel };
        }
        return c;
      })
    };
  }),

  unlockSkill: (godId, skill) => set((state) => ({
    companions: state.companions.map(c => {
      if (c.id === godId) {
        return { ...c, unlockedSkills: [...c.unlockedSkills, skill] };
      }
      if (c.id === 'kane') {
        const hasSkill = c.unlockedSkills.some(s => s.name === skill.name);
        if (hasSkill) return c;
        return { ...c, unlockedSkills: [...c.unlockedSkills, skill] };
      }
      return c;
    })
  })),

  markThresholdClaimed: (godId, threshold) => set((state) => ({
    companions: state.companions.map(c =>
      c.id === godId
        ? { ...c, claimedThresholds: [...c.claimedThresholds, threshold] }
        : c
    )
  })),

  getBondBonus: (id) => {
    const companion = get().companions.find(c => c.id === id);
    if (!companion) return { atk: 0, def: 0 };
    return {
      atk: Math.floor(companion.bond * 1.5),
      def: Math.floor(companion.bond * 1.0)
    };
  },

  currentCustomer: null,
  setCustomer: (customer) => set({ currentCustomer: customer }),

  day: 1,
  choicesLeft: MAX_CHOICES_PER_DAY,
  interventionPoints: 10,
  addIP: (amount: number) => set((state) => {
    const effect = state.currentDailyEventEffect;
    let finalAmount = amount;
    if (effect?.type === 'ip_boost') finalAmount += effect.value;
    return { interventionPoints: state.interventionPoints + finalAmount };
  }),
  useIP: (amount) => {
    const state = get();
    if (state.interventionPoints >= amount) {
      set({ interventionPoints: state.interventionPoints - amount });
      return true;
    }
    return false;
  },
  arenaWins: 0,
  incrementArenaWins: () => set((state) => ({ arenaWins: state.arenaWins + 1 })),
  lastDailyEvent: null,
  currentDailyEventEffect: null,
  setDailyEvent: (title, effect) => set({ lastDailyEvent: title, currentDailyEventEffect: effect }),
  setLastDailyEvent: (event) => set({ lastDailyEvent: event }),

  consumeChoice: () => set((state) => {
    return { choicesLeft: Math.max(0, state.choicesLeft - 1) };
  }),
  
  endDay: () => set((state) => {
    const newDay = state.day + 1;
    if (newDay > MAX_TURNS && !state.vampireDefeated) {
      return { choicesLeft: 0, day: newDay, gameOver: 'lose' as const, gameOverReason: 'time' as const, isBusy: false };
    }
    if (state.gold <= 0 && state.items.length === 0) {
      return { choicesLeft: 0, day: newDay, gameOver: 'lose' as const, gameOverReason: 'bankruptcy' as const, isBusy: false };
    }
    const restockCostMultiplier = 1.0 + (newDay - 1) * 0.03;
    return { 
      choicesLeft: MAX_CHOICES_PER_DAY, 
      day: newDay, 
      restockCostMultiplier, 
      showProphecy: true, 
      isBusy: false, 
      lastDailyEvent: null,
      currentDailyEventEffect: null,
      isExploringRoom: false,
      explorationEnergy: 0
    };
  }),

  isBusy: false,
  setIsBusy: (isBusy) => set({ isBusy }),

  customersServed: 0,
  isShiftActive: false,
  startShift: () => set({ isShiftActive: true, isBusy: true, customersServed: 0 }),
  endShift: () => {
    const { consumeChoice, endDay, setDialogue } = get();
    set({ isShiftActive: false, isBusy: false });
    consumeChoice();
    setDialogue(null);
    if (get().choicesLeft <= 0) {
      setTimeout(() => endDay(), 2000);
    }
  },
  incrementServed: () => set((state) => ({ customersServed: state.customersServed + 1 })),

  gameOver: null,
  gameOverReason: null,
  vampireDefeated: false,
  defeatVampire: () => set({ vampireDefeated: true, gameOver: 'win' }),
  setGameOver: (result) => set({ gameOver: result }),

  restockCostMultiplier: 1.0,

  showProphecy: false,
  setShowProphecy: (show) => set({ showProphecy: show }),

  dialogue: null,
  setDialogue: (dialogue) => set({ dialogue }),

  explorationLog: [],
  addExplorationLog: (entries) => set((state) => ({
    explorationLog: [...entries, ...state.explorationLog].slice(0, 20)
  })),

  // Exploration implementation
  explorationEnergy: 0,
  setExplorationEnergy: (explorationEnergy) => set({ explorationEnergy }),
  reduceEnergy: (amount) => set((state) => ({ explorationEnergy: Math.max(0, state.explorationEnergy - amount) })),
  isExploringRoom: false,
  setIsExploringRoom: (isExploringRoom) => set({ isExploringRoom }),

  kaneStats: { hp: 100, maxHp: 100, atk: 15, def: 10 },
  updateKaneStats: (newStats) => set((state) => ({
    kaneStats: { ...state.kaneStats, ...newStats }
  })),
  boostSkill: (skillName, multiplierAdd) => set((state) => ({
    companions: state.companions.map(c => {
      if (c.id === 'kane') {
        return {
          ...c,
          unlockedSkills: c.unlockedSkills.map(s => 
            s.name === skillName ? { ...s, multiplier: s.multiplier + multiplierAdd } : s
          )
        };
      }
      return c;
    })
  })),

  // AI Logs Implementation
  aiLogs: [],
  addAILog: (log) => set((state) => {
    const newLog: AILog = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    return {
      aiLogs: [newLog, ...state.aiLogs].slice(0, 50),
      totalTokensInput: state.totalTokensInput + (log.tokensInput || 0),
      totalTokensOutput: state.totalTokensOutput + (log.tokensOutput || 0),
      hasNewLog: !state.showAITerminal, 
    };
  }),
  clearAILogs: () => set({ aiLogs: [], totalTokensInput: 0, totalTokensOutput: 0, hasNewLog: false }),
  totalTokensInput: 0,
  totalTokensOutput: 0,
  showAITerminal: false,
  setShowAITerminal: (show) => set({ showAITerminal: show, hasNewLog: false }),
  hasNewLog: false,
  setHasNewLog: (hasNewLog) => set({ hasNewLog }),

  resetGame: () => set({
    gold: 500,
    items: ['potion_health', 'potion_health', 'soap', 'mirror', 'flower', 'flower'],
    companions: INITIAL_COMPANIONS.map(c => ({ ...c, unlockedSkills: [], claimedThresholds: [] })),
    day: 1,
    choicesLeft: MAX_CHOICES_PER_DAY,
    interventionPoints: 20,
    arenaWins: 0,
    lastDailyEvent: null,
    currentDailyEventEffect: null,
    isBusy: false,
    customersServed: 0,
    isShiftActive: false,
    currentCustomer: null,
    dialogue: null,
    phase: 'shop' as GamePhase,
    gameOver: null,
    gameOverReason: null,
    vampireDefeated: false,
    showProphecy: false,
    restockCostMultiplier: 1.0,
    explorationLog: [],
    explorationEnergy: 0,
    isExploringRoom: false,
    kaneStats: { hp: 100, maxHp: 100, atk: 15, def: 10 },
    aiLogs: [],
    totalTokensInput: 0,
    totalTokensOutput: 0,
    showAITerminal: false,
    hasNewLog: false,
  }),

  loadSaveData: (data) => {
    if (!data) return;
    set({
      gold: data.player.gold,
      items: data.inventory.map((i: any) => i.id || i),
      companions: get().companions.map(c => ({
        ...c,
        bond: data.relationships[c.id] || c.bond,
        level: Math.floor((data.relationships[c.id] || c.bond) / 10) + 1,
        unlockedSkills: data.unlockedSkills?.[c.id] || [],
        claimedThresholds: data.claimedThresholds?.[c.id] || []
      })),
      day: data.day || 1,
      arenaWins: data.arenaWins || 0,
      choicesLeft: data.choicesLeft !== undefined ? data.choicesLeft : MAX_CHOICES_PER_DAY,
      interventionPoints: data.interventionPoints || 10,
      vampireDefeated: data.vampireDefeated || false,
      gameOver: data.gameOver || null,
      explorationLog: data.explorationLog || [],
      kaneStats: data.kaneStats || get().kaneStats,
      isBusy: false,
    });
  },
}));
