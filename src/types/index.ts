/**
 * ============================================================================
 * Types Index - Gods' Arena
 * ============================================================================
 * ไฟล์หลักสำหรับ TypeScript types ทั้งหมดของเกม
 * รวม types สำหรับ Player, God, Enemy, Item, NPC, Dialogue และ Game State
 */

// ==================== BASE TYPES ====================

/** ระดับความยากของ node ในแผนที่ */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

/** ประเภทของไอเทม */
export type ItemType = 'weapon' | 'armor' | 'consumable';

/** ประเภทของ NPC */
export type NpcType = 'merchant' | 'companion' | 'story';

/** เฟสหลักของเกม */
export type GamePhase = 
  | 'start' 
  | 'shop' 
  | 'arena' 
  | 'combat' 
  | 'relationship' 
  | 'exploration'
  | 'victory' 
  | 'defeat'
  | 'loading';

/** ผลลัพธ์ของ combat */
export type CombatResult = 'win' | 'lose' | 'draw' | null;

/** ฝั่งที่เล่นในตานั้นๆ */
export type TurnPhase = 'player' | 'enemy';

/** ประเภทของ action ใน combat */
export type ActionType = 'attack' | 'defend' | 'heal' | 'skill';

/** ประเภทของ log message */
export type LogType = 'player' | 'enemy' | 'system' | 'npc' | 'narrative';

/** สถานะของ arena match */
export type ArenaStatus = 'waiting' | 'in_progress' | 'completed';

/** ประเภทของ exploration node */
export type ExplorationNodeType = 'enemy' | 'treasure' | 'mystery' | 'rest' | 'boss';

/** ประเภทของ relationship event */
export type RelationshipEventType = 'gift' | 'talk' | 'quest' | 'date';

// ==================== PLAYER TYPES ====================

/** Player interface หลัก */
export interface Player {
  /** จำนวนเงินทอง */
  gold: number;
  /** ไอเทมที่มี */
  items: Item[];
  /** เทพที่เลือก */
  god: God | null;
  /** ความสัมพันธ์กับ NPC (npcId -> bond value) */
  relationships: Record<string, number>;
}

/** Player แบบละเอียด (สำหรับ RPG) */
export interface PlayerDetailed {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  mp: number;
  maxMp: number;
  gold: number;
  level: number;
  exp: number;
  expToNextLevel: number;
}

// ==================== GOD TYPES ====================

/** God (เทพ) interface */
export interface God {
  id: string;
  name: string;
  nameTH: string;
  description: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  ability: string;
  abilityTH: string;
  image: string;
}

/** God Stats - ใช้สำหรับ validation ranges */
export const GOD_STATS = {
  /** HP ขั้นต่ำ */
  MIN_HP: 50,
  /** HP สูงสุด */
  MAX_HP: 200,
  /** ATK ขั้นต่ำ */
  MIN_ATK: 5,
  /** ATK สูงสุด */
  MAX_ATK: 50,
  /** DEF ขั้นต่ำ */
  MIN_DEF: 0,
  /** DEF สูงสุด */
  MAX_DEF: 30,
} as const;

// ==================== ENEMY TYPES ====================

/** Enemy interface */
export interface Enemy {
  id: string;
  name: string;
  nameTH: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  image: string;
  /** Rank ของศัตรู (1-10) */
  rank?: number;
  /** EXP ที่ได้รับ */
  exp?: number;
  /** เงินทองที่ดร็อป */
  gold?: number;
}

// ==================== ITEM TYPES ====================

/** Item effect */
export interface ItemEffect {
  hp?: number;
  attack?: number;
  defense?: number;
  mp?: number;
}

/** Item interface */
export interface Item {
  id: string;
  name: string;
  nameTH: string;
  description: string;
  price: number;
  type: ItemType;
  effect: ItemEffect;
}

/** Item Stats - ใช้สำหรับ validation ranges */
export const ITEM_STATS = {
  /** ราคาขั้นต่ำ */
  MIN_PRICE: 1,
  /** ราคาสูงสุด */
  MAX_PRICE: 9999,
  /** effect value ขั้นต่ำ */
  MIN_EFFECT: 1,
  /** effect value สูงสุด */
  MAX_EFFECT: 100,
} as const;

// ==================== NPC & DIALOGUE TYPES ====================

/** Dialogue choice */
export interface DialogueChoice {
  text: string;
  textTH: string;
  nextId: string;
  /** การเปลี่ยนแปลงความสัมพันธ์ */
  bondChange?: number;
  /** ไอเทมที่ต้องการ */
  requiredItem?: string;
  /** ไอเทมที่ได้รับ */
  rewardItem?: string;
}

/** Dialogue node */
export interface DialogueNode {
  id: string;
  text: string;
  textTH: string;
  choices: DialogueChoice[];
  /** condition สำหรับแสดง dialogue นี้ */
  condition?: DialogueCondition;
}

/** Dialogue condition */
export interface DialogueCondition {
  /** relationship ขั้นต่ำ */
  minRelationship?: number;
  /** ต้องมีไอเทม */
  requiredItem?: string;
  /** phase ที่ต้องเป็น */
  requiredPhase?: GamePhase;
}

/** NPC interface */
export interface NPC {
  id: string;
  name: string;
  nameTH: string;
  description: string;
  image: string;
  /** ประเภท NPC */
  type?: NpcType;
  dialogue: DialogueNode[];
}

// ==================== COMBAT TYPES ====================

/** Combat state */
export interface CombatState {
  playerGod: God | null;
  enemy: Enemy | null;
  turn: TurnPhase;
  log: string[];
  isPlayerTurn: boolean;
  combatResult: CombatResult;
}

/** Combat log entry */
export interface GameLog {
  message: string;
  type: LogType;
  timestamp: number;
}

// ==================== ARENA TYPES ====================

/** Arena match */
export interface ArenaMatch {
  id: string;
  playerGod: God;
  enemy: Enemy;
  round: number;
  maxRounds: number;
  playerScore: number;
  enemyScore: number;
  status: ArenaStatus;
}

/** Arena result */
export interface ArenaResult {
  winner: 'player' | 'enemy' | 'draw';
  roundsWon: number;
  expGained: number;
  goldGained: number;
}

// ==================== SHOP TYPES ====================

/** Shop item (แบบละเอียด) */
export interface ShopItem {
  id: string;
  name: string;
  nameTH: string;
  description: string;
  type: ItemType;
  price: number;
  effect: ItemEffect;
  /** จำนวนใน stock */
  stock?: number;
  /** ซื้อได้กี่ครั้งต่อวัน */
  dailyLimit?: number;
}

/** Inventory item */
export interface InventoryItem {
  item: ShopItem;
  quantity: number;
}

// ==================== EXPLORATION TYPES ====================

/** Exploration node rewards */
export interface ExplorationRewards {
  exp?: number;
  gold?: number;
  item?: ShopItem;
}

/** Exploration node */
export interface ExplorationNode {
  id: string;
  name: string;
  nameTH: string;
  description: string;
  type: ExplorationNodeType;
  difficulty: Difficulty;
  visited: boolean;
  rewards?: ExplorationRewards;
}

/** Exploration map */
export interface ExplorationMap {
  nodes: ExplorationNode[];
  currentNodeId: string | null;
  totalNodes: number;
  visitedCount: number;
}

// ==================== RELATIONSHIP TYPES ====================

/** Companion quest */
export interface CompanionQuest {
  id: string;
  title: string;
  titleTH: string;
  description: string;
  descriptionTH: string;
  requiredAffinity: number;
  rewards: {
    exp: number;
    gold: number;
    affinity: number;
  };
  completed: boolean;
}

/** Companion */
export interface Companion {
  id: string;
  name: string;
  nameTH: string;
  title: string;
  titleTH: string;
  image: string;
  description: string;
  descriptionTH: string;
  affinity: number;
  maxAffinity: number;
  unlocked: boolean;
  quests: CompanionQuest[];
}

/** Relationship event */
export interface RelationshipEvent {
  id: string;
  companionId: string;
  type: RelationshipEventType;
  description: string;
  descriptionTH: string;
  affinityChange: number;
}

// ==================== SAVE DATA TYPES ====================

/** Save data interface */
export interface SaveData {
  version: string;
  timestamp: number;
  player: Player;
  phase: GamePhase;
  /** จำนวนครั้งที่เล่น */
  playCount: number;
  /** จำนวนชนะ */
  winCount: number;
  /** จำนวนแพ้ */
  loseCount: number;
  /** เวลาเล่นรวม (วินาที) */
  totalPlayTime: number;
}

/** Save data version */
export const SAVE_DATA_VERSION = '1.0.0';

/** Save data Stats - ใช้สำหรับ validation */
export const SAVE_STATS = {
  /** version ที่รองรับ */
  SUPPORTED_VERSIONS: ['1.0.0', '1.0.1'],
  /** playCount สูงสุด */
  MAX_PLAY_COUNT: 99999,
  /** winCount สูงสุด */
  MAX_WIN_COUNT: 99999,
  /** loseCount สูงสุด */
  MAX_LOSE_COUNT: 99999,
  /** totalPlayTime สูงสุด (1 ปีในวินาที) */
  MAX_PLAY_TIME: 31536000,
} as const;

// ==================== GAME STATE TYPES ====================

/** Shop state */
export interface ShopState {
  items: ShopItem[];
  inventory: InventoryItem[];
}

/** Game data หลัก */
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
  shop?: ShopState;
  exploration?: ExplorationMap;
  companions?: Companion[];
}
