import { create } from 'zustand';

export type GamePhase = 'shop' | 'arena' | 'exploration' | 'relationship';

interface Player {
  gold: number;
  hp: number;
  maxHp: number;
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
}));
