'use client';
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { EventBus } from '@/game/EventBus';

const ITEMS_POOL = [
  'potion_health', 'potion_mana', 'soap', 'flower', 'basket', 'cloth', 'mirror', 'herbs', 'ore', 'wood'
];

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
  'shop': '/images/backgrounds/shop/interior/bg_shop_interior.png',
  'arena': '/images/backgrounds/arena/interior/bg_arena_interior.png',
  'storage': '/images/backgrounds/shop/interior/bg_shop_interior.png',
  'village': '/images/backgrounds/village/exterior/bg_village_exterior.png',
};

const PLAYER_SPRITES = [
  '/images/characters/npcs/kane/idle/hero_idle_DOWN.png',
  '/images/characters/npcs/kane/idle/hero_idle_DOWN.png',
  '/images/characters/npcs/kane/idle/hero_idle_DOWN.png',
  '/images/characters/npcs/kane/idle/hero_idle_DOWN.png',
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
  const { choicesLeft, consumeChoice, addItem, setDialogue, setIsBusy } = useGameStore();
  const [room, setRoom] = useState('shop');
  const [playerX, setPlayerX] = useState(3);
  const [playerY, setPlayerY] = useState(3);
  const [frame, setFrame] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [isGathering, setIsGathering] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => setFrame(f => (f + 1) % 4), 200);
    return () => clearInterval(timer);
  }, []);

  const handleGather = async () => {
    if (choicesLeft <= 0) {
      setDialogue({
        speaker: 'Minju',
        text: 'วันนี้สำรวจมาเยอะแล้วค่ะ... กลับไปพักผ่อนกันก่อนดีกว่านะเคน',
        portrait: 'work'
      });
      return;
    }

    setIsGathering(true);
    setIsBusy(true);
    consumeChoice();

    // Trigger animation in Phaser if applicable
    EventBus.emit('exploration-gather-start');

    setTimeout(async () => {
      const randomItem = ITEMS_POOL[Math.floor(Math.random() * ITEMS_POOL.length)];
      addItem(randomItem);

      try {
        const res = await fetch('/api/narrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'exploration_event',
            location: ROOM_NAMES[room],
            foundItem: randomItem
          })
        });
        const data = await res.json();
        setDialogue({
          speaker: 'Minju',
          text: data.narrative || `ว้าว! เจอ ${randomItem} ใน ${ROOM_NAMES[room]} ด้วยล่ะเคน!`,
          portrait: 'happy'
        });
      } catch (err) {
        setDialogue({
          speaker: 'Minju',
          text: `เจอ ${randomItem} ใน ${ROOM_NAMES[room]} ด้วยล่ะเคน! เก็บไว้ขายที่ร้านเรานะ`,
          portrait: 'happy'
        });
      }

      setIsGathering(false);
      setIsBusy(false);
      EventBus.emit('exploration-gather-end');
    }, 1500);
  };
  
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
          <div style={{ display: 'grid', gap: '10px' }}>
            <button onClick={() => { setRoom('shop'); setShowMenu(false); }} style={{ padding: '15px', background: '#92400e', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>🏪 ร้านค้า</button>
            <button onClick={() => { setRoom('arena'); setShowMenu(false); }} style={{ padding: '15px', background: '#dc2626', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>⚔️ Arena</button>
            <button onClick={() => { setRoom('storage'); setShowMenu(false); }} style={{ padding: '15px', background: '#7c3aed', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>📦 คลัง</button>
            <button onClick={() => { setRoom('village'); setShowMenu(false); }} style={{ padding: '15px', background: '#16a34a', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>🏘่ หมู่บ้าน</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>📍 {ROOM_NAMES[room]}</div>
            <button 
              onClick={handleGather}
              disabled={isGathering || choicesLeft <= 0}
              style={{
                padding: '8px 16px',
                background: choicesLeft > 0 ? '#10b981' : '#4b5563',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: choicesLeft > 0 ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                opacity: isGathering ? 0.7 : 1
              }}
            >
              {isGathering ? '⏳ กำลังค้นหา...' : `🔍 สำรวจที่นี่ (${choicesLeft} แต้ม)`}
            </button>
          </div>
          
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
        </>
      )}
    </div>
  );
}
