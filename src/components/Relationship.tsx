'use client';
import { useState, useEffect, useRef } from 'react';
import { useGameStore, DivineSkill } from '@/store/gameStore';
import { EventBus } from '@/game/EventBus';
import { broadcastAISource } from './AIStatusBadge';
import { NPC_CONFIGS, getSkillThresholds, GOD_BOND_RATE, GOD_CHAT_LIMIT } from '@/data/npcConfig';

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

const FALLBACK_SKILLS: Record<string, DivineSkill[]> = {
  leo: [
    { name: 'War Cry', description: 'เสียงกึกก้องจากสมรภูมิ', multiplier: 1.5, type: 'physical', godId: 'leo' },
    { name: 'Blade Storm', description: 'พายุดาบแห่งเทพสงคราม', multiplier: 2.0, type: 'physical', godId: 'leo' },
    { name: 'Olympian Fury', description: 'ความโกรธแค้นแห่งโอลิมปัส', multiplier: 2.5, type: 'physical', godId: 'leo' },
    { name: 'God of War', description: 'พลังสูงสุดของเทพสงคราม', multiplier: 3.0, type: 'physical', godId: 'leo' },
    { name: 'Eternal Vanguard', description: 'หอกนำทัพนิรันดร์', multiplier: 2.8, type: 'physical', godId: 'leo' },
  ],
  arena: [
    { name: 'Holy Light', description: 'แสงศักดิ์สิทธิ์แห่งราชินี', multiplier: 1.5, type: 'magical', godId: 'arena' },
    { name: 'Starfall', description: 'ฝนดาวตกจากสวรรค์', multiplier: 2.0, type: 'magical', godId: 'arena' },
    { name: 'Crown Judgment', description: 'คำพิพากษาแห่งมงกุฎ', multiplier: 2.5, type: 'magical', godId: 'arena' },
    { name: 'Divine Radiance', description: 'รัศมีสูงสุดแห่งวิหาร', multiplier: 3.0, type: 'magical', godId: 'arena' },
    { name: 'Celestial Bond', description: 'สายสัมพันธ์เบื้องบน', multiplier: 2.8, type: 'magical', godId: 'arena' },
  ],
  draco: [
    { name: 'Dragon Breath', description: 'ลมหายใจมังกรบรรพกาล', multiplier: 1.5, type: 'magical', godId: 'draco' },
    { name: 'Ancient Tremor', description: 'แผ่นดินไหวแห่งยุคโบราณ', multiplier: 2.0, type: 'physical', godId: 'draco' },
    { name: 'Wyrm Coil', description: 'ขดพญานาคสยบศัตรู', multiplier: 2.5, type: 'physical', godId: 'draco' },
    { name: 'Primordial Flame', description: 'เปลวไฟดั้งเดิมแห่งโลก', multiplier: 3.0, type: 'magical', godId: 'draco' },
    { name: 'Epoch Crusher', description: 'พลังทำลายกาลเวลา', multiplier: 2.8, type: 'magical', godId: 'draco' },
  ],
};

function getDeterministicSkill(godId: string, level: number): DivineSkill {
  const pool = FALLBACK_SKILLS[godId] || FALLBACK_SKILLS.leo;
  const index = Math.min(level - 1, pool.length - 1);
  return { ...pool[Math.max(0, index)], godId };
}

function parseSkillResponse(narrative: unknown, godId: string, level: number): DivineSkill {
  try {
    let raw: any;
    if (typeof narrative === 'string') {
      const cleaned = narrative.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();
      raw = JSON.parse(cleaned);
    } else {
      raw = narrative;
    }
    if (!raw || typeof raw.name !== 'string' || !raw.name.trim()) throw new Error('Missing name');
    const multiplier = Math.min(3.0, Math.max(1.5, raw.multiplier || 1.5));
    return { name: raw.name.trim(), description: raw.description || '', multiplier, type: raw.type === 'magical' ? 'magical' : 'physical', godId };
  } catch (err) {
    return getDeterministicSkill(godId, level);
  }
}

const FAVORITE_GIFTS: Record<string, string[]> = {
  leo: ['sword', 'shield', 'bow'],
  arena: ['perfume', 'flower', 'mirror'],
  draco: ['herbs', 'ore', 'olympian_coin'],
};

interface ChatMessage {
  sender: 'player' | 'npc' | 'system';
  text: string;
}

export default function Relationship() {
  const { 
    companions, addBond, unlockSkill, markThresholdClaimed, setDialogue, 
    choicesLeft, consumeChoice, setIsBusy, items, removeItem, addAILog,
    gold, day, arenaWins, spendGold, updateKaneStats, kaneStats
  } = useGameStore();
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [userInput, setUserMessage] = useState('');
  const [isTalking, setIsTalking] = useState(false);
  const [isGeneratingSkill, setIsGeneratingSkill] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [turnsUsed, setTurnsUsed] = useState(0);
  const [conversationEnded, setConversationEnded] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLog]);

  const checkAutoSkillUnlock = async (id: string) => {
    const freshCompanion = useGameStore.getState().companions.find(c => c.id === id);
    if (!freshCompanion || isGeneratingSkill) return;
    const config = NPC_CONFIGS[id];
    const godThresholds = getSkillThresholds(id);
    const unclaimedThreshold = godThresholds.find(t => freshCompanion.bond >= t && !freshCompanion.claimedThresholds.includes(t));
    if (!unclaimedThreshold) return;

    setIsGeneratingSkill(true);
    setChatLog(prev => [...prev, { sender: 'system', text: `🌟 บรรลุระดับความสนิท ${unclaimedThreshold} แต้ม! ${freshCompanion.name} กำลังมอบสกิลใหม่ให้...` }]);

    try {
      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_skill',
          npcName: freshCompanion.name,
          godTheme: config?.theme || 'Divine',
          level: freshCompanion.level
        })
      });
      const data = await res.json();
      broadcastAISource(data.source || 'fallback');
      
      addAILog({
        action: 'generate_skill',
        model: data.model || 'AI Model',
        source: data.source || 'unknown',
        prompt: data.prompt || '',
        response: typeof data.narrative === 'string' ? data.narrative : JSON.stringify(data.narrative),
        tokensInput: data.usage?.prompt_tokens || 0,
        tokensOutput: data.usage?.completion_tokens || 0
      });

      const skillData = parseSkillResponse(data.narrative, id, freshCompanion.level);
      unlockSkill(id, { ...skillData, godId: id });
      markThresholdClaimed(id, unclaimedThreshold);
      setChatLog(prev => [...prev, { sender: 'system', text: `✨ สกิลใหม่: ${skillData.name}! (พลังโจมตี x${skillData.multiplier})` }]);
    } catch (err) {
      const fallback = getDeterministicSkill(id, freshCompanion.level);
      unlockSkill(id, { ...fallback, godId: id });
      markThresholdClaimed(id, unclaimedThreshold);
    } finally {
      setIsGeneratingSkill(false);
    }
  };

  const handleTalk = async (id: string, message?: string) => {
    const companion = companions.find(c => c.id === id);
    if (!companion || (message && conversationEnded)) return;
    
    // Check if player has actions left BEFORE starting or sending
    if (choicesLeft <= 0) {
      setDialogue({
        speaker: 'Minju',
        text: 'วันนี้ฉันเหนื่อยเกินกว่าจะคุยแล้วค่ะ... ไว้พรุ่งนี้ค่อยมาใหม่นะคะ',
        portrait: 'work'
      });
      setSelectedId(null);
      return;
    }

    const chatLimit = GOD_CHAT_LIMIT[id] ?? 3;
    const config = NPC_CONFIGS[id];
    setIsTalking(true);
    setIsBusy(true);
    if (!selectedId) setSelectedId(id);

    if (message) {
      consumeChoice();
      setTurnsUsed(prev => prev + 1);
      setChatLog(prev => [...prev, { sender: 'player', text: message }]);
      setUserMessage('');
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
          userMessage: message,
          // Inject context for Divine Council awareness
          playerContext: {
            gold,
            day,
            arenaWins,
            items: items.map(id => ITEMS_MAP[id]?.name || id).join(', '),
            relationships: companions
              .filter(c => c.id !== id)
              .map(c => `${c.name} (Bond: ${c.bond})`)
              .join(', ')
          }
        })
      });
      const data = await res.json();
      broadcastAISource(data.source || 'fallback');
      
      addAILog({
        action: 'talk',
        model: data.model || 'AI Model',
        source: data.source || 'unknown',
        prompt: data.prompt || '',
        response: data.narrative || '',
        tokensInput: data.usage?.prompt_tokens || 0,
        tokensOutput: data.usage?.completion_tokens || 0
      });

      if (data.narrative) {
        setChatLog(prev => [...prev, { sender: 'npc', text: data.narrative }]);
        setDialogue({ speaker: companion.name, text: data.narrative });
        if (message) {
          const godRate = GOD_BOND_RATE[id] ?? 1.0;
          const bondChance = Math.max(0.10, (0.4 - companion.bond * 0.02) * godRate);
          if (Math.random() < bondChance) {
            addBond(id, 1);
            
            // Visual feedback in Phaser
            EventBus.emit('spawn-floating-text', { text: `💗 +1 Bond`, color: '#f472b6' });
            
            setChatLog(prev => [...prev, { sender: 'system', text: `💗 ความสัมพันธ์ +1` }]);
            setTimeout(() => checkAutoSkillUnlock(id), 100);
          }
        }
      }
    } catch (err) {
      const fb = config?.greeting || '...';
      setChatLog(prev => [...prev, { sender: 'npc', text: fb }]);
    } finally {
      setIsTalking(false);
      setTimeout(() => setIsBusy(false), 1000);
    }

    if (message && turnsUsed + 1 >= chatLimit) {
      setConversationEnded(true);
      setChatLog(prev => [...prev, { sender: 'system', text: `💬 บทสนทนาวันนี้จบลงแล้ว` }]);
    }
  };

  const handleGift = async (itemId: string) => {
    if (!selectedId) return;
    if (choicesLeft <= 0) {
      setDialogue({
        speaker: 'Minju',
        text: 'แต้มการกระทำหมดแล้วค่ะ! ไว้พรุ่งนี้ค่อยเอามาให้นะคะ',
        portrait: 'shock'
      });
      return;
    }
    const companion = companions.find(c => c.id === selectedId);
    if (!companion) return;
    consumeChoice(); removeItem(itemId); setShowGiftModal(false);
    const itemInfo = ITEMS_MAP[itemId];
    setChatLog(prev => [...prev, { sender: 'player', text: `(มอบของขวัญ: ${itemInfo?.emoji || ''} ${itemInfo?.name || itemId})` }]);
    const isFavorite = FAVORITE_GIFTS[selectedId]?.includes(itemId);
    const bondGain = (itemId.includes('potion') ? 3 : 5) + (isFavorite ? 3 : 0);
    addBond(selectedId, bondGain);
    setChatLog(prev => [...prev, { sender: 'system', text: `💗 ความสัมพันธ์ +${bondGain}${isFavorite ? ' ⭐' : ''}` }]);
    try {
      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'gift', playerName: 'Minju', npcName: companion.name, wantedItem: itemInfo?.name || itemId, bondLevel: companion.level })
      });
      const data = await res.json();
      broadcastAISource(data.source || 'fallback');
      addAILog({ action: 'gift', model: data.model || 'AI Model', source: data.source as any || 'unknown', prompt: data.prompt || '', response: data.narrative || '', tokensInput: data.usage?.prompt_tokens || 0, tokensOutput: data.usage?.completion_tokens || 0 });
      if (data.narrative) { setChatLog(prev => [...prev, { sender: 'npc', text: data.narrative }]); setDialogue({ speaker: companion.name, text: data.narrative }); }
    } catch (err) {}
    setTimeout(() => checkAutoSkillUnlock(selectedId), 100);
  };

  const handleTrain = () => {
    if (!selectedId || !selectedCompanion) return;
    if (choicesLeft <= 0) {
      setDialogue({ speaker: 'Minju', text: 'วันนี้เหนื่อยมากแล้วค่ะ พักผ่อนก่อนเถอะนะ', portrait: 'work' });
      return;
    }

    const cost = 50 + (day - 1) * 10;
    if (gold < cost) {
      setDialogue({ speaker: 'Minju', text: `เราต้องมีอย่างน้อย ${cost} ทองเพื่อขอรับการฝึกฝนค่ะ`, portrait: 'shock' });
      return;
    }

    if (spendGold(cost)) {
      consumeChoice();
      const r = Math.random();
      let statMsg = "";
      if (r < 0.4) {
        updateKaneStats({ maxHp: kaneStats.maxHp + 15, hp: Math.min(kaneStats.maxHp + 15, kaneStats.hp + 15) });
        statMsg = "Max HP +15";
      } else if (r < 0.7) {
        updateKaneStats({ atk: kaneStats.atk + 4 });
        statMsg = "ATK +4";
      } else {
        updateKaneStats({ def: kaneStats.def + 2 });
        statMsg = "DEF +2";
      }

      setChatLog(prev => [
        ...prev, 
        { sender: 'player', text: `(ขอรับการฝึกฝนจาก ${selectedCompanion.name} - ${cost} Gold)` },
        { sender: 'system', text: `✨ Kane แข็งแกร่งขึ้น! (${statMsg})` }
      ]);
      
      EventBus.emit('spawn-floating-text', { text: `Kane Upgraded!`, color: '#f59e0b' });
    }
  };

  const selectedCompanion = companions.find(c => c.id === selectedId);
  const metadata = selectedId ? NPC_CONFIGS[selectedId] : null;
  const getNextThreshold = (c: any) => getSkillThresholds(c.id).find(t => c.bond < t);

  return (
    <div className="p-4 bg-slate-900/95 rounded-xl shadow-2xl border border-pink-500/20 flex flex-col flex-1 min-h-[500px] h-0">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h2 className="text-2xl font-black text-pink-500 uppercase tracking-tighter italic font-serif">สายสัมพันธ์แห่งเทพ</h2>
        {selectedId && <button onClick={() => {setSelectedId(null); setChatLog([]); setIsBusy(false); setTurnsUsed(0); setConversationEnded(false);}} className="text-slate-500 hover:text-white text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors font-serif">← กลับ</button>}
      </div>
      {selectedCompanion && metadata ? (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5 flex items-center gap-4 relative overflow-hidden shrink-0">
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border-2 border-pink-500/20 shadow-xl relative z-10 shrink-0 overflow-hidden">
              {metadata && metadata.facial ? (
                <img src={metadata.facial} alt={selectedCompanion.name} className="w-full h-full object-cover image-pixelated" />
              ) : (
                <span className="text-2xl">{metadata?.emoji || '👤'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-black text-white uppercase tracking-tight truncate font-serif">{selectedCompanion.name}</h3>
              <div className="flex items-center gap-2"><div className="flex-1 min-w-0"><div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">{(() => { const next = getNextThreshold(selectedCompanion); const thresholds = getSkillThresholds(selectedCompanion.id); const prev = thresholds.filter(t => t <= selectedCompanion.bond).pop() || 0; const progress = next ? ((selectedCompanion.bond - prev) / (next - prev)) * 100 : 100; return <div className="h-full bg-gradient-to-r from-pink-600 to-rose-400 transition-all duration-1000" style={{ width: `${progress}%` }} />; })()}</div><div className="flex justify-between mt-0.5"><span className="text-[8px] md:text-[10px] text-slate-500 font-sans">ค่าความสนิท: {selectedCompanion.bond}</span>{getNextThreshold(selectedCompanion) && <span className="text-[8px] md:text-[10px] text-amber-500/70 font-sans">สกิลถัดไป: {getNextThreshold(selectedCompanion)}</span>}</div></div><span className="text-[10px] md:text-xs font-black text-pink-500 shrink-0 font-sans uppercase">LVL {selectedCompanion.level}</span></div>
            </div>
            {/* Feature: Divine Training */}
            {GOD_BOND_RATE[selectedCompanion.id] !== undefined && (
              <button type="button" onClick={handleTrain} disabled={choicesLeft <= 0 || conversationEnded} className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-3 py-2 rounded-xl font-black text-[9px] uppercase transition-all shadow-lg shadow-amber-500/20 shrink-0 ml-2">
                ฝึกฝน Kane<br/>({50 + (day-1)*10}g)
              </button>
            )}
          </div>
          {isGeneratingSkill && <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2 text-center animate-pulse shrink-0"><span className="text-amber-500 text-xs md:text-sm font-black uppercase tracking-widest font-serif">กำลังรวบรวมพลังเทพ...</span></div>}
          <div ref={scrollRef} className="flex-1 bg-black/40 rounded-2xl p-4 overflow-y-auto border border-white/5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 min-h-0">{chatLog.length === 0 && <div className="text-center text-slate-600 italic text-xs md:text-sm py-8">ขอเข้าพบเพื่อเริ่มบทสนทนา...</div>}{chatLog.map((msg, i) => <div key={i} className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${msg.sender === 'player' ? 'bg-pink-600 text-white rounded-tr-none' : msg.sender === 'npc' ? 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5' : 'bg-amber-500/10 text-amber-500 text-[10px] md:text-xs font-bold uppercase tracking-widest border border-amber-500/20 mx-auto'}`}>{msg.text}</div></div>)}{isTalking && <div className="flex justify-start"><div className="bg-slate-800/50 px-4 py-2 rounded-2xl rounded-tl-none animate-pulse text-slate-400 text-xs md:text-sm font-sans">กำลังคิด...</div></div>}</div>
          
          <div className="shrink-0 space-y-2 pb-2">
            {selectedId && !conversationEnded && <div className="flex items-center justify-between px-1 mb-1"><span className="text-[9px] md:text-[11px] text-slate-500 font-bold uppercase tracking-widest font-sans">โอกาสพูดคุย</span><div className="flex items-center gap-1">{Array.from({ length: GOD_CHAT_LIMIT[selectedId] ?? 3 }).map((_, i) => <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < turnsUsed ? 'bg-slate-700' : 'bg-pink-500'}`} />)}<span className="text-[8px] md:text-[10px] text-slate-500 ml-1 font-sans">{Math.max(0, (GOD_CHAT_LIMIT[selectedId] ?? 3) - turnsUsed)}/{GOD_CHAT_LIMIT[selectedId] ?? 3}</span></div></div>}
            {conversationEnded && <div className="bg-slate-800/50 border border-pink-500/20 rounded-xl px-4 py-3 text-center"><div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest font-sans">บทสนทนาวันนี้จบลงแล้ว</div><div className="text-[9px] md:text-[11px] text-slate-600 mt-1 font-sans">ยังมอบของขวัญได้ หรือกลับไปเลือกเทพองค์อื่น</div></div>}
            <form onSubmit={(e) => { e.preventDefault(); if (userInput.trim() && !conversationEnded) handleTalk(selectedCompanion.id, userInput); }} className="flex gap-2 relative">
              <button type="button" onClick={() => setShowGiftModal(!showGiftModal)} disabled={choicesLeft <= 0 || conversationEnded} className="bg-slate-800 hover:bg-slate-700 text-pink-500 p-3 rounded-xl border border-white/10 transition-all flex items-center justify-center shrink-0 disabled:opacity-50" title="Give Gift">🎁</button>
              
              {/* Feature: Divine Training */}
              <button type="button" onClick={handleTrain} disabled={choicesLeft <= 0 || conversationEnded} className="bg-slate-800 hover:bg-slate-700 text-amber-500 p-3 rounded-xl border border-white/10 transition-all flex items-center justify-center shrink-0 disabled:opacity-50" title={`Train Kane (${100 + (day-1)*20}g)`}>⚔️</button>

              {showGiftModal && (
                <div className="absolute bottom-full left-0 w-64 bg-slate-900 border-2 border-pink-500/30 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300 mb-2">
                  <div className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex justify-between"><span>เลือกของขวัญ</span><button onClick={() => setShowGiftModal(false)}>✕</button></div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 font-sans">{Array.from(new Set(items)).map((itemId) => { const info = ITEMS_MAP[itemId]; const isFav = selectedId ? FAVORITE_GIFTS[selectedId]?.includes(itemId) : false; return <button key={itemId} onClick={() => handleGift(itemId)} className={`w-full text-left p-2 rounded-lg text-xs md:text-sm text-slate-200 border transition-all flex items-center justify-between ${isFav ? 'bg-pink-900/30 hover:bg-pink-800/40 border-pink-500/20' : 'bg-slate-800 hover:bg-slate-700 border-white/5'}`}><span>{info ? `${info.emoji} ${info.name}` : itemId}{isFav ? ' ⭐' : ''}</span><span className="text-[8px] md:text-[10px] text-pink-500/70 font-sans">x{items.filter(i => i === itemId).length}</span></button>; })} {items.length === 0 && <div className="text-[10px] md:text-xs text-slate-600 italic text-center py-4 font-sans">ไม่มีของในกระเป๋าเลย...</div>}</div>
                </div>
              )}
              <input type="text" value={userInput} onChange={(e) => setUserMessage(e.target.value)} disabled={conversationEnded} placeholder={conversationEnded ? 'เทพกลับไปแล้ว...' : 'พิมพ์ข้อความคุยกับเทพ...'} className={`flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50 transition-colors ${conversationEnded ? 'opacity-50' : ''}`} />
              <button type="submit" disabled={isTalking || !userInput.trim() || choicesLeft <= 0 || conversationEnded} className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-black uppercase text-xs md:text-sm tracking-widest transition-all font-serif">{conversationEnded ? 'จบ' : choicesLeft > 0 ? 'ส่ง' : 'แต้มหมด'}</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 pb-4">
          {(companions || []).map((comp) => {
            const meta = NPC_CONFIGS[comp.id];
            const thresholds = getSkillThresholds(comp.id);
            const nextThreshold = (thresholds || []).find(t => comp.bond < t);
            return (comp.id !== 'kane' && (
              <button key={comp.id} onClick={() => { 
                if (choicesLeft <= 0) {
                  setDialogue({ speaker: 'Minju', text: 'แต้มการกระทำหมดแล้วค่ะ กลับบ้านไปพักผ่อนเถอะนะ', portrait: 'work' });
                  return;
                }
                setSelectedId(comp.id); EventBus.emit('village-walk-to-npc', { npcId: comp.id }); const onArrival = () => { EventBus.off('village-walk-complete', onArrival); handleTalk(comp.id); }; EventBus.on('village-walk-complete', onArrival); 
              }} className="p-6 bg-slate-800/40 hover:bg-slate-800 border border-white/5 hover:border-pink-500/30 rounded-3xl transition-all flex flex-col items-center gap-4 group relative overflow-hidden h-48">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity font-serif"><span className="text-4xl font-black">{comp.level}</span></div>
                <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl border border-white/5 group-hover:scale-110 transition-transform overflow-hidden">
                  {meta && meta.facial ? (
                    <img src={meta.facial} alt={comp.name} className="w-full h-full object-cover image-pixelated" />
                  ) : (
                    <span className="text-4xl">{meta?.emoji || '👤'}</span>
                  )}
                </div>
                <div className="text-center"><div className="font-black text-white uppercase tracking-tight font-serif">{comp.name}</div><div className="text-[9px] md:text-[11px] text-pink-500/70 font-black uppercase mt-1 font-sans">ความสนิท {comp.bond}{nextThreshold ? ` / ${nextThreshold}` : ' สูงสุด'}</div>{(comp.unlockedSkills || []).length > 0 && <div className="flex flex-wrap gap-1 justify-center mt-2">{(comp.unlockedSkills || []).map((skill, i) => <span key={i} className="text-[8px] md:text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/20 font-serif" title={`x${skill.multiplier}`}>🔥 {skill.name}</span>)}</div>}</div>
              </button>
            ));
          })}
        </div>
      )}
    </div>
  );
}
