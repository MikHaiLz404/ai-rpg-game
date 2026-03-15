'use client';
import { useGameStore } from '@/store/gameStore';
import { NPC_CONFIGS, SKILL_THRESHOLDS } from '@/data/npcConfig';

export default function ChampionStatus() {
  const { companions, getBondBonus } = useGameStore();
  const kane = companions.find(c => c.id === 'kane');

  if (!kane) return null;

  const gods = companions.filter(c => c.id !== 'kane');

  const bonuses = gods.reduce((acc, c) => {
    const b = getBondBonus(c.id);
    return { atk: acc.atk + b.atk, def: acc.def + b.def };
  }, { atk: 0, def: 0 });

  return (
    <div className="p-6 bg-slate-900/95 rounded-2xl border border-blue-500/20 shadow-2xl space-y-6">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 bg-blue-900/20 rounded-3xl border-2 border-blue-500/30 flex items-center justify-center overflow-hidden shadow-inner">
          <img
            src="/images/characters/npcs/kane/idle/hero_idle_DOWN.png"
            alt="Kane"
            className="w-full h-full object-contain image-pixelated scale-125"
          />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Kane <span className="text-blue-500 text-lg not-italic">the Champion</span></h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-blue-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded uppercase">Level {kane.level}</span>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Skills: {kane.unlockedSkills.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/40 p-4 rounded-xl border border-white/5">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Combat Stats</div>
          <div className="space-y-3">
            <StatRow label="Attack" value={15 + bonuses.atk} bonus={bonuses.atk} color="text-red-400" />
            <StatRow label="Defense" value={10 + bonuses.def} bonus={bonuses.def} color="text-blue-400" />
            <StatRow label="Speed" value={12} bonus={0} color="text-green-400" />
          </div>
        </div>
        <div className="bg-black/40 p-4 rounded-xl border border-white/5">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Divine Bonds</div>
          <div className="space-y-2">
            {gods.map(god => {
              const config = NPC_CONFIGS[god.id];
              const nextThreshold = SKILL_THRESHOLDS.find(t => god.bond < t);
              const prev = SKILL_THRESHOLDS.filter(t => t <= god.bond).pop() || 0;
              const progress = nextThreshold ? ((god.bond - prev) / (nextThreshold - prev)) * 100 : 100;
              return (
                <div key={god.id} className="flex items-center gap-2">
                  <span className="text-sm">{config?.emoji || '👤'}</span>
                  <div className="flex-1">
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <span className="text-[8px] font-black text-slate-500">{god.bond}{nextThreshold ? `/${nextThreshold}` : ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Divine Skills</div>
        <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          {gods.map(god => {
            const config = NPC_CONFIGS[god.id];
            const godSkills = kane.unlockedSkills.filter(s => s.godId === god.id);
            if (godSkills.length === 0) return null;
            return (
              <div key={god.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{config?.emoji || '👤'}</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{god.name}</span>
                  <span className="text-[8px] text-slate-500">Bond Lvl {god.level}</span>
                </div>
                <div className="space-y-2 pl-6">
                  {godSkills.map((skill, i) => (
                    <div key={i} className="bg-slate-800/50 p-3 rounded-xl border border-white/5 flex justify-between items-center group hover:border-amber-500/30 transition-all">
                      <div>
                        <div className="text-xs font-black text-amber-500 uppercase flex items-center gap-2">
                          {skill.name}
                          <span className="text-[8px] bg-amber-500/10 px-1 rounded text-amber-500/70 border border-amber-500/20">{skill.type}</span>
                        </div>
                        <div className="text-[9px] text-slate-400 italic mt-0.5 line-clamp-1">{skill.description}</div>
                      </div>
                      <div className="text-[10px] font-black text-white bg-slate-900 px-2 py-1 rounded border border-white/5 shrink-0">
                        x{skill.multiplier.toFixed(1)} DMG
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {kane.unlockedSkills.length === 0 && (
            <div className="text-center py-8 bg-black/20 rounded-xl border border-dashed border-slate-800">
              <p className="text-[10px] text-slate-600 italic">No divine skills earned yet. Visit the Sanctuary to bond with Gods.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, bonus, color }: { label: string, value: number, bonus: number, color: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-slate-400">{label}</span>
      <div className="font-black flex items-center gap-1">
        <span className={color}>{value}</span>
        {bonus > 0 && <span className="text-green-500 text-[8px]">+{bonus}</span>}
      </div>
    </div>
  );
}
