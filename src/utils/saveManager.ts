/**
 * saveManager.ts - ระบบจัดการบันทึกเกม
 * Gods' Arena RPG
 * 
 * ฟังก์ชัน:
 * - Auto-save to localStorage
 * - Manual save/load
 * - Export to JSON file
 * - Import from JSON file
 * - Version checking
 */

// เวอร์ชันของ save data format
export const SAVE_VERSION = '1.0.0';

/**
 * Interface หลักสำหรับข้อมูลที่ต้องบันทึก
 */
export interface SaveData {
  version: string;
  timestamp: number;
  player: PlayerState;
  inventory: Item[];
  relationships: Record<string, number>;
  arenaWins: number;
  stats: GameStats;
}

/**
 * Player State ที่ต้องบันทึก
 */
export interface PlayerState {
  gold: number;
  god: GodData | null;
  level: number;
  exp: number;
}

/**
 * God Data สำหรับบันทึก
 */
export interface GodData {
  id: string;
  name: string;
  nameTH: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
}

/**
 * Item สำหรับบันทึก
 */
export interface Item {
  id: string;
  name: string;
  nameTH: string;
  description: string;
  price: number;
  type: 'weapon' | 'armor' | 'consumable';
  effect: {
    hp?: number;
    attack?: number;
    defense?: number;
  };
}

/**
 * Game Statistics
 */
export interface GameStats {
  totalBattles: number;
  totalWins: number;
  totalLosses: number;
  goldEarned: number;
  goldSpent: number;
  itemsPurchased: number;
  playTime: number;
  lastSavedAt: number;
}

/**
 * LocalStorage keys
 */
const STORAGE_KEYS = {
  AUTO_SAVE: 'gods_arena_autosave',
  MANUAL_SAVE: 'gods_arena_save',
  SETTINGS: 'gods_arena_settings',
  SLOT_PREFIX: 'gods_arena_save_slot_',
};

/**
 * ตรวจสอบเวอร์ชันของ save data
 */
export function checkVersion(saveData: SaveData): { valid: boolean; message: string } {
  if (!saveData.version) {
    return { valid: false, message: 'ข้อมูลบันทึกไม่มีเวอร์ชัน' };
  }
  
  const saveVersion = saveData.version.split('.').map(Number);
  const currentVersion = SAVE_VERSION.split('.').map(Number);
  
  if (saveVersion[0] !== currentVersion[0]) {
    return { 
      valid: false, 
      message: `เวอร์ชันไม่ตรงกัน (${saveData.version} -> ${SAVE_VERSION})` 
    };
  }
  
  if (saveVersion[1] < currentVersion[1]) {
    return { 
      valid: true, 
      message: `เวอร์ชันเก่า (${saveData.version}) อาจมีข้อมูลบางส่วนที่ไม่ครบ` 
    };
  }
  
  return { valid: true, message: 'เวอร์ชันถูกต้อง' };
}

/**
 * บันทึกข้อมูลไปยัง localStorage (Auto-save)
 */
export function autoSave(data: SaveData): boolean {
  try {
    const saveData: SaveData = {
      ...data,
      version: SAVE_VERSION,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(STORAGE_KEYS.AUTO_SAVE, JSON.stringify(saveData));
    console.log('Auto-save completed:', new Date(saveData.timestamp).toLocaleString('th-TH'));
    return true;
  } catch (error) {
    console.error('Auto-save failed:', error);
    return false;
  }
}

/**
 * โหลดข้อมูลจาก localStorage (Auto-save)
 */
export function loadAutoSave(): SaveData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTO_SAVE);
    if (!saved) return null;
    
    const saveData: SaveData = JSON.parse(saved);
    const versionCheck = checkVersion(saveData);
    
    if (!versionCheck.valid) {
      console.warn('Version check failed:', versionCheck.message);
      return null;
    }
    
    console.log('Auto-save loaded successfully');
    return saveData;
  } catch (error) {
    console.error('Failed to load auto-save:', error);
    return null;
  }
}

/**
 * บันทึกข้อมูลไปยัง localStorage (Manual save)
 */
export function manualSave(data: SaveData, slot: number = 0): boolean {
  try {
    const saveData: SaveData = {
      ...data,
      version: SAVE_VERSION,
      timestamp: Date.now(),
    };
    
    const key = slot === 0 ? STORAGE_KEYS.MANUAL_SAVE : `${STORAGE_KEYS.SLOT_PREFIX}${slot}`;
    localStorage.setItem(key, JSON.stringify(saveData));
    
    console.log(`Manual save (Slot ${slot}) completed`);
    return true;
  } catch (error) {
    console.error('Manual save failed:', error);
    return false;
  }
}

/**
 * โหลดข้อมูลจาก localStorage (Manual save)
 */
export function loadManualSave(slot: number = 0): SaveData | null {
  try {
    const key = slot === 0 ? STORAGE_KEYS.MANUAL_SAVE : `${STORAGE_KEYS.SLOT_PREFIX}${slot}`;
    const saved = localStorage.getItem(key);
    
    if (!saved) return null;
    
    const saveData: SaveData = JSON.parse(saved);
    const versionCheck = checkVersion(saveData);
    
    if (!versionCheck.valid) {
      console.warn('Version check failed:', versionCheck.message);
      return null;
    }
    
    console.log(`Manual save (Slot ${slot}) loaded successfully`);
    return saveData;
  } catch (error) {
    console.error('Failed to load manual save:', error);
    return null;
  }
}

/**
 * ส่งออกข้อมูลเป็น JSON file
 */
export function exportToJson(data: SaveData): void {
  try {
    const saveData: SaveData = {
      ...data,
      version: SAVE_VERSION,
      timestamp: Date.now(),
    };
    
    const jsonString = JSON.stringify(saveData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `gods_arena_save_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Export JSON completed');
  } catch (error) {
    console.error('Export JSON failed:', error);
  }
}

/**
 * นำเข้าข้อมูลจาก JSON file
 */
export function importFromJson(file: File): Promise<SaveData | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const saveData: SaveData = JSON.parse(content);
        
        const versionCheck = checkVersion(saveData);
        if (!versionCheck.valid) {
          console.warn('Version check failed:', versionCheck.message);
          resolve(null);
          return;
        }
        
        console.log('Import JSON completed');
        resolve(saveData);
      } catch (error) {
        console.error('Import JSON failed:', error);
        resolve(null);
      }
    };
    
    reader.onerror = () => {
      console.error('File read error');
      resolve(null);
    };
    
    reader.readAsText(file);
  });
}

/**
 * ลบข้อมูล Auto-save
 */
export function deleteAutoSave(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTO_SAVE);
    console.log('Auto-save deleted');
    return true;
  } catch (error) {
    console.error('Failed to delete auto-save:', error);
    return false;
  }
}

/**
 * ลบข้อมูล Manual save
 */
export function deleteManualSave(slot: number = 0): boolean {
  try {
    const key = slot === 0 ? STORAGE_KEYS.MANUAL_SAVE : `${STORAGE_KEYS.SLOT_PREFIX}${slot}`;
    localStorage.removeItem(key);
    console.log(`Manual save (Slot ${slot}) deleted`);
    return true;
  } catch (error) {
    console.error('Failed to delete manual save:', error);
    return false;
  }
}

/**
 * ตรวจสอบว่ามีข้อมูล Auto-save หรือไม่
 */
export function hasAutoSave(): boolean {
  return localStorage.getItem(STORAGE_KEYS.AUTO_SAVE) !== null;
}

/**
 * ตรวจสอบว่ามีข้อมูล Manual save หรือไม่
 */
export function hasManualSave(slot: number = 0): boolean {
  const key = slot === 0 ? STORAGE_KEYS.MANUAL_SAVE : `${STORAGE_KEYS.SLOT_PREFIX}${slot}`;
  return localStorage.getItem(key) !== null;
}

/**
 * สร้าง SaveData ว่างๆ
 */
export function createEmptySaveData(): SaveData {
  return {
    version: SAVE_VERSION,
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
    stats: {
      totalBattles: 0,
      totalWins: 0,
      totalLosses: 0,
      goldEarned: 0,
      goldSpent: 0,
      itemsPurchased: 0,
      playTime: 0,
      lastSavedAt: 0,
    },
  };
}

/**
 * อัพเดท play time
 */
export function updatePlayTime(data: SaveData, secondsToAdd: number): SaveData {
  return {
    ...data,
    stats: {
      ...data.stats,
      playTime: data.stats.playTime + secondsToAdd,
    },
  };
}
