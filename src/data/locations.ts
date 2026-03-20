export interface ExplorationLocation {
  id: string;
  name: string;
  emoji: string;
  description: string;
  difficulty: number;
  unlockDay: number;
  loot: { id: string; name: string; emoji: string; weight: number }[];
  monsters: { name: string; emoji: string; hp: number; atk: number; reward: number }[];
  encounterRate: number;
  bgColor: string;
  borderColor: string;
  bgImage: string;
}

export const EXPLORATION_LOCATIONS: ExplorationLocation[] = [
  {
    id: 'forest',
    name: 'ป่ามืด',
    emoji: '🌲',
    description: 'ป่าทึบที่เต็มไปด้วยสมุนไพรและสิ่งมีชีวิตแปลกประหลาด',
    difficulty: 1,
    unlockDay: 1,
    loot: [
      { id: 'herbs', name: 'Herbs', emoji: '🌿', weight: 30 },
      { id: 'wood', name: 'Wood', emoji: '🪵', weight: 30 },
      { id: 'flower', name: 'Flower', emoji: '🌸', weight: 25 },
      { id: 'potion_health', name: 'Health Potion', emoji: '❤️', weight: 10 },
    ],
    monsters: [
      { name: 'หมาป่า', emoji: '🐺', hp: 20, atk: 5, reward: 15 },
      { name: 'สไลม์', emoji: '🦠', hp: 12, atk: 3, reward: 10 },
    ],
    encounterRate: 0.35,
    bgColor: 'from-green-900/50 to-emerald-800/30',
    borderColor: 'border-green-500/30',
    bgImage: '/images/backgrounds/exploration/forest/bg_forest.png',
  },
  {
    id: 'mountain',
    name: 'ภูเขาหมอก',
    emoji: '🏔️',
    description: 'ยอดเขาสูงที่เต็มไปด้วยแร่ธาตุล้ำค่าและอากาศหนาวเหน็บ',
    difficulty: 2,
    unlockDay: 5,
    loot: [
      { id: 'ore', name: 'Ore', emoji: '🪨', weight: 30 },
      { id: 'cloth', name: 'Cloth', emoji: '🧣', weight: 20 },
      { id: 'shield', name: 'Shield', emoji: '🛡️', weight: 10 },
      { id: 'sword', name: 'Sword', emoji: '⚔️', weight: 10 },
    ],
    monsters: [
      { name: 'ก๊อบลิน', emoji: '👺', hp: 35, atk: 9, reward: 25 },
      { name: 'หมีภูเขา', emoji: '🐻', hp: 55, atk: 13, reward: 40 },
    ],
    encounterRate: 0.45,
    bgColor: 'from-slate-700/50 to-blue-900/30',
    borderColor: 'border-blue-500/30',
    bgImage: '/images/backgrounds/exploration/mountain/bg_mountain.png',
  },
];
