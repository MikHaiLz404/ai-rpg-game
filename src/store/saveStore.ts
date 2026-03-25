/**
 * saveStore.ts - ระบบจัดการสถานะการบันทึกเกม
 * Gods' Arena RPG
 */

import { create } from 'zustand';
import { 
  SaveData, 
  PlayerState, 
  Item, 
  GameStats,
  autoSave, 
  loadAutoSave, 
  manualSave, 
  loadManualSave,
  exportToJson,
  importFromJson,
  deleteAutoSave,
  deleteManualSave,
  hasAutoSave,
  hasManualSave,
  createEmptySaveData,
  updatePlayTime,
  wipeAllData,
  SAVE_VERSION
} from '../utils/saveManager';
import { God } from '../types';

interface SaveStore {
  currentSaveData: SaveData | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaveTime: number | null;
  saveError: string | null;
  hasUnsavedChanges: boolean;
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  sessionStartTime: number;
  autoSaveTimeoutId: ReturnType<typeof setTimeout> | null;
  
  initializeSave: () => Promise<void>;
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
  saveGame: (playerGold: number, playerGod: God | null, inventory: Item[], relationships: Record<string, number>, arenaWins: number, kaneStats: { hp: number; maxHp: number; atk: number; def: number }, manual?: boolean, slot?: number) => Promise<boolean>;
  loadGame: (slot?: number) => Promise<SaveData | null>;
  loadAutoSaveGame: () => Promise<SaveData | null>;
  exportGame: (playerGold: number, playerGod: God | null, inventory: Item[], relationships: Record<string, number>, arenaWins: number, kaneStats: { hp: number; maxHp: number; atk: number; def: number }) => void;
  importGame: (file: File) => Promise<SaveData | null>;
  deleteSave: (slot?: number) => Promise<boolean>;
  deleteAllSaves: () => Promise<void>;
  checkHasSave: (slot?: number) => boolean;
  checkHasAutoSave: () => boolean;
  updateSessionTime: () => void;
  resetSaveData: () => void;
  requestAutoSave: (playerGold: number, playerGod: God | null, inventory: Item[], relationships: Record<string, number>, arenaWins: number, kaneStats: { hp: number; maxHp: number; atk: number; def: number }) => void;
}

export const useSaveStore = create<SaveStore>((set, get) => ({
  currentSaveData: null,
  isLoading: false,
  isSaving: false,
  lastSaveTime: null,
  saveError: null,
  hasUnsavedChanges: false,
  autoSaveEnabled: true,
  autoSaveInterval: 60000,
  sessionStartTime: Date.now(),
  autoSaveTimeoutId: null,
  
  initializeSave: async () => {
    set({ isLoading: true, saveError: null });
    try {
      const autoSaveData = await loadAutoSave();
      if (autoSaveData) {
        set({ currentSaveData: autoSaveData, lastSaveTime: autoSaveData.timestamp, isLoading: false });
        console.log('SaveStore: Loaded auto-save from IndexedDB/LS');
      } else {
        set({ currentSaveData: createEmptySaveData(), isLoading: false });
        console.log('SaveStore: Starting new journey');
      }
    } catch (error) {
      set({ saveError: 'Failed to initialize save system', isLoading: false });
    }
  },
  
  setAutoSaveEnabled: (enabled: boolean) => set({ autoSaveEnabled: enabled }),
  setAutoSaveInterval: (interval: number) => set({ autoSaveInterval: interval }),
  
  saveGame: async (playerGold: number, playerGod: God | null, inventory: Item[], relationships: Record<string, number>, arenaWins: number, kaneStats: { hp: number; maxHp: number; atk: number; def: number }, manual: boolean = false, slot: number = 0) => {
    const { currentSaveData, autoSaveEnabled, sessionStartTime } = get();
    set({ isSaving: true, saveError: null });
    
    try {
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
      const newPlayTime = currentSaveData ? currentSaveData.stats.playTime + sessionDuration : sessionDuration;
      
      const saveData: SaveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        player: {
          gold: playerGold,
          god: playerGod ? { id: playerGod.id, name: playerGod.name, nameTH: playerGod.nameTH, hp: playerGod.hp, maxHp: playerGod.maxHp, attack: playerGod.attack, defense: playerGod.defense } : null,
          level: currentSaveData?.player.level || 1,
          exp: currentSaveData?.player.exp || 0,
        },
        inventory,
        relationships,
        arenaWins,
        kaneStats,
        stats: {
          ...(currentSaveData?.stats || { totalBattles: 0, totalWins: 0, totalLosses: 0, goldEarned: 0, goldSpent: 0, itemsPurchased: 0, playTime: 0 }),
          playTime: newPlayTime,
          lastSavedAt: Date.now(),
        },
      };
      
      let success: boolean;
      if (manual) success = await manualSave(saveData, slot);
      else if (autoSaveEnabled) success = await autoSave(saveData);
      else { set({ saveError: 'Auto-save is disabled', isSaving: false }); return false; }
      
      if (success) {
        set({ currentSaveData: saveData, lastSaveTime: Date.now(), hasUnsavedChanges: false, isSaving: false, sessionStartTime: Date.now() });
        return true;
      }
      set({ isSaving: false });
      return false;
    } catch (error) {
      set({ saveError: 'Save failed', isSaving: false });
      return false;
    }
  },
  
  loadGame: async (slot: number = 0) => {
    set({ isLoading: true, saveError: null });
    try {
      const saveData = await loadManualSave(slot);
      if (saveData) {
        set({ currentSaveData: saveData, lastSaveTime: saveData.timestamp, isLoading: false, hasUnsavedChanges: false, sessionStartTime: Date.now() });
        return saveData;
      }
      set({ saveError: 'No save data found', isLoading: false });
      return null;
    } catch (error) {
      set({ saveError: 'Failed to load save', isLoading: false });
      return null;
    }
  },
  
  loadAutoSaveGame: async () => {
    set({ isLoading: true, saveError: null });
    try {
      const saveData = await loadAutoSave();
      if (saveData) {
        set({ currentSaveData: saveData, lastSaveTime: saveData.timestamp, isLoading: false, hasUnsavedChanges: false, sessionStartTime: Date.now() });
        return saveData;
      }
      set({ saveError: 'No auto-save found', isLoading: false });
      return null;
    } catch (error) {
      set({ saveError: 'Failed to load auto-save', isLoading: false });
      return null;
    }
  },
  
  exportGame: (playerGold: number, playerGod: God | null, inventory: Item[], relationships: Record<string, number>, arenaWins: number, kaneStats: { hp: number; maxHp: number; atk: number; def: number }) => {
    const { currentSaveData, sessionStartTime } = get();
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    const newPlayTime = currentSaveData ? currentSaveData.stats.playTime + sessionDuration : sessionDuration;
    
    exportToJson({
      version: SAVE_VERSION, timestamp: Date.now(),
      player: { gold: playerGold, god: playerGod ? { id: playerGod.id, name: playerGod.name, nameTH: playerGod.nameTH, hp: playerGod.hp, maxHp: playerGod.maxHp, attack: playerGod.attack, defense: playerGod.defense } : null, level: currentSaveData?.player.level || 1, exp: currentSaveData?.player.exp || 0 },
      inventory, relationships, arenaWins, kaneStats,
      stats: { ...(currentSaveData?.stats || { totalBattles: 0, totalWins: 0, totalLosses: 0, goldEarned: 0, goldSpent: 0, itemsPurchased: 0, playTime: 0 }), playTime: newPlayTime, lastSavedAt: Date.now() }
    });
  },
  
  importGame: async (file: File) => {
    set({ isLoading: true, saveError: null });
    try {
      const saveData = await importFromJson(file);
      if (saveData) {
        set({ currentSaveData: saveData, lastSaveTime: saveData.timestamp, isLoading: false, hasUnsavedChanges: false, sessionStartTime: Date.now() });
        return saveData;
      }
      set({ saveError: 'Invalid save file', isLoading: false });
      return null;
    } catch (error) {
      set({ saveError: 'Failed to import save', isLoading: false });
      return null;
    }
  },
  
  deleteSave: async (slot: number = 0) => {
    const success = slot === 0 ? await deleteAutoSave() : await deleteManualSave(slot);
    if (success && slot === 0) set({ currentSaveData: createEmptySaveData(), lastSaveTime: null, hasUnsavedChanges: false });
    return success;
  },
  
  deleteAllSaves: async () => {
    try {
      await wipeAllData();
      set({ currentSaveData: createEmptySaveData(), lastSaveTime: null, hasUnsavedChanges: false });
      console.log('IndexedDB and LocalStorage cleared');
    } catch (error) {
      console.error('Wipe failed:', error);
    }
  },
  
  checkHasSave: (slot: number = 0) => hasManualSave(slot),
  checkHasAutoSave: () => hasAutoSave(),
  updateSessionTime: () => {
    const { currentSaveData, sessionStartTime } = get();
    if (!currentSaveData) return;
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    set({ currentSaveData: updatePlayTime(currentSaveData, sessionDuration), sessionStartTime: Date.now() });
  },
  resetSaveData: () => set({ currentSaveData: createEmptySaveData(), lastSaveTime: null, hasUnsavedChanges: false, sessionStartTime: Date.now() }),
  requestAutoSave: (playerGold, playerGod, inventory, relationships, arenaWins, kaneStats) => {
    const { saveGame, autoSaveEnabled, autoSaveTimeoutId } = get();
    if (!autoSaveEnabled) return;

    if (autoSaveTimeoutId) clearTimeout(autoSaveTimeoutId);
    const timeoutId = setTimeout(() => {
      saveGame(playerGold, playerGod, inventory, relationships, arenaWins, kaneStats);
      set({ autoSaveTimeoutId: null });
      console.log('SaveStore: Surgical auto-save triggered');
    }, 2000); // 2 second debounce
    set({ autoSaveTimeoutId: timeoutId });
  },
}));
