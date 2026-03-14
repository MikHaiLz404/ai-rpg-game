import { create } from 'zustand';
import { GamePhase, Player, Item, God, Enemy, NPC, DialogueNode, CombatState } from '../types';
import { items as itemData, gods as godData, enemies as enemyData, npcs as npcData } from '../data';

interface GameStore {
  // Game State
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  
  // Player
  player: Player;
  addGold: (amount: number) => void;
  removeGold: (amount: number) => boolean;
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => boolean;
  equipGod: (god: God) => void;
  changeRelationship: (npcId: string, amount: number) => void;
  
  // Shop
  shopItems: Item[];
  
  // Arena
  selectedGod: God | null;
  selectGod: (god: God | null) => void;
  combatState: CombatState;
  startCombat: (god: God, enemy: Enemy) => void;
  playerAttack: () => void;
  enemyAttack: () => void;
  endCombat: (result: 'win' | 'lose') => void;
  
  // Relationship
  npcs: NPC[];
  currentNpc: NPC | null;
  currentDialogue: DialogueNode | null;
  selectNpc: (npc: NPC) => void;
  chooseDialogue: (choiceIndex: number) => void;
  closeDialogue: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial State
  phase: 'shop',
  setPhase: (phase) => set({ phase }),
  
  player: {
    gold: 500,
    items: [],
    god: null,
    relationships: {}
  },
  
  addGold: (amount) => set((state) => ({
    player: { ...state.player, gold: state.player.gold + amount }
  })),
  
  removeGold: (amount) => {
    const { player } = get();
    if (player.gold >= amount) {
      set({ player: { ...player, gold: player.gold - amount } });
      return true;
    }
    return false;
  },
  
  addItem: (item) => set((state) => ({
    player: { ...state.player, items: [...state.player.items, item] }
  })),
  
  removeItem: (itemId) => {
    const { player } = get();
    const index = player.items.findIndex(i => i.id === itemId);
    if (index !== -1) {
      const newItems = [...player.items];
      newItems.splice(index, 1);
      set({ player: { ...player, items: newItems } });
      return true;
    }
    return false;
  },
  
  equipGod: (god) => set((state) => ({
    player: { ...state.player, god }
  })),
  
  changeRelationship: (npcId, amount) => set((state) => {
    const current = state.player.relationships[npcId] || 0;
    return {
      player: {
        ...state.player,
        relationships: { ...state.player.relationships, [npcId]: current + amount }
      }
    };
  }),
  
  // Shop
  shopItems: itemData,
  
  // Arena
  selectedGod: null,
  selectGod: (god) => set({ selectedGod: god }),
  
  combatState: {
    playerGod: null,
    enemy: null,
    turn: 'player',
    log: [],
    isPlayerTurn: true,
    combatResult: null
  },
  
  startCombat: (god, enemy) => set({
    phase: 'arena',
    selectedGod: god,
    combatState: {
      playerGod: { ...god },
      enemy: { ...enemy },
      turn: 'player',
      log: [`⚔️ Combat started: ${god.nameTH} vs ${enemy.nameTH}`],
      isPlayerTurn: true,
      combatResult: null
    }
  }),
  
  playerAttack: () => {
    const { combatState, addGold } = get();
    const { playerGod, enemy, log } = combatState;
    if (!playerGod || !enemy) return;
    
    const damage = Math.max(1, playerGod.attack - enemy.defense);
    const newEnemyHp = Math.max(0, enemy.hp - damage);
    const newLog = [...log, `⚔️ ${playerGod.nameTH} สร้างความเสียหาย ${damage}!`];
    
    if (newEnemyHp <= 0) {
      set({
        combatState: {
          ...combatState,
          enemy: { ...enemy, hp: 0 },
          log: newLog,
          combatResult: 'win'
        }
      });
      addGold(100);
    } else {
      set({
        combatState: {
          ...combatState,
          enemy: { ...enemy, hp: newEnemyHp },
          log: newLog,
          isPlayerTurn: false,
          turn: 'enemy'
        }
      });
    }
  },
  
  enemyAttack: () => {
    const { combatState } = get();
    const { playerGod, enemy, log } = combatState;
    if (!playerGod || !enemy) return;
    
    const damage = Math.max(1, enemy.attack - playerGod.defense);
    const newPlayerHp = Math.max(0, playerGod.hp - damage);
    const newLog = [...log, `💥 ${enemy.nameTH} สร้างความเสียหาย ${damage}!`];
    
    if (newPlayerHp <= 0) {
      set({
        combatState: {
          ...combatState,
          playerGod: { ...playerGod, hp: 0 },
          log: newLog,
          combatResult: 'lose'
        }
      });
    } else {
      set({
        combatState: {
          ...combatState,
          playerGod: { ...playerGod, hp: newPlayerHp },
          log: newLog,
          isPlayerTurn: true,
          turn: 'player'
        }
      });
    }
  },
  
  endCombat: (result) => set((state) => ({
    phase: 'shop',
    combatState: { ...state.combatState, combatResult: result }
  })),
  
  // Relationship
  npcs: npcData,
  currentNpc: null,
  currentDialogue: null,
  
  selectNpc: (npc) => set({
    currentNpc: npc,
    currentDialogue: npc.dialogue[0]
  }),
  
  chooseDialogue: (choiceIndex) => {
    const { currentDialogue, changeRelationship, currentNpc } = get();
    if (!currentDialogue || !currentNpc) return;
    
    const choice = currentDialogue.choices[choiceIndex];
    if (!choice) return;
    
    if (choice.bondChange) {
      changeRelationship(currentNpc.id, choice.bondChange);
    }
    
    const nextNode = currentNpc.dialogue.find(d => d.id === choice.nextId);
    set({ currentDialogue: nextNode || null });
  },
  
  closeDialogue: () => set({
    currentNpc: null,
    currentDialogue: null
  })
}));
