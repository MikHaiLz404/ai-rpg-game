/**
 * saveStore.ts - ระบบจัดการสถานะการบันทึกเกม
 * Gods' Arena RPG
 * 
 * ใช้ Zustand สำหรับจัดการ state ของระบบบันทึก
 * รองรับ: Auto-save, Manual save, Import/Export
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
  SAVE_VERSION
} from '../utils/saveManager';
import { God } from '../types';

/**
 * Interface สำหรับ Save Store
 */
interface SaveStore {
  // สถานะปัจจุบัน
  currentSaveData: SaveData | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaveTime: number | null;
  saveError: string | null;
  hasUnsavedChanges: boolean;
  
  // Auto-save settings
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // หน่วยเป็นมิลลิวินาที
  
  // Play time tracking
  sessionStartTime: number;
  
  // Actions
  initializeSave: () => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
  
  // Save actions
  saveGame: (playerGold: number, playerGod: God | null, inventory: Item[], relationships: Record<string, number>, arenaWins: number, manual?: boolean, slot?: number) => Promise<boolean>;
  loadGame: (slot?: number) => Promise<SaveData | null>;
  loadAutoSaveGame: () => Promise<SaveData | null>;
  
  // Export/Import
  exportGame: (playerGold: number, playerGod: God | null, inventory: Item[], relationships: Record<string, number>, arenaWins: number) => void;
  importGame: (file: File) => Promise<SaveData | null>;
  
  // Delete
  deleteSave: (slot?: number) => boolean;
  deleteAllSaves: () => void;
  
  // Check save existence
  checkHasSave: (slot?: number) => boolean;
  checkHasAutoSave: () => boolean;
  
  // Update play time
  updateSessionTime: () => void;
  
  // Reset
  resetSaveData: () => void;
}

/**
 * สร้าง Save Store
 */
export const useSaveStore = create<SaveStore>((set, get) => ({
  // Initial State
  currentSaveData: null,
  isLoading: false,
  isSaving: false,
  lastSaveTime: null,
  saveError: null,
  hasUnsavedChanges: false,
  
  autoSaveEnabled: true,
  autoSaveInterval: 60000, // 60 วินาที
  
  sessionStartTime: Date.now(),
  
  /**
   * เริ่มต้นระบบ save - โหลด auto-save อัตโนมัติถ้ามี
   */
  initializeSave: () => {
    set({ isLoading: true, saveError: null });
    
    try {
      const autoSaveData = loadAutoSave();
      if (autoSaveData) {
        set({ 
          currentSaveData: autoSaveData, 
          lastSaveTime: autoSaveData.timestamp,
          isLoading: false 
        });
        console.log('SaveStore: โหลด auto-save สำเร็จ');
      } else {
        // สร้าง save data ใหม่ถ้าไม่มี auto-save
        const newSaveData = createEmptySaveData();
        set({ 
          currentSaveData: newSaveData, 
          isLoading: false 
        });
        console.log('SaveStore: เริ่มเกมใหม่');
      }
    } catch (error) {
      set({ 
        saveError: 'Failed to initialize save system', 
        isLoading: false 
      });
    }
  },
  
  /**
   * เปิด/ปิด auto-save
   */
  setAutoSaveEnabled: (enabled: boolean) => {
    set({ autoSaveEnabled: enabled });
    console.log(`Auto-save: ${enabled ? 'เปิด' : 'ปิด'}`);
  },
  
  /**
   * ตั้งค่า auto-save interval
   */
  setAutoSaveInterval: (interval: number) => {
    set({ autoSaveInterval: interval });
  },
  
  /**
   * บันทึกเกม
   */
  saveGame: async (playerGold: number, playerGod: God | null, inventory: Item[], relationships: Record<string, number>, arenaWins: number, manual: boolean = false, slot: number = 0) => {
    const { currentSaveData, autoSaveEnabled, sessionStartTime } = get();
    
    set({ isSaving: true, saveError: null });
    
    try {
      // คำนวณ play time
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
      const newPlayTime = currentSaveData 
        ? currentSaveData.stats.playTime + sessionDuration 
        : sessionDuration;
      
      // สร้าง player state
      const playerState: PlayerState = {
        gold: playerGold,
        god: playerGod ? {
          id: playerGod.id,
          name: playerGod.name,
          nameTH: playerGod.nameTH,
          hp: playerGod.hp,
          maxHp: playerGod.maxHp,
          attack: playerGod.attack,
          defense: playerGod.defense,
        } : null,
        level: currentSaveData?.player.level || 1,
        exp: currentSaveData?.player.exp || 0,
      };
      
      // สร้าง game stats
      const gameStats: GameStats = {
        ...(currentSaveData?.stats || {
          totalBattles: 0,
          totalWins: 0,
          totalLosses: 0,
          goldEarned: 0,
          goldSpent: 0,
          itemsPurchased: 0,
          playTime: 0,
        }),
        playTime: newPlayTime,
        lastSavedAt: Date.now(),
      };
      
      // สร้าง save data
      const saveData: SaveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        player: playerState,
        inventory: inventory,
        relationships: relationships,
        arenaWins: arenaWins,
        stats: gameStats,
      };
      
      // บันทึก
      let success: boolean;
      if (manual) {
        success = manualSave(saveData, slot);
      } else if (autoSaveEnabled) {
        success = autoSave(saveData);
      } else {
        success = false;
        set({ saveError: 'Auto-save is disabled' });
      }
      
      if (success) {
        set({ 
          currentSaveData: saveData,
          lastSaveTime: Date.now(),
          hasUnsavedChanges: false,
          isSaving: false,
          sessionStartTime: Date.now(), // รีเซ็ต session time
        });
        console.log(`Save ${manual ? 'Manual' : 'Auto'} completed successfully`);
        return true;
      } else {
        set({ isSaving: false });
        return false;
      }
    } catch (error) {
      set({ 
        saveError: 'Save failed', 
        isSaving: false 
      });
      return false;
    }
  },
  
  /**
   * โหลดเกม (Manual)
   */
  loadGame: async (slot: number = 0) => {
    set({ isLoading: true, saveError: null });
    
    try {
      const saveData = loadManualSave(slot);
      
      if (saveData) {
        set({ 
          currentSaveData: saveData,
          lastSaveTime: saveData.timestamp,
          isLoading: false,
          hasUnsavedChanges: false,
          sessionStartTime: Date.now(),
        });
        console.log(`Load from slot ${slot} completed`);
        return saveData;
      } else {
        set({ 
          saveError: 'No save data found',
          isLoading: false 
        });
        return null;
      }
    } catch (error) {
      set({ 
        saveError: 'Failed to load save', 
        isLoading: false 
      });
      return null;
    }
  },
  
  /**
   * โหลดเกม (Auto-save)
   */
  loadAutoSaveGame: async () => {
    set({ isLoading: true, saveError: null });
    
    try {
      const saveData = loadAutoSave();
      
      if (saveData) {
        set({ 
          currentSaveData: saveData,
          lastSaveTime: saveData.timestamp,
          isLoading: false,
          hasUnsavedChanges: false,
          sessionStartTime: Date.now(),
        });
        console.log('Load auto-save completed');
        return saveData;
      } else {
        set({ 
          saveError: 'No auto-save found',
          isLoading: false 
        });
        return null;
      }
    } catch (error) {
      set({ 
        saveError: 'Failed to load auto-save', 
        isLoading: false 
      });
      return null;
    }
  },
  
  /**
   * Export เกมเป็น JSON
   */
  exportGame: (playerGold: number, playerGod: God | null, inventory: Item[], relationships: Record<string, number>, arenaWins: number) => {
    const { currentSaveData, sessionStartTime } = get();
    
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    const newPlayTime = currentSaveData 
      ? currentSaveData.stats.playTime + sessionDuration 
      : sessionDuration;
    
    const saveData: SaveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      player: {
        gold: playerGold,
        god: playerGod ? {
          id: playerGod.id,
          name: playerGod.name,
          nameTH: playerGod.nameTH,
          hp: playerGod.hp,
          maxHp: playerGod.maxHp,
          attack: playerGod.attack,
          defense: playerGod.defense,
        } : null,
        level: currentSaveData?.player.level || 1,
        exp: currentSaveData?.player.exp || 0,
      },
      inventory: inventory,
      relationships: relationships,
      arenaWins: arenaWins,
      stats: {
        ...(currentSaveData?.stats || {
          totalBattles: 0,
          totalWins: 0,
          totalLosses: 0,
          goldEarned: 0,
          goldSpent: 0,
          itemsPurchased: 0,
          playTime: 0,
        }),
        playTime: newPlayTime,
        lastSavedAt: Date.now(),
      },
    };
    
    exportToJson(saveData);
    console.log('Export completed');
  },
  
  /**
   * Import เกมจาก JSON
   */
  importGame: async (file: File) => {
    set({ isLoading: true, saveError: null });
    
    try {
      const saveData = await importFromJson(file);
      
      if (saveData) {
        set({ 
          currentSaveData: saveData,
          lastSaveTime: saveData.timestamp,
          isLoading: false,
          hasUnsavedChanges: false,
          sessionStartTime: Date.now(),
        });
        console.log('Import completed');
        return saveData;
      } else {
        set({ 
          saveError: 'Invalid save file or version mismatch',
          isLoading: false 
        });
        return null;
      }
    } catch (error) {
      set({ 
        saveError: 'Failed to import save', 
        isLoading: false 
      });
      return null;
    }
  },
  
  /**
   * ลบ save
   */
  deleteSave: (slot: number = 0) => {
    try {
      const success = slot === 0 ? deleteAutoSave() : deleteManualSave(slot);
      
      if (success && slot === 0) {
        // ถ้าลบ auto-save ให้สร้างใหม่
        const newSaveData = createEmptySaveData();
        set({ 
          currentSaveData: newSaveData,
          lastSaveTime: null,
          hasUnsavedChanges: false,
        });
      }
      
      console.log(`Delete slot ${slot} completed`);
      return success;
    } catch (error) {
      console.error('Delete failed:', error);
      return false;
    }
  },
  
  /**
   * ลบทุก save
   */
  deleteAllSaves: () => {
    try {
      deleteAutoSave();
      for (let i = 1; i <= 3; i++) {
        deleteManualSave(i);
      }
      
      const newSaveData = createEmptySaveData();
      set({ 
        currentSaveData: newSaveData,
        lastSaveTime: null,
        hasUnsavedChanges: false,
      });
      
      console.log('All saves deleted');
    } catch (error) {
      console.error('Delete all failed:', error);
    }
  },
  
  /**
   * ตรวจสอบว่ามี save หรือไม่
   */
  checkHasSave: (slot: number = 0) => {
    return hasManualSave(slot);
  },
  
  /**
   * ตรวจสอบว่ามี auto-save หรือไม่
   */
  checkHasAutoSave: () => {
    return hasAutoSave();
  },
  
  /**
   * อัพเดทเวลาเล่น
   */
  updateSessionTime: () => {
    const { currentSaveData, sessionStartTime } = get();
    if (!currentSaveData) return;
    
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    const updatedData = updatePlayTime(currentSaveData, sessionDuration);
    
    set({ 
      currentSaveData: updatedData,
      sessionStartTime: Date.now(),
    });
  },
  
  /**
   * รีเซ็ตข้อมูล save
   */
  resetSaveData: () => {
    const newSaveData = createEmptySaveData();
    set({ 
      currentSaveData: newSaveData,
      lastSaveTime: null,
      hasUnsavedChanges: false,
      sessionStartTime: Date.now(),
    });
    console.log('Save data reset');
  },
}));

export default useSaveStore;
