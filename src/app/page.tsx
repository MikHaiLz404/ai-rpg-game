'use client';

import dynamic from 'next/dynamic';
import { useGameStore, MAX_TURNS, MAX_CHOICES_PER_DAY } from '@/store/gameStore';
import { useSaveStore } from '@/store/saveStore';
import { useState, useEffect } from 'react';
import { EventBus } from '@/game/EventBus';
import { broadcastAISource } from '@/components/AIStatusBadge';

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
import { PhaserErrorBoundary, GameOverlayErrorBoundary } from '@/components/ErrorBoundary';

const PhaserGame = dynamic(() => import('@/game/PhaserGame'), { ssr: false });

export default function GamePage() {
  const { 
    phase, setPhase, gold, day, choicesLeft, gameOver, gameOverReason,
    hydraDefeated, resetGame, loadSaveData, showProphecy, setShowProphecy,
    addExplorationLog, endDay, isBusy, setDialogue, addAILog, interventionPoints,
    arenaWins, items, companions, kaneStats
  } = useGameStore();
  const { initializeSave, requestAutoSave } = useSaveStore();
  
  const [mounted, setLoading] = useState(false);

  // Feature: Surgical Save System (Auto-save on meaningful change)
  useEffect(() => {
    if (!mounted) return;
    
    // Convert current items IDs to Item objects for SaveData compatibility
    // In a real app, we'd fetch the full objects, here we mock for the orchestrator/save compatibility
    const itemObjects = items.map(id => ({ id, name: id, price: 0 } as any));
    const relationships = companions.reduce((acc, c) => ({ ...acc, [c.id]: c.bond }), {});
    const playerGod = companions.find(c => c.bond > 10) || null; // Simplified logic

    requestAutoSave(gold, playerGod as any, itemObjects, relationships, arenaWins, kaneStats);
  }, [gold, items, companions, arenaWins, kaneStats, day, mounted, requestAutoSave]);

  // Feature: Autonomous Divine Council (Every 5 days)
  useEffect(() => {
    if (mounted && !showProphecy && day > 1 && day % 5 === 0) {
      triggerDivineCouncil();
    }
  }, [showProphecy, day, mounted]);

  const triggerDivineCouncil = async () => {
    try {
      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'talk',
          npcName: 'Divine Council',
          playerName: 'Minju',
          userMessage: 'สภาเทพ (The Divine Council Meeting)',
          playerContext: {
            gold, day, arenaWins, 
            items: items.join(', '),
            relationships: companions.map(c => `${c.name} (Bond: ${c.bond})`).join(', ')
          }
        })
      });
      const data = await res.json();
      
      broadcastAISource(data.source || 'fallback');

      addAILog({
        action: 'divine_council',
        model: data.model || 'AI Model',
        source: data.source || 'unknown',
        prompt: data.prompt || '',
        response: data.narrative || '',
        tokensInput: data.usage?.prompt_tokens || 0,
        tokensOutput: data.usage?.completion_tokens || 0,
        gatewayLogs: data.gatewayLogs
      });

      if (data.narrative) {
        setDialogue({
          speaker: 'สภาเทพ (Divine Council)',
          text: data.narrative
        });
      }
    } catch (e) {
      console.error('Failed to trigger Council:', e);
    }
  };

  // Clear dialogue when phase changes
  useEffect(() => {
    setDialogue(null);
    // Feature: Audio Integration (Trigger BGM change)
    if (mounted) {
      EventBus.emit('play-bgm', phase + '_bgm');
    }
  }, [phase, setDialogue, mounted]);

  useEffect(() => {
    setLoading(true);
    
    // Use the robust save system initializer (IndexedDB + Fallback)
    initializeSave();

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

  // Sync Phase -> Phaser Room
  useEffect(() => {
    if (!mounted) return;
    const phaseToRoom: Record<string, string> = {
      shop: 'shop',
      arena: 'arena',
      exploration: 'cave_entrance',
      relationship: 'village'
    };
    const targetRoom = phaseToRoom[phase];
    if (targetRoom) {
      EventBus.emit('change-room', targetRoom);
    }

    // Bug Fix: If we leave exploration phase, tell Phaser to clear tiles immediately
    if (phase !== 'exploration') {
      EventBus.emit('exploration-ended');
    }
  }, [phase, mounted]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen lg:h-screen bg-[#020617] text-slate-200 flex flex-col font-sans selection:bg-amber-500/30 lg:overflow-hidden overflow-y-auto">
      {/* Global Overlays (Draggable/Top-level) */}
      <GameOverlayErrorBoundary componentName="Prophecy Overlay">
        <ProphecyOverlay />
      </GameOverlayErrorBoundary>
      <GameOverlayErrorBoundary componentName="AI Terminal">
        <AITerminal />
      </GameOverlayErrorBoundary>

      {/* Header Bar */}
      <header className="shrink-0 h-14 border-b border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center px-4 md:px-8 justify-between z-50">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-white uppercase tracking-tighter italic leading-none font-serif">Gods&apos; Arena</h1>
            <span className="text-[10px] font-bold text-amber-500/50 uppercase tracking-widest leading-none mt-1 font-serif">วิหารแห่งเทพ</span>
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
            onClick={() => { EventBus.emit('toggle-debug'); }}
            className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors border border-white/10 px-2 py-1 rounded hover:border-white/30"
          >
            Debug Grid
          </button>
          <button 
            onClick={() => { if(confirm('Reset game?')) resetGame(); }}
            className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden relative">
        
        {/* Game View Container (Center) */}
        <div className="flex-1 relative flex items-start justify-center p-2 lg:p-4 bg-[#05070a]">
          <div className="relative aspect-[4/3] w-full max-w-[1024px] shadow-2xl shadow-black/50 rounded-2xl overflow-hidden border border-white/10 bg-black mt-2">
            <PhaserErrorBoundary>
              <PhaserGame />
            </PhaserErrorBoundary>
            <DialogueOverlay />
            
            {/* Phase Overlay Badge */}
            <div className="absolute top-4 left-4 pointer-events-none">
              <div className="bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] font-serif">{phase} phase</span>
              </div>
            </div>

            {/* Game Over Overlay */}
            {gameOver && (
              <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                <h2 className={`text-5xl font-black mb-4 uppercase italic tracking-tighter font-serif ${gameOver === 'win' ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {gameOver === 'win' ? 'Ascension Complete' : 'Champion Fallen'}
                </h2>
                <p className="text-slate-400 max-w-md mb-8 leading-relaxed font-medium">
                  {gameOver === 'win'
                    ? 'Hydra has been defeated! The gods celebrate your victory. Your guidance was divine.'
                    : gameOverReason === 'bankruptcy'
                      ? 'The treasury is empty and the shelves are bare. The shop has closed its doors forever.'
                      : 'The 20 days have passed. Darkness has claimed the arena.'}
                </p>
                <button 
                  onClick={resetGame}
                  className="px-10 py-4 bg-white text-black font-black rounded-xl hover:bg-amber-400 transition-all uppercase tracking-widest text-sm font-serif"
                >
                  Return to Beginning
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Controls (Right) */}
        <aside className="w-full lg:w-[400px] shrink-0 border-l border-white/5 bg-[#080a0f] lg:overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="space-y-6">
            
            {/* End Day Button (Appears when 0 actions left) */}
            {choicesLeft <= 0 && !isBusy && !gameOver && (
              <div className="animate-in fade-in zoom-in duration-500">
                <button
                  onClick={() => endDay()}
                  aria-label="End the day and rest"
                  className="w-full py-4 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-black rounded-2xl shadow-xl shadow-amber-900/20 uppercase tracking-[0.2em] transition-all active:scale-95 border-2 border-white/10"
                >
                  💤 End Day &amp; Rest
                </button>
                <p className="text-[10px] text-center text-slate-500 mt-2 font-bold uppercase tracking-widest">No actions remaining</p>
              </div>
            )}

            {/* Phase Tabs */}
            <div role="tablist" aria-label="Game phases" className="grid grid-cols-4 gap-1 p-1 bg-slate-900/50 rounded-xl border border-white/5">
              <TabButton label="Shop" active={phase === 'shop'} onClick={() => setPhase('shop')} title="Shop: buy and sell items (costs 1 action)" />
              <TabButton label="Arena" active={phase === 'arena'} onClick={() => setPhase('arena')} title="Arena: fight enemies (costs 1 action)" />
              <TabButton label="Explore" active={phase === 'exploration'} onClick={() => setPhase('exploration')} title="Explore: discover events (costs 1 action)" />
              <TabButton label="Bond" active={phase === 'relationship'} onClick={() => setPhase('relationship')} title="Bond: talk to gods (costs 1 action)" />
            </div>

            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <GameOverlayErrorBoundary componentName="Shop">
                {phase === 'shop' && <Shop />}
              </GameOverlayErrorBoundary>
              <GameOverlayErrorBoundary componentName="Arena">
                {phase === 'arena' && <Arena />}
              </GameOverlayErrorBoundary>
              <GameOverlayErrorBoundary componentName="Exploration">
                {phase === 'exploration' && <Exploration />}
              </GameOverlayErrorBoundary>
              <GameOverlayErrorBoundary componentName="Relationship">
                {phase === 'relationship' && <Relationship />}
              </GameOverlayErrorBoundary>
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
      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-none mb-1 font-serif">{label}</span>
      <span className={`text-xs font-black ${color} leading-none tracking-tight`}>{value}</span>
    </div>
  );
}

function TabButton({ label, active, onClick, title }: { label: string, active: boolean, onClick: () => void, title?: string }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      aria-label={`${label} phase${active ? ' (active)' : ''}${title ? `: ${title}` : ''}`}
      title={title}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      tabIndex={active ? 0 : -1}
      className={`py-2 px-1 text-[9px] font-black uppercase tracking-widest transition-all font-serif focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded-lg ${
        active
          ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20'
          : 'text-slate-500 hover:text-white focus-visible:outline-amber-500/50'
      }`}
    >
      {label}
    </button>
  );
}
