import { create } from 'zustand';
import { Item, God, Enemy, NPC, DialogueNode, DialogueChoice } from '../types';
import { items as initialItems, gods as initialGods, enemies as initialEnemies, npcs as initialNpcs } from '../data';

export type EditorTab = 'items' | 'gods' | 'enemies' | 'npcs';

interface ValidationError {
  field: string;
  message: string;
}

interface EditorStore {
  // Tab State
  activeTab: EditorTab;
  setActiveTab: (tab: EditorTab) => void;
  
  // Data
  items: Item[];
  gods: God[];
  enemies: Enemy[];
  npcs: NPC[];
  
  // Selected Item for Edit
  selectedItem: Item | null;
  selectedGod: God | null;
  selectedEnemy: Enemy | null;
  selectedNpc: NPC | null;
  
  // Modal State
  isModalOpen: boolean;
  modalMode: 'create' | 'edit';
  
  // Validation
  errors: ValidationError[];
  validateItem: (item: Partial<Item>) => ValidationError[];
  validateGod: (god: Partial<God>) => ValidationError[];
  validateEnemy: (enemy: Partial<Enemy>) => ValidationError[];
  validateNpc: (npc: Partial<NPC>) => ValidationError[];
  
  // CRUD - Items
  selectItem: (item: Item | null) => void;
  createItem: (item: Item) => boolean;
  updateItem: (item: Item) => boolean;
  deleteItem: (id: string) => boolean;
  
  // CRUD - Gods
  selectGod: (god: God | null) => void;
  createGod: (god: God) => boolean;
  updateGod: (god: God) => boolean;
  deleteGod: (id: string) => boolean;
  
  // CRUD - Enemies
  selectEnemy: (enemy: Enemy | null) => void;
  createEnemy: (enemy: Enemy) => boolean;
  updateEnemy: (enemy: Enemy) => boolean;
  deleteEnemy: (id: string) => boolean;
  
  // CRUD - NPCs
  selectNpc: (npc: NPC | null) => void;
  createNpc: (npc: NPC) => boolean;
  updateNpc: (npc: NPC) => boolean;
  deleteNpc: (id: string) => boolean;
  
  // Modal
  openCreateModal: () => void;
  openEditModal: () => void;
  closeModal: () => void;
  
  // Import/Export
  exportData: () => string;
  importData: (json: string) => boolean;
  resetData: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  // Initial State
  activeTab: 'items',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  items: [...initialItems],
  gods: [...initialGods],
  enemies: [...initialEnemies],
  npcs: [...initialNpcs],
  
  selectedItem: null,
  selectedGod: null,
  selectedEnemy: null,
  selectedNpc: null,
  
  isModalOpen: false,
  modalMode: 'create',
  
  errors: [],
  
  // Validation Functions
  validateItem: (item) => {
    const errors: ValidationError[] = [];
    if (!item.id?.trim()) errors.push({ field: 'id', message: 'กรุณากรอก ID' });
    if (!item.name?.trim()) errors.push({ field: 'name', message: 'กรุณากรอกชื่อ (EN)' });
    if (!item.nameTH?.trim()) errors.push({ field: 'nameTH', message: 'กรุณากรอกชื่อ (TH)' });
    if (!item.description?.trim()) errors.push({ field: 'description', message: 'กรุณากรอกคำอธิบาย' });
    if (item.price === undefined || item.price < 0) errors.push({ field: 'price', message: 'กรุณากรอกราคา' });
    if (!item.type) errors.push({ field: 'type', message: 'กรุณาเลือกประเภท' });
    if (!item.effect) errors.push({ field: 'effect', message: 'กรุณากรอกเอฟเฟกต์' });
    return errors;
  },
  
  validateGod: (god) => {
    const errors: ValidationError[] = [];
    if (!god.id?.trim()) errors.push({ field: 'id', message: 'กรุณากรอก ID' });
    if (!god.name?.trim()) errors.push({ field: 'name', message: 'กรุณากรอกชื่อ (EN)' });
    if (!god.nameTH?.trim()) errors.push({ field: 'nameTH', message: 'กรุณากรอกชื่อ (TH)' });
    if (!god.description?.trim()) errors.push({ field: 'description', message: 'กรุณากรอกคำอธิบาย' });
    if (god.hp === undefined || god.hp < 0) errors.push({ field: 'hp', message: 'กรุณากรอก HP' });
    if (god.maxHp === undefined || god.maxHp < 0) errors.push({ field: 'maxHp', message: 'กรุณากรอก Max HP' });
    if (god.attack === undefined || god.attack < 0) errors.push({ field: 'attack', message: 'กรุณากรอกพลังโจมตี' });
    if (god.defense === undefined || god.defense < 0) errors.push({ field: 'defense', message: 'กรุณากรอกพลังป้องกัน' });
    if (!god.ability?.trim()) errors.push({ field: 'ability', message: 'กรุณากรอกความสามารถ (EN)' });
    if (!god.abilityTH?.trim()) errors.push({ field: 'abilityTH', message: 'กรุณากรอกความสามารถ (TH)' });
    if (!god.image?.trim()) errors.push({ field: 'image', message: 'กรุณาเลือกอีโมจิ' });
    return errors;
  },
  
  validateEnemy: (enemy) => {
    const errors: ValidationError[] = [];
    if (!enemy.id?.trim()) errors.push({ field: 'id', message: 'กรุณากรอก ID' });
    if (!enemy.name?.trim()) errors.push({ field: 'name', message: 'กรุณากรอกชื่อ (EN)' });
    if (!enemy.nameTH?.trim()) errors.push({ field: 'nameTH', message: 'กรุณากรอกชื่อ (TH)' });
    if (enemy.hp === undefined || enemy.hp < 0) errors.push({ field: 'hp', message: 'กรุณากรอก HP' });
    if (enemy.maxHp === undefined || enemy.maxHp < 0) errors.push({ field: 'maxHp', message: 'กรุณากรอก Max HP' });
    if (enemy.attack === undefined || enemy.attack < 0) errors.push({ field: 'attack', message: 'กรุณากรอกพลังโจมตี' });
    if (enemy.defense === undefined || enemy.defense < 0) errors.push({ field: 'defense', message: 'กรุณากรอกพลังป้องกัน' });
    if (!enemy.image?.trim()) errors.push({ field: 'image', message: 'กรุณาเลือกอีโมจิ' });
    return errors;
  },
  
  validateNpc: (npc) => {
    const errors: ValidationError[] = [];
    if (!npc.id?.trim()) errors.push({ field: 'id', message: 'กรุณากรอก ID' });
    if (!npc.name?.trim()) errors.push({ field: 'name', message: 'กรุณากรอกชื่อ (EN)' });
    if (!npc.nameTH?.trim()) errors.push({ field: 'nameTH', message: 'กรุณากรอกชื่อ (TH)' });
    if (!npc.description?.trim()) errors.push({ field: 'description', message: 'กรุณากรอกคำอธิบาย' });
    if (!npc.image?.trim()) errors.push({ field: 'image', message: 'กรุณาเลือกอีโมจิ' });
    if (!npc.dialogue || npc.dialogue.length === 0) errors.push({ field: 'dialogue', message: 'กรุณาเพิ่มบทสนทนา' });
    return errors;
  },
  
  // Items CRUD
  selectItem: (item) => set({ selectedItem: item }),
  
  createItem: (item) => {
    const errors = get().validateItem(item);
    if (errors.length > 0) {
      set({ errors });
      return false;
    }
    const { items } = get();
    if (items.some(i => i.id === item.id)) {
      set({ errors: [{ field: 'id', message: 'ID นี้มีอยู่แล้ว' }] });
      return false;
    }
    set({ items: [...items, item], errors: [], isModalOpen: false });
    return true;
  },
  
  updateItem: (item) => {
    const errors = get().validateItem(item);
    if (errors.length > 0) {
      set({ errors });
      return false;
    }
    const { items } = get();
    const index = items.findIndex(i => i.id === item.id);
    if (index === -1) return false;
    const newItems = [...items];
    newItems[index] = item;
    set({ items: newItems, errors: [], isModalOpen: false, selectedItem: null });
    return true;
  },
  
  deleteItem: (id) => {
    const { items } = get();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return false;
    const newItems = [...items];
    newItems.splice(index, 1);
    set({ items: newItems, selectedItem: null });
    return true;
  },
  
  // Gods CRUD
  selectGod: (god) => set({ selectedGod: god }),
  
  createGod: (god) => {
    const errors = get().validateGod(god);
    if (errors.length > 0) {
      set({ errors });
      return false;
    }
    const { gods } = get();
    if (gods.some(g => g.id === god.id)) {
      set({ errors: [{ field: 'id', message: 'ID นี้มีอยู่แล้ว' }] });
      return false;
    }
    set({ gods: [...gods, god], errors: [], isModalOpen: false });
    return true;
  },
  
  updateGod: (god) => {
    const errors = get().validateGod(god);
    if (errors.length > 0) {
      set({ errors });
      return false;
    }
    const { gods } = get();
    const index = gods.findIndex(g => g.id === god.id);
    if (index === -1) return false;
    const newGods = [...gods];
    newGods[index] = god;
    set({ gods: newGods, errors: [], isModalOpen: false, selectedGod: null });
    return true;
  },
  
  deleteGod: (id) => {
    const { gods } = get();
    const index = gods.findIndex(g => g.id === id);
    if (index === -1) return false;
    const newGods = [...gods];
    newGods.splice(index, 1);
    set({ gods: newGods, selectedGod: null });
    return true;
  },
  
  // Enemies CRUD
  selectEnemy: (enemy) => set({ selectedEnemy: enemy }),
  
  createEnemy: (enemy) => {
    const errors = get().validateEnemy(enemy);
    if (errors.length > 0) {
      set({ errors });
      return false;
    }
    const { enemies } = get();
    if (enemies.some(e => e.id === enemy.id)) {
      set({ errors: [{ field: 'id', message: 'ID นี้มีอยู่แล้ว' }] });
      return false;
    }
    set({ enemies: [...enemies, enemy], errors: [], isModalOpen: false });
    return true;
  },
  
  updateEnemy: (enemy) => {
    const errors = get().validateEnemy(enemy);
    if (errors.length > 0) {
      set({ errors });
      return false;
    }
    const { enemies } = get();
    const index = enemies.findIndex(e => e.id === enemy.id);
    if (index === -1) return false;
    const newEnemies = [...enemies];
    newEnemies[index] = enemy;
    set({ enemies: newEnemies, errors: [], isModalOpen: false, selectedEnemy: null });
    return true;
  },
  
  deleteEnemy: (id) => {
    const { enemies } = get();
    const index = enemies.findIndex(e => e.id === id);
    if (index === -1) return false;
    const newEnemies = [...enemies];
    newEnemies.splice(index, 1);
    set({ enemies: newEnemies, selectedEnemy: null });
    return true;
  },
  
  // NPCs CRUD
  selectNpc: (npc) => set({ selectedNpc: npc }),
  
  createNpc: (npc) => {
    const errors = get().validateNpc(npc);
    if (errors.length > 0) {
      set({ errors });
      return false;
    }
    const { npcs } = get();
    if (npcs.some(n => n.id === npc.id)) {
      set({ errors: [{ field: 'id', message: 'ID นี้มีอยู่แล้ว' }] });
      return false;
    }
    set({ npcs: [...npcs, npc], errors: [], isModalOpen: false });
    return true;
  },
  
  updateNpc: (npc) => {
    const errors = get().validateNpc(npc);
    if (errors.length > 0) {
      set({ errors });
      return false;
    }
    const { npcs } = get();
    const index = npcs.findIndex(n => n.id === npc.id);
    if (index === -1) return false;
    const newNpcs = [...npcs];
    newNpcs[index] = npc;
    set({ npcs: newNpcs, errors: [], isModalOpen: false, selectedNpc: null });
    return true;
  },
  
  deleteNpc: (id) => {
    const { npcs } = get();
    const index = npcs.findIndex(n => n.id === id);
    if (index === -1) return false;
    const newNpcs = [...npcs];
    newNpcs.splice(index, 1);
    set({ npcs: newNpcs, selectedNpc: null });
    return true;
  },
  
  // Modal
  openCreateModal: () => set({ isModalOpen: true, modalMode: 'create', errors: [] }),
  openEditModal: () => set({ isModalOpen: true, modalMode: 'edit', errors: [] }),
  closeModal: () => set({ isModalOpen: false, errors: [], selectedItem: null, selectedGod: null, selectedEnemy: null, selectedNpc: null }),
  
  // Import/Export
  exportData: () => {
    const { items, gods, enemies, npcs } = get();
    return JSON.stringify({ items, gods, enemies, npcs }, null, 2);
  },
  
  importData: (json) => {
    try {
      const data = JSON.parse(json);
      if (data.items && data.gods && data.enemies && data.npcs) {
        set({
          items: data.items,
          gods: data.gods,
          enemies: data.enemies,
          npcs: data.npcs
        });
        return true;
      }
      set({ errors: [{ field: 'import', message: 'รูปแบบข้อมูลไม่ถูกต้อง' }] });
      return false;
    } catch {
      set({ errors: [{ field: 'import', message: 'JSON ไม่ถูกต้อง' }] });
      return false;
    }
  },
  
  resetData: () => set({
    items: [...initialItems],
    gods: [...initialGods],
    enemies: [...initialEnemies],
    npcs: [...initialNpcs]
  })
}));
