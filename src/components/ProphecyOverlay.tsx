'use client';
import { useState, useEffect } from 'react';
import { useGameStore, MAX_TURNS } from '@/store/gameStore';
import { NPC_CONFIGS } from '@/data/npcConfig';
import { broadcastAISource } from './AIStatusBadge';

interface Prophecy {
  godId: string;
  godName: string;
  emoji: string;
  text: string;
  agentName?: string;
}

interface DailyEvent {
  title: string;
  description: string;
  emoji: string;
  effect: { type: 'gold' | 'item' | 'ip' | 'bond' | 'discount'; value: number; target?: string };
}

export default function ProphecyOverlay() {
  const { day, gold, companions, showProphecy, setShowProphecy, addGold, addItem, addIP, addBond, setLastDailyEvent } = useGameStore();
  const [prophecies, setProphecies] = useState<Prophecy[]>([]);
  const [dailyEvent, setDailyEvent] = useState<DailyEvent | null>(null);
  const [eventApplied, setEventApplied] = useState(false);
  const [source, setSource] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!showProphecy) {
      setProphecies([]);
      setDailyEvent(null);
      setEventApplied(false);
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
        broadcastAISource(data.source || 'fallback');

        // Store daily event
        if (data.dailyEvent) {
          setDailyEvent(data.dailyEvent);
        }

        // Reveal prophecies one by one, then daily event
        const totalItems = (data.prophecies?.length || 3) + (data.dailyEvent ? 1 : 0);
        let i = 0;
        const interval = setInterval(() => {
          i++;
          setRevealed(i);
          if (i >= totalItems) clearInterval(interval);
        }, 1200);
      } catch {
        setProphecies([
          { godId: 'leo', godName: 'เลโอ', emoji: '⚔️', text: '"เทพไม่ตอบรับในตอนนี้..."' },
          { godId: 'arena', godName: 'อารีน่า', emoji: '👑', text: '"สายลมกระซิบว่ายังไม่ถึงเวลา..."' },
          { godId: 'draco', godName: 'ดราโก้', emoji: '🐉', text: '"ฮึ่ม... ข้ารู้สึกถึงการรบกวนบางอย่าง"' },
        ]);
        setSource('fallback');
        setRevealed(3);
      } finally {
        setLoading(false);
      }
    };

    fetchProphecies();
  }, [showProphecy]);

  const turnsLeft = MAX_TURNS - day + 1;
  const urgency: 'calm' | 'warning' | 'critical' = turnsLeft <= 5 ? 'critical' : turnsLeft <= 10 ? 'warning' : 'calm';

  if (!showProphecy) return null;

  // Urgency-based styling
  const urgencyGlow = urgency === 'critical' ? 'shadow-red-500/30' : urgency === 'warning' ? 'shadow-orange-500/20' : 'shadow-amber-500/10';
  const titleColor = urgency === 'critical' ? 'text-red-400' : urgency === 'warning' ? 'text-orange-400' : 'text-amber-400';
  const subtitleColor = urgency === 'critical' ? 'text-red-500/60' : urgency === 'warning' ? 'text-orange-500/50' : 'text-amber-500/40';

  // Source badge color
  const sourceColor = source === 'openclaw' ? 'text-emerald-400' : source === 'openrouter' ? 'text-sky-400' : 'text-slate-500';

  return (
    <div className="fixed inset-0 z-[150] bg-black/90 flex items-center justify-center backdrop-blur-sm">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: 'url(/images/backgrounds/council/bg_council.png)' }}
      />
      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />

      {/* Council Content */}
      <div className={`relative z-10 max-w-2xl w-full mx-4 flex flex-col items-center`}>
        {/* Council Title */}
        <div className="text-center mb-6">
          <div className={`text-[10px] ${subtitleColor} font-bold uppercase tracking-[0.4em] mb-2 ${urgency === 'critical' ? 'animate-pulse' : ''}`}>
            {urgency === 'critical' ? 'สภาฉุกเฉิน' : 'สภาแห่งทวยเทพ'}
          </div>
          <h2 className={`text-2xl md:text-3xl font-black ${titleColor} uppercase tracking-widest`}>
            Divine Council
          </h2>
          <div className={`text-xs ${subtitleColor} font-bold mt-2 tracking-wider`}>
            วันที่ {day} / {MAX_TURNS} — เหลือเวลาอีก {turnsLeft} วัน
          </div>
        </div>

        {/* God Portraits Row */}
        <div className="flex justify-center gap-4 md:gap-8 mb-6">
          {['leo', 'arena', 'draco'].map((godId, i) => {
            const config = NPC_CONFIGS[godId];
            const prophecy = prophecies.find(p => p.godId === godId);
            const isRevealed = i < revealed;
            const isSpeaking = i === revealed - 1 && revealed <= prophecies.length;
            return (
              <div key={godId} className="flex flex-col items-center">
                <div className={`w-14 h-14 md:w-18 md:h-18 rounded-full border-2 overflow-hidden transition-all duration-700 ${
                  isRevealed
                    ? isSpeaking
                      ? 'border-amber-400 shadow-lg shadow-amber-400/40 scale-110'
                      : 'border-amber-500/50 opacity-80'
                    : 'border-slate-700 opacity-30 grayscale'
                }`}>
                  {config?.facial ? (
                    <img src={config.facial} alt={prophecy?.godName || godId} className="w-full h-full object-cover image-pixelated" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-2xl">
                      {prophecy?.emoji || '?'}
                    </div>
                  )}
                </div>
                <div className={`text-[9px] font-black uppercase tracking-widest mt-2 transition-all duration-500 ${
                  isRevealed ? 'text-amber-500/80' : 'text-slate-600'
                }`}>
                  {prophecy?.godName || godId}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dialogue Panel */}
        <div className={`w-full bg-slate-950/80 backdrop-blur-md border border-amber-500/20 rounded-2xl shadow-2xl ${urgencyGlow} overflow-hidden`}>
          {/* Loading State */}
          {loading && prophecies.length === 0 && (
            <div className="text-center py-12 px-6">
              <div className="text-4xl mb-4 animate-pulse">🔮</div>
              <div className="text-amber-500/70 text-xs font-black uppercase tracking-[0.3em] animate-pulse">
                เหล่าเทพกำลังร่วมประชุมกัน...
              </div>
            </div>
          )}

          {/* Council Dialogue */}
          {prophecies.length > 0 && (
            <div className="p-5 md:p-6 space-y-4">
              {prophecies.map((p, i) => {
                const config = NPC_CONFIGS[p.godId];
                const isRevealed = i < revealed;
                const isSpeaking = i === revealed - 1;
                return (
                  <div
                    key={p.godId}
                    className={`transition-all duration-700 ${
                      isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 h-0 overflow-hidden'
                    }`}
                  >
                    <div className={`flex gap-3 items-start ${isSpeaking ? '' : 'opacity-75'}`}>
                      {/* Mini portrait */}
                      <div className={`w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden border transition-all duration-500 ${
                        isSpeaking ? 'border-amber-400/60' : 'border-slate-700/50'
                      }`}>
                        {config?.facial ? (
                          <img src={config.facial} alt={p.godName} className="w-full h-full object-cover image-pixelated" />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-sm">{p.emoji}</div>
                        )}
                      </div>

                      {/* Speech bubble */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest">{p.godName}</span>
                          {i === 0 && (
                            <span className="text-[8px] text-amber-500/30 font-bold uppercase tracking-wider">เริ่มประเด็น</span>
                          )}
                          {i > 0 && (
                            <span className="text-[8px] text-amber-500/30 font-bold uppercase tracking-wider">ตอบโต้</span>
                          )}
                        </div>
                        <div className={`text-sm leading-relaxed rounded-xl px-3 py-2 ${
                          isSpeaking
                            ? 'bg-amber-500/10 text-slate-100 border border-amber-500/15'
                            : 'text-slate-300'
                        }`}>
                          <span className="italic">{p.text}</span>
                        </div>
                        {source === 'openclaw' && p.agentName && (
                          <div className="text-[9px] text-cyan-400/50 mt-1 font-mono ml-3">
                            via agent: {p.agentName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Daily Event — shown after all prophecies */}
              {dailyEvent && revealed > prophecies.length && (
                <DailyEventCard
                  event={dailyEvent}
                  applied={eventApplied}
                  onApply={() => {
                    if (eventApplied) return;
                    setEventApplied(true);
                    const { effect } = dailyEvent;
                    switch (effect.type) {
                      case 'gold': addGold(effect.value); break;
                      case 'ip': addIP(effect.value); break;
                      case 'item': if (effect.target) addItem(effect.target); break;
                      case 'bond': if (effect.target) addBond(effect.target, effect.value); break;
                      case 'discount': addGold(effect.value); break; // Simplified: discount = bonus gold
                    }
                    setLastDailyEvent(`${dailyEvent.emoji} ${dailyEvent.title}`);
                  }}
                />
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-5 md:px-6 pb-5 md:pb-6 pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[8px] font-bold uppercase tracking-widest ${sourceColor}`}>
                AI: {source || '...'}
              </span>
              {urgency !== 'calm' && (
                <span className={`text-[8px] font-black uppercase tracking-widest ${urgency === 'critical' ? 'text-red-400 animate-pulse' : 'text-orange-400'}`}>
                  {urgency === 'critical' ? 'เวลาใกล้หมด!' : 'เวลาจำกัด'}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowProphecy(false)}
              disabled={(loading && prophecies.length === 0) || (dailyEvent && !eventApplied && revealed > prophecies.length)}
              className={`w-full py-3 font-black rounded-xl uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-50 ${
                urgency === 'critical'
                  ? 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/20'
              }`}
            >
              {revealed > prophecies.length && (!dailyEvent || eventApplied) ? `เริ่มวันที่ ${day}` : 'กำลังรับฟัง...'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DailyEventCard({ event, applied, onApply }: { event: DailyEvent; applied: boolean; onApply: () => void }) {
  const effectLabel = (() => {
    switch (event.effect.type) {
      case 'gold': return `+${event.effect.value} ทอง`;
      case 'ip': return `+${event.effect.value} IP`;
      case 'item': return `ได้ของ!`;
      case 'bond': return `+${event.effect.value} Bond`;
      case 'discount': return `ลด ${event.effect.value}%`;
      default: return '';
    }
  })();

  return (
    <div className="mt-3 pt-3 border-t border-amber-500/10 animate-in fade-in duration-700">
      <div className="text-[9px] font-black text-amber-500/40 uppercase tracking-[0.3em] mb-2">เหตุการณ์ประจำวัน</div>
      <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/15 rounded-xl px-3 py-2.5">
        <span className="text-2xl shrink-0">{event.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black text-amber-400">{event.title}</div>
          <div className="text-[11px] text-slate-300 leading-snug mt-0.5">{event.description}</div>
        </div>
        <button
          onClick={onApply}
          disabled={applied}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${
            applied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-md shadow-amber-500/20'
          }`}
        >
          {applied ? `${effectLabel} ✓` : effectLabel}
        </button>
      </div>
    </div>
  );
}
