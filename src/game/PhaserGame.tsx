'use client';

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { EventBus } from './EventBus';
import { useGameStore } from '@/store/gameStore';

export default function PhaserGame() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [ready, setReady] = useState(false);
  const store = useGameStore();

  useEffect(() => {
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 384,
      height: 288,
      parent: 'phaser-game-container',
      backgroundColor: '#020617',
      pixelArt: true,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 }
        }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [MainScene],
    };

    gameRef.current = new Phaser.Game(config);
    // Attach store to game object for access in scenes
    (gameRef.current as any).store = useGameStore;

    const onSceneReady = () => {
      setReady(true);
    };

    EventBus.on('current-scene-ready', onSceneReady);

    return () => {
      EventBus.off('current-scene-ready', onSceneReady);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <div 
        id="phaser-game-container"
        className="w-full max-w-[384px] aspect-[4/3] border-4 border-amber-500/50 rounded-xl overflow-hidden shadow-2xl shadow-amber-500/10 bg-slate-900"
      />
      
      <div className="mt-4 flex gap-4 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
        <span className="flex items-center gap-1"><kbd className="bg-slate-800 px-1 rounded border border-slate-700">WASD</kbd> MOVE</span>
        <span className="flex items-center gap-1"><kbd className="bg-slate-800 px-1 rounded border border-slate-700">ENTER</kbd> INTERACT</span>
      </div>
    </div>
  );
}
