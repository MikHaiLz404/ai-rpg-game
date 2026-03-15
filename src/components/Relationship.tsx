'use client';
import { useState, useEffect, useRef } from 'react';
import { useGameStore, DivineSkill } from '@/store/gameStore';
import { EventBus } from '@/game/EventBus';

const NPC_METADATA = {
  leo: { emoji: '⚔️', desc: 'เทพสงคราม — ดุดัน เด็ดขาด พูดตรง', theme: 'War & Physical Strength', facial: '/images/characters/npcs/facial/leo.png' },
  arena: { emoji: '👑', desc: 'ราชินีแห่งวิหาร — สง่างาม อ่อนโยน ลึกลับ', theme: 'Royal Protection & Light', facial: '/images/characters/npcs/arena/facial/arena.png' },
  draco: { emoji: '🐉', desc: 'มังกรบรรพกาล — เฒ่าแก่ ปราดเปรื่อง พูดน้อยแต่ได้ใจความ', theme: 'Ancient Fire & Magic', facial: '/images/characters/npcs/draco/facial/draco.png' },
  kane: { emoji: '🏹', desc: 'ผู้พิทักษ์ (Your Champion)', theme: 'Agility & Archery', facial: '' },
};

interface ChatMessage {
  sender: 'player' | 'npc' | 'system';
  text: string;
}

export default function Relationship() {
  const { companions, addBond, unlockSkill, setDialogue } = useGameStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [userInput, setUserMessage] = useState('');
  const [isTalking, setIsTalking] = useState(false);
  const [isGeneratingSkill, setIsGeneratingSkill] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLog]);
  
  const handleTalk = async (id: string, message?: string) => {
    const companion = companions.find(c => c.id === id);
    if (!companion) return;
    
    setIsTalking(true);
    if (!selectedId) setSelectedId(id);

    if (message) {
      setChatLog(prev => [...prev, { sender: 'player', text: message }]);
      setUserMessage('');
      
      // Also show player dialogue in overlay
      setDialogue({
        speaker: 'Minju',
        text: message,
        portrait: 'happy' // Standard talking expression
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
          npcMood: NPC_METADATA[id as keyof typeof NPC_METADATA]?.desc || 'divine',
          userMessage: message
        })
      });
      
      const data = await res.json();
      if (data.narrative) {
        setChatLog(prev => [...prev, { sender: 'npc', text: data.narrative }]);
        
        // Show NPC dialogue in overlay too
        setTimeout(() => {
          setDialogue({
            speaker: companion.name,
            text: data.narrative
          });
        }, 500);

        addBond(id, 1);
      }
    } catch (err) {
      const fallback = `${companion.name} nods in approval.`;
      setChatLog(prev => [...prev, { sender: 'npc', text: fallback }]);
      setDialogue({
        speaker: companion.name,
        text: fallback
      });
    } finally {
      setIsTalking(false);
    }
  };

  const handleGenerateSkill = async (id: string) => {
    const companion = companions.find(c => c.id === id);
    if (!companion || isGeneratingSkill) return;

    setIsGeneratingSkill(true);
    
    setDialogue({
      speaker: 'Minju',
      text: `O Divine ${companion.name}, please grant us a fragment of your power!`,
      portrait: 'work'
    });

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
      const skillData: DivineSkill = typeof data.narrative === 'string' ? JSON.parse(data.narrative) : data.narrative;
      
      unlockSkill(id, { ...skillData, godId: id });
      
      const successText = `✨ UNLOCKED NEW SKILL: ${skillData.name}!`;
      setChatLog(prev => [...prev, { sender: 'system', text: successText }]);
      
      setDialogue({
        speaker: companion.name,
        text: `It is done. Use this power wisely, mortal. ${skillData.name} is now yours.`,
      });

    } catch (err) {
      console.error('Skill gen error:', err);
      setDialogue({
        speaker: 'Minju',
        text: `The connection was severed! We must try again later.`,
        portrait: 'shock'
      });
    } finally {
      setIsGeneratingSkill(false);
    }
  };
  
  const selectedCompanion = companions.find(c => c.id === selectedId);
  const metadata = selectedId ? NPC_METADATA[selectedId as keyof typeof NPC_METADATA] : null;
  
  return (
    <div className="p-4 bg-slate-900/95 rounded-xl shadow-2xl border border-pink-500/20 flex flex-col h-[600px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-black text-pink-500 uppercase tracking-tighter italic">Divine Connections</h2>
        {selectedId && (
          <button 
            onClick={() => {setSelectedId(null); setChatLog([]);}} 
            className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            ← Back
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
                <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-600 to-rose-400 transition-all duration-1000"
                    style={{ width: `${(selectedCompanion.bond % 10) * 10}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-pink-500">LVL {selectedCompanion.level}</span>
              </div>
            </div>
            <button 
              onClick={() => handleGenerateSkill(selectedCompanion.id)}
              disabled={isGeneratingSkill}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-[10px] font-black rounded-lg transition-all shadow-lg uppercase disabled:opacity-50 shrink-0"
            >
              {isGeneratingSkill ? '...' : '✨ Skill'}
            </button>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 bg-black/40 rounded-2xl p-4 overflow-y-auto border border-white/5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800"
          >
            {chatLog.length === 0 && (
              <div className="text-center text-slate-600 italic text-xs py-8">Seek audience to begin your conversation...</div>
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
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (userInput.trim()) handleTalk(selectedCompanion.id, userInput);
            }}
            className="flex gap-2"
          >
            <input 
              type="text"
              value={userInput}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Type your message to the god..."
              className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50 transition-colors"
            />
            <button 
              type="submit"
              disabled={isTalking || !userInput.trim()}
              className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all"
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          {companions.map((comp) => {
            const meta = NPC_METADATA[comp.id as keyof typeof NPC_METADATA];
            return (comp.id !== 'kane' && (
              <button
                key={comp.id}
                onClick={() => {
                  EventBus.emit('village-walk-to-npc', { npcId: comp.id });
                  handleTalk(comp.id);
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
