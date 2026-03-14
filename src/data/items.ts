import { Item } from '../types';

export const items: Item[] = [
  {
    id: 'weapon_1',
    name: 'Bronze Sword',
    nameTH: 'ดาบสำริด',
    description: 'A basic sword',
    price: 100,
    type: 'weapon',
    effect: { attack: 5 }
  },
  {
    id: 'weapon_2',
    name: 'Silver Spear',
    nameTH: 'หอกเงิน',
    description: 'A sharp spear',
    price: 250,
    type: 'weapon',
    effect: { attack: 12 }
  },
  {
    id: 'armor_1',
    name: 'Leather Armor',
    nameTH: 'เกราะหนัง',
    description: 'Basic protection',
    price: 80,
    type: 'armor',
    effect: { defense: 3 }
  },
  {
    id: 'armor_2',
    name: 'Golden Shield',
    nameTH: 'โล่ทอง',
    description: 'Divine protection',
    price: 200,
    type: 'armor',
    effect: { defense: 8 }
  },
  {
    id: 'potion_1',
    name: 'Health Potion',
    nameTH: 'ยาน้ำแดง',
    description: 'Restores HP',
    price: 50,
    type: 'consumable',
    effect: { hp: 30 }
  }
];
