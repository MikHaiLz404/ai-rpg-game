/**
 * saveManager.ts - ระบบจัดการบันทึกเกม
 * Gods' Arena RPG
 */

import { gameDB } from '@/lib/db';

// เวอร์ชันของ save data format
export const SAVE_VERSION = '1.0.0';

export interface SaveData {
  version: string;
  timestamp: number;
  player: PlayerState;
  inventory: Item[];
  relationships: Record<string, number>;
  arenaWins: number;
  stats: GameStats;
}

export interface PlayerState {
  gold: number;
  god: GodData | null;
  level: number;
  exp: number;
}

export interface GodData {
  id: string;
  name: string;
  nameTH: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
}

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

const STORAGE_KEYS = {
  AUTO_SAVE: 'gods_arena_autosave',
  MANUAL_SAVE: 'gods_arena_save',
  SLOT_PREFIX: 'gods_arena_save_slot_',
};

export function checkVersion(saveData: SaveData): { valid: boolean; message: string } {
  if (!saveData || !saveData.version) {
    return { valid: false, message: 'ข้อมูลบันทึกไม่มีเวอร์ชัน' };
  }
  const saveVersion = saveData.version.split('.').map(Number);
  const currentVersion = SAVE_VERSION.split('.').map(Number);
  if (saveVersion[0] !== currentVersion[0]) {
    return { valid: false, message: `เวอร์ชันไม่ตรงกัน (${saveData.version} -> ${SAVE_VERSION})` };
  }
  return { valid: true, message: 'เวอร์ชันถูกต้อง' };
}

/**
 * บันทึกข้อมูลไปยัง IndexedDB และ localStorage (Dual-write)
 */
export async function autoSave(data: SaveData): Promise<boolean> {
  try {
    const saveData: SaveData = { ...data, version: SAVE_VERSION, timestamp: Date.now() };
    
    // Write to IndexedDB (Primary)
    await gameDB.set(STORAGE_KEYS.AUTO_SAVE, saveData);
    
    // Write to localStorage (Fallback/Legacy)
    localStorage.setItem(STORAGE_KEYS.AUTO_SAVE, JSON.stringify(saveData));
    
    console.log('Auto-save completed (IndexedDB + LS)');
    return true;
  } catch (error) {
    console.error('Auto-save failed:', error);
    return false;
  }
}

/**
 * โหลดข้อมูล (ลองจาก IndexedDB ก่อน ถ้าไม่มีให้เอาจาก localStorage)
 */
export async function loadAutoSave(): Promise<SaveData | null> {
  try {
    // Try IndexedDB first
    let saveData = await gameDB.get(STORAGE_KEYS.AUTO_SAVE);
    
    // Fallback to localStorage
    if (!saveData) {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTO_SAVE);
      if (saved) {
        saveData = JSON.parse(saved);
        // Sync back to IndexedDB for next time
        await gameDB.set(STORAGE_KEYS.AUTO_SAVE, saveData);
      }
    }

    if (!saveData) return null;
    if (!checkVersion(saveData).valid) return null;
    
    return saveData;
  } catch (error) {
    console.error('Failed to load auto-save:', error);
    return null;
  }
}

export async function manualSave(data: SaveData, slot: number = 0): Promise<boolean> {
  try {
    const saveData: SaveData = { ...data, version: SAVE_VERSION, timestamp: Date.now() };
    const key = slot === 0 ? STORAGE_KEYS.MANUAL_SAVE : `${STORAGE_KEYS.SLOT_PREFIX}${slot}`;
    
    await gameDB.set(key, saveData);
    localStorage.setItem(key, JSON.stringify(saveData));
    
    console.log(`Manual save (Slot ${slot}) completed`);
    return true;
  } catch (error) {
    console.error('Manual save failed:', error);
    return false;
  }
}

export async function loadManualSave(slot: number = 0): Promise<SaveData | null> {
  try {
    const key = slot === 0 ? STORAGE_KEYS.MANUAL_SAVE : `${STORAGE_KEYS.SLOT_PREFIX}${slot}`;
    let saveData = await gameDB.get(key);
    
    if (!saveData) {
      const saved = localStorage.getItem(key);
      if (saved) {
        saveData = JSON.parse(saved);
        await gameDB.set(key, saveData);
      }
    }

    if (!saveData || !checkVersion(saveData).valid) return null;
    return saveData;
  } catch (error) {
    console.error('Failed to load manual save:', error);
    return null;
  }
}

export function exportToJson(data: SaveData): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `gods_arena_save_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importFromJson(file: File): Promise<SaveData | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const saveData: SaveData = JSON.parse(e.target?.result as string);
        if (checkVersion(saveData).valid) resolve(saveData);
        else resolve(null);
      } catch { resolve(null); }
    };
    reader.readAsText(file);
  });
}

export async function deleteAutoSave(): Promise<boolean> {
  await gameDB.delete(STORAGE_KEYS.AUTO_SAVE);
  localStorage.removeItem(STORAGE_KEYS.AUTO_SAVE);
  return true;
}

export async function deleteManualSave(slot: number = 0): Promise<boolean> {
  const key = slot === 0 ? STORAGE_KEYS.MANUAL_SAVE : `${STORAGE_KEYS.SLOT_PREFIX}${slot}`;
  await gameDB.delete(key);
  localStorage.removeItem(key);
  return true;
}

/**
 * ลบข้อมูลทั้งหมด (Wipe everything)
 */
export async function wipeAllData(): Promise<void> {
  await gameDB.clear();
  Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  for (let i = 1; i <= 5; i++) localStorage.removeItem(`${STORAGE_KEYS.SLOT_PREFIX}${i}`);
  console.log('All save data wiped from IndexedDB and LocalStorage');
}

export function hasAutoSave(): boolean {
  return localStorage.getItem(STORAGE_KEYS.AUTO_SAVE) !== null;
}

export function hasManualSave(slot: number = 0): boolean {
  const key = slot === 0 ? STORAGE_KEYS.MANUAL_SAVE : `${STORAGE_KEYS.SLOT_PREFIX}${slot}`;
  return localStorage.getItem(key) !== null;
}

export function createEmptySaveData(): SaveData {
  return {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    player: { gold: 500, god: null, level: 1, exp: 0 },
    inventory: [],
    relationships: {},
    arenaWins: 0,
    stats: { totalBattles: 0, totalWins: 0, totalLosses: 0, goldEarned: 0, goldSpent: 0, itemsPurchased: 0, playTime: 0, lastSavedAt: 0 },
  };
}

export function updatePlayTime(data: SaveData, secondsToAdd: number): SaveData {
  return { ...data, stats: { ...data.stats, playTime: data.stats.playTime + secondsToAdd } };
}
