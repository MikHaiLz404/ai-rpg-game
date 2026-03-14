'use client';

import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { EventBus } from './EventBus';

export interface IRefPhaserGame {
  game: Phaser.Game;
  scene: Phaser.Scene;
}

export default function PhaserGame() {
  const gameRef = useRef<IRefPhaserGame | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 384,
      height: 288,
      parent: 'phaser-game-container',
      backgroundColor: '#1a1a2e',
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [MainScene],
    };

    gameRef.current = {
      game: new Phaser.Game(config),
      scene: null as unknown as Phaser.Scene,
    };

    EventBus.on('current-scene-ready', (scene: Phaser.Scene) => {
      if (gameRef.current) {
        gameRef.current.scene = scene;
      }
      setReady(true);
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.game.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '20px'
    }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>🗺️ Exploration</h2>
      <div 
        id="phaser-game-container"
        style={{
          border: '4px solid #374151',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      />
      {!ready && <p style={{ color: '#666', marginTop: '10px' }}>Loading game...</p>}
      <p style={{ color: '#9ca3af', marginTop: '10px', fontSize: '0.85rem' }}>
        🎮 Use arrow keys to move
      </p>
    </div>
  );
}
