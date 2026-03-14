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
  companions: Companion[];
  addBond: (id: string, amount: number) => void;
  getBondBonus: (id: string) => { atk: number; def: number };
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
  
  items: ['potion', 'sword'],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  
  companions: [
    { id: 'leo', name: 'เลโอ้', bond: 5 },
    { id: 'arena', name: 'อารีน่า', bond: 3 },
    { id: 'draco', name: 'ดราโก้', bond: 2 },
    { id: 'kane', name: 'เคน', bond: 1 },
  ],
  addBond: (id, amount) => set((state) => ({
    companions: state.companions.map(c => 
      c.id === id ? { ...c, bond: c.bond + amount } : c
    )
  })),

  getBondBonus: (id) => {
    const companion = get().companions.find(c => c.id === id);
    if (!companion) return { atk: 0, def: 0 };
    return {
      atk: Math.floor(companion.bond / 2),
      def: Math.floor(companion.bond / 3)
    };
  },

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
        bond: data.relationships[c.id] || c.bond
      }))
    });
  },
}));
