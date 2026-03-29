'use client';
import { useState, useEffect } from 'react';
import { useGameStore, DivineSkill } from '@/store/gameStore';
import { EventBus } from '@/game/EventBus';
import { NPC_CONFIGS } from '@/data/npcConfig';
import { EXPLORATION_LOCATIONS, ExplorationLocation } from '@/data/locations';
import { HPColorIcon, SwordColorIcon, ShieldColorIcon } from './Icons';

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

export default function Exploration() {
  const {
    choicesLeft, consumeChoice, addItem, addGold, setDialogue,
    day, companions, addIP, explorationLog, addExplorationLog,
    explorationEnergy, setExplorationEnergy, reduceEnergy, isExploringRoom, setIsExploringRoom,
    kaneStats, updateKaneStats, boostSkill
  } = useGameStore();

  const [selectedLocation, setSelectedLocation] = useState<ExplorationLocation | null>(null);
  const [encounter, setEncounter] = useState<{ type: 'enemy' | 'item'; data: any; x: number; y: number } | null>(null);
  const [blessing, setBlessing] = useState<{ god: any; options: any[] } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Listen for tile clicks from Phaser
  useEffect(() => {
    const onTileClicked = (data: { type: string; x: number; y: number }) => {
      if (!selectedLocation || isProcessing) return;

      if (data.type === 'gathering') {
        const item = weightedRandom(selectedLocation.loot);
        setEncounter({ type: 'item', data: item, x: data.x, y: data.y });
        reduceEnergy(1);
      } else {
        const baseMonster = selectedLocation.monsters[Math.floor(Math.random() * selectedLocation.monsters.length)];
        const scale = 1 + (day - 1) * 0.05;
        const enemy = {
          ...baseMonster,
          hp: Math.floor(baseMonster.hp * scale * (0.8 + Math.random() * 0.4)),
          atk: Math.floor(baseMonster.atk * scale * (0.8 + Math.random() * 0.4)),
          def: Math.floor(baseMonster.def * 0.5 * scale),
          reward: Math.floor(baseMonster.reward * scale)
        };
        setEncounter({ type: 'enemy', data: enemy, x: data.x, y: data.y });
      }
    };

    EventBus.on('exploration-tile-clicked', onTileClicked);
    return () => { EventBus.off('exploration-tile-clicked', onTileClicked); };
  }, [selectedLocation, day, reduceEnergy, isProcessing]);

  const handleStartExploration = (loc: ExplorationLocation) => {
    if (choicesLeft <= 0) {
      setDialogue({ speaker: 'Minju', text: 'แต้มการกระทำหมดแล้วค่ะ พักผ่อนเถอะนะ', portrait: 'work' });
      return;
    }
    consumeChoice();
    setSelectedLocation(loc);
    setExplorationEnergy(5);
    setIsExploringRoom(true);
    EventBus.emit('change-room', 'cave_entrance'); 
  };

  const handleLeaveEncounter = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    reduceEnergy(2); // Leave costs 2 Energy
    setEncounter(null);
    addExplorationLog(['Kane ตัดสินใจถอยหนีจากศัตรู...']);
    setTimeout(() => setIsProcessing(false), 500);
  };

  const handleFightEncounter = () => {
    if (isProcessing || !encounter || !selectedLocation) return;
    setIsProcessing(true);
    
    const enemy = encounter.data;
    reduceEnergy(1); // Fight costs only 1 Energy

    // Scaling combat logic
    let won = true;
    const isUnderdog = enemy.atk > kaneStats.atk || enemy.hp > (kaneStats.hp * 0.8);

    if (won) {
      const lootGold = enemy.reward * 2;
      addGold(lootGold);
      addIP(2);
      
      const item = weightedRandom(selectedLocation.loot);
      addItem(item.id);

      addExplorationLog([
        `Kane เอาชนะ ${enemy.emoji} ${enemy.name}!`,
        `ได้รับ ${lootGold} ทอง และ ${item.emoji} ${item.name}`,
        `ได้รับ +2 IP`
      ]);

      EventBus.emit('spawn-floating-text', { x: encounter.x, y: encounter.y, text: `+${lootGold} G`, color: '#ffd700' });

      if (isUnderdog) {
        triggerBlessing();
      }
    }

    setEncounter(null);
    setTimeout(() => setIsProcessing(false), 500);
  };

  const triggerBlessing = () => {
    const gods = companions.filter(c => c.id !== 'kane');
    const randomGod = gods[Math.floor(Math.random() * gods.length)];
    const godMeta = NPC_CONFIGS[randomGod.id];

    const options = [
      { type: 'stat', label: 'เสริมพลังกาย (+3 ATK)', action: () => updateKaneStats({ atk: kaneStats.atk + 3 }) },
      { type: 'stat', label: 'เสริมความอดทน (+3 DEF)', action: () => updateKaneStats({ def: kaneStats.def + 3 }) },
      { type: 'skill', label: 'ขัดเกลาสกิล (สุ่มเพิ่มพลังสกิล)', action: () => {
        const kane = companions.find(c => c.id === 'kane');
        if (kane && kane.unlockedSkills.length > 0) {
          const skill = kane.unlockedSkills[Math.floor(Math.random() * kane.unlockedSkills.length)];
          boostSkill(skill.name, 0.2);
        }
      }}
    ];

    setBlessing({
      god: { ...randomGod, meta: godMeta },
      options: options.sort(() => Math.random() - 0.5).slice(0, 2)
    });
  };

  const claimBlessing = (option: any) => {
    const godName = blessing?.god.name || 'God'; // Capture before setting to null
    option.action();
    setBlessing(null);
    setDialogue({
      speaker: godName,
      text: 'เจ้าทำได้ดีมาก จงรับพลังนี้ไปเสีย!',
      portrait: 'happy'
    });
  };

  if (!isExploringRoom) {
    return (
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-emerald-500/20 shadow-2xl space-y-6">
        <h2 className="text-3xl font-black text-emerald-400 uppercase tracking-tighter italic font-serif">ดินแดนสำรวจ</h2>
        <div className="space-y-3">
          {EXPLORATION_LOCATIONS.map(loc => (
            <button
              key={loc.id}
              onClick={() => handleStartExploration(loc)}
              className="w-full p-4 bg-slate-800/40 hover:bg-slate-800 border border-white/5 hover:border-emerald-500/30 rounded-2xl transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-2xl border border-white/5 group-hover:scale-110 transition-transform">{loc.emoji}</div>
              <div className="text-left flex-1">
                <div className="font-black text-white uppercase tracking-tight font-serif">{loc.name}</div>
                <div className="text-[10px] text-slate-400 font-sans">{loc.description}</div>
              </div>
              <div className="text-emerald-500 text-xs font-black uppercase font-serif">สำรวจ (1/3)</div>
            </button>
          ))}
        </div>
        <div className="bg-black/50 p-4 rounded-xl max-h-32 overflow-y-auto font-mono text-[10px] md:text-xs leading-relaxed custom-scrollbar text-slate-500">
          {explorationLog.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/95 p-6 rounded-2xl border-2 border-emerald-500/30 shadow-2xl flex flex-col min-h-[500px] flex-1">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/30 animate-pulse">
            <HPColorIcon size={20} />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-serif">พลังสำรวจ</div>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`w-4 h-1.5 rounded-full ${i < explorationEnergy ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`} />
              ))}
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsExploringRoom(false)}
          className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors font-serif"
        >
          จบการสำรวจ
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {!encounter && !blessing && (
          <div className="text-center py-12 animate-in fade-in zoom-in">
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2 font-serif">
              {explorationEnergy > 0 ? `กำลังสำรวจ ${selectedLocation?.name}` : 'การสำรวจเสร็จสิ้น'}
            </h3>
            <p className="text-slate-500 text-xs italic font-sans">
              {explorationEnergy > 0 ? 'คลิกที่ "กลุ่มพลังงาน" ในฉากเพื่อค้นหาสิ่งต่างๆ' : 'คุณสำรวจพื้นที่นี้จนหมดพลังแล้ว กลับไปพักผ่อนเถอะ'}
            </p>
          </div>
        )}

        {encounter && encounter.type === 'enemy' && (
          <div className="bg-red-950/40 border-2 border-red-500/30 rounded-3xl p-6 text-center animate-in zoom-in duration-300">
            <span className="text-5xl mb-4 block drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">{encounter.data.emoji}</span>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1 font-serif">พบศัตรู: {encounter.data.name}!</h3>
            <div className="flex justify-center gap-4 mb-6 text-xs font-bold font-sans">
              <span className="text-red-400">HP: {encounter.data.hp}</span>
              <span className="text-orange-400">ATK: {encounter.data.atk}</span>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={handleFightEncounter}
                disabled={isProcessing || explorationEnergy < 1}
                className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-red-900/20 uppercase tracking-widest transition-all active:scale-95 border-2 border-white/10 font-serif"
              >
                เข้าต่อสู้ (ใช้ 1 พลัง)
                <div className="text-[9px] opacity-70 mt-0.5 font-sans">รางวัล x2 · โอกาสรับพรเทพ</div>
              </button>
              <button 
                onClick={handleLeaveEncounter}
                disabled={isProcessing || explorationEnergy < 2}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-bold rounded-xl border border-white/5 transition-all uppercase text-[10px] tracking-widest font-serif"
              >
                ถอยหนี (ใช้ 2 พลัง)
              </button>
            </div>
          </div>
        )}

        {encounter && encounter.type === 'item' && (
          <div className="bg-emerald-950/40 border-2 border-emerald-500/30 rounded-3xl p-6 text-center animate-in zoom-in duration-300">
            <span className="text-5xl mb-4 block drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">{encounter.data.emoji}</span>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1 font-serif">ค้นพบ {encounter.data.name}!</h3>
            <p className="text-slate-400 text-xs mb-6 font-sans">เก็บไอเทมเข้าคลังเรียบร้อยแล้ว</p>
            <button 
              onClick={() => setEncounter(null)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl uppercase text-xs tracking-widest transition-all font-serif"
            >
              ดำเนินการต่อ
            </button>
          </div>
        )}

        {blessing && (
          <div className="bg-amber-950/40 border-2 border-amber-500/40 rounded-3xl p-6 text-center animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-slate-900 rounded-full mx-auto mb-4 border-2 border-amber-500/50 overflow-hidden shadow-2xl">
              {blessing.god.meta?.facial ? <img src={blessing.god.meta.facial} className="w-full h-full object-cover image-pixelated" /> : <span className="text-4xl leading-[80px]">{blessing.god.meta?.emoji}</span>}
            </div>
            <h3 className="text-xl font-black text-amber-400 uppercase tracking-widest mb-1 font-serif">พรจากเทพ {blessing.god.name}</h3>
            <p className="text-slate-300 text-xs italic mb-6 font-sans">"เจ้าพิสูจน์ความกล้าหาญแล้ว จงรับของขวัญจากข้า"</p>
            <div className="grid grid-cols-1 gap-2">
              {blessing.options.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => claimBlessing(opt)}
                  className="p-4 bg-slate-900/80 hover:bg-slate-800 border border-amber-500/20 hover:border-amber-500 rounded-xl transition-all text-left group"
                >
                  <div className="text-xs font-black text-amber-500 uppercase mb-1 font-serif group-hover:text-white transition-colors">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 font-sans">รับการอวยพรเพื่อเพิ่มสถานะถาวร</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4 shrink-0">
        <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
          <SwordColorIcon size={14} className="text-emerald-400" />
          <span className="text-[10px] font-black uppercase text-slate-500 font-serif">ATK: <span className="text-white font-sans">{kaneStats.atk}</span></span>
        </div>
        <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
          <ShieldColorIcon size={14} className="text-blue-400" />
          <span className="text-[10px] font-black uppercase text-slate-500 font-serif">DEF: <span className="text-white font-sans">{kaneStats.def}</span></span>
        </div>
      </div>
    </div>
  );
}
