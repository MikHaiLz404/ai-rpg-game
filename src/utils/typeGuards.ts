/**
 * ============================================================================
 * Type Guards - Gods' Arena
 * ============================================================================
 * ไฟล์สำหรับ Type Guards เพื่อตรวจสอบประเภทของข้อมูลใน runtime
 * ใช้สำหรับการตรวจสอบ type ก่อนใช้งานจริง
 */

import {
  Item,
  God,
  Enemy,
  NPC,
  DialogueNode,
  DialogueChoice,
  Player,
  SaveData,
  ShopItem,
  InventoryItem,
  CombatState,
  GamePhase,
  ItemType,
  LogType,
  TurnPhase,
  ExplorationNodeType,
  Difficulty,
  GameLog,
} from '../types';

// ==================== BASE TYPE GUARDS ====================

/**
 * ตรวจสอบว่าเป็น string ที่ไม่ว่าง
 * @param value - ค่าที่ต้องการตรวจสอบ
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * ตรวจสอบว่าเป็น positive number
 * @param value - ค่าที่ต้องการตรวจสอบ
 */
export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && value >= 0;
}

/**
 * ตรวจสอบว่าเป็น number ในช่วงที่กำหนด
 * @param value - ค่าที่ต้องการตรวจสอบ
 * @param min - ค่าต่ำสุด
 * @param max - ค่าสูงสุด
 */
export function isNumberInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && value >= min && value <= max;
}

// ==================== ITEM TYPE GUARDS ====================

/**
 * ตรวจสอบว่าเป็น ItemType ที่ถูกต้อง
 * @param type - ค่าที่ต้องการตรวจสอบ
 */
export function isItemType(type: unknown): type is ItemType {
  return typeof type === 'string' && ['weapon', 'armor', 'consumable'].includes(type);
}

/**
 * ตรวจสอบว่าเป็น Item ที่ถูกต้อง
 * @param item - ค่าที่ต้องการตรวจสอบ
 */
export function isItem(item: unknown): item is Item {
  if (!item || typeof item !== 'object') return false;
  
  const obj = item as Record<string, unknown>;
  
  return (
    isNonEmptyString(obj.id) &&
    isNonEmptyString(obj.name) &&
    isNonEmptyString(obj.nameTH) &&
    isNonEmptyString(obj.description) &&
    isPositiveNumber(obj.price) &&
    isItemType(obj.type) &&
    isItemEffect(obj.effect)
  );
}

/**
 * ตรวจสอบว่าเป็น ItemEffect ที่ถูกต้อง
 * @param effect - ค่าที่ต้องการตรวจสอบ
 */
export function isItemEffect(effect: unknown): effect is Item['effect'] {
  if (!effect || typeof effect !== 'object') return false;
  
  const obj = effect as Record<string, unknown>;
  const validKeys = ['hp', 'attack', 'defense', 'mp'];
  
  for (const key of Object.keys(obj)) {
    if (!validKeys.includes(key)) return false;
    if (obj[key] !== undefined && typeof obj[key] !== 'number') return false;
  }
  
  return true;
}

/**
 * ตรวจสอบว่าเป็น ShopItem ที่ถูกต้อง
 * @param item - ค่าที่ต้องการตรวจสอบ
 */
export function isShopItem(item: unknown): item is ShopItem {
  return isItem(item);
}

/**
 * ตรวจสอบว่าเป็น InventoryItem ที่ถูกต้อง
 * @param item - ค่าที่ต้องการตรวจสอบ
 */
export function isInventoryItem(item: unknown): item is InventoryItem {
  if (!item || typeof item !== 'object') return false;
  
  const obj = item as Record<string, unknown>;
  
  return isShopItem(obj.item) && isPositiveNumber(obj.quantity);
}

// ==================== GOD TYPE GUARDS ====================

/**
 * ตรวจสอบว่าเป็น God ที่ถูกต้อง
 * @param god - ค่าที่ต้องการตรวจสอบ
 */
export function isGod(god: unknown): god is God {
  if (!god || typeof god !== 'object') return false;
  
  const obj = god as Record<string, unknown>;
  
  return (
    isNonEmptyString(obj.id) &&
    isNonEmptyString(obj.name) &&
    isNonEmptyString(obj.nameTH) &&
    isNonEmptyString(obj.description) &&
    isPositiveNumber(obj.hp) &&
    isPositiveNumber(obj.maxHp) &&
    isPositiveNumber(obj.attack) &&
    isPositiveNumber(obj.defense) &&
    isNonEmptyString(obj.ability) &&
    isNonEmptyString(obj.abilityTH) &&
    isNonEmptyString(obj.image)
  );
}

/**
 * ตรวจสอบว่า God มี stats ที่ถูกต้อง
 * @param god - ค่าที่ต้องการตรวจสอบ
 */
export function isValidGodStats(god: unknown): god is God {
  if (!isGod(god)) return false;
  
  // ตรวจสอบช่วงของ stats
  const HP_MIN = 50, HP_MAX = 200;
  const ATK_MIN = 5, ATK_MAX = 50;
  const DEF_MIN = 0, DEF_MAX = 30;
  
  return (
    god.hp >= HP_MIN && god.hp <= HP_MAX &&
    god.maxHp >= HP_MIN && god.maxHp <= HP_MAX &&
    god.attack >= ATK_MIN && god.attack <= ATK_MAX &&
    god.defense >= DEF_MIN && god.defense <= DEF_MAX
  );
}

// ==================== ENEMY TYPE GUARDS ====================

/**
 * ตรวจสอบว่าเป็น Enemy ที่ถูกต้อง
 * @param enemy - ค่าที่ต้องการตรวจสอบ
 */
export function isEnemy(enemy: unknown): enemy is Enemy {
  if (!enemy || typeof enemy !== 'object') return false;
  
  const obj = enemy as Record<string, unknown>;
  
  return (
    isNonEmptyString(obj.id) &&
    isNonEmptyString(obj.name) &&
    isNonEmptyString(obj.nameTH) &&
    isPositiveNumber(obj.hp) &&
    isPositiveNumber(obj.maxHp) &&
    isPositiveNumber(obj.attack) &&
    isPositiveNumber(obj.defense) &&
    isNonEmptyString(obj.image)
  );
}

// ==================== DIALOGUE TYPE GUARDS ====================

/**
 * ตรวจสอบว่าเป็น DialogueChoice ที่ถูกต้อง
 * @param choice - ค่าที่ต้องการตรวจสอบ
 */
export function isDialogueChoice(choice: unknown): choice is DialogueChoice {
  if (!choice || typeof choice !== 'object') return false;
  
  const obj = choice as Record<string, unknown>;
  
  return (
    isNonEmptyString(obj.text) &&
    isNonEmptyString(obj.textTH) &&
    isNonEmptyString(obj.nextId)
  );
}

/**
 * ตรวจสอบว่าเป็น DialogueNode ที่ถูกต้อง
 * @param node - ค่าที่ต้องการตรวจสอบ
 */
export function isDialogueNode(node: unknown): node is DialogueNode {
  if (!node || typeof node !== 'object') return false;
  
  const obj = node as Record<string, unknown>;
  
  if (!isNonEmptyString(obj.id) || !isNonEmptyString(obj.text) || !isNonEmptyString(obj.textTH)) {
    return false;
  }
  
  // ตรวจสอบ choices
  if (!Array.isArray(obj.choices)) return false;
  return obj.choices.every(isDialogueChoice);
}

// ==================== NPC TYPE GUARDS ====================

/**
 * ตรวจสอบว่าเป็น NPC ที่ถูกต้อง
 * @param npc - ค่าที่ต้องการตรวจสอบ
 */
export function isNPC(npc: unknown): npc is NPC {
  if (!npc || typeof npc !== 'object') return false;
  
  const obj = npc as Record<string, unknown>;
  
  return (
    isNonEmptyString(obj.id) &&
    isNonEmptyString(obj.name) &&
    isNonEmptyString(obj.nameTH) &&
    isNonEmptyString(obj.description) &&
    isNonEmptyString(obj.image) &&
    Array.isArray(obj.dialogue) &&
    obj.dialogue.every(isDialogueNode)
  );
}

// ==================== PLAYER TYPE GUARDS ====================

/**
 * ตรวจสอบว่าเป็น Player ที่ถูกต้อง
 * @param player - ค่าที่ต้องการตรวจสอบ
 */
export function isPlayer(player: unknown): player is Player {
  if (!player || typeof player !== 'object') return false;
  
  const obj = player as Record<string, unknown>;
  
  if (!isPositiveNumber(obj.gold)) return false;
  
  // items ต้องเป็น array ของ Item
  if (Array.isArray(obj.items) && !obj.items.every(isItem)) return false;
  
  // god ต้องเป็น God หรือ null
  if (obj.god !== null && !isGod(obj.god)) return false;
  
  // relationships ต้องเป็น object
  if (obj.relationships && (typeof obj.relationships !== 'object' || obj.relationships === null)) {
    return false;
  }
  
  return true;
}

// ==================== GAME STATE TYPE GUARDS ====================

/**
 * ตรวจสอบว่าเป็น GamePhase ที่ถูกต้อง
 * @param phase - ค่าที่ต้องการตรวจสอบ
 */
export function isGamePhase(phase: unknown): phase is GamePhase {
  const validPhases = ['start', 'shop', 'arena', 'combat', 'relationship', 'exploration', 'victory', 'defeat'];
  return typeof phase === 'string' && validPhases.includes(phase);
}

/**
 * ตรวจสอบว่าเป็น TurnPhase ที่ถูกต้อง
 * @param turn - ค่าที่ต้องการตรวจสอบ
 */
export function isTurnPhase(turn: unknown): turn is TurnPhase {
  return turn === 'player' || turn === 'enemy';
}

/**
 * ตรวจสอบว่าเป็น LogType ที่ถูกต้อง
 * @param type - ค่าที่ต้องการตรวจสอบ
 */
export function isLogType(type: unknown): type is LogType {
  return ['player', 'enemy', 'system', 'npc', 'narrative'].includes(type as string);
}

/**
 * ตรวจสอบว่าเป็น GameLog ที่ถูกต้อง
 * @param log - ค่าที่ต้องการตรวจสอบ
 */
export function isGameLog(log: unknown): log is GameLog {
  if (!log || typeof log !== 'object') return false;
  
  const obj = log as Record<string, unknown>;
  
  return (
    isNonEmptyString(obj.message) &&
    isLogType(obj.type) &&
    typeof obj.timestamp === 'number'
  );
}

/**
 * ตรวจสอบว่าเป็น CombatState ที่ถูกต้อง
 * @param state - ค่าที่ต้องการตรวจสอบ
 */
export function isCombatState(state: unknown): state is CombatState {
  if (!state || typeof state !== 'object') return false;
  
  const obj = state as Record<string, unknown>;
  
  // playerGod ต้องเป็น God หรือ null
  if (obj.playerGod !== null && !isGod(obj.playerGod)) return false;
  
  // enemy ต้องเป็น Enemy หรือ null
  if (obj.enemy !== null && !isEnemy(obj.enemy)) return false;
  
  return isTurnPhase(obj.turn) && Array.isArray(obj.log);
}

// ==================== EXPLORATION TYPE GUARDS ====================

/**
 * ตรวจสอบว่าเป็น ExplorationNodeType ที่ถูกต้อง
 * @param type - ค่าที่ต้องการตรวจสอบ
 */
export function isExplorationNodeType(type: unknown): type is ExplorationNodeType {
  return ['enemy', 'treasure', 'mystery', 'rest', 'boss'].includes(type as string);
}

/**
 * ตรวจสอบว่าเป็น Difficulty ที่ถูกต้อง
 * @param difficulty - ค่าที่ต้องการตรวจสอบ
 */
export function isDifficulty(difficulty: unknown): difficulty is Difficulty {
  return isNumberInRange(difficulty, 1, 5);
}

// ==================== SAVE DATA TYPE GUARDS ====================

/**
 * ตรวจสอบว่าเป็น SaveData ที่ถูกต้อง
 * @param data - ค่าที่ต้องการตรวจสอบ
 */
export function isSaveData(data: unknown): data is SaveData {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  
  // ตรวจสอบ version
  if (!isNonEmptyString(obj.version)) return false;
  
  // ตรวจสอบ timestamp
  if (typeof obj.timestamp !== 'number' || obj.timestamp < 0) return false;
  
  // ตรวจสอบ player
  if (!isPlayer(obj.player)) return false;
  
  // ตรวจสอบ phase
  if (!isGamePhase(obj.phase)) return false;
  
  // ตรวจสอบ stats
  if (!isPositiveNumber(obj.playCount)) return false;
  if (!isPositiveNumber(obj.winCount)) return false;
  if (!isPositiveNumber(obj.loseCount)) return false;
  if (!isPositiveNumber(obj.totalPlayTime)) return false;
  
  return true;
}

/**
 * ตรวจสอบว่าเป็น SaveData version ที่รองรับ
 * @param data - ค่าที่ต้องการตรวจสอบ
 */
export function isSupportedSaveDataVersion(data: unknown): data is SaveData {
  if (!isSaveData(data)) return false;
  
  const SUPPORTED_VERSIONS = ['1.0.0', '1.0.1'];
  return SUPPORTED_VERSIONS.includes(data.version);
}

// ==================== UTILITY TYPE GUARDS ====================

/**
 * ตรวจสอบว่าเป็น array ที่ไม่ว่าง
 * @param arr - ค่าที่ต้องการตรวจสอบ
 */
export function isNonEmptyArray(arr: unknown): arr is unknown[] {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * ตรวจสอบว่าเป็น object ที่ไม่ใช่ null
 * @param obj - ค่าที่ต้องการตรวจสอบ
 */
export function isObject(obj: unknown): obj is Record<string, unknown> {
  return obj !== null && typeof obj === 'object';
}

/**
 * Safe cast เป็น Item ถ้าผ่าน type guard
 * @param value - ค่าที่ต้องการ cast
 */
export function asItem(value: unknown): Item | null {
  return isItem(value) ? value : null;
}

/**
 * Safe cast เป็น God ถ้าผ่าน type guard
 * @param value - ค่าที่ต้องการ cast
 */
export function asGod(value: unknown): God | null {
  return isGod(value) ? value : null;
}

/**
 * Safe cast เป็น Enemy ถ้าผ่าน type guard
 * @param value - ค่าที่ต้องการ cast
 */
export function asEnemy(value: unknown): Enemy | null {
  return isEnemy(value) ? value : null;
}

/**
 * Safe cast เป็น NPC ถ้าผ่าน type guard
 * @param value - ค่าที่ต้องการ cast
 */
export function asNPC(value: unknown): NPC | null {
  return isNPC(value) ? value : null;
}

/**
 * Safe cast เป็น Player ถ้าผ่าน type guard
 * @param value - ค่าที่ต้องการ cast
 */
export function asPlayer(value: unknown): Player | null {
  return isPlayer(value) ? value : null;
}

/**
 * Safe cast เป็น SaveData ถ้าผ่าน type guard
 * @param value - ค่าที่ต้องการ cast
 */
export function asSaveData(value: unknown): SaveData | null {
  return isSaveData(value) ? value : null;
}

/**
 * Filter array ให้เหลือเฉพาะ Item
 * @param arr - array ที่ต้องการ filter
 */
export function filterItems(arr: unknown[]): Item[] {
  return arr.filter(isItem);
}

/**
 * Filter array ให้เหลือเฉพาะ God
 * @param arr - array ที่ต้องการ filter
 */
export function filterGods(arr: unknown[]): God[] {
  return arr.filter(isGod);
}

/**
 * Filter array ให้เหลือเฉพาะ Enemy
 * @param arr - array ที่ต้องการ filter
 */
export function filterEnemies(arr: unknown[]): Enemy[] {
  return arr.filter(isEnemy);
}

/**
 * Filter array ให้เหลือเฉพาะ NPC
 * @param arr - array ที่ต้องการ filter
 */
export function filterNPCs(arr: unknown[]): NPC[] {
  return arr.filter(isNPC);
}
