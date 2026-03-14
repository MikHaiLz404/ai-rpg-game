'use client';
import { useState, useEffect } from 'react';
import { useGameStore, DivineSkill } from '@/store/gameStore';

function makeFrames(base: string, count: number) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(base + '/frame_' + Math.floor(i/3) + '_' + (i%3) + '.png');
  }
  return arr;
}

const NPC_METADATA = {
  leo: { emoji: '⚔️', desc: 'เทพสงคราม', theme: 'War & Physical Strength', sprites: makeFrames('/images/characters/npcs/leo/idle', 12) },
  arena: { emoji: '👑', desc: 'ราชินีแห่งวิหาร', theme: 'Royal Protection & Light', sprites: makeFrames('/images/characters/npcs/arena/idle', 12) },
  draco: { emoji: '🐉', desc: 'มังกรบรรพกาล', theme: 'Ancient Fire & Magic', sprites: makeFrames('/images/characters/npcs/draco/idle', 12) },
  kane: { emoji: '🏹', desc: 'ผู้พิทักษ์ (Your Champion)', theme: 'Agility & Archery', sprites: [] },
};

export default function Relationship() {
  const { companions, addBond, unlockSkill } = useGameStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isTalking, setIsTalking] = useState(false);
  const [isGeneratingSkill, setIsGeneratingSkill] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => setFrameIndex(f => (f + 1) % 12), 200);
    return () => clearInterval(interval);
  }, []);
  
  const handleTalk = async (id: string) => {
    const companion = companions.find(c => c.id === id);
    if (!companion) return;
    
    setIsTalking(true);
    setSelectedId(id);
    
    try {
      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'talk',
          playerName: 'Minju',
          npcName: companion.name,
          npcMood: NPC_METADATA[id as keyof typeof NPC_METADATA]?.desc || 'divine'
        })
      });
      
      const data = await res.json();
      if (data.narrative) {
        setChatLog([data.narrative]);
        addBond(id, 1); // Small bond for talking
      }
    } catch (err) {
      setChatLog([`${companion.name} nods in approval of your presence.`]);
    } finally {
      setIsTalking(false);
    }
  };

  const handleGenerateSkill = async (id: string) => {
    const companion = companions.find(c => c.id === id);
    if (!companion || isGeneratingSkill) return;

    setIsGeneratingSkill(true);
    try {
      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_skill',
          npcName: companion.name,
          godTheme: NPC_METADATA[id as keyof typeof NPC_METADATA].theme,
          level: companion.level
        })
      });
      const data = await res.json();
      // Clean the JSON string from AI if needed
      const skillData: DivineSkill = typeof data.narrative === 'string' ? JSON.parse(data.narrative) : data.narrative;
      
      unlockSkill(id, { ...skillData, godId: id });
      setChatLog(prev => [`✨ UNLOCKED NEW SKILL: ${skillData.name}!`, ...prev]);
    } catch (err) {
      console.error('Skill gen error:', err);
    } finally {
      setIsGeneratingSkill(false);
    }
  };
  
  const selectedCompanion = companions.find(c => c.id === selectedId);
  const metadata = selectedId ? NPC_METADATA[selectedId as keyof typeof NPC_METADATA] : null;
  const currentFrame = (metadata && metadata.sprites.length > 0) ? metadata.sprites[frameIndex] : null;
  
  return (
    <div className="p-4 bg-slate-900/95 rounded-xl shadow-2xl border border-pink-500/20">
      <h2 className="text-2xl font-black mb-6 text-pink-500 uppercase tracking-tighter italic">Divine Connections</h2>

      {selectedCompanion && metadata ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <button 
            onClick={() => {setSelectedId(null); setChatLog([]);}} 
            className="text-slate-500 hover:text-white flex items-center gap-1 text-[10px] font-black uppercase tracking-widest mb-4 transition-colors"
          >
            ← Back to Sanctuary
          </button>
          
          <div className="bg-slate-800/50 p-8 rounded-3xl border border-white/5 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent opacity-50" />
            <div className="w-28 h-28 mx-auto mb-6 bg-slate-900 rounded-full overflow-hidden flex items-center justify-center border-4 border-pink-500/20 shadow-2xl relative z-10">
              {currentFrame ? (
                <img src={currentFrame} alt={selectedCompanion.name} className="w-20 h-20 object-contain image-pixelated" />
              ) : (
                <span className="text-5xl">{metadata.emoji}</span>
              )}
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight relative z-10">{selectedCompanion.name}</h3>
            <p className="text-[10px] text-pink-500/70 font-bold uppercase tracking-widest mb-6 relative z-10">{metadata.desc}</p>
            
            <div className="max-w-xs mx-auto space-y-4 relative z-10">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bond Level {selectedCompanion.level}</span>
                <span className="text-pink-500 font-black text-xl">{selectedCompanion.bond % 10}/10</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full border border-white/5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-600 to-rose-400 transition-all duration-1000"
                  style={{ width: `${(selectedCompanion.bond % 10) * 10}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => handleTalk(selectedCompanion.id)} 
              disabled={isTalking}
              className={`flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl transition-all border border-white/10 uppercase text-xs tracking-widest ${isTalking ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isTalking ? 'Connecting...' : '💬 Seek Audience'}
            </button>
            
            {/* Skill Generation Button - Only visible if they have "pending" skill unlocks or just reached a level */}
            <button 
              onClick={() => handleGenerateSkill(selectedCompanion.id)}
              disabled={isGeneratingSkill}
              className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-900 font-black rounded-xl transition-all shadow-lg uppercase text-xs tracking-widest disabled:opacity-50"
            >
              {isGeneratingSkill ? 'Weaving...' : '✨ Weave Skill'}
            </button>
          </div>

          {/* Unlocked Skills */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Divine Skills Granted</h4>
            <div className="grid grid-cols-1 gap-2">
              {selectedCompanion.unlockedSkills.map((skill, i) => (
                <div key={i} className="bg-black/30 p-3 rounded-xl border border-white/5 flex justify-between items-center group hover:border-amber-500/30 transition-colors">
                  <div>
                    <div className="text-xs font-black text-amber-500 uppercase tracking-tight">{skill.name}</div>
                    <div className="text-[9px] text-slate-500 italic line-clamp-1">{skill.description}</div>
                  </div>
                  <div className="text-[10px] font-black text-white bg-slate-800 px-2 py-1 rounded">x{skill.multiplier}</div>
                </div>
              ))}
              {selectedCompanion.unlockedSkills.length === 0 && (
                <div className="text-[10px] text-slate-600 italic px-1 text-center py-4 border border-dashed border-slate-800 rounded-xl">No skills granted yet. Deepen your bond.</div>
              )}
            </div>
          </div>

          <div className="bg-black/60 p-6 rounded-2xl h-36 overflow-y-auto border border-white/5 font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
            {chatLog.map((msg, i) => (
              <div key={i} className={`mb-3 ${i === 0 ? 'text-white italic' : 'text-slate-500'}`}>{msg}</div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {companions.map((comp) => {
            const meta = NPC_METADATA[comp.id as keyof typeof NPC_METADATA];
            return (comp.id !== 'kane' && (
              <button 
                key={comp.id} 
                onClick={() => handleTalk(comp.id)} 
                className="p-6 bg-slate-800/40 hover:bg-slate-800 border border-white/5 hover:border-pink-500/30 rounded-3xl transition-all flex flex-col items-center gap-4 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-4xl font-black">{comp.level}</span>
                </div>
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-4xl shadow-xl border border-white/5 group-hover:scale-110 transition-transform">
                  {meta?.emoji || '👤'}
                </div>
                <div className="text-center">
                  <div className="font-black text-white uppercase tracking-tight">{comp.name}</div>
                  <div className="text-[9px] text-pink-500/70 font-black uppercase mt-1">Bond Lvl {comp.level}</div>
                </div>
              </button>
            ))}
          )}
        </div>
      )}
    </div>
  );
}
