'use client';
import { useState, useEffect } from 'react';

function makeFrames(base: string, count: number) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(base + '/frame_' + Math.floor(i/3) + '_' + (i%3) + '.png');
  }
  return arr;
}

const SPRITES = {
  leo: makeFrames('/images/characters/npcs/leo/idle', 12),
  arena: makeFrames('/images/characters/npcs/arena/idle', 12),
  draco: makeFrames('/images/characters/npcs/draco/idle', 12),
};

export default function Relationship() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [npcs, setNpcs] = useState({leo: 5, arena: 3, draco: 2, kane: 1});
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => setFrameIndex(f => (f + 1) % 12), 200);
    return () => clearInterval(interval);
  }, []);
  
  const characters = [
    {id: 'leo', name: 'เลโอ้', emoji: '⚔️', desc: 'เทพสงคราม'},
    {id: 'arena', name: 'อารีน่า', emoji: '👑', desc: 'ราชินี'},
    {id: 'draco', name: 'ดราโก้', emoji: '🐉', desc: 'มังกร'},
    {id: 'kane', name: 'เคน', emoji: '🗡️', desc: 'นักฆ่า'},
  ];
  
  const handleTalk = (id: string) => {
    const char = characters.find(c => c.id === id);
    if (!char) return;
    const msgs = [char.name + ': สวัสดีครับ!', char.name + ': วันนี้มีอะไรให้ช่วยไหม?', char.name + ': เตรียมตัวพร้อมสำหรับ Arena แล้วใช่ไหม?'];
    setChatLog([msgs[Math.floor(Math.random() * 3)]]);
    setSelectedId(id);
  };
  
  const handleGift = (id: string) => {
    const char = characters.find(c => c.id === id);
    if (!char) return;
    setNpcs(p => ({...p, [id]: (p[id] || 0) + 1}));
    setChatLog(prev => [...prev, '❤️ คุณให้ของขวัญแก่ ' + char.name + '! Bond +1']);
  };
  
  const selectedChar = characters.find(c => c.id === selectedId);
  const frames = selectedId && SPRITES[selectedId as keyof typeof SPRITES] ? SPRITES[selectedId as keyof typeof SPRITES] : null;
  const currentFrame = frames ? frames[frameIndex] : null;
  
  return (
    <div style={{padding: '20px'}}>
      <h2 style={{fontSize: '1.5rem', marginBottom: '15px'}}>💕 Relationship</h2>
      {selectedChar ? (
        <div>
          <button onClick={() => {setSelectedId(null); setChatLog([])}} style={{padding: '8px 16px', background: '#374151', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', marginBottom: '15px'}}>← Back</button>
          <div style={{background: '#16213e', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center'}}>
            <div style={{width: '64px', height: '64px', margin: '0 auto 10px', background: '#0f172a', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {currentFrame ? <img src={currentFrame} alt={selectedChar.name} style={{width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated'}}/> : <span style={{fontSize: '2rem'}}>{selectedChar.emoji}</span>}
            </div>
            <h3>{selectedChar.name}</h3>
            <p style={{color: '#9ca3af'}}>{selectedChar.desc}</p>
            <p style={{color: '#ec4899', marginTop: '10px'}}>❤️ Bond: {npcs[selectedChar.id as keyof typeof npcs] || 0}</p>
          </div>
          <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
            <button onClick={() => handleTalk(selectedChar.id)} style={{flex: 1, padding: '15px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer'}}>💬 Talk</button>
            <button onClick={() => handleGift(selectedChar.id)} style={{flex: 1, padding: '15px', background: '#ec4899', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer'}}>🎁 Gift</button>
          </div>
          <div style={{background: '#1f2937', padding: '10px', borderRadius: '8px', minHeight: '100px'}}>
            {chatLog.map((msg, i) => <div key={i} style={{marginBottom: '5px', fontSize: '0.9rem'}}>{msg}</div>)}
            {chatLog.length === 0 && <span style={{color: '#666'}}>Start a conversation...</span>}
          </div>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px'}}>
          {characters.map((char) => (
            <button key={char.id} onClick={() => handleTalk(char.id)} style={{padding: '15px', background: '#374151', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
              <span style={{fontSize: '2rem'}}>{char.emoji}</span>
              <span style={{fontWeight: 'bold'}}>{char.name}</span>
              <span style={{color: '#9ca3af', fontSize: '0.75rem'}}>{char.desc}</span>
              <span style={{color: '#ec4899', fontSize: '0.85rem'}}>❤️ {npcs[char.id as keyof typeof npcs] || 0}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
