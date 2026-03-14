'use client';

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { EventBus } from './EventBus';

export default function PhaserGame() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 384,
      height: 336,
      parent: 'phaser-game-container',
      backgroundColor: '#1a1a2e',
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [MainScene],
    };

    gameRef.current = new Phaser.Game(config);

    EventBus.on('current-scene-ready', () => {
      setReady(true);
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '10px', color: '#fbbf24' }}>
        ⚔️ Gods' Arena 🏪
      </h1>
      
      <div 
        id="phaser-game-container"
        style={{
          border: '4px solid #fbbf24',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 0 30px rgba(251, 191, 36, 0.3)'
        }}
      />
      
      {!ready && <p style={{ color: '#666', marginTop: '10px' }}>กำลังโหลด...</p>}
      
      <div style={{ marginTop: '15px', color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center' }}>
        <p>🎮 W/A/S/D หรือ ลูกศร เพื่อเดิน</p>
        <p>💕 ปุ่ม Space สำหรับโต้ตอบ</p>
      </div>
    </div>
  );
}
