'use client';
import { useState } from 'react';

const NPCs = [
  { id: 'leo', name: 'เลโอ้', emoji: '⚔️', bond: 5, desc: 'เทพสงคราม' },
  { id: 'arena', name: 'อารีน่า', emoji: '👑', bond: 3, desc: 'ราชินี' },
  { id: 'draco', name: 'ดราโก้', emoji: '🐉', bond: 2, desc: 'มังกร' },
  { id: 'kane', name: 'เคน', emoji: '🗡️', bond: 1, desc: 'นักฆ่า' },
];

export default function Relationship() {
  const [selectedNpc, setSelectedNpc] = useState<typeof NPCs[0] | null>(null);
  const [npcs, setNpcs] = useState(NPCs);
  const [chatLog, setChatLog] = useState<string[]>([]);
  
  const handleTalk = (npc: typeof NPCs[0]) => {
    setSelectedNpc(npc);
    const messages = [
      `${npc.name}: สวัสดีครับ!`,
      `${npc.name}: วันนี้เป็นอย่างไรบ้าง?`,
      `${npc.name}: อารีน่าน่ะเหรอ? เธอแข็งแกร่งมากเลย!`,
    ];
    setChatLog([messages[Math.floor(Math.random() * messages.length)]]);
  };
  
  const handleGift = (npcId: string) => {
    setNpcs(prev => prev.map(npc => 
      npc.id === npcId ? { ...npc, bond: npc.bond + 1 } : npc
    ));
    const npc = npcs.find(n => n.id === npcId);
    setChatLog(prev => [...prev, `❤️ You gave a gift to ${npc?.name}! Bond +1`]);
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>💕 Relationship</h2>
      
      {selectedNpc ? (
        <div>
          <button 
            onClick={() => { setSelectedNpc(null); setChatLog([]); }}
            style={{
              padding: '8px 16px',
              background: '#374151',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              marginBottom: '15px'
            }}
          >
            ← Back
          </button>
          
          <div style={{ 
            background: '#16213e', 
            padding: '20px', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '10px' }}>
              {selectedNpc.emoji}
            </div>
            <h3 style={{ textAlign: 'center' }}>{selectedNpc.name}</h3>
            <p style={{ textAlign: 'center', color: '#9ca3af' }}>{selectedNpc.desc}</p>
            <p style={{ textAlign: 'center', marginTop: '10px', color: '#ec4899' }}>
              ❤️ Bond: {npcs.find(n => n.id === selectedNpc.id)?.bond}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              onClick={() => handleTalk(selectedNpc)}
              style={{
                flex: 1,
                padding: '15px',
                background: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              💬 Talk
            </button>
            <button 
              onClick={() => handleGift(selectedNpc.id)}
              style={{
                flex: 1,
                padding: '15px',
                background: '#ec4899',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              🎁 Gift
            </button>
          </div>
          
          {/* Chat Log */}
          <div style={{ 
            background: '#1f2937', 
            padding: '10px', 
            borderRadius: '8px',
            minHeight: '100px'
          }}>
            {chatLog.map((msg, i) => (
              <div key={i} style={{ marginBottom: '5px', fontSize: '0.9rem' }}>{msg}</div>
            ))}
            {chatLog.length === 0 && <span style={{ color: '#666' }}>Start a conversation...</span>}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
          {npcs.map((npc) => (
            <button
              key={npc.id}
              onClick={() => handleTalk(npc)}
              style={{
                padding: '15px',
                background: '#374151',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span style={{ fontSize: '2rem' }}>{npc.emoji}</span>
              <span>{npc.name}</span>
              <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{npc.desc}</span>
              <span style={{ color: '#ec4899' }}>❤️ {npc.bond}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
