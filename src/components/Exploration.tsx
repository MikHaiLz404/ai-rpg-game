'use client';
import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { EventBus } from '@/game/EventBus';
import { NPC_CONFIGS } from '@/data/npcConfig';
import { broadcastAISource } from './AIStatusBadge';

// --- LOCATION DATA ---
interface ExplorationLocation {
  id: string;
  name: string;
  emoji: string;
  description: string;
  difficulty: number; // 1-5 stars
  unlockDay: number;
  loot: { id: string; name: string; emoji: string; weight: number }[];
  monsters: { name: string; emoji: string; hp: number; atk: number; reward: number }[];
  encounterRate: number; // 0-1, chance of monster encounter
  events: ExplorationEvent[];
  bgColor: string;
  borderColor: string;
  bgImage: string;
}

interface ExplorationEvent {
  name: string;
  emoji: string;
  description: string;
  type: 'gold' | 'item' | 'ip' | 'trap' | 'heal';
  value: number; // gold amount, IP amount, or damage for trap
  itemId?: string;
  weight: number;
}

const LOCATIONS: ExplorationLocation[] = [
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
      { id: 'basket', name: 'Basket', emoji: '🧺', weight: 5 },
    ],
    monsters: [
      { name: 'หมาป่า', emoji: '🐺', hp: 25, atk: 6, reward: 15 },
      { name: 'สไลม์', emoji: '🦠', hp: 15, atk: 3, reward: 10 },
    ],
    encounterRate: 0.35,
    events: [
      { name: 'หีบสมบัติ', emoji: '🎁', description: 'เจอหีบสมบัติซ่อนอยู่ในพุ่มไม้!', type: 'gold', value: 30, weight: 20 },
      { name: 'สมุนไพรหายาก', emoji: '🌿', description: 'เจอสมุนไพรพิเศษ!', type: 'item', value: 0, itemId: 'herbs', weight: 30 },
      { name: 'กับดักหมี', emoji: '🪤', description: 'เหยียบกับดักหมี!', type: 'trap', value: 10, weight: 15 },
      { name: 'ลำธารศักดิ์สิทธิ์', emoji: '💧', description: 'พบลำธารที่มีพลังรักษา', type: 'heal', value: 20, weight: 15 },
    ],
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
      { id: 'herbs', name: 'Herbs', emoji: '🌿', weight: 15 },
      { id: 'cloth', name: 'Cloth', emoji: '🧣', weight: 20 },
      { id: 'shield', name: 'Shield', emoji: '🛡️', weight: 10 },
      { id: 'potion_mana', name: 'Mana Potion', emoji: '💙', weight: 15 },
      { id: 'sword', name: 'Sword', emoji: '⚔️', weight: 10 },
    ],
    monsters: [
      { name: 'ก๊อบลิน', emoji: '👺', hp: 40, atk: 10, reward: 25 },
      { name: 'หมีภูเขา', emoji: '🐻', hp: 60, atk: 14, reward: 40 },
    ],
    encounterRate: 0.45,
    events: [
      { name: 'เส้นแร่ทองคำ', emoji: '✨', description: 'ค้นพบเส้นแร่ทองคำ!', type: 'gold', value: 60, weight: 15 },
      { name: 'ถ้ำซ่อน', emoji: '🕳️', description: 'เจอถ้ำลับซ่อนอาวุธ!', type: 'item', value: 0, itemId: 'sword', weight: 10 },
      { name: 'พายุหิมะ', emoji: '🌨️', description: 'พายุหิมะกระหน่ำ! เคนหนาวสั่น', type: 'trap', value: 15, weight: 20 },
      { name: 'ศิลาเทพ', emoji: '🪨', description: 'พบศิลาจารึกที่เปล่งพลังเทพ', type: 'ip', value: 3, weight: 15 },
    ],
    bgColor: 'from-slate-700/50 to-blue-900/30',
    borderColor: 'border-blue-500/30',
    bgImage: '/images/backgrounds/exploration/mountain/bg_mountain.png',
  },
  {
    id: 'cave',
    name: 'ถ้ำลาวา',
    emoji: '🌋',
    description: 'ถ้ำร้อนระอุที่เต็มไปด้วยสิ่งของหายากและสัตว์ประหลาดอันตราย',
    difficulty: 3,
    unlockDay: 10,
    loot: [
      { id: 'ore', name: 'Ore', emoji: '🪨', weight: 20 },
      { id: 'sword', name: 'Sword', emoji: '⚔️', weight: 15 },
      { id: 'shield', name: 'Shield', emoji: '🛡️', weight: 15 },
      { id: 'perfume', name: 'Perfume', emoji: '✨', weight: 10 },
      { id: 'mirror', name: 'Mirror', emoji: '🪞', weight: 15 },
      { id: 'potion_health', name: 'Health Potion', emoji: '❤️', weight: 15 },
      { id: 'bow', name: 'Bow', emoji: '🏹', weight: 10 },
    ],
    monsters: [
      { name: 'วิญญาณไฟ', emoji: '🔥', hp: 80, atk: 20, reward: 60 },
      { name: 'โครงกระดูก', emoji: '💀', hp: 60, atk: 16, reward: 45 },
    ],
    encounterRate: 0.55,
    events: [
      { name: 'ขุมทรัพย์มังกร', emoji: '💰', description: 'ค้นพบขุมทรัพย์ที่มังกรเฝ้า!', type: 'gold', value: 100, weight: 10 },
      { name: 'หินเวท', emoji: '💎', description: 'เจอหินเวทที่เปล่งพลังเทพ!', type: 'ip', value: 5, weight: 15 },
      { name: 'ลาวาพุ่ง', emoji: '🌋', description: 'ลาวาพุ่งขึ้นมากะทันหัน!', type: 'trap', value: 25, weight: 20 },
      { name: 'น้ำพุร้อน', emoji: '♨️', description: 'พบน้ำพุร้อนที่มีพลังรักษา', type: 'heal', value: 30, weight: 15 },
    ],
    bgColor: 'from-red-900/50 to-orange-800/30',
    borderColor: 'border-red-500/30',
    bgImage: '/images/backgrounds/exploration/cave/bg_cave_interior.png',
  },
  {
    id: 'ruins',
    name: 'ซากปรักหักพัง',
    emoji: '🏛️',
    description: 'ซากอารยธรรมโบราณที่ซ่อนสมบัติล้ำค่าและความลับของเทพเจ้า',
    difficulty: 4,
    unlockDay: 15,
    loot: [
      { id: 'olympian_coin', name: 'Olympian Coin', emoji: '🪙', weight: 15 },
      { id: 'mirror', name: 'Mirror', emoji: '🪞', weight: 15 },
      { id: 'perfume', name: 'Perfume', emoji: '✨', weight: 15 },
      { id: 'bow', name: 'Bow', emoji: '🏹', weight: 15 },
      { id: 'sword', name: 'Sword', emoji: '⚔️', weight: 15 },
      { id: 'shield', name: 'Shield', emoji: '🛡️', weight: 15 },
      { id: 'potion_mana', name: 'Mana Potion', emoji: '💙', weight: 10 },
    ],
    monsters: [
      { name: 'ผีโบราณ', emoji: '👻', hp: 100, atk: 25, reward: 80 },
      { name: 'โกเลม', emoji: '🗿', hp: 150, atk: 30, reward: 120 },
    ],
    encounterRate: 0.65,
    events: [
      { name: 'คัมภีร์โบราณ', emoji: '📜', description: 'ค้นพบคัมภีร์ที่ซ่อนพลังเทพ!', type: 'ip', value: 8, weight: 10 },
      { name: 'ห้องสมบัติ', emoji: '👑', description: 'เจอห้องสมบัติลับ!', type: 'gold', value: 150, weight: 10 },
      { name: 'กับดักโบราณ', emoji: '⚡', description: 'เหยียบกับดักเวทมนตร์!', type: 'trap', value: 30, weight: 20 },
      { name: 'เหรียญเทพ', emoji: '🪙', description: 'เจอเหรียญโอลิมเปียในซอกหิน!', type: 'item', value: 0, itemId: 'olympian_coin', weight: 15 },
    ],
    bgColor: 'from-purple-900/50 to-violet-800/30',
    borderColor: 'border-purple-500/30',
    bgImage: '/images/backgrounds/exploration/ruins/bg_ruins.png',
  },
];

// --- WEIGHTED RANDOM HELPER ---
function weightedRandom<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

// --- EXPLORATION RESULT TYPE ---
type ExploreResult = {
  type: 'gather';
  item: { id: string; name: string; emoji: string };
} | {
  type: 'monster';
  monster: { name: string; emoji: string; hp: number; atk: number; reward: number };
  won: boolean;
  playerDmgTaken: number;
  playerDmgDealt: number;
  goldEarned: number;
} | {
  type: 'event';
  event: ExplorationEvent;
};

export default function Exploration() {
  const {
    choicesLeft, consumeChoice, addItem, addGold, setDialogue, setIsBusy,
    day, companions, getBondBonus, addIP, addBond, gold, spendGold,
    explorationLog, addExplorationLog
  } = useGameStore();

  const [selectedLocation, setSelectedLocation] = useState<ExplorationLocation | null>(null);
  const [isExploring, setIsExploring] = useState(false);
  const [exploreResult, setExploreResult] = useState<ExploreResult | null>(null);

  const availableLocations = LOCATIONS.filter(loc => day >= loc.unlockDay);

  // Calculate Kane's combat power from bonds
  const totalBonusAtk = companions.reduce((acc, c) => acc + getBondBonus(c.id).atk, 0);
  const totalBonusDef = companions.reduce((acc, c) => acc + getBondBonus(c.id).def, 0);
  const kanePower = 15 + totalBonusAtk; // base + bond bonus

  // Find highest-bond god to narrate exploration events
  const guideGod = (() => {
    const gods = companions.filter(c => c.id !== 'kane');
    if (gods.length === 0) return null;
    const best = gods.reduce((a, b) => a.bond >= b.bond ? a : b);
    const config = NPC_CONFIGS[best.id];
    return config ? { id: best.id, name: best.name, thaiName: best.name, config } : null;
  })();

  const handleExplore = async (location: ExplorationLocation) => {
    if (choicesLeft <= 0) {
      setDialogue({
        speaker: 'Minju',
        text: 'วันนี้สำรวจมาเยอะแล้วค่ะ... กลับไปพักผ่อนกันก่อนดีกว่านะเคน',
        portrait: 'work'
      });
      return;
    }

    setIsExploring(true);
    setIsBusy(true);
    setExploreResult(null);
    consumeChoice();
    EventBus.emit('exploration-gather-start');

    // Day-based scaling for monsters
    const dayScale = 1 + (day - 1) * 0.04;

    // Determine encounter type: monster vs gather vs event
    const roll = Math.random();
    const eventRoll = Math.random();

    setTimeout(async () => {
      if (roll < location.encounterRate) {
        // MONSTER ENCOUNTER
        const monster = location.monsters[Math.floor(Math.random() * location.monsters.length)];
        const scaledHp = Math.floor(monster.hp * dayScale);
        const scaledAtk = Math.floor(monster.atk * dayScale);
        const scaledReward = Math.floor(monster.reward * (1 + (day - 1) * 0.03));

        // Auto-combat simulation
        let kaneHp = 100;
        let monsterHp = scaledHp;
        let rounds = 0;

        while (kaneHp > 0 && monsterHp > 0 && rounds < 10) {
          // Kane attacks
          const kaneDmg = Math.floor(Math.random() * 10 + kanePower);
          monsterHp = Math.max(0, monsterHp - kaneDmg);

          if (monsterHp > 0) {
            // Monster attacks
            const monsterDmg = Math.max(1, Math.floor(Math.random() * scaledAtk) + 3 - totalBonusDef);
            kaneHp = Math.max(0, kaneHp - monsterDmg);
          }
          rounds++;
        }

        const won = monsterHp <= 0;
        const goldEarned = won ? scaledReward : Math.floor(scaledReward * 0.2);

        if (won) {
          addGold(goldEarned);
          addIP(1); // IP gain on exploration monster kill
          // Random god notices your bravery — 50% chance bond +1
          const gods = companions.filter(c => c.id !== 'kane');
          const luckyGod = gods.length > 0 && Math.random() < 0.5
            ? gods[Math.floor(Math.random() * gods.length)] : null;
          if (luckyGod) addBond(luckyGod.id, 1);
          // Bonus: also get a loot item on monster kill
          const bonusItem = weightedRandom(location.loot);
          addItem(bonusItem.id);
          addExplorationLog([
            `${monster.emoji} ${monster.name} ปรากฏตัว!`,
            `Kane ต่อสู้ ${rounds} รอบ`,
            `Kane ชนะ! +${goldEarned} ทอง · +1 IP${luckyGod ? ` · ${luckyGod.name} +1 สนิท` : ''}`,
            `${bonusItem.emoji} เจอ ${bonusItem.name} ด้วย!`,
          ]);
          setExploreResult({
            type: 'monster',
            monster: { ...monster, hp: scaledHp, atk: scaledAtk, reward: scaledReward },
            won: true,
            playerDmgTaken: 100 - kaneHp,
            playerDmgDealt: scaledHp,
            goldEarned,
          });
        } else {
          addGold(goldEarned);
          addExplorationLog([
            `${monster.emoji} ${monster.name} ปรากฏตัว!`,
            `Kane ต่อสู้ ${rounds} รอบ`,
            `Kane ต้องถอยหนี... +${goldEarned} ทอง`,
          ]);
          setExploreResult({
            type: 'monster',
            monster: { ...monster, hp: scaledHp, atk: scaledAtk, reward: scaledReward },
            won: false,
            playerDmgTaken: 100 - kaneHp,
            playerDmgDealt: scaledHp - monsterHp,
            goldEarned,
          });
        }

        try {
          const narrateNpcName = guideGod?.name || 'เลโอ';
          const res = await fetch('/api/narrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'exploration_event',
              playerName: 'Minju',
              npcName: narrateNpcName,
              npcPersonality: guideGod?.config.personality || '',
              npcSpeechStyle: guideGod?.config.speechStyle || '',
              location: location.name,
              foundItem: `ต่อสู้กับ ${monster.name} ${won ? 'และชนะ' : 'แต่ต้องถอยหนี'}`
            })
          });
          const data = await res.json();
          if (data.source) broadcastAISource(data.source);
          setDialogue({
            speaker: guideGod?.name || 'Minju',
            text: data.narrative || (won ? `เก่งมากเคน! ${monster.name} ไม่ใช่คู่ต่อสู้ของเรา!` : `ระวังนะเคน! ${monster.name} แข็งแกร่งเกินไป!`),
            portrait: won ? 'happy' : 'shock'
          });
        } catch {
          setDialogue({
            speaker: guideGod?.name || 'Minju',
            text: won ? `เก่งมากเคน! ชนะ ${monster.name} ได้ ${goldEarned} ทอง!` : `ไม่เป็นไรนะเคน... ไว้กลับมาสู้ใหม่!`,
            portrait: won ? 'happy' : 'shock'
          });
        }
      } else if (eventRoll < 0.35 && location.events.length > 0) {
        // RANDOM EVENT
        const event = weightedRandom(location.events);

        switch (event.type) {
          case 'gold':
            addGold(event.value);
            break;
          case 'item':
            if (event.itemId) addItem(event.itemId);
            break;
          case 'ip':
            addIP(event.value);
            break;
          case 'trap':
            // Trap costs gold (can't go below 0)
            if (gold >= event.value) spendGold(event.value);
            break;
          case 'heal':
            addIP(1); // Minor IP recovery as "heal" benefit
            break;
        }

        addExplorationLog([
          `${event.emoji} ${event.name}: ${event.description}`,
          event.type === 'gold' ? `+${event.value} ทอง` :
          event.type === 'ip' ? `+${event.value} IP` :
          event.type === 'trap' ? `-${event.value} ทอง` :
          event.type === 'item' ? `ได้ของ!` : `ฟื้นฟูพลัง!`,
        ]);

        setExploreResult({ type: 'event', event });
        setDialogue({
          speaker: 'Minju',
          text: event.description,
          portrait: event.type === 'trap' ? 'shock' : 'happy'
        });
      } else {
        // NORMAL GATHER
        const item = weightedRandom(location.loot);
        addItem(item.id);

        addExplorationLog([
          `${item.emoji} เก็บ ${item.name} ใน${location.name}`,
        ]);

        setExploreResult({ type: 'gather', item });

        try {
          const narrateNpcName = guideGod?.name || 'เลโอ';
          const res = await fetch('/api/narrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'exploration_event',
              playerName: 'Minju',
              npcName: narrateNpcName,
              npcPersonality: guideGod?.config.personality || '',
              npcSpeechStyle: guideGod?.config.speechStyle || '',
              location: location.name,
              foundItem: item.name
            })
          });
          const data = await res.json();
          if (data.source) broadcastAISource(data.source);
          setDialogue({
            speaker: guideGod?.name || 'Minju',
            text: data.narrative || `เจอ ${item.emoji} ${item.name} ใน${location.name} ด้วยล่ะเคน!`,
            portrait: 'happy'
          });
        } catch {
          setDialogue({
            speaker: guideGod?.name || 'Minju',
            text: `เจอ ${item.emoji} ${item.name} ใน${location.name} ด้วยล่ะเคน! เก็บไว้ขายที่ร้านเรานะ`,
            portrait: 'happy'
          });
        }
      }

      setIsExploring(false);
      setIsBusy(false);
      EventBus.emit('exploration-gather-end');
    }, 1500);
  };

  // --- LOCATION SELECTION VIEW ---
  if (!selectedLocation) {
    return (
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-emerald-500/20 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black text-emerald-400 uppercase tracking-tighter italic font-serif">ดินแดนสำรวจ</h2>
          <div className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">
            พลังรบ: <span className="text-emerald-400">{kanePower}</span> ATK / <span className="text-blue-400">{totalBonusDef}</span> DEF
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {LOCATIONS.map((loc) => {
            const locked = day < loc.unlockDay;
            return (
              <button
                key={loc.id}
                onClick={() => !locked && setSelectedLocation(loc)}
                disabled={locked}
                className={`w-full group p-4 rounded-2xl transition-all flex items-center justify-between ${
                  locked
                    ? 'bg-slate-800/20 border border-white/5 opacity-40 cursor-not-allowed'
                    : 'bg-slate-800/40 hover:bg-slate-800 border border-white/5 hover:border-emerald-500/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-2xl border border-white/5 group-hover:scale-110 transition-transform shadow-inner overflow-hidden relative">
                    {!locked && (
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-40"
                        style={{ backgroundImage: `url(${loc.bgImage})` }}
                      />
                    )}
                    <span className="relative z-10">{locked ? '🔒' : loc.emoji}</span>
                  </div>
                  <div className="text-left">
                    <div className="font-black text-white uppercase tracking-tight">
                      {loc.name}
                      <span className="ml-2 text-amber-400/70 text-[9px] md:text-[11px]">
                        {'★'.repeat(loc.difficulty)}{'☆'.repeat(5 - loc.difficulty)}
                      </span>
                    </div>
                    <div className="text-[9px] md:text-[11px] text-slate-400 mt-0.5">
                      {locked ? `ปลดล็อควันที่ ${loc.unlockDay}` : loc.description}
                    </div>
                  </div>
                </div>
                {!locked && (
                  <div className="text-[10px] md:text-xs font-black text-emerald-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    สำรวจ
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Exploration Log */}
        {explorationLog.length > 0 && (
          <div className="bg-black/50 p-4 rounded-xl max-h-32 overflow-y-auto font-mono text-[10px] md:text-xs leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
            <div className="text-[9px] md:text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">บันทึกการสำรวจ</div>
            {explorationLog.map((log, i) => (
              <div key={i} className={i === 0 ? 'text-emerald-300 font-bold' : 'text-slate-500'}>{log}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- LOCATION DETAIL VIEW ---
  return (
    <div className="bg-slate-900/90 p-6 rounded-2xl border border-emerald-500/20 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => { setSelectedLocation(null); setExploreResult(null); }}
          className="text-slate-500 hover:text-white text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors"
        >
          ← กลับ
        </button>
        <div className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">
          {choicesLeft > 0 ? `${choicesLeft} แต้มเหลือ` : 'แต้มหมด'}
        </div>
      </div>

      {/* Location Banner with Background */}
      <div className={`relative rounded-2xl border ${selectedLocation.borderColor} mb-4 overflow-hidden`}>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${selectedLocation.bgImage})` }}
        />
        <div className={`relative bg-gradient-to-r ${selectedLocation.bgColor} p-4`}>
          <div className="flex items-center gap-3">
            <span className="text-4xl drop-shadow-lg">{selectedLocation.emoji}</span>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight drop-shadow">
                {selectedLocation.name}
                <span className="ml-2 text-amber-400/70 text-xs md:text-sm">
                  {'★'.repeat(selectedLocation.difficulty)}
                </span>
              </h3>
              <div className="text-[10px] md:text-xs text-slate-300/70">{selectedLocation.description}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Info Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-800/40 p-3 rounded-xl border border-white/5 text-center">
          <div className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">สัตว์ร้าย</div>
          <div className="text-sm font-black text-red-400 mt-1">{Math.round(selectedLocation.encounterRate * 100)}%</div>
        </div>
        <div className="bg-slate-800/40 p-3 rounded-xl border border-white/5 text-center">
          <div className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">ของดรอป</div>
          <div className="text-sm font-black text-amber-400 mt-1">{selectedLocation.loot.length} แบบ</div>
        </div>
        <div className="bg-slate-800/40 p-3 rounded-xl border border-white/5 text-center">
          <div className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">เหตุการณ์</div>
          <div className="text-sm font-black text-purple-400 mt-1">{selectedLocation.events.length} แบบ</div>
        </div>
      </div>

      {/* Monsters Preview */}
      <div className="mb-4 space-y-2">
        <div className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest">สัตว์ร้ายในพื้นที่</div>
        <div className="flex gap-2">
          {selectedLocation.monsters.map((m, i) => {
            const dayScale = 1 + (day - 1) * 0.04;
            return (
              <div key={i} className="flex-1 bg-red-900/20 p-2 rounded-xl border border-red-500/10 text-center">
                <span className="text-xl">{m.emoji}</span>
                <div className="text-[9px] md:text-[11px] font-black text-white mt-1">{m.name}</div>
                <div className="text-[8px] md:text-[10px] text-slate-400">HP {Math.floor(m.hp * dayScale)} ATK {Math.floor(m.atk * dayScale)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explore Button */}
      <button
        onClick={() => handleExplore(selectedLocation)}
        disabled={isExploring || choicesLeft <= 0}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl uppercase text-xs md:text-sm tracking-widest transition-all active:scale-95 mb-4"
      >
        {isExploring ? '⏳ กำลังสำรวจ...' : choicesLeft > 0 ? `🗡️ ออกสำรวจ (ใช้ 1 แต้ม)` : 'แต้มหมดแล้ว'}
      </button>

      {/* Explore Result */}
      {exploreResult && (
        <div className={`p-4 rounded-xl border mb-4 ${
          exploreResult.type === 'monster'
            ? exploreResult.won ? 'bg-green-900/20 border-green-500/20' : 'bg-red-900/20 border-red-500/20'
            : exploreResult.type === 'event'
            ? exploreResult.event.type === 'trap' ? 'bg-red-900/20 border-red-500/20' : 'bg-purple-900/20 border-purple-500/20'
            : 'bg-emerald-900/20 border-emerald-500/20'
        }`}>
          {exploreResult.type === 'monster' && (
            <div className="text-center">
              <span className="text-3xl">{exploreResult.monster.emoji}</span>
              <div className="text-sm font-black text-white mt-1">
                {exploreResult.won ? 'ชัยชนะ!' : 'ต้องถอยหนี!'}
              </div>
              <div className="text-[10px] md:text-xs text-slate-400 mt-1">
                ปะทะ {exploreResult.monster.name} · โดน {exploreResult.playerDmgTaken} dmg · ได้ {exploreResult.goldEarned} ทอง
              </div>
            </div>
          )}
          {exploreResult.type === 'event' && (
            <div className="text-center">
              <span className="text-3xl">{exploreResult.event.emoji}</span>
              <div className="text-sm font-black text-white mt-1">{exploreResult.event.name}</div>
              <div className="text-[10px] md:text-xs text-slate-400 mt-1">{exploreResult.event.description}</div>
            </div>
          )}
          {exploreResult.type === 'gather' && (
            <div className="text-center">
              <span className="text-3xl">{exploreResult.item.emoji}</span>
              <div className="text-sm font-black text-white mt-1">เก็บ {exploreResult.item.name}!</div>
              <div className="text-[10px] md:text-xs text-slate-400 mt-1">เพิ่มเข้าคลังสินค้าแล้ว</div>
            </div>
          )}
        </div>
      )}

      {/* Location Loot Table */}
      <div className="bg-black/30 p-3 rounded-xl border border-white/5">
        <div className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">ของที่หาได้</div>
        <div className="flex flex-wrap gap-1.5">
          {selectedLocation.loot.map((item, i) => (
            <span key={i} className="text-[9px] md:text-[11px] bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-white/5">
              {item.emoji} {item.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
