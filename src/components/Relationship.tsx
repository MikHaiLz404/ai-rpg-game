'use client';
import { useState } from 'react';

export default function Relationship() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [npcs, setNpcs] = useState<Record<string, number>>({ leo: 5, arena: 3, draco: 2, kane: 1 });
  const [chatLog, setChatLog] = useState<string[]>([]);
  
  const characters = [
    { id: 'leo', name: 'เลโอ้', emoji: '⚔️', desc: 'เทพสงคราม', sprite: '/images/characters/npcs/leo/character_2/character_2_frame32x32.png' },
    { id: 'arena', name: 'อารีน่า', emoji: '👑', desc: 'ราชินี', sprite: '/images/characters/npcs/arena/character_10/character_10_frame32x32.png' },
    { id: 'draco', name: 'ดราโก้', emoji: '🐉', desc: 'มังกร', sprite: '/images/characters/npcs/draco/character_24/character_24_frame32x32.png' },
    { id: 'kane', name: 'เคน', emoji: '🗡️', desc: 'นักฆ่า', sprite: '/images/characters/npcs/kane/hero-pack-free_version/hero/color_1/idle/hero_idle_DOWN.png' },
  ];
  
  const handleTalk = (id: string) => {
    const char = characters.find(c => c.id === id);
    if (!char) return;
    const msgs = [
      char.name + ': สวัสดีครับ!',
      char.name + ': วันนี้มีอะไรให้ช่วยไหม?',
      char.name + ': เตรียมตัวพร้อมสำหรับ Arena แล้วใช่ไหม?',
    ];
    const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
    setChatLog([randomMsg]);
    setSelectedId(id);
  };
  
  const handleGift = (id: string) => {
    const char = characters.find(c => c.id === id);
    if (!char) return;
    setNpcs(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setChatLog(prev => [...prev, '❤️ คุณให้ของขวัญแก่ ' + char.name + '! Bond +1']);
  };
  
  const selectedChar = characters.find(c => c.id === selectedId);
  
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>💕 Relationship</h2>
      
      {selectedChar ? (
        <div>
          <button onClick={() => { setSelectedId(null); setChatLog([]); }}
            style={{ padding: '8px 16px', background: '#374151', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', marginBottom: '15px' }}>
            ← Back
          </button>
          
          <div style={{ background: '#16213e', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', margin: '0 auto 10px', background: '#0f172a', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={selectedChar.sprite} alt={selectedChar.name} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} />
            </div>
            <h3>{selectedChar.name}</h3>
            <p style={{ color: '#9ca3af' }}>{selectedChar.desc}</p>
            <p style={{ color: '#ec4899', marginTop: '10px' }}>❤️ Bond: {npcs[selectedChar.id] || 0}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => handleTalk(selectedChar.id)} style={{ flex: 1, padding: '15px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>💬 Talk</button>
            <button onClick={() => handleGift(selectedChar.id)} style={{ flex: 1, padding: '15px', background: '#ec4899', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>🎁 Gift</button>
          </div>
          
          <div style={{ background: '#1f2937', padding: '10px', borderRadius: '8px', minHeight: '100px' }}>
            {chatLog.map((msg, i) => <div key={i} style={{ marginBottom: '5px', fontSize: '0.9rem' }}>{msg}</div>)}
            {chatLog.length === 0 && <span style={{ color: '#666' }}>Start a conversation...</span>}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
          {characters.map((char) => (
            <button key={char.id} onClick={() => handleTalk(char.id)}
              style={{ padding: '15px', background: '#374151', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '48px', height: '48px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                <img src={char.sprite} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} />
              </div>
              <span>{char.name}</span>
              <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{char.desc}</span>
              <span style={{ color: '#ec4899' }}>❤️ {npcs[char.id] || 0}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
