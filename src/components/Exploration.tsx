'use client';
import { useState, useEffect, useCallback } from 'react';

const TILE_SIZE = 48;
const GRID_COLS = 8;
const GRID_ROWS = 6;

// Simple room maps using tileset_B
const ROOM_MAPS = {
  shop: [
    [0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,0],
    [0,1,2,2,2,2,1,0],
    [0,1,2,2,2,2,1,0],
    [0,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0],
  ],
  arena: [
    [0,0,0,0,0,0,0,0],
    [0,3,3,3,3,3,3,0],
    [0,3,4,4,4,4,3,0],
    [0,3,4,4,4,4,3,0],
    [0,3,3,3,3,3,3,0],
    [0,0,0,0,0,0,0,0],
  ],
  storage: [
    [0,0,0,0,0,0,0,0],
    [0,5,5,5,5,5,5,0],
    [0,5,6,6,6,6,5,0],
    [0,5,6,6,6,6,5,0],
    [0,5,5,5,5,5,5,0],
    [0,0,0,0,0,0,0,0],
  ],
  village: [
    [0,0,0,0,0,0,0,0],
    [0,7,7,7,7,7,7,0],
    [0,7,8,8,8,8,7,0],
    [0,7,8,8,8,8,7,0],
    [0,7,7,7,7,7,7,0],
    [0,0,0,0,0,0,0,0],
  ],
};

const TILE_MAPPINGS: Record<string, string> = {
  'shop': '/images/backgrounds/shop/interior/tileset_B/tile_',
  'arena': '/images/backgrounds/shop/interior/tileset_B/tile_',
  'storage': '/images/backgrounds/shop/interior/tileset_C/tile_',
  'village': '/images/backgrounds/shop/interior/tileset_D/tile_',
};

const PLAYER_SPRITES = [
  '/images/characters/player/minju/idle/frame_0_0.png',
  '/images/characters/player/minju/idle/frame_0_1.png',
  '/images/characters/player/minju/idle/frame_0_2.png',
  '/images/characters/player/minju/idle/frame_0_1.png',
];

const MAP_EXITS: Record<string, Record<string, string>> = {
  shop: { right: 'arena', down: 'storage' },
  arena: { left: 'shop' },
  storage: { up: 'shop' },
  village: { right: 'shop' },
};

const ROOM_NAMES: Record<string, string> = {
  shop: '🏪 ร้านค้า',
  arena: '⚔️ Arena',
  storage: '📦 คลัง',
  village: '🏘่ หมู่บ้าน',
};

export default function Exploration() {
  const [room, setRoom] = useState('shop');
  const [playerX, setPlayerX] = useState(3);
  const [playerY, setPlayerY] = useState(3);
  const [frame, setFrame] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => setFrame(f => (f + 1) % 4), 200);
    return () => clearInterval(timer);
  }, []);
  
  const handleMove = useCallback((dx: number, dy: number) => {
    setPlayerX(x => {
      const nx = x + dx;
      if (nx < 1 || nx > GRID_COLS - 2) return x;
      return nx;
    });
    setPlayerY(y => {
      const ny = y + dy;
      if (ny < 1 || ny > GRID_ROWS - 2) return y;
      return ny;
    });
  }, []);
  
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showMenu) {
        if (e.key === 'Escape') setShowMenu(false);
        return;
      }
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': handleMove(0, -1); break;
        case 'ArrowDown': case 's': case 'S': handleMove(0, 1); break;
        case 'ArrowLeft': case 'a': case 'A': handleMove(-1, 0); break;
        case 'ArrowRight': case 'd': case 'D': handleMove(1, 0); break;
        case 'Escape': setShowMenu(true); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleMove, showMenu]);
  
  const currentMap = ROOM_MAPS[room as keyof typeof ROOM_MAPS];
  const tileBase = TILE_MAPPINGS[room] || TILE_MAPPINGS['shop'];
  const exits = MAP_EXITS[room];
  
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
          <p style={{ color: '#9ca3af', marginBottom: '10px' }}>กด ESC เพื่อกลับ</p>
          <div style={{ display: 'grid', gap: '10px' }}>
            <button onClick={() => { setRoom('shop'); setShowMenu(false); }} style={{ padding: '15px', background: '#92400e', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>🏪 ร้านค้า</button>
            <button onClick={() => { setRoom('arena'); setShowMenu(false); }} style={{ padding: '15px', background: '#dc2626', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>⚔️ Arena</button>
            <button onClick={() => { setRoom('storage'); setShowMenu(false); }} style={{ padding: '15px', background: '#7c3aed', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>📦 คลัง</button>
            <button onClick={() => { setRoom('village'); setShowMenu(false); }} style={{ padding: '15px', background: '#16a34a', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>🏘่ หมู่บ้าน</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '10px', color: '#9ca3af', fontSize: '0.9rem' }}>📍 {ROOM_NAMES[room]} | ตำแหน่ง: ({playerX}, {playerY})</div>
          
          {/* Game Container */}
          <div style={{ 
            position: 'relative',
            width: GRID_COLS * TILE_SIZE,
            height: GRID_ROWS * TILE_SIZE,
            margin: '0 auto',
            border: '4px solid #374151',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#1a1a2e'
          }}>
            {/* Tiles Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_COLS}, ${TILE_SIZE}px)`, gridTemplateRows: `repeat(${GRID_ROWS}, ${TILE_SIZE}px)` }}>
              {currentMap.map((row, rowIdx) => 
                row.map((tileId, colIdx) => (
                  <div key={`${rowIdx}-${colIdx}`} style={{ width: TILE_SIZE, height: TILE_SIZE, overflow: 'hidden', background: tileId === 0 ? '#000' : 'transparent' }}>
                    {tileId > 0 && (
                      <img 
                        src={tileBase + tileId + '.png'} 
                        alt=""
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'none', imageRendering: 'pixelated' }}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
            
            {/* Player */}
            <div style={{
              position: 'absolute',
              left: playerX * TILE_SIZE,
              top: playerY * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              transition: 'left 0.1s, top 0.1s',
            }}>
              <img 
                src={PLAYER_SPRITES[frame]} 
                alt="Player"
                style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }}
              />
            </div>
          </div>
          
          {/* Exits */}
          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            {exits && Object.entries(exits).map(([dir, target]) => (
              <button
                key={dir}
                onClick={() => setRoom(target)}
                style={{
                  padding: '10px 20px',
                  background: '#fbbf24',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {dir === 'right' ? '→ ' + ROOM_NAMES[target] : 
                 dir === 'left' ? ROOM_NAMES[target] + ' ←' :
                 dir === 'up' ? '↑ ' + ROOM_NAMES[target] :
                 ROOM_NAMES[target] + ' ↓'}
              </button>
            ))}
          </div>
          
          {/* D-Pad */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ color: '#9ca3af', marginBottom: '10px', fontSize: '0.85rem' }}>🎮 ลูกศร / WASD | ESC = เมนู</p>
            <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(3, 44px)', gap: '4px' }}>
              <div />
              <button onClick={() => handleMove(0, -1)} style={{ width: 44, height: 44, background: '#374151', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '20px' }}>↑</button>
              <div />
              <button onClick={() => handleMove(-1, 0)} style={{ width: 44, height: 44, background: '#374151', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '20px' }}>←</button>
              <button onClick={() => handleMove(0, 1)} style={{ width: 44, height: 44, background: '#374151', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '20px' }}>↓</button>
              <button onClick={() => handleMove(1, 0)} style={{ width: 44, height: 44, background: '#374151', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '20px' }}>→</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
