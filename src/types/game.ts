// Base Types
export interface Player {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  mp: number;
  maxMp: number;
  gold: number;
  level: number;
  exp: number;
  expToNextLevel: number;
}

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  exp: number;
  gold: number;
  rank: number; // God rank (1-10)
}

export type ActionType = 'attack' | 'defend' | 'heal' | 'fireball';

export interface GameLog {
  message: string;
  type: 'player' | 'enemy' | 'system' | 'narrative';
  timestamp: number;
}

// Game Phase Types
export type GamePhase = 'start' | 'arena' | 'exploration' | 'shop' | 'relationship' | 'combat' | 'victory' | 'defeat';
export type TurnPhase = 'player' | 'enemy';

// ==================== ARENA TYPES ====================
export interface ArenaMatch {
  id: string;
  playerGod: Player;
  enemyGod: Enemy;
  round: number;
  maxRounds: number;
  playerScore: number;
  enemyScore: number;
  status: 'waiting' | 'in_progress' | 'completed';
}

export interface ArenaResult {
  winner: 'player' | 'enemy' | 'draw';
  roundsWon: number;
  expGained: number;
  goldGained: number;
}

// ==================== SHOP TYPES ====================
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'potion' | 'accessory';
  price: number;
  effect: {
    hp?: number;
    atk?: number;
    def?: number;
    mp?: number;
  };
}

export interface InventoryItem {
  item: ShopItem;
  quantity: number;
}

// ==================== EXPLORATION TYPES ====================
export interface ExplorationNode {
  id: string;
  name: string;
  description: string;
  type: 'enemy' | 'treasure' | 'mystery' | 'rest' | 'boss';
  difficulty: 1 | 2 | 3 | 4 | 5;
  visited: boolean;
  rewards?: {
    exp?: number;
    gold?: number;
    item?: ShopItem;
  };
}

export interface ExplorationMap {
  nodes: ExplorationNode[];
  currentNodeId: string | null;
  totalNodes: number;
  visitedCount: number;
}

// ==================== RELATIONSHIP TYPES ====================
export interface Companion {
  id: string;
  name: string;
  title: string;
  image: string;
  description: string;
  affinity: number; // 0-100
  maxAffinity: number;
  unlocked: boolean;
  quests: CompanionQuest[];
}

export interface CompanionQuest {
  id: string;
  title: string;
  description: string;
  requiredAffinity: number;
  rewards: {
    exp: number;
    gold: number;
    affinity: number;
  };
  completed: boolean;
}

export interface RelationshipEvent {
  id: string;
  companionId: string;
  type: 'gift' | 'talk' | 'quest' | 'date';
  description: string;
  affinityChange: number;
}

// ==================== MAIN GAME STATE ====================
export interface GameData {
  player: Player;
  currentEnemy: Enemy | null;
  phase: GamePhase;
  subPhase?: string;
  logs: GameLog[];
  turn: TurnPhase;
  battleCount: number;
  
  // Phase-specific data
  arena?: ArenaMatch;
  shop?: {
    items: ShopItem[];
    inventory: InventoryItem[];
  };
  exploration?: ExplorationMap;
  companions?: Companion[];
}
