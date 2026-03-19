'use client';

import dynamic from 'next/dynamic';
import { useGameStore, MAX_TURNS, MAX_CHOICES_PER_DAY } from '@/store/gameStore';
import { useSaveStore } from '@/store/saveStore';
import { useState, useEffect } from 'react';
import { EventBus } from '@/game/EventBus';

// Components
import Shop from '@/components/Shop';
import Arena from '@/components/Arena';
import Exploration from '@/components/Exploration';
import Relationship from '@/components/Relationship';
import ChampionStatus from '@/components/ChampionStatus';
import ProphecyOverlay from '@/components/ProphecyOverlay';
import DialogueOverlay from '@/components/DialogueOverlay';
import AIStatusBadge from '@/components/AIStatusBadge';
import AITerminal from '@/components/AITerminal';

const PhaserGame = dynamic(() => import('@/game/PhaserGame'), { ssr: false });

export default function GamePage() {
  const { 
    phase, setPhase, gold, day, choicesLeft, gameOver, gameOverReason,
    vampireDefeated, resetGame, loadSaveData, showProphecy, setShowProphecy,
    addExplorationLog
  } = useGameStore();
  
  const [mounted, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const saved = localStorage.getItem('gods-arena-save-quick');
    if (saved) {
      try { loadSaveData(JSON.parse(saved)); } catch(e) {}
    }

    const onPhaseChange = (newPhase: string) => {
      setPhase(newPhase as any);
    };

    const onExplorationEvent = (data: { text: string }) => {
      addExplorationLog([data.text]);
    };

    EventBus.on('phase-change', onPhaseChange);
    EventBus.on('exploration-event', onExplorationEvent);

    return () => {
      EventBus.off('phase-change', onPhaseChange);
      EventBus.off('exploration-event', onExplorationEvent);
    };
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#05070a] text-slate-200 flex flex-col font-sans selection:bg-amber-500/30">
      <ProphecyOverlay />
      <DialogueOverlay />
      <AITerminal />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 h-14 border-b border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center px-4 md:px-8 justify-between">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-white uppercase tracking-tighter italic leading-none">Gods' Arena</h1>
            <span className="text-[10px] font-bold text-amber-500/50 uppercase tracking-widest leading-none mt-1">วิหารแห่งเทพ</span>
          </div>
          
          <div className="h-8 w-px bg-white/10 hidden md:block" />
          
          <div className="hidden md:flex items-center gap-4">
            <StatItem label="Day" value={`${day}/${MAX_TURNS}`} color="text-amber-400" />
            <StatItem label="Gold" value={gold.toLocaleString()} color="text-emerald-400" />
            <StatItem label="Actions" value={`${choicesLeft}/${MAX_CHOICES_PER_DAY}`} color="text-sky-400" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <AIStatusBadge />
          <button 
            onClick={() => { if(confirm('Reset game?')) resetGame(); }}
            className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Game View Container (Center) */}
        <div className="flex-1 relative flex items-center justify-center p-4 lg:p-8 bg-radial-gradient">
          <div className="relative aspect-[4/3] w-full max-w-[1024px] shadow-2xl shadow-black/50 rounded-2xl overflow-hidden border border-white/10 bg-black">
            <PhaserGame />
            
            {/* Phase Overlay Badge */}
            <div className="absolute top-4 left-4 pointer-events-none">
              <div className="bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{phase} phase</span>
              </div>
            </div>

            {/* Game Over Overlay */}
            {gameOver && (
              <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                <h2 className={`text-5xl font-black mb-4 uppercase italic tracking-tighter ${gameOver === 'win' ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {gameOver === 'win' ? 'Ascension Complete' : 'Champion Fallen'}
                </h2>
                <p className="text-slate-400 max-w-md mb-8 leading-relaxed font-medium">
                  {gameOver === 'win' 
                    ? 'Kane has defeated the Vampire Lord and earned his place among the stars. Your guidance was divine.' 
                    : gameOverReason === 'bankruptcy'
                      ? 'The treasury is empty and the shelves are bare. The shop has closed its doors forever.'
                      : 'The 20 days have passed. Darkness has claimed the arena.'}
                </p>
                <button 
                  onClick={resetGame}
                  className="px-10 py-4 bg-white text-black font-black rounded-xl hover:bg-amber-400 transition-all uppercase tracking-widest text-sm"
                >
                  Return to Beginning
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Controls (Right) */}
        <aside className="w-full lg:w-[400px] border-l border-white/5 bg-[#080a0f] overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="space-y-6">
            {/* Phase Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/50 rounded-xl border border-white/5">
              <TabButton label="Shop" active={phase === 'shop'} onClick={() => setPhase('shop')} />
              <TabButton label="Arena" active={phase === 'arena'} onClick={() => setPhase('arena')} />
              <TabButton label="Exploration" active={phase === 'exploration'} onClick={() => setPhase('exploration')} />
              <TabButton label="Relate" active={phase === 'relationship'} onClick={() => setPhase('relationship')} />
            </div>

            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              {phase === 'shop' && <Shop />}
              {phase === 'arena' && <Arena />}
              {phase === 'exploration' && <Exploration />}
              {phase === 'relationship' && <Relationship />}
            </div>

            <ChampionStatus />
          </div>
        </aside>
      </div>
    </main>
  );
}

function StatItem({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">{label}</span>
      <span className={`text-xs font-black ${color} leading-none tracking-tight`}>{value}</span>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-1 text-[9px] font-black uppercase tracking-widest transition-all ${
        active
          ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20 rounded-lg'
          : 'text-slate-500 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}
