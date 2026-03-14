'use client';
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

function makeFrames(base: string, count: number) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(base + '/frame_' + Math.floor(i/3) + '_' + (i%3) + '.png');
  }
  return arr;
}

const NPC_METADATA = {
  leo: { emoji: '⚔️', desc: 'เทพสงคราม', sprites: makeFrames('/images/characters/npcs/leo/idle', 12) },
  arena: { emoji: '👑', desc: 'ราชินี', sprites: makeFrames('/images/characters/npcs/arena/idle', 12) },
  draco: { emoji: '🐉', desc: 'มังกร', sprites: makeFrames('/images/characters/npcs/draco/idle', 12) },
  kane: { emoji: '🗡️', desc: 'นักฆ่า', sprites: [] },
};

export default function Relationship() {
  const { companions, addBond } = useGameStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => setFrameIndex(f => (f + 1) % 12), 200);
    return () => clearInterval(interval);
  }, []);
  
  const handleTalk = (id: string) => {
    const companion = companions.find(c => c.id === id);
    if (!companion) return;
    const msgs = [
      `${companion.name}: สวัสดีครับนักเดินทาง!`,
      `${companion.name}: วันนี้เจ้าดูแข็งแกร่งขึ้นนะ`,
      `${companion.name}: เจ้าพร้อมสำหรับการประลองครั้งต่อไปหรือยัง?`
    ];
    setChatLog([msgs[Math.floor(Math.random() * 3)]]);
    setSelectedId(id);
  };
  
  const handleGift = (id: string) => {
    const companion = companions.find(c => c.id === id);
    if (!companion) return;
    addBond(id, 1);
    setChatLog(prev => [`❤️ มอบของขวัญให้ ${companion.name} (Bond +1)`, ...prev]);
  };
  
  const selectedCompanion = companions.find(c => c.id === selectedId);
  const metadata = selectedId ? NPC_METADATA[selectedId as keyof typeof NPC_METADATA] : null;
  const currentFrame = (metadata && metadata.sprites.length > 0) ? metadata.sprites[frameIndex] : null;
  
  return (
    <div className="p-4 bg-slate-900/80 rounded-xl border border-pink-900/30">
      <h2 className="text-2xl font-bold mb-6 text-pink-400 flex items-center gap-2">
        💕 Divine Connections
      </h2>

      {selectedCompanion && metadata ? (
        <div className="space-y-6">
          <button 
            onClick={() => {setSelectedId(null); setChatLog([]);}} 
            className="text-slate-400 hover:text-white flex items-center gap-1 text-sm mb-2"
          >
            ← Back to All Gods
          </button>
          
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-pink-500/30">
              {currentFrame ? (
                <img src={currentFrame} alt={selectedCompanion.name} className="w-full h-full object-contain image-pixelated" />
              ) : (
                <span className="text-4xl">{metadata.emoji}</span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white">{selectedCompanion.name}</h3>
            <p className="text-sm text-slate-400">{metadata.desc}</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-pink-400 font-bold">
              <span>❤️ BOND LEVEL:</span>
              <span className="text-2xl">{selectedCompanion.bond}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => handleTalk(selectedCompanion.id)} 
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
            >
              💬 TALK
            </button>
            <button 
              onClick={() => handleGift(selectedCompanion.id)} 
              className="flex-1 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg transition-colors"
            >
              🎁 GIVE GIFT
            </button>
          </div>

          <div className="bg-black/40 p-4 rounded-lg h-32 overflow-y-auto border border-slate-800 font-mono text-sm">
            {chatLog.map((msg, i) => (
              <div key={i} className={`mb-1 ${i === 0 ? 'text-white' : 'text-slate-500'}`}>{msg}</div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {companions.map((comp) => {
            const meta = NPC_METADATA[comp.id as keyof typeof NPC_METADATA];
            return (
              <button 
                key={comp.id} 
                onClick={() => handleTalk(comp.id)} 
                className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-pink-500/50 rounded-xl transition-all flex flex-col items-center gap-3 group"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">{meta?.emoji || '👤'}</span>
                <div className="text-center">
                  <div className="font-bold">{comp.name}</div>
                  <div className="text-xs text-pink-400">Bond: {comp.bond}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
