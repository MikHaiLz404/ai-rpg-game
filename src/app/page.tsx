'use client';

import dynamic from 'next/dynamic';
import { useGameStore } from '@/store/gameStore';
import { useEffect } from 'react';
import { EventBus } from '@/game/EventBus';

import Shop from '@/components/Shop';
import Arena from '@/components/Arena';
import Relationship from '@/components/Relationship';

const PhaserGame = dynamic(() => import('@/game/PhaserGame'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-[336px] bg-slate-900 flex items-center justify-center rounded-xl border-4 border-amber-500/30">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">⚔️</div>
        <div className="text-amber-500 font-bold tracking-widest">LOADING DIVINE WORLD...</div>
      </div>
    </div>
  )
});

const ExplorationUI = () => (
  <div className="p-6 bg-slate-900/80 rounded-xl border border-green-900/30">
    <h2 className="text-2xl font-bold mb-4 text-green-400">🗡️ Exploration Mode</h2>
    <div className="bg-black/40 p-4 rounded-lg border border-slate-800">
      <p className="text-slate-300">
        You are currently exploring the world of <span className="text-amber-400 font-bold">Gods' Arena</span>.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-slate-400">
        <li>• Use <span className="text-slate-200 bg-slate-700 px-1 rounded">WASD</span> or <span className="text-slate-200 bg-slate-700 px-1 rounded">Arrow Keys</span> to move.</li>
        <li>• Find exits to travel between locations.</li>
        <li>• Visit the <span className="text-amber-500">Shop</span> to buy supplies.</li>
        <li>• Enter the <span className="text-red-500">Arena</span> to test your strength.</li>
      </ul>
    </div>
  </div>
);

export default function Home() {
  const { phase, setPhase, gold } = useGameStore();

  useEffect(() => {
    const handlePhaseChange = (newPhase: any) => {
      setPhase(newPhase);
    };

    EventBus.on('phase-change', handlePhaseChange);

    return () => {
      EventBus.off('phase-change', handlePhaseChange);
    };
  }, [setPhase]);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-50 selection:bg-amber-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏛️</span>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-amber-500 uppercase">Gods' Arena</h1>
              <div className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">Divine Management RPG</div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Divine Wealth</span>
              <div className="flex items-center gap-2 text-amber-400 font-black text-xl">
                <span>💰</span>
                <span>{gold.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Game Viewport */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-red-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative">
              <PhaserGame />
            </div>
          </div>
          
          {/* Controls Hint */}
          <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg flex justify-between items-center text-[11px] font-bold text-slate-500 tracking-wider uppercase">
            <div className="flex gap-4">
              <span>WASD / ARROWS: MOVE</span>
              <span>ENTER: INTERACT</span>
            </div>
            <div className="text-amber-500/50">PHASER ENGINE V3.90</div>
          </div>
        </div>
        
        {/* React UI / Phase specific */}
        <div className="lg:col-span-5 space-y-6">
          <div className="transition-all duration-500 ease-in-out">
            {phase === 'shop' && <Shop />}
            {phase === 'arena' && <Arena />}
            {phase === 'exploration' && <ExplorationUI />}
            {phase === 'relationship' && <Relationship />}
          </div>

          {/* World Info */}
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Current Location Info</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-xl shadow-inner">
                {phase === 'shop' && '🏪'}
                {phase === 'arena' && '🏟️'}
                {phase === 'exploration' && '🌲'}
                {phase === 'relationship' && '🏘️'}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-200">
                  {phase === 'shop' && 'Celestial Emporium'}
                  {phase === 'arena' && 'The Grand Arena'}
                  {phase === 'exploration' && 'Wilderness Borders'}
                  {phase === 'relationship' && 'Divine Village'}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Level 1 Territory
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
