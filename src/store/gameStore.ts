import { create } from 'zustand';

export type GamePhase = 'shop' | 'arena' | 'exploration' | 'relationship';

interface Player {
  gold: number;
  hp: number;
  maxHp: number;
}

interface Companion {
  id: string;
  name: string;
  bond: number;
  level: number;
  unlockedSkills: string[];
}

interface Customer {
  id: string;
  name: string;
  request: string;
  offeredGold: number;
  wantedItemId: string;
  isGod: boolean;
}

interface GameStore {
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  player: Player;
  gold: number;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  items: string[];
  addItem: (item: string) => void;
  removeItem: (item: string) => void;
  companions: Companion[];
  addBond: (id: string, amount: number) => void;
  getBondBonus: (id: string) => { atk: number; def: number };
  currentCustomer: Customer | null;
  setCustomer: (customer: Customer | null) => void;
  
  // Day Cycle
  day: number;
  customersServed: number;
  isShiftActive: boolean;
  startShift: () => void;
  endShift: () => void;
  incrementServed: () => void;
  
  loadSaveData: (data: any) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'shop',
  setPhase: (phase) => set({ phase }),
  
  player: {
    gold: 500,
    hp: 100,
    maxHp: 100,
  },
  gold: 500,
  addGold: (amount) => set((state) => ({ 
    gold: state.gold + amount,
    player: { ...state.player, gold: state.player.gold + amount }
  })),
  spendGold: (amount) => {
    const state = get();
    if (state.gold >= amount) {
      set({ 
        gold: state.gold - amount,
        player: { ...state.player, gold: state.player.gold - amount }
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
  
  companions: [
    { id: 'leo', name: 'เลโอ้', bond: 5, level: 1, unlockedSkills: ['Power Strike'] },
    { id: 'arena', name: 'อารีน่า', bond: 3, level: 1, unlockedSkills: ['Royal Guard'] },
    { id: 'draco', name: 'ดราโก้', bond: 2, level: 1, unlockedSkills: ['Dragon Breath'] },
    { id: 'kane', name: 'เคน', bond: 1, level: 1, unlockedSkills: ['Quick Shot'] },
  ],
  
  addBond: (id, amount) => set((state) => ({
    companions: state.companions.map(c => {
      if (c.id === id) {
        const newBond = c.bond + amount;
        const newLevel = Math.floor(newBond / 10) + 1;
        // Logic for unlocking skills based on level can be added here
        return { ...c, bond: newBond, level: newLevel };
      }
      return c;
    })
  })),

  getBondBonus: (id) => {
    const companion = get().companions.find(c => c.id === id);
    if (!companion) return { atk: 0, def: 0 };
    return {
      atk: Math.floor(companion.bond / 2),
      def: Math.floor(companion.bond / 3)
    };
  },

  currentCustomer: null,
  setCustomer: (customer) => set({ currentCustomer: customer }),

  day: 1,
  customersServed: 0,
  isShiftActive: false,
  startShift: () => set({ isShiftActive: true, customersServed: 0 }),
  endShift: () => set((state) => ({ isShiftActive: false, day: state.day + 1 })),
  incrementServed: () => set((state) => ({ customersServed: state.customersServed + 1 })),

  loadSaveData: (data) => {
    if (!data) return;
    set({
      gold: data.player.gold,
      player: {
        ...get().player,
        gold: data.player.gold,
      },
      items: data.inventory.map((i: any) => i.id || i),
      companions: get().companions.map(c => ({
        ...c,
        bond: data.relationships[c.id] || c.bond,
        level: Math.floor((data.relationships[c.id] || c.bond) / 10) + 1
      })),
      day: data.day || 1
    });
  },
}));
