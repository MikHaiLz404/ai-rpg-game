'use client';
import { useState, useEffect, useRef } from 'react';
import { useGameStore, DivineSkill } from '@/store/gameStore';
import { EventBus } from '@/game/EventBus';
import { NPC_CONFIGS, SKILL_THRESHOLDS } from '@/data/npcConfig';

// Item lookup for gift display names
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

// Each god has favorite gifts that give bonus bond
const FAVORITE_GIFTS: Record<string, string[]> = {
  leo: ['sword', 'shield', 'bow'],       // War god likes weapons
  arena: ['perfume', 'flower', 'mirror'], // Queen likes elegant items
  draco: ['herbs', 'ore', 'olympian_coin'], // Ancient dragon likes rare/natural items
};

interface ChatMessage {
  sender: 'player' | 'npc' | 'system';
  text: string;
}

export default function Relationship() {
  const { companions, addBond, unlockSkill, markThresholdClaimed, setDialogue, choicesLeft, consumeChoice, setIsBusy, items, removeItem } = useGameStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [userInput, setUserMessage] = useState('');
  const [isTalking, setIsTalking] = useState(false);
  const [isGeneratingSkill, setIsGeneratingSkill] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLog]);

  // Check for auto-skill unlock when bond changes (reads fresh state)
  const checkAutoSkillUnlock = async (id: string) => {
    // Read fresh state from store to avoid stale closure
    const freshCompanion = useGameStore.getState().companions.find(c => c.id === id);
    if (!freshCompanion || isGeneratingSkill) return;

    const config = NPC_CONFIGS[id];
    if (!config) return;

    const unclaimedThreshold = SKILL_THRESHOLDS.find(
      t => freshCompanion.bond >= t && !freshCompanion.claimedThresholds.includes(t)
    );

    if (!unclaimedThreshold) return;

    setIsGeneratingSkill(true);
    setChatLog(prev => [...prev, { sender: 'system', text: `🌟 ระดับความสัมพันธ์ถึง ${unclaimedThreshold} แล้ว! ${freshCompanion.name} กำลังมอบสกิลใหม่ให้...` }]);

    try {
      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_skill',
          npcName: freshCompanion.name,
          godTheme: config.theme,
          level: freshCompanion.level
        })
      });
      const data = await res.json();
      const skillData: DivineSkill = typeof data.narrative === 'string' ? JSON.parse(data.narrative) : data.narrative;

      unlockSkill(id, { ...skillData, godId: id });
      markThresholdClaimed(id, unclaimedThreshold);

      setChatLog(prev => [...prev, { sender: 'system', text: `✨ สกิลใหม่: ${skillData.name}! (พลังโจมตี x${skillData.multiplier})` }]);
      setDialogue({
        speaker: freshCompanion.name,
        text: `รับพลังนี้ไป... ${skillData.name} เป็นของเจ้าแล้ว`,
      });
    } catch (err) {
      console.error('Auto skill gen error:', err);
    } finally {
      setIsGeneratingSkill(false);
    }
  };

  const handleTalk = async (id: string, message?: string) => {
    const companion = companions.find(c => c.id === id);
    if (!companion) return;

    // Prevention for message sending
    if (message && choicesLeft <= 0) {
      setDialogue({
        speaker: 'Minju',
        text: 'วันนี้เหนื่อยมากแล้วค่ะ... เราพักผ่อนแล้วค่อยคุยใหม่พรุ่งนี้ดีไหมคะ?',
        portrait: 'work'
      });
      return;
    }

    const config = NPC_CONFIGS[id];

    setIsTalking(true);
    setIsBusy(true); // Mark as busy when conversation starts
    if (!selectedId) setSelectedId(id);

    if (message) {
      consumeChoice();
      setChatLog(prev => [...prev, { sender: 'player', text: message }]);
      setUserMessage('');

      setDialogue({
        speaker: 'Minju',
        text: message,
        portrait: 'happy'
      });
    }

    try {
      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'talk',
          playerName: 'Minju',
          npcName: companion.name,
          npcMood: config?.personality || 'divine',
          npcPersonality: config?.personality,
          npcSpeechStyle: config?.speechStyle,
          bondLevel: companion.level,
          userMessage: message
        })
      });

      const data = await res.json();
      if (data.narrative) {
        setChatLog(prev => [...prev, { sender: 'npc', text: data.narrative }]);

        setTimeout(() => {
          setDialogue({
            speaker: companion.name,
            text: data.narrative
          });
        }, 500);

        // Bond gain logic: Only if day is active (choices > 0)
        if (choicesLeft > 0) {
          const bondChance = Math.max(0.15, 0.4 - companion.bond * 0.02);
          if (Math.random() < bondChance) {
            addBond(id, 1);
            setChatLog(prev => [...prev, { sender: 'system', text: `💗 ความสัมพันธ์ +1` }]);
            // Check skill unlock after bond increase
            setTimeout(() => checkAutoSkillUnlock(id), 100);
          }
        }
      }
    } catch (err) {
      const fallback = config?.greeting || `${companion.name} พยักหน้าตอบรับด้วยความพึงพอใจ`;
      setChatLog(prev => [...prev, { sender: 'npc', text: fallback }]);
      setDialogue({
        speaker: companion.name,
        text: fallback
      });
    } finally {
      setIsTalking(false);
      // Wait a bit before clearing busy so the dialogue can be read
      setTimeout(() => setIsBusy(false), 1000);
    }
  };

  const handleGift = async (itemId: string) => {
    if (!selectedId || choicesLeft <= 0) return;
    
    const companion = companions.find(c => c.id === selectedId);
    if (!companion) return;

    consumeChoice();
    removeItem(itemId);
    setShowGiftModal(false);

    const itemInfo = ITEMS_MAP[itemId];
    const itemName = itemInfo ? `${itemInfo.emoji} ${itemInfo.name}` : itemId;
    setChatLog(prev => [...prev, { sender: 'player', text: `(มอบของขวัญ: ${itemName})` }]);

    // Bond gain: base 3 for potions, 5 for other items, +3 bonus for favorite gifts
    const isFavorite = FAVORITE_GIFTS[selectedId]?.includes(itemId);
    const baseBond = itemId.includes('potion') ? 3 : 5;
    const bondGain = isFavorite ? baseBond + 3 : baseBond;
    addBond(selectedId, bondGain);
    const favoriteText = isFavorite ? ' ⭐ ของขวัญโปรด!' : '';
    setChatLog(prev => [...prev, { sender: 'system', text: `💗 ความสัมพันธ์ +${bondGain}${favoriteText}` }]);

    try {
      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'gift',
          playerName: 'Minju',
          npcName: companion.name,
          giftItem: itemId,
          bondLevel: companion.level
        })
      });
      const data = await res.json();
      if (data.narrative) {
        setChatLog(prev => [...prev, { sender: 'npc', text: data.narrative }]);
        setDialogue({
          speaker: companion.name,
          text: data.narrative
        });
      }
    } catch (err) {
      setDialogue({
        speaker: companion.name,
        text: `ขอบใจมากนะสำหรับ ${itemInfo?.name || itemId} ข้าจะเก็บรักษาไว้อย่างดี`
      });
    }

    setTimeout(() => checkAutoSkillUnlock(selectedId), 100);
  };

  const selectedCompanion = companions.find(c => c.id === selectedId);
  const metadata = selectedId ? NPC_CONFIGS[selectedId] : null;

  // Calculate next threshold for selected companion
  const getNextThreshold = (companion: typeof companions[0]) => {
    return SKILL_THRESHOLDS.find(t => companion.bond < t);
  };

  return (
    <div className="p-4 bg-slate-900/95 rounded-xl shadow-2xl border border-pink-500/20 flex flex-col h-[600px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-black text-pink-500 uppercase tracking-tighter italic">สายสัมพันธ์แห่งเทพ</h2>
        {selectedId && (
          <button
            onClick={() => {setSelectedId(null); setChatLog([]); setIsBusy(false);}}
            className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            ← กลับ
          </button>
        )}
      </div>

      {selectedCompanion && metadata ? (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5 flex items-center gap-4 relative overflow-hidden">
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border-2 border-pink-500/20 shadow-xl relative z-10 shrink-0 overflow-hidden">
              {metadata.facial ? (
                <img src={metadata.facial} alt={selectedCompanion.name} className="w-full h-full object-cover image-pixelated" />
              ) : (
                <span className="text-2xl">{metadata.emoji}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-black text-white uppercase tracking-tight truncate">{selectedCompanion.name}</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    {(() => {
                      const next = getNextThreshold(selectedCompanion);
                      const prev = SKILL_THRESHOLDS.filter(t => t <= selectedCompanion.bond).pop() || 0;
                      const progress = next ? ((selectedCompanion.bond - prev) / (next - prev)) * 100 : 100;
                      return (
                        <div
                          className="h-full bg-gradient-to-r from-pink-600 to-rose-400 transition-all duration-1000"
                          style={{ width: `${progress}%` }}
                        />
                      );
                    })()}
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-[8px] text-slate-500">ค่าความสนิท: {selectedCompanion.bond}</span>
                    {getNextThreshold(selectedCompanion) && (
                      <span className="text-[8px] text-amber-500/70">สกิลถัดไป: {getNextThreshold(selectedCompanion)}</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-black text-pink-500 shrink-0">LVL {selectedCompanion.level}</span>
              </div>
            </div>
          </div>

          {isGeneratingSkill && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2 text-center animate-pulse">
              <span className="text-amber-500 text-xs font-black uppercase tracking-widest">กำลังรวบรวมพลังเทพ...</span>
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex-1 bg-black/40 rounded-2xl p-4 overflow-y-auto border border-white/5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800"
          >
            {chatLog.length === 0 && (
              <div className="text-center text-slate-600 italic text-xs py-8">ขอเข้าพบเพื่อเริ่มบทสนทนา...</div>
            )}
            {chatLog.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                  msg.sender === 'player'
                    ? 'bg-pink-600 text-white rounded-tr-none'
                    : msg.sender === 'npc'
                    ? 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5'
                    : 'bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest border border-amber-500/20 mx-auto'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTalking && (
              <div className="flex justify-start">
                <div className="bg-slate-800/50 px-4 py-2 rounded-2xl rounded-tl-none animate-pulse text-slate-400 text-xs">
                  กำลังคิด...
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (userInput.trim()) handleTalk(selectedCompanion.id, userInput);
            }}
            className="flex gap-2 relative"
          >
            <button
              type="button"
              onClick={() => setShowGiftModal(!showGiftModal)}
              disabled={choicesLeft <= 0}
              className="bg-slate-800 hover:bg-slate-700 text-pink-500 p-3 rounded-xl border border-white/10 transition-all flex items-center justify-center shrink-0"
              title="Give Gift"
            >
              🎁
            </button>
            
            {showGiftModal && (
              <div className="absolute bottom-16 left-0 w-64 bg-slate-900 border-2 border-pink-500/30 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex justify-between">
                  <span>เลือกของขวัญ</span>
                  <button onClick={() => setShowGiftModal(false)}>✕</button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                  {Array.from(new Set(items)).map((itemId) => {
                    const info = ITEMS_MAP[itemId];
                    const isFav = selectedId ? FAVORITE_GIFTS[selectedId]?.includes(itemId) : false;
                    return (
                      <button
                        key={itemId}
                        onClick={() => handleGift(itemId)}
                        className={`w-full text-left p-2 rounded-lg text-xs text-slate-200 border transition-all flex justify-between items-center ${
                          isFav ? 'bg-pink-900/30 hover:bg-pink-800/40 border-pink-500/20' : 'bg-slate-800 hover:bg-slate-700 border-white/5'
                        }`}
                      >
                        <span>{info ? `${info.emoji} ${info.name}` : itemId}{isFav ? ' ⭐' : ''}</span>
                        <span className="text-[8px] text-pink-500/70">x{items.filter(i => i === itemId).length}</span>
                      </button>
                    );
                  })}
                  {items.length === 0 && (
                    <div className="text-[10px] text-slate-600 italic text-center py-4">ไม่มีของในกระเป๋าเลย...</div>
                  )}
                </div>
              </div>
            )}

            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="พิมพ์ข้อความคุยกับเทพ..."
              className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50 transition-colors"
            />
            <button
              type="submit"
              disabled={isTalking || !userInput.trim() || choicesLeft <= 0}
              className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all"
            >
              {choicesLeft > 0 ? 'ส่ง' : 'แต้มหมด'}
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          {companions.map((comp) => {
            const meta = NPC_CONFIGS[comp.id];
            const nextThreshold = SKILL_THRESHOLDS.find(t => comp.bond < t);
            return (comp.id !== 'kane' && (
              <button
                key={comp.id}
                onClick={() => {
                  setSelectedId(comp.id);
                  EventBus.emit('village-walk-to-npc', { npcId: comp.id });
                  const onArrival = () => {
                    EventBus.off('village-walk-complete', onArrival);
                    handleTalk(comp.id);
                  };
                  EventBus.on('village-walk-complete', onArrival);
                }}
                className="p-6 bg-slate-800/40 hover:bg-slate-800 border border-white/5 hover:border-pink-500/30 rounded-3xl transition-all flex flex-col items-center gap-4 group relative overflow-hidden h-48"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-4xl font-black">{comp.level}</span>
                </div>
                <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl border border-white/5 group-hover:scale-110 transition-transform overflow-hidden">
                  {meta?.facial ? (
                    <img src={meta.facial} alt={comp.name} className="w-full h-full object-cover image-pixelated" />
                  ) : (
                    <span className="text-4xl">{meta?.emoji || '👤'}</span>
                  )}
                </div>
                <div className="text-center">
                  <div className="font-black text-white uppercase tracking-tight">{comp.name}</div>
                  <div className="text-[9px] text-pink-500/70 font-black uppercase mt-1">
                    ความสนิท {comp.bond}{nextThreshold ? ` / ${nextThreshold}` : ' สูงสุด'}
                  </div>
                  {comp.unlockedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mt-2">
                      {comp.unlockedSkills.map((skill, i) => (
                        <span key={i} className="text-[8px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/20" title={`x${skill.multiplier}`}>
                          🔥 {skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ));
          })}
        </div>
      )}
    </div>
  );
}
