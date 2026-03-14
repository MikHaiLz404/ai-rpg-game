'use client';
import { useState, useEffect } from 'react';

const TILE_SIZE = 48;

// Game map - rooms and connections
const MAP = {
  shop: { name: '🏪 ร้านค้า', x: 2, y: 2, color: '#f59e0b', exits: { right: 'arena', down: 'storage' } },
  arena: { name: '⚔️ อารีน่า', x: 4, y: 2, color: '#ef4444', exits: { left: 'shop' } },
  storage: { name: '📦 คลัง', x: 2, y: 4, color: '#8b5cf6', exits: { up: 'shop' } },
  village: { name: '🏘่ หมู่บ้าน', x: 0, y: 2, color: '#22c55e', exits: { right: 'shop' } },
};

const PLAYER_SPRITE = '/images/characters/player/minju/character_26/character_26_frame32x32.png';

export default function Exploration() {
  const [room, setRoom] = useState('shop');
  const [playerX, setPlayerX] = useState(2);
  const [playerY, setPlayerY] = useState(2);
  const [frameIndex, setFrameIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  
  // Animation
  useEffect(() => {
    const interval = setInterval(() => setFrameIndex(f => (f + 1) % 4), 150);
    return () => clearInterval(interval);
  }, []);
  
  const handleMove = (dx: number, dy: number) => {
    const newX = playerX + dx;
    const newY = playerY + dy;
    
    // Boundary check
    if (newX < 0 || newX > 5 || newY < 0 || newY > 5) return;
    
    // Wall check (simple: avoid corners)
    if (room === 'shop' && newX === 5 && newY === 2) return;
    
    setPlayerX(newX);
    setPlayerY(newY);
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    switch(e.key) {
      case 'ArrowUp': case 'w': handleMove(0, -1); break;
      case 'ArrowDown': case 's': handleMove(0, 1); break;
      case 'ArrowLeft': case 'a': handleMove(-1, 0); break;
      case 'ArrowRight': case 'd': handleMove(1, 0); break;
    }
  };
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerX, playerY, room]);
  
  const currentRoom = MAP[room as keyof typeof MAP];
  
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '1.5rem' }}>🗺️ Exploration</h2>
        <button onClick={() => setShowMenu(!showMenu)} style={{ padding: '8px 16px', background: '#374151', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
          {showMenu ? '🎮 เล่นต่อ' : '📋 เมนู'}
        </button>
      </div>
      
      {showMenu ? (
        <div style={{ background: '#16213e', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '15px' }}>📋 เมนู</h3>
          <p style={{ color: '#9ca3af', marginBottom: '20px' }}>กด ESC เพื่อกลับไปเล่น</p>
          <div style={{ display: 'grid', gap: '10px' }}>
            <button style={{ padding: '15px', background: '#f59e0b', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>🏪 กลับร้าน</button>
            <button style={{ padding: '15px', background: '#ef4444', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>⚔️ ไป Arena</button>
            <button style={{ padding: '15px', background: '#ec4899', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>💕 ความสัมพันธ์</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '10px', color: '#9ca3af' }}>📍 {currentRoom?.name || 'Unknown'}</div>
          
          {/* Game Area */}
          <div style={{ 
            position: 'relative',
            width: '100%',
            maxWidth: '400px',
            height: '300px',
            background: currentRoom?.color || '#1e293b',
            borderRadius: '12px',
            margin: '0 auto',
            overflow: 'hidden',
            border: '4px solid #374151'
          }}>
            {/* Room decorations based on current room */}
            {room === 'shop' && (
              <>
                <div style={{ position: 'absolute', top: '20%', left: '20%', width: '60px', height: '40px', background: '#92400e', borderRadius: '4px' }} />
                <div style={{ position: 'absolute', top: '20%', right: '20%', width: '60px', height: '40px', background: '#92400e', borderRadius: '4px' }} />
                <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: '80px', height: '20px', background: '#78716c', borderRadius: '2px' }} />
              </>
            )}
            
            {room === 'arena' && (
              <>
                <div style={{ position: 'absolute', top: '10%', left: '30%', width: '40%', height: '10px', background: '#ef4444', borderRadius: '4px' }} />
                <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: '80%', height: '40px', background: '#7f1d1d', borderRadius: '4px' }} />
              </>
            )}
            
            {/* Exit indicators */}
            {currentRoom?.exits && Object.entries(currentRoom.exits).map(([dir, target]) => (
              <button
                key={dir}
                onClick={() => { setRoom(target); setPlayerX(2); setPlayerY(2); }}
                style={{
                  position: 'absolute',
                  padding: '8px 12px',
                  background: '#00000080',
                  border: '2px solid #fff',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  ...(dir === 'right' && { right: '10px', top: '50%', transform: 'translateY(-50%)' }),
                  ...(dir === 'left' && { left: '10px', top: '50%', transform: 'translateY(-50%)' }),
                  ...(dir === 'up' && { top: '10px', left: '50%', transform: 'translateX(-50%)' }),
                  ...(dir === 'down' && { bottom: '10px', left: '50%', transform: 'translateX(-50%)' }),
                }}
              >
                {dir === 'right' ? '→' : dir === 'left' ? '←' : dir === 'up' ? '↑' : '↓'}
              </button>
            ))}
            
            {/* Player */}
            <div style={{
              position: 'absolute',
              left: playerX * TILE_SIZE,
              top: playerY * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              transition: 'left 0.1s, top 0.1s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={PLAYER_SPRITE} 
                alt="Player"
                style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }}
              />
            </div>
          </div>
          
          {/* Controls */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ color: '#9ca3af', marginBottom: '10px' }}>🎮 กดลูกศร หรือ W/A/S/D เพื่อเดิน</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', maxWidth: '150px', margin: '0 auto' }}>
              <div />
              <button onClick={() => handleMove(0, -1)} style={{ padding: '10px', background: '#374151', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>↑</button>
              <div />
              <button onClick={() => handleMove(-1, 0)} style={{ padding: '10px', background: '#374151', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>←</button>
              <button onClick={() => handleMove(0, 1)} style={{ padding: '10px', background: '#374151', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>↓</button>
              <button onClick={() => handleMove(1, 0)} style={{ padding: '10px', background: '#374151', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>→</button>
            </div>
          </div>
          
          {/* Room info */}
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {Object.entries(MAP).map(([id, r]) => (
              <button
                key={id}
                onClick={() => setRoom(id)}
                style={{
                  padding: '10px',
                  background: room === id ? r.color : '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  opacity: room === id ? 1 : 0.6
                }}
              >
                {r.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
