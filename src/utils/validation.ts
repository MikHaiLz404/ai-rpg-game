/**
 * ============================================================================
 * Validation Utils - Gods' Arena
 * ============================================================================
 * ไฟล์สำหรับ utilities ตรวจสอบความถูกต้องของข้อมูล
 * รวม validation สำหรับ Item, God, Dialogue, Save Data
 */

import {
  Item,
  God,
  Enemy,
  NPC,
  DialogueNode,
  DialogueChoice,
  SaveData,
  Player,
  PlayerState,
  GOD_STATS,
  ITEM_STATS,
  SAVE_STATS,
} from '../types';

// ==================== ERROR CLASSES ====================

/** Error สำหรับ validation ที่ไม่ผ่าน */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/** Error สำหรับ version ไม่ตรงกัน */
export class SaveDataVersionError extends Error {
  constructor(
    message: string,
    public expected: string,
    public actual: string
  ) {
    super(message);
    this.name = 'SaveDataVersionError';
  }
}

// ==================== VALIDATION RESULT ====================

/** ผลลัพธ์การ validate */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

/**
 * สร้าง ValidationResult สำเร็จ
 */
export function createValidResult(): ValidationResult {
  return { valid: true, errors: [], warnings: [] };
}

/**
 * เพิ่ม error ให้ ValidationResult
 */
export function addError(
  result: ValidationResult,
  message: string,
  field?: string,
  value?: unknown
): ValidationResult {
  return {
    valid: false,
    errors: [...result.errors, new ValidationError(message, field, value)],
    warnings: result.warnings,
  };
}

/**
 * เพิ่ม warning ให้ ValidationResult
 */
export function addWarning(
  result: ValidationResult,
  message: string
): ValidationResult {
  return {
    valid: result.valid,
    errors: result.errors,
    warnings: [...result.warnings, message],
  };
}

// ==================== ITEM VALIDATION ====================

/**
 * ตรวจสอบว่า price ถูกต้องหรือไม่
 * @param price - ราคาสินค้า
 */
export function validatePrice(price: number): ValidationResult {
  const result = createValidResult();

  if (typeof price !== 'number') {
    return addError(result, 'ราคาต้องเป็นตัวเลข', 'price', price);
  }

  if (price < ITEM_STATS.MIN_PRICE) {
    return addError(
      result,
      `ราคาต้องไม่ต่ำกว่า ${ITEM_STATS.MIN_PRICE}`,
      'price',
      price
    );
  }

  if (price > ITEM_STATS.MAX_PRICE) {
    return addWarning(
      result,
      `ราคาสูงเกินไป (แนะนำไม่เกิน ${ITEM_STATS.MAX_PRICE})`
    );
  }

  return result;
}

/**
 * ตรวจสอบว่า item effect ถูกต้องหรือไม่
 * @param effect - effect ของไอเทม
 */
export function validateItemEffect(effect: Item['effect']): ValidationResult {
  const result = createValidResult();

  if (!effect || typeof effect !== 'object') {
    return addError(result, 'Effect ต้องเป็น object', 'effect', effect);
  }

  // ตรวจสอบแต่ละ effect property
  const effectKeys = ['hp', 'attack', 'defense', 'mp'] as const;
  
  for (const key of effectKeys) {
    const value = effect[key];
    
    if (value !== undefined) {
      if (typeof value !== 'number') {
        return addError(result, `${key} ต้องเป็นตัวเลข`, `effect.${key}`, value);
      }

      if (value < ITEM_STATS.MIN_EFFECT) {
        return addError(
          result,
          `${key} effect ต้องไม่ต่ำกว่า ${ITEM_STATS.MIN_EFFECT}`,
          `effect.${key}`,
          value
        );
      }

      if (value > ITEM_STATS.MAX_EFFECT) {
        return addWarning(
          result,
          `${key} effect สูงเกินไป (แนะนำไม่เกิน ${ITEM_STATS.MAX_EFFECT})`
        );
      }
    }
  }

  // ตรวจสอบว่ามี effect อย่างน้อย 1 อย่าง
  const hasEffect = effectKeys.some((key) => effect[key] !== undefined);
  if (!hasEffect) {
    return addError(result, 'ต้องมี effect อย่างน้อย 1 อย่าง', 'effect', effect);
  }

  return result;
}

/**
 * ตรวจสอบความถูกต้องของ Item
 * @param item - ไอเทมที่ต้องการตรวจสอบ
 */
export function validateItem(item: Item): ValidationResult {
  const result = createValidResult();

  // ตรวจสอบ id
  if (!item.id || typeof item.id !== 'string') {
    return addError(result, 'Item ต้องมี id', 'id', item.id);
  }

  // ตรวจสอบ name
  if (!item.name || typeof item.name !== 'string') {
    return addError(result, 'Item ต้องมี name', 'name', item.name);
  }

  // ตรวจสอบ nameTH
  if (!item.nameTH || typeof item.nameTH !== 'string') {
    return addError(result, 'Item ต้องมี nameTH', 'nameTH', item.nameTH);
  }

  // ตรวจสอบ description
  if (!item.description || typeof item.description !== 'string') {
    return addError(result, 'Item ต้องมี description', 'description', item.description);
  }

  // ตรวจสอบ price
  const priceResult = validatePrice(item.price);
  if (!priceResult.valid) {
    return priceResult;
  }

  // ตรวจสอบ type
  const validTypes = ['weapon', 'armor', 'consumable'];
  if (!validTypes.includes(item.type)) {
    return addError(
      result,
      `Item type ต้องเป็นหนึ่งใน: ${validTypes.join(', ')}`,
      'type',
      item.type
    );
  }

  // ตรวจสอบ effect
  const effectResult = validateItemEffect(item.effect);
  if (!effectResult.valid) {
    return effectResult;
  }

  // เพิ่ม warnings จาก effect
  for (const warning of effectResult.warnings) {
    result.warnings.push(warning);
  }

  return result;
}

// ==================== GOD VALIDATION ====================

/**
 * ตรวจสอบว่า HP อยู่ในช่วงที่ถูกต้อง
 * @param hp - ค่า HP
 * @param field - ชื่อ field (สำหรับ error message)
 */
export function validateHp(hp: number, field: string = 'hp'): ValidationResult {
  const result = createValidResult();

  if (typeof hp !== 'number') {
    return addError(result, 'HP ต้องเป็นตัวเลข', field, hp);
  }

  if (hp < GOD_STATS.MIN_HP) {
    return addError(
      result,
      `HP ต้องไม่ต่ำกว่า ${GOD_STATS.MIN_HP}`,
      field,
      hp
    );
  }

  if (hp > GOD_STATS.MAX_HP) {
    return addWarning(result, `HP สูงเกินไป (แนะนำไม่เกิน ${GOD_STATS.MAX_HP})`);
  }

  return result;
}

/**
 * ตรวจสอบว่า ATK อยู่ในช่วงที่ถูกต้อง
 * @param atk - ค่า ATK
 * @param field - ชื่อ field (สำหรับ error message)
 */
export function validateAtk(atk: number, field: string = 'attack'): ValidationResult {
  const result = createValidResult();

  if (typeof atk !== 'number') {
    return addError(result, 'ATK ต้องเป็นตัวเลข', field, atk);
  }

  if (atk < GOD_STATS.MIN_ATK) {
    return addError(
      result,
      `ATK ต้องไม่ต่ำกว่า ${GOD_STATS.MIN_ATK}`,
      field,
      atk
    );
  }

  if (atk > GOD_STATS.MAX_ATK) {
    return addWarning(result, `ATK สูงเกินไป (แนะนำไม่เกิน ${GOD_STATS.MAX_ATK})`);
  }

  return result;
}

/**
 * ตรวจสอบว่า DEF อยู่ในช่วงที่ถูกต้อง
 * @param def - ค่า DEF
 * @param field - ชื่อ field (สำหรับ error message)
 */
export function validateDef(def: number, field: string = 'defense'): ValidationResult {
  const result = createValidResult();

  if (typeof def !== 'number') {
    return addError(result, 'DEF ต้องเป็นตัวเลข', field, def);
  }

  if (def < GOD_STATS.MIN_DEF) {
    return addError(
      result,
      `DEF ต้องไม่ต่ำกว่า ${GOD_STATS.MIN_DEF}`,
      field,
      def
    );
  }

  if (def > GOD_STATS.MAX_DEF) {
    return addWarning(result, `DEF สูงเกินไป (แนะนำไม่เกิน ${GOD_STATS.MAX_DEF})`);
  }

  return result;
}

/**
 * ตรวจสอบความถูกต้องของ God stats
 * @param god - God object ที่ต้องการตรวจสอบ
 */
export function validateGodStats(god: God): ValidationResult {
  const result = createValidResult();

  // ตรวจสอบ HP
  const hpResult = validateHp(god.hp, 'hp');
  if (!hpResult.valid) return hpResult;
  result.warnings.push(...hpResult.warnings);

  // ตรวจสอบ maxHp
  const maxHpResult = validateHp(god.maxHp, 'maxHp');
  if (!maxHpResult.valid) return maxHpResult;
  result.warnings.push(...maxHpResult.warnings);

  // ตรวจสอบว่า hp ไม่เกิน maxHp
  if (god.hp > god.maxHp) {
    return addWarning(result, 'HP ควรไม่เกิน maxHp');
  }

  // ตรวจสอบ attack
  const atkResult = validateAtk(god.attack, 'attack');
  if (!atkResult.valid) return atkResult;
  result.warnings.push(...atkResult.warnings);

  // ตรวจสอบ defense
  const defResult = validateDef(god.defense, 'defense');
  if (!defResult.valid) return defResult;
  result.warnings.push(...defResult.warnings);

  return result;
}

/**
 * ตรวจสอบความถูกต้องของ God ทั้งหมด
 * @param god - God ที่ต้องการตรวจสอบ
 */
export function validateGod(god: God): ValidationResult {
  const result = createValidResult();

  // ตรวจสอบ id
  if (!god.id || typeof god.id !== 'string') {
    return addError(result, 'God ต้องมี id', 'id', god.id);
  }

  // ตรวจสอบ name
  if (!god.name || typeof god.name !== 'string') {
    return addError(result, 'God ต้องมี name', 'name', god.name);
  }

  // ตรวจสอบ nameTH
  if (!god.nameTH || typeof god.nameTH !== 'string') {
    return addError(result, 'God ต้องมี nameTH', 'nameTH', god.nameTH);
  }

  // ตรวจสอบ description
  if (!god.description || typeof god.description !== 'string') {
    return addError(result, 'God ต้องมี description', 'description', god.description);
  }

  // ตรวจสอบ ability
  if (!god.ability || typeof god.ability !== 'string') {
    return addError(result, 'God ต้องมี ability', 'ability', god.ability);
  }

  // ตรวจสอบ abilityTH
  if (!god.abilityTH || typeof god.abilityTH !== 'string') {
    return addError(result, 'God ต้องมี abilityTH', 'abilityTH', god.abilityTH);
  }

  // ตรวจสอบ image
  if (!god.image || typeof god.image !== 'string') {
    return addError(result, 'God ต้องมี image', 'image', god.image);
  }

  // ตรวจสอบ stats
  const statsResult = validateGodStats(god);
  if (!statsResult.valid) return statsResult;
  result.warnings.push(...statsResult.warnings);

  return result;
}

// ==================== ENEMY VALIDATION ====================

/**
 * ตรวจสอบความถูกต้องของ Enemy
 * @param enemy - Enemy ที่ต้องการตรวจสอบ
 */
export function validateEnemy(enemy: Enemy): ValidationResult {
  const result = createValidResult();

  // ตรวจสอบ id
  if (!enemy.id || typeof enemy.id !== 'string') {
    return addError(result, 'Enemy ต้องมี id', 'id', enemy.id);
  }

  // ตรวจสอบ name
  if (!enemy.name || typeof enemy.name !== 'string') {
    return addError(result, 'Enemy ต้องมี name', 'name', enemy.name);
  }

  // ตรวจสอบ nameTH
  if (!enemy.nameTH || typeof enemy.nameTH !== 'string') {
    return addError(result, 'Enemy ต้องมี nameTH', 'nameTH', enemy.nameTH);
  }

  // ตรวจสอบ hp
  const hpResult = validateHp(enemy.hp, 'hp');
  if (!hpResult.valid) return hpResult;

  // ตรวจสอบ maxHp
  const maxHpResult = validateHp(enemy.maxHp, 'maxHp');
  if (!maxHpResult.valid) return maxHpResult;

  // ตรวจสอบ attack
  const atkResult = validateAtk(enemy.attack, 'attack');
  if (!atkResult.valid) return atkResult;

  // ตรวจสอบ defense
  const defResult = validateDef(enemy.defense, 'defense');
  if (!defResult.valid) return defResult;

  // ตรวจสอบ image
  if (!enemy.image || typeof enemy.image !== 'string') {
    return addError(result, 'Enemy ต้องมี image', 'image', enemy.image);
  }

  return result;
}

// ==================== DIALOGUE VALIDATION ====================

/**
 * ตรวจสอบความถูกต้องของ DialogueChoice
 * @param choice - DialogueChoice ที่ต้องการตรวจสอบ
 * @param nodeId - ID ของ parent node (สำหรับ error message)
 */
export function validateDialogueChoice(
  choice: DialogueChoice,
  nodeId: string
): ValidationResult {
  const result = createValidResult();

  // ตรวจสอบ text
  if (!choice.text || typeof choice.text !== 'string') {
    return addError(result, `Choice ใน node ${nodeId} ต้องมี text`, 'text', choice.text);
  }

  // ตรวจสอบ textTH
  if (!choice.textTH || typeof choice.textTH !== 'string') {
    return addError(result, `Choice ใน node ${nodeId} ต้องมี textTH`, 'textTH', choice.textTH);
  }

  // ตรวจสอบ nextId
  if (!choice.nextId || typeof choice.nextId !== 'string') {
    return addError(result, `Choice ใน node ${nodeId} ต้องมี nextId`, 'nextId', choice.nextId);
  }

  // ตรวจสอบ bondChange (optional)
  if (choice.bondChange !== undefined && typeof choice.bondChange !== 'number') {
    return addWarning(result, `bondChange ควรเป็นตัวเลข`);
  }

  return result;
}

/**
 * ตรวจสอบความถูกต้องของ DialogueNode
 * @param node - DialogueNode ที่ต้องการตรวจสอบ
 */
export function validateDialogueNode(node: DialogueNode): ValidationResult {
  const result = createValidResult();

  // ตรวจสอบ id
  if (!node.id || typeof node.id !== 'string') {
    return addError(result, 'DialogueNode ต้องมี id', 'id', node.id);
  }

  // ตรวจสอบ text
  if (!node.text || typeof node.text !== 'string') {
    return addError(result, `Node ${node.id} ต้องมี text`, 'text', node.text);
  }

  // ตรวจสอบ textTH
  if (!node.textTH || typeof node.textTH !== 'string') {
    return addError(result, `Node ${node.id} ต้องมี textTH`, 'textTH', node.textTH);
  }

  // ตรวจสอบ choices
  if (!Array.isArray(node.choices)) {
    return addError(result, `Node ${node.id} ต้องมี choices เป็น array`, 'choices', node.choices);
  }

  if (node.choices.length === 0) {
    return addWarning(result, `Node ${node.id} ไม่มี choices (อาจเป็น terminal node)`);
  }

  // ตรวจสอบแต่ละ choice
  for (let i = 0; i < node.choices.length; i++) {
    const choiceResult = validateDialogueChoice(node.choices[i], node.id);
    if (!choiceResult.valid) return choiceResult;
    result.warnings.push(...choiceResult.warnings);
  }

  return result;
}

/**
 * ตรวจสอบความถูกต้องของ Dialogue ทั้งหมด (graph structure)
 * @param dialogue - Array ของ DialogueNode
 */
export function validateDialogue(dialogue: DialogueNode[]): ValidationResult {
  const result = createValidResult();

  // ตรวจสอบว่าเป็น array
  if (!Array.isArray(dialogue)) {
    return addError(result, 'Dialogue ต้องเป็น array', 'dialogue', dialogue);
  }

  if (dialogue.length === 0) {
    return addError(result, 'Dialogue ต้องมีอย่างน้อย 1 node', 'dialogue', dialogue);
  }

  // ตรวจสอบแต่ละ node
  const nodeIds = new Set<string>();
  for (const node of dialogue) {
    // ตรวจสอบโครงสร้าง node
    const nodeResult = validateDialogueNode(node);
    if (!nodeResult.valid) return nodeResult;
    result.warnings.push(...nodeResult.warnings);

    // ตรวจสอบ duplicate id
    if (nodeIds.has(node.id)) {
      return addError(result, `มี node id ซ้ำกัน: ${node.id}`, 'id', node.id);
    }
    nodeIds.add(node.id);
  }

  // ตรวจสอบว่า node ที่อ้างอิงใน nextId มีอยู่จริง
  for (const node of dialogue) {
    for (const choice of node.choices) {
      // ข้าม 'end' หรือ null
      if (choice.nextId && choice.nextId !== 'end' && !nodeIds.has(choice.nextId)) {
        result.warnings.push(
          `Node ${node.id} อ้างอิงถึง node ที่ไม่มีอยู่: ${choice.nextId}`
        );
      }
    }
  }

  return result;
}

/**
 * ตรวจสอบความถูกต้องของ NPC
 * @param npc - NPC ที่ต้องการตรวจสอบ
 */
export function validateNPC(npc: NPC): ValidationResult {
  const result = createValidResult();

  // ตรวจสอบ id
  if (!npc.id || typeof npc.id !== 'string') {
    return addError(result, 'NPC ต้องมี id', 'id', npc.id);
  }

  // ตรวจสอบ name
  if (!npc.name || typeof npc.name !== 'string') {
    return addError(result, 'NPC ต้องมี name', 'name', npc.name);
  }

  // ตรวจสอบ nameTH
  if (!npc.nameTH || typeof npc.nameTH !== 'string') {
    return addError(result, 'NPC ต้องมี nameTH', 'nameTH', npc.nameTH);
  }

  // ตรวจสอบ description
  if (!npc.description || typeof npc.description !== 'string') {
    return addError(result, 'NPC ต้องมี description', 'description', npc.description);
  }

  // ตรวจสอบ image
  if (!npc.image || typeof npc.image !== 'string') {
    return addError(result, 'NPC ต้องมี image', 'image', npc.image);
  }

  // ตรวจสอบ dialogue
  if (!Array.isArray(npc.dialogue)) {
    return addError(result, 'NPC ต้องมี dialogue เป็น array', 'dialogue', npc.dialogue);
  }

  const dialogueResult = validateDialogue(npc.dialogue);
  if (!dialogueResult.valid) return dialogueResult;
  result.warnings.push(...dialogueResult.warnings);

  return result;
}

// ==================== PLAYER VALIDATION ====================

/**
 * ตรวจสอบความถูกต้องของ Player
 * @param player - Player ที่ต้องการตรวจสอบ
 */
export function validatePlayer(player: Player | PlayerState): ValidationResult {
  const result = createValidResult();

  // ตรวจสอบ gold
  if (typeof player.gold !== 'number' || player.gold < 0) {
    return addError(result, 'Gold ต้องเป็นตัวเลขและไม่ต่ำกว่า 0', 'gold', player.gold);
  }

  // ตรวจสอบ items (optional — only exists on Player, not PlayerState)
  if ('items' in player && player.items !== undefined) {
    if (!Array.isArray(player.items)) {
      return addError(result, 'Items ต้องเป็น array', 'items', player.items);
    }

    for (const item of player.items) {
      const itemResult = validateItem(item);
      if (!itemResult.valid) return itemResult;
      result.warnings.push(...itemResult.warnings);
    }
  }

  // ตรวจสอบ god (optional — type differs: God vs GodData)
  if (player.god !== null && player.god !== undefined) {
    if ('nameTH' in player.god) {
      // GodData from PlayerState — skip detailed validation
    } else {
      const godResult = validateGod(player.god as God);
      if (!godResult.valid) return godResult;
      result.warnings.push(...godResult.warnings);
    }
  }

  // ตรวจสอบ relationships (optional — only exists on Player, not PlayerState)
  if ('relationships' in player && player.relationships !== undefined) {
    if (typeof player.relationships !== 'object') {
      return addError(result, 'Relationships ต้องเป็น object', 'relationships', player.relationships);
    }

    for (const [npcId, value] of Object.entries(player.relationships)) {
      if (typeof value !== 'number') {
        return addError(
          result,
          `Relationship value ต้องเป็นตัวเลข`,
          `relationships.${npcId}`,
          value
        );
      }
    }
  }

  return result;
}

// ==================== SAVE DATA VALIDATION ====================

/**
 * ตรวจสอบความถูกต้องของ Save Data
 * @param data - Save data ที่ต้องการตรวจสอบ
 * @throws SaveDataVersionError - ถ้า version ไม่ตรงกัน
 */
export function validateSaveData(data: SaveData): ValidationResult {
  const result = createValidResult();

  // ตรวจสอบ version
  if (!data.version || typeof data.version !== 'string') {
    return addError(result, 'Save data ต้องมี version', 'version', data.version);
  }

  if (!SAVE_STATS.SUPPORTED_VERSIONS.includes(data.version as any)) {
    return addError(
      result,
      `Version ไม่รองรับ: ${data.version} (รองรับ: ${SAVE_STATS.SUPPORTED_VERSIONS.join(', ')})`,
      'version',
      data.version
    );
  }

  // ตรวจสอบ timestamp
  if (typeof data.timestamp !== 'number' || data.timestamp < 0) {
    return addError(result, 'Timestamp ต้องเป็นตัวเลขบวก', 'timestamp', data.timestamp);
  }

  // ตรวจสอบ timestamp ไม่เกินปัจจุบัน
  const now = Date.now();
  if (data.timestamp > now) {
    return addWarning(result, 'Timestamp เกินปัจจุบัน (อาจเกิดจากการแก้ไขเวลา)');
  }

  // ตรวจสอบ player
  const playerResult = validatePlayer(data.player);
  if (!playerResult.valid) return playerResult;
  result.warnings.push(...playerResult.warnings);

  return result;
}

/**
 * สร้าง save data เริ่มต้น
 */
export function createDefaultSaveData(): SaveData {
  return {
    version: '1.0.0',
    timestamp: Date.now(),
    player: {
      gold: 500,
      god: null,
      level: 1,
      exp: 0,
    },
    inventory: [],
    relationships: {},
    arenaWins: 0,
    stats: { totalBattles: 0, totalWins: 0, totalLosses: 0, goldEarned: 0, goldSpent: 0, itemsPurchased: 0, playTime: 0, lastSavedAt: 0 },
  };
}

// ==================== BATCH VALIDATION ====================

/**
 * ตรวจสอบ array ของ items
 * @param items - Array ของ Item
 */
export function validateItems(items: Item[]): ValidationResult {
  const result = createValidResult();

  if (!Array.isArray(items)) {
    return addError(result, 'ต้องเป็น array ของ Item', 'items', items);
  }

  for (let i = 0; i < items.length; i++) {
    const itemResult = validateItem(items[i]);
    if (!itemResult.valid) {
      return addError(
        result,
        `Item ลำดับที่ ${i} ไม่ถูกต้อง: ${itemResult.errors[0].message}`,
        `items[${i}]`,
        items[i]
      );
    }
    result.warnings.push(...itemResult.warnings);
  }

  return result;
}

/**
 * ตรวจสอบ array ของ gods
 * @param gods - Array ของ God
 */
export function validateGods(gods: God[]): ValidationResult {
  const result = createValidResult();

  if (!Array.isArray(gods)) {
    return addError(result, 'ต้องเป็น array ของ God', 'gods', gods);
  }

  for (let i = 0; i < gods.length; i++) {
    const godResult = validateGod(gods[i]);
    if (!godResult.valid) {
      return addError(
        result,
        `God ลำดับที่ ${i} ไม่ถูกต้อง: ${godResult.errors[0].message}`,
        `gods[${i}]`,
        gods[i]
      );
    }
    result.warnings.push(...godResult.warnings);
  }

  return result;
}

/**
 * ตรวจสอบ array ของ enemies
 * @param enemies - Array ของ Enemy
 */
export function validateEnemies(enemies: Enemy[]): ValidationResult {
  const result = createValidResult();

  if (!Array.isArray(enemies)) {
    return addError(result, 'ต้องเป็น array ของ Enemy', 'enemies', enemies);
  }

  for (let i = 0; i < enemies.length; i++) {
    const enemyResult = validateEnemy(enemies[i]);
    if (!enemyResult.valid) {
      return addError(
        result,
        `Enemy ลำดับที่ ${i} ไม่ถูกต้อง: ${enemyResult.errors[0].message}`,
        `enemies[${i}]`,
        enemies[i]
      );
    }
    result.warnings.push(...enemyResult.warnings);
  }

  return result;
}

/**
 * ตรวจสอบ array ของ NPCs
 * @param npcs - Array ของ NPC
 */
export function validateNPCs(npcs: NPC[]): ValidationResult {
  const result = createValidResult();

  if (!Array.isArray(npcs)) {
    return addError(result, 'ต้องเป็น array ของ NPC', 'npcs', npcs);
  }

  for (let i = 0; i < npcs.length; i++) {
    const npcResult = validateNPC(npcs[i]);
    if (!npcResult.valid) {
      return addError(
        result,
        `NPC ลำดับที่ ${i} ไม่ถูกต้อง: ${npcResult.errors[0].message}`,
        `npcs[${i}]`,
        npcs[i]
      );
    }
    result.warnings.push(...npcResult.warnings);
  }

  return result;
}

// ==================== EXPORT TYPES ====================

export type { Item, God, Enemy, NPC, DialogueNode, DialogueChoice, SaveData, ItemEffect } from '../types';
