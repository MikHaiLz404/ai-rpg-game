import { God } from '../types';

/**
 * @deprecated Legacy Greek gods data - NOT used in current game
 * Current game uses Leo, Arena, Draco from npcConfig.ts
 * This data was from an earlier version and is kept for reference
 */
export const gods: God[] = [
  {
    id: 'zeus',
    name: 'Zeus',
    nameTH: 'ซูส',
    description: 'King of Gods',
    hp: 100,
    maxHp: 100,
    attack: 25,
    defense: 10,
    ability: 'Thunder Strike',
    abilityTH: 'ประกายสายฟ้า',
    image: '⚡'
  },
  {
    id: 'athena',
    name: 'Athena',
    nameTH: 'อาเธน่า',
    description: 'Goddess of Wisdom',
    hp: 90,
    maxHp: 90,
    attack: 20,
    defense: 15,
    ability: 'Divine Shield',
    abilityTH: 'เกราะศักดิ์สิทธ์',
    image: '🦉'
  },
  {
    id: 'ares',
    name: 'Ares',
    nameTH: 'อเรซ',
    description: 'God of War',
    hp: 120,
    maxHp: 120,
    attack: 30,
    defense: 5,
    ability: 'War Cry',
    abilityTH: 'กรีราชส์',
    image: '⚔️'
  }
];
