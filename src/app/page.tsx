'use client';

import dynamic from 'next/dynamic';
import { useGameStore } from '@/store/gameStore';
import { useSaveStore } from '@/store/saveStore';
import { useEffect } from 'react';
import { EventBus } from '@/game/EventBus';

import Shop from '@/components/Shop';
import Arena from '@/components/Arena';
import Relationship from '@/components/Relationship';

const PhaserGame = dynamic(() => import('@/game/PhaserGame'), { 
  ssr: false,
  loading: () => (
    <div className="aspect-[4/3] max-w-[384px] mx-auto bg-slate-900 flex items-center justify-center rounded-xl border-4 border-amber-500/30">
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
      <p className="text-slate-300 italic">
        "The whispers of the ancient gods echo through these halls..."
      </p>
      <ul className="mt-4 space-y-2 text-sm text-slate-400">
        <li className="flex gap-2"><span>•</span> <span>Travel between rooms to discover secrets.</span></li>
        <li className="flex gap-2"><span>•</span> <span>The <span className="text-amber-500">Shop</span> offers divine protection.</span></li>
        <li className="flex gap-2"><span>•</span> <span>Test your mettle in the <span className="text-red-500">Arena</span>.</span></li>
      </ul>
    </div>
  </div>
);

export default function Home() {
  const { phase, setPhase, gold, items, companions, loadSaveData } = useGameStore();
  const { initializeSave, currentSaveData, saveGame, autoSaveEnabled } = useSaveStore();

  useEffect(() => {
    initializeSave();
  }, [initializeSave]);

  useEffect(() => {
    if (currentSaveData) {
      loadSaveData(currentSaveData);
    }
  }, [currentSaveData, loadSaveData]);

  useEffect(() => {
    if (!autoSaveEnabled) return;

    const interval = setInterval(() => {
      const relationships = companions.reduce((acc, c) => ({ ...acc, [c.id]: c.bond }), {});
      const saveItems = items.map(id => ({ id, name: id, price: 0, type: 'consumable' }));
      saveGame(gold, null, saveItems as any, relationships, 0);
    }, 30000);

    return () => clearInterval(interval);
  }, [gold, items, companions, saveGame, autoSaveEnabled]);

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
    <main className="min-h-screen bg-[#020617] text-slate-50 selection:bg-amber-500/30 pb-12">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl drop-shadow-lg">🏛️</span>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-amber-500 uppercase leading-none">Gods' Arena</h1>
              <div className="text-[9px] text-slate-500 font-bold tracking-[0.25em] uppercase mt-1">วิหารแห่งเทพ</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            <button 
              onClick={() => {
                const relationships = companions.reduce((acc, c) => ({ ...acc, [c.id]: c.bond }), {});
                const saveItems = items.map(id => ({ id, name: id, price: 0, type: 'consumable' }));
                saveGame(gold, null, saveItems as any, relationships, 0, true);
                alert('Divine Progress Saved!');
              }}
              className="hidden md:block px-4 py-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
            >
              💾 Save Progress
            </button>
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Divine Wealth</span>
              <div className="flex items-center gap-2 text-amber-400 font-black text-xl">
                <span>💰</span>
                <span>{gold.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="relative group rounded-2xl overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-red-600/20 blur opacity-75"></div>
            <div className="relative bg-slate-900 border-4 border-slate-800 rounded-2xl">
              <PhaserGame />
            </div>
          </div>
          
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-2xl shadow-inner border border-slate-700/50">
                {phase === 'shop' && '🏪'}
                {phase === 'arena' && '🏟️'}
                {phase === 'exploration' && '🌲'}
                {phase === 'relationship' && '🏘️'}
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current Sanctum</div>
              <div className="text-sm font-black text-amber-500 uppercase tracking-tight">
                {phase === 'shop' && 'Celestial Emporium'}
                {phase === 'arena' && 'The Grand Arena'}
                {phase === 'exploration' && 'Wilderness Borders'}
                {phase === 'relationship' && 'Divine Village'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-5 space-y-6">
          <div className="min-h-[500px]">
            {phase === 'shop' && <Shop />}
            {phase === 'arena' && <Arena />}
            {phase === 'exploration' && <ExplorationUI />}
            {phase === 'relationship' && <Relationship />}
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={() => {
                const relationships = companions.reduce((acc, c) => ({ ...acc, [c.id]: c.bond }), {});
                const saveItems = items.map(id => ({ id, name: id, price: 0, type: 'consumable' }));
                saveGame(gold, null, saveItems as any, relationships, 0, true);
                alert('Divine Progress Saved!');
              }}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
            >
              💾 Save Progress
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
