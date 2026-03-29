'use client';
import { useState, useRef } from 'react';
import { useGameStore, MAX_TURNS } from '@/store/gameStore';
import { useSaveStore } from '@/store/saveStore';
import { NPC_CONFIGS, getSkillThresholds } from '@/data/npcConfig';
import { GoldIcon, HPIcon, ManaIcon, SwordIcon, ShieldIcon, IPIcon, PackageIcon, SparklesIcon } from './Icons';

// Item lookup for display
const ITEMS_MAP: Record<string, { name: string; emoji: string }> = {
  potion_health: { name: 'Health Potion', emoji: '❤️' },
  potion_mana: { name: 'Mana Potion', emoji: '💙' },
  soap: { name: 'Soap', emoji: '🧼' },
  perfume: { name: 'Perfume', emoji: '✨' },
  basket: { name: 'Basket', emoji: '🧺' },
  cloth: { name: 'Cloth', emoji: '🧣' },
  flower: { name: 'Flower', emoji: '🌸' },
  mirror: { name: 'Mirror', emoji: '🪞' },
  sword: { name: 'Sword', emoji: '⚔️' },
  shield: { name: 'Shield', emoji: '🛡️' },
  bow: { name: 'Bow', emoji: '🏹' },
  herbs: { name: 'Herbs', emoji: '🌿' },
  ore: { name: 'Ore', emoji: '🪨' },
  wood: { name: 'Wood', emoji: '🪵' },
  olympian_coin: { name: 'Olympian Coin', emoji: '🪙' },
};

export default function ChampionStatus() {
  const { companions, getBondBonus, items, gold, day, interventionPoints, resetGame, loadSaveData, kaneStats, arenaWins } = useGameStore();
  const { saveGame, loadGame, deleteAllSaves, checkHasSave, exportGame, importGame } = useSaveStore();
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const kane = companions.find(c => c.id === 'kane');

  if (!kane) return null;

  const gods = companions.filter(c => c.id !== 'kane');

  const bonuses = gods.reduce((acc, c) => {
    const b = getBondBonus(c.id);
    return { atk: acc.atk + b.atk, def: acc.def + b.def };
  }, { atk: 0, def: 0 });

  // Count items by id
  const itemCounts: Record<string, number> = {};
  items.forEach(id => { itemCounts[id] = (itemCounts[id] || 0) + 1; });

  const buildSaveArgs = (): [number, null, any, Record<string, number>, number] => {
    const relationships = companions.reduce((acc, c) => ({ ...acc, [c.id]: c.bond }), {} as Record<string, number>);
    const saveItems = items.map(id => ({ id, name: id, price: 0, type: 'consumable' }));
    return [gold, null, saveItems as any, relationships, arenaWins];
  };

  const flash = (msg: string) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(null), 2000);
  };

  const handleSaveSlot = async (slot: number) => {
    const success = await saveGame(...buildSaveArgs(), kaneStats, true, slot);
    flash(success ? `บันทึก Slot ${slot} สำเร็จ!` : 'บันทึกล้มเหลว');
  };

  const handleLoadSlot = async (slot: number) => {
    const data = await loadGame(slot);
    if (data) {
      loadSaveData(data);
      flash(`โหลด Slot ${slot} สำเร็จ!`);
    } else {
      flash(`ไม่พบข้อมูลใน Slot ${slot}`);
    }
  };

  const handleExport = () => {
    exportGame(...buildSaveArgs(), kaneStats);
    flash('ส่งออกไฟล์ JSON สำเร็จ!');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await importGame(file);
    if (data) {
      loadSaveData(data);
      flash('นำเข้าข้อมูลสำเร็จ!');
    } else {
      flash('ไฟล์ไม่ถูกต้องหรือเวอร์ชันไม่ตรง');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    if (confirm('รีเซ็ตข้อมูลเกมทั้งหมด? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) {
      deleteAllSaves();
      resetGame();
    }
  };

  const handleResetTutorial = () => {
    localStorage.removeItem('gods-arena-tutorial-dismissed');
    flash('Tutorial จะแสดงเมื่อรีเฟรช');
  };

  return (
    <div className="p-6 bg-slate-900/95 rounded-2xl border border-blue-500/20 shadow-2xl space-y-5 max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
      {/* Kane Header */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-blue-900/20 rounded-2xl border-2 border-blue-500/30 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
          <img
            src="/images/characters/npcs/kane/idle/hero_idle_DOWN.png"
            alt="Kane"
            className="w-full h-full object-contain image-pixelated scale-125"
          />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight italic font-serif">Kane <span className="text-blue-500 text-sm not-italic font-sans">ผู้พิทักษ์</span></h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap font-serif">
            <span className="bg-blue-500 text-slate-900 text-[10px] md:text-xs font-black px-2 py-0.5 rounded uppercase font-sans">LVL {kane.level}</span>
            <span className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              <SparklesIcon size={12} className="text-amber-500/50" /> สกิล: {kane.unlockedSkills.length}
            </span>
            <span className="text-amber-500/70 text-[10px] md:text-xs font-bold uppercase tracking-widest">วันที่ {day}/{MAX_TURNS}</span>
          </div>
        </div>
      </div>

      {/* Stats + Bonds Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
          <div className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 font-serif">พลังการต่อสู้</div>
          <div className="space-y-2">
            <StatRow icon={<HPIcon size={14} className="text-rose-500" />} label="พลังชีวิต" value={kaneStats?.hp || 0} bonus={0} color="text-rose-500" />
            <StatRow icon={<SwordIcon size={14} className="text-red-400" />} label="โจมตี" value={(kaneStats?.atk || 0) + bonuses.atk} bonus={bonuses.atk} color="text-red-400" />
            <StatRow icon={<ShieldIcon size={14} className="text-blue-400" />} label="ป้องกัน" value={(kaneStats?.def || 0) + bonuses.def} bonus={bonuses.def} color="text-blue-400" />
            <StatRow icon={<IPIcon size={14} className="text-purple-400" />} label="IP" value={interventionPoints} bonus={0} color="text-purple-400" />
          </div>
        </div>
        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
          <div className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 font-serif">สายสัมพันธ์</div>
          <div className="space-y-2">
            {gods.map(god => {
              const config = NPC_CONFIGS[god.id];
              const godThresholds = getSkillThresholds(god.id);
              const nextThreshold = godThresholds.find(t => god.bond < t);
              const prev = godThresholds.filter(t => t <= god.bond).pop() || 0;
              const progress = nextThreshold ? ((god.bond - prev) / (nextThreshold - prev)) * 100 : 100;
              return (
                <div key={god.id}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs md:text-sm">{config?.emoji || '👤'}</span>
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[8px] md:text-[10px] font-black text-slate-500 font-sans">{god.bond}{nextThreshold ? `/${nextThreshold}` : ''}</span>
                  </div>
                  {god.unlockedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-5 mt-0.5 font-serif">
                      {god.unlockedSkills.map((skill, i) => (
                        <span key={i} className="text-[7px] md:text-[9px] bg-amber-500/10 text-amber-400 px-1 py-0.5 rounded border border-amber-500/20">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-black/40 p-3 rounded-xl border border-white/5">
        <div className="flex justify-between items-center mb-2 font-serif">
          <div className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <PackageIcon size={14} /> คลังสินค้า
          </div>
          <div className="text-[9px] md:text-[11px] font-black text-amber-500/70 flex items-center gap-1">
            {items.length} ชิ้น · <GoldIcon size={12} /> {gold.toLocaleString()}
          </div>
        </div>
        {Object.keys(itemCounts).length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5 font-serif">
            {Object.entries(itemCounts).map(([id, count]) => {
              const info = ITEMS_MAP[id];
              return (
                <div key={id} className="bg-slate-800/50 px-2 py-1.5 rounded-lg border border-white/5 flex items-center gap-1.5">
                  <span className="text-xs md:text-sm">{info?.emoji || '📦'}</span>
                  <span className="text-[8px] md:text-[10px] text-slate-300 truncate flex-1 font-serif">{info?.name || id}</span>
                  <span className="text-[8px] md:text-[10px] font-black text-slate-500 font-sans">x{count}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-[10px] md:text-xs text-slate-600 italic text-center py-3">กระเป๋าว่างเปล่า</div>
        )}
      </div>

      {/* Skills */}
      <div>
        <div className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1 font-serif">ทักษะเทพเจ้า</div>
        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {gods.map(god => {
            const config = NPC_CONFIGS[god.id];
            const godSkills = kane.unlockedSkills.filter(s => s.godId === god.id);
            if (godSkills.length === 0) return null;
            return (
              <div key={god.id}>
                <div className="flex items-center gap-2 mb-1 font-serif">
                  <span className="text-xs md:text-sm">{config?.emoji || '👤'}</span>
                  <span className="text-[9px] md:text-[11px] font-black text-white uppercase tracking-widest">{god.name}</span>
                </div>
                <div className="space-y-1.5 pl-5 font-serif">
                  {godSkills.map((skill, i) => (
                    <div key={i} className="bg-slate-800/50 p-2 rounded-lg border border-white/5 flex justify-between items-center">
                      <div>
                        <div className="text-[10px] md:text-xs font-black text-amber-500 uppercase flex items-center gap-1.5">
                          {skill.name}
                          <span className="text-[7px] md:text-[9px] bg-amber-500/10 px-1 rounded text-amber-500/70 border border-amber-500/20 font-sans">{skill.type}</span>
                        </div>
                        <div className="text-[8px] md:text-[10px] text-slate-400 italic mt-0.5 line-clamp-1 font-sans">{skill.description}</div>
                      </div>
                      <div className="text-[9px] md:text-[11px] font-black text-white bg-slate-900 px-1.5 py-0.5 rounded border border-white/5 shrink-0 font-sans">
                        x{skill.multiplier.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {kane.unlockedSkills.length === 0 && (
            <div className="text-center py-6 bg-black/20 rounded-xl border border-dashed border-slate-800">
              <p className="text-[10px] md:text-xs text-slate-600 italic">ยังไม่มีทักษะเทพเจ้า ไปที่วิหารเพื่อสร้างความสัมพันธ์กับเหล่าเทพ</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Slots */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest font-serif">บันทึก / โหลด</div>

        {saveMsg && (
          <div className="text-[10px] md:text-xs font-black text-emerald-400 bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-3 py-1.5 text-center animate-in fade-in">
            {saveMsg}
          </div>
        )}

        <div className="space-y-1.5">
          {[1, 2, 3].map(slot => {
            const hasSave = checkHasSave(slot);
            return (
              <div key={slot} className="flex gap-1.5">
                <div className="flex-1 bg-slate-800/30 rounded-lg px-3 py-1.5 border border-white/5 flex items-center font-serif">
                  <span className="text-[9px] md:text-[11px] text-slate-400">Slot {slot}</span>
                  <span className="text-[8px] md:text-[10px] text-slate-600 ml-auto font-sans">{hasSave ? 'มีข้อมูล' : 'ว่าง'}</span>
                </div>
                <button
                  onClick={() => handleSaveSlot(slot)}
                  className="px-3 py-1.5 bg-blue-900/40 hover:bg-blue-800/50 border border-blue-500/20 rounded-lg text-[8px] md:text-[10px] font-black uppercase text-blue-400 transition-all active:scale-95"
                >
                  💾
                </button>
                <button
                  onClick={() => handleLoadSlot(slot)}
                  disabled={!hasSave}
                  className="px-3 py-1.5 bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-500/20 rounded-lg text-[8px] md:text-[10px] font-black uppercase text-emerald-400 transition-all active:scale-95 disabled:opacity-30"
                >
                  📂
                </button>
              </div>
            );
          })}
        </div>

        {/* Export / Import */}
        <div className="flex gap-1.5">
          <button
            onClick={handleExport}
            className="flex-1 py-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-lg text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 font-serif"
          >
            📤 ส่งออก JSON
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-lg text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 font-serif"
          >
            📥 นำเข้า JSON
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>

        {/* Tutorial Reset */}
        <div className="flex gap-1.5 pt-1 font-serif">
          <button
            onClick={handleResetTutorial}
            className="w-full py-2 bg-slate-800/30 hover:bg-slate-800/50 border border-white/5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all text-slate-500 hover:text-slate-300"
          >
            📖 Re-enable Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value, bonus, color }: { icon: React.ReactNode, label: string, value: number, bonus: number, color: string }) {
  return (
    <div className="flex justify-between items-center text-xs md:text-sm">
      <div className="flex items-center gap-1.5 text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-black flex items-center gap-1 font-sans">
        <span className={color}>{value}</span>
        {bonus > 0 && <span className="text-green-500 text-[8px] md:text-[10px]">+{bonus}</span>}
      </div>
    </div>
  );
}
