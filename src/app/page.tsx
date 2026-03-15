'use client';

import dynamic from 'next/dynamic';
import { useGameStore } from '@/store/gameStore';
import { useSaveStore } from '@/store/saveStore';
import { useEffect } from 'react';
import { EventBus } from '@/game/EventBus';

import Shop from '@/components/Shop';
import Arena from '@/components/Arena';
import Relationship from '@/components/Relationship';
import ChampionStatus from '@/components/ChampionStatus';
import DialogueOverlay from '@/components/DialogueOverlay';

const PhaserGame = dynamic(() => import('@/game/PhaserGame'), { 
  ssr: false,
  loading: () => (
    <div className="aspect-[4/3] w-full bg-slate-900 flex items-center justify-center rounded-xl border-4 border-amber-500/30">
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
  const {
    phase, setPhase, gold, items, companions, loadSaveData, resetGame,
    day, isShiftActive, startShift, setDialogue
  } = useGameStore();
  const { initializeSave, currentSaveData, saveGame, autoSaveEnabled, deleteAllSaves } = useSaveStore();

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
      setDialogue(null);
    };

    EventBus.on('phase-change', handlePhaseChange);
    return () => {
      EventBus.off('phase-change', handlePhaseChange);
    };
  }, [setPhase]);

  // Test dialogue on load for demonstration (optional)
  /*
  useEffect(() => {
    setTimeout(() => {
      setDialogue({
        speaker: 'Minju',
        text: 'Welcome to the Gods\' Arena! I am Minju, your humble shopkeeper. How can I help you today?',
        portrait: 'happy'
      });
    }, 2000);
  }, []);
  */

  const changeRoom = (room: string) => {
    EventBus.emit('change-room', room);
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-50 selection:bg-amber-500/30 pb-16 overflow-x-hidden">
      {/* Desktop Header (A) */}
      <header className="hidden md:block border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl drop-shadow-lg">🏛️</span>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-amber-500 uppercase leading-none italic">Gods&apos; Arena</h1>
              <div className="text-[9px] text-slate-500 font-bold tracking-[0.25em] uppercase mt-1">วิหารแห่งเทพ</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NavTab label="Shop" active={phase === 'shop'} onClick={() => changeRoom('shop')} />
            <NavTab label="Arena" active={phase === 'arena'} onClick={() => changeRoom('arena')} />
            <NavTab label="Village" active={phase === 'relationship'} onClick={() => changeRoom('village')} />
            <NavTab label="Status" active={phase === 'status' as any} onClick={() => setPhase('status' as any)} />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Day</span>
              <div className="text-amber-400 font-black text-xl leading-none">{day}</div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="flex items-center gap-2 text-amber-400 font-black text-xl">
              <span className="text-sm opacity-70">💰</span>
              <span>{gold.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header (H) */}
      <header className="md:hidden border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-black uppercase">Day {day}</span>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-1.5 text-amber-400 font-black text-base">
              <span className="text-xs opacity-70">💰</span>
              <span>{gold.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {phase === 'shop' && 'Celestial Emporium'}
            {phase === 'arena' && 'The Grand Arena'}
            {phase === 'exploration' && 'Wilderness'}
            {phase === 'relationship' && 'Divine Village'}
            {(phase as any) === 'status' && 'Status'}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-start">
        {/* Main View (B) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative isolate group rounded-xl md:rounded-3xl overflow-hidden border-2 md:border-4 border-slate-800 bg-slate-950 shadow-2xl shadow-black/50 aspect-[4/3] w-full max-w-full">
            <PhaserGame />
            <DialogueOverlay />
          </div>
          
          <div className="hidden md:flex p-4 bg-slate-900/40 border border-slate-800 rounded-2xl justify-between items-center backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl shadow-inner border border-slate-700/50">
                  {phase === 'shop' && '🏪'}
                  {phase === 'arena' && '🏟️'}
                  {phase === 'exploration' && '🌲'}
                  {phase === 'relationship' && '🏘️'}
                  {(phase as any) === 'status' && '👤'}
              </div>
              <div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 opacity-70">Current Sanctum</div>
                <div className="text-xs font-black text-amber-500 uppercase tracking-tight">
                  {phase === 'shop' && 'Celestial Emporium'}
                  {phase === 'arena' && 'The Grand Arena'}
                  {phase === 'exploration' && 'Wilderness Borders'}
                  {phase === 'relationship' && 'Divine Village'}
                  {(phase as any) === 'status' && "Kane's Status"}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const relationships = companions.reduce((acc, c) => ({ ...acc, [c.id]: c.bond }), {});
                  const saveItems = items.map(id => ({ id, name: id, price: 0, type: 'consumable' }));
                  saveGame(gold, null, saveItems as any, relationships, 0, true);
                  alert('Divine Progress Saved!');
                }}
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
              >
                💾 Save
              </button>
              <button
                onClick={() => {
                  if (confirm('Reset all game data? This cannot be undone.')) {
                    deleteAllSaves();
                    resetGame();
                    alert('Game data cleared!');
                  }
                }}
                className="px-4 py-2 bg-red-900/30 hover:bg-red-800/50 border border-red-500/30 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 text-red-400"
              >
                🗑 Reset
              </button>
            </div>
          </div>
        </div>
        
        {/* Side Panel */}
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          <div className="min-h-[200px] md:min-h-[400px]">
            {phase === 'shop' && <Shop />}
            {phase === 'arena' && <Arena />}
            {phase === 'exploration' && <ExplorationUI />}
            {phase === 'relationship' && <Relationship />}
            {(phase as any) === 'status' && <ChampionStatus />}
          </div>
        </div>
      </div>
      {/* Bottom Nav - always visible */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md">
        <div className="grid grid-cols-4 gap-0">
          <MobileNavTab label="Shop" active={phase === 'shop'} onClick={() => changeRoom('shop')} />
          <MobileNavTab label="Arena" active={phase === 'arena'} onClick={() => changeRoom('arena')} />
          <MobileNavTab label="Village" active={phase === 'relationship'} onClick={() => changeRoom('village')} />
          <MobileNavTab label="Status" active={(phase as any) === 'status'} onClick={() => setPhase('status' as any)} />
        </div>
      </nav>
    </main>
  );
}

function MobileNavTab({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`py-3 text-[10px] font-black uppercase tracking-widest transition-all border-t-2 ${
        active
          ? 'text-amber-500 border-amber-500 bg-amber-500/5'
          : 'text-slate-500 border-transparent hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  );
}

function NavTab({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
        active 
          ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' 
          : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
      }`}
    >
      {label}
    </button>
  );
}

