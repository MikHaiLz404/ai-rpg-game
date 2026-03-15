'use client';
import { useState, useEffect } from 'react';
import { useGameStore, MAX_TURNS } from '@/store/gameStore';
import { NPC_CONFIGS } from '@/data/npcConfig';

interface Prophecy {
  godId: string;
  godName: string;
  emoji: string;
  text: string;
  agentName?: string;
}

export default function ProphecyOverlay() {
  const { day, gold, companions, showProphecy, setShowProphecy } = useGameStore();
  const [prophecies, setProphecies] = useState<Prophecy[]>([]);
  const [source, setSource] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!showProphecy) {
      setProphecies([]);
      setSource('');
      setRevealed(0);
      return;
    }

    const fetchProphecies = async () => {
      setLoading(true);
      try {
        const kane = companions.find(c => c.id === 'kane');
        const bonds = companions.reduce((acc, c) => ({ ...acc, [c.id]: c.bond }), {} as Record<string, number>);
        const skills = kane?.unlockedSkills.map(s => s.name) || [];

        const res = await fetch('/api/prophecy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            day,
            gold,
            bonds,
            skills,
            turnsLeft: MAX_TURNS - day + 1,
          }),
        });
        const data = await res.json();
        setProphecies(data.prophecies || []);
        setSource(data.source || '');

        // Reveal prophecies one by one
        let i = 0;
        const interval = setInterval(() => {
          i++;
          setRevealed(i);
          if (i >= (data.prophecies?.length || 3)) clearInterval(interval);
        }, 800);
      } catch {
        setProphecies([
          { godId: 'leo', godName: 'เลโอ', emoji: '⚔️', text: '"เทพไม่ตอบรับในตอนนี้..."' },
          { godId: 'arena', godName: 'อารีน่า', emoji: '👑', text: '"สายลมกระซิบว่ายังไม่ถึงเวลา..."' },
          { godId: 'draco', godName: 'ดราโก้', emoji: '🐉', text: '"ฮึ่ม... ข้ารู้สึกถึงการรบกวนบางอย่าง"' },
        ]);
        setRevealed(3);
      } finally {
        setLoading(false);
      }
    };

    fetchProphecies();
  }, [showProphecy]);

  if (!showProphecy) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-slate-900/95 border-2 border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-500/10 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/30 px-6 py-4 border-b border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-amber-500 uppercase tracking-widest">Divine Council</h2>
              <div className="text-[9px] text-amber-500/50 font-bold uppercase tracking-widest mt-0.5">
                Day {day} Prophecy — {MAX_TURNS - day + 1} turns remaining
              </div>
            </div>
            <div className="text-3xl opacity-50">📜</div>
          </div>
        </div>

        {/* Prophecies */}
        <div className="p-6 space-y-4">
          {loading && prophecies.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3 animate-pulse">🔮</div>
              <div className="text-amber-500/70 text-xs font-black uppercase tracking-widest animate-pulse">
                The gods are convening...
              </div>
            </div>
          )}

          {prophecies.map((p, i) => {
            const config = NPC_CONFIGS[p.godId];
            return (
              <div
                key={p.godId}
                className={`transition-all duration-500 ${
                  i < revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-white/5 overflow-hidden">
                    {config?.facial ? (
                      <img src={config.facial} alt={p.godName} className="w-full h-full object-cover image-pixelated" />
                    ) : (
                      <span className="text-lg">{p.emoji}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest mb-1">{p.godName}</div>
                    <div className="text-sm text-slate-200 leading-relaxed italic">{p.text}</div>
                    {source === 'openclaw' && p.agentName && (
                      <div className="text-[9px] text-cyan-400/60 mt-1 font-mono">
                        via agent: {p.agentName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={() => setShowProphecy(false)}
            disabled={loading && prophecies.length === 0}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-black rounded-xl uppercase text-xs tracking-widest transition-all active:scale-95"
          >
            Begin Day {day}
          </button>
        </div>
      </div>
    </div>
  );
}
