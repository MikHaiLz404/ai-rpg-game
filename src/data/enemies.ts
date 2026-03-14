import { Enemy } from '../types';

export const enemies: Enemy[] = [
  {
    id: 'minotaur',
    name: 'Minotaur',
    nameTH: 'ไมโนเทาร์',
    hp: 80,
    maxHp: 80,
    attack: 15,
    defense: 5,
    image: '🐂'
  },
  {
    id: 'hydra',
    name: 'Hydra',
    nameTH: 'ไฮดรา',
    hp: 100,
    maxHp: 100,
    attack: 20,
    defense: 3,
    image: '🐍'
  }
];
