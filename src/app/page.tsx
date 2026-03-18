'use client';

import dynamic from 'next/dynamic';
import { useGameStore, MAX_TURNS, MAX_CHOICES_PER_DAY } from '@/store/gameStore';
import { useSaveStore } from '@/store/saveStore';
import { useState, useEffect } from 'react';
import { EventBus } from '@/game/EventBus';

import AIStatusBadge from '@/components/AIStatusBadge';
import Shop from '@/components/Shop';
import Arena from '@/components/Arena';
import Exploration from '@/components/Exploration';
import Relationship from '@/components/Relationship';
import ChampionStatus from '@/components/ChampionStatus';
import DialogueOverlay from '@/components/DialogueOverlay';
import ProphecyOverlay from '@/components/ProphecyOverlay';

const PhaserGame = dynamic(() => import('@/game/PhaserGame'), {
  ssr: false,
  loading: () => (
    <div className="aspect-[4/3] w-full bg-slate-900 flex items-center justify-center rounded-xl border-4 border-amber-500/30">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">⚔️</div>
        <div className="text-amber-500 font-bold tracking-widest">กำลังโหลดโลกแห่งทวยเทพ...</div>
      </div>
    </div>
  )
});

export default function Home() {
  const {
    phase, setPhase, gold, items, companions, loadSaveData, resetGame,
    day, choicesLeft, setDialogue, gameOver, gameOverReason, isShiftActive, isBusy, endDay
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

  const changeRoom = (room: string) => {
    EventBus.emit('change-room', room);
  };

  const [showTutorial, setShowTutorial] = useState(false);

  // Show tutorial on first day if never dismissed
  useEffect(() => {
    if (day === 1 && !gameOver && typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('gods-arena-tutorial-dismissed');
      if (!dismissed) setShowTutorial(true);
    }
  }, [day, gameOver]);

  const dismissTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('gods-arena-tutorial-dismissed', 'true');
  };

  const turnsLeft = Math.max(0, MAX_TURNS - day + 1);
  const isUrgent = turnsLeft <= 5;

  return (
    <main className="min-h-screen bg-[#020617] text-slate-50 selection:bg-amber-500/30 pb-16 md:pb-0 overflow-x-hidden">
      {/* Divine Council Prophecy */}
      <ProphecyOverlay />

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 z-[180] bg-black/85 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-slate-900/95 border-2 border-amber-500/40 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/30 px-6 py-4 border-b border-amber-500/20">
              <h2 className="text-lg font-black text-amber-500 uppercase tracking-widest">ยินดีต้อนรับสู่ Gods&apos; Arena</h2>
              <div className="text-[9px] text-amber-500/50 font-bold uppercase tracking-widest mt-0.5">คู่มือผู้เล่นใหม่</div>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-300 leading-relaxed">
              <div className="flex gap-3 items-start">
                <span className="text-xl shrink-0">🏪</span>
                <div><span className="font-black text-white">ร้านค้า</span> — ซื้อขายสินค้ากับลูกค้า เทพจ่ายแพงกว่าคนธรรมดา</div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-xl shrink-0">⚔️</span>
                <div><span className="font-black text-white">อารีน่า</span> — ส่งเคนต่อสู้กับศัตรู รับทองและ IP เมื่อชนะ</div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-xl shrink-0">🗺️</span>
                <div><span className="font-black text-white">สำรวจ</span> — ออกเดินทางหาวัตถุดิบ ต่อสู้สัตว์ประหลาด พื้นที่ใหม่เปิดตามวัน</div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-xl shrink-0">💕</span>
                <div><span className="font-black text-white">หมู่บ้าน</span> — สร้างสายสัมพันธ์กับเทพ ปลดล็อคสกิลใหม่ มอบของขวัญ</div>
              </div>
              <div className="bg-red-900/30 border border-red-500/20 rounded-xl p-3 text-xs text-red-300">
                <span className="font-black">เป้าหมาย:</span> ปราบเจ้าแห่งแวมไพร์ให้ได้ภายใน {MAX_TURNS} วัน! แต่ละวันมี {MAX_CHOICES_PER_DAY} แต้มกิจกรรม
              </div>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={dismissTutorial}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl uppercase text-xs tracking-widest transition-all active:scale-95"
              >
                เข้าใจแล้ว เริ่มเลย!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over / Win Overlay */}
      {gameOver && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center space-y-6 p-8 max-w-md">
            <div className="text-6xl">{gameOver === 'win' ? '🏆' : gameOverReason === 'bankruptcy' ? '💸' : '💀'}</div>
            <h2 className="text-4xl font-black uppercase tracking-tight">
              {gameOver === 'win' ? (
                <span className="text-amber-500">ชัยชนะ!</span>
              ) : gameOverReason === 'bankruptcy' ? (
                <span className="text-red-500">ล้มละลาย!</span>
              ) : (
                <span className="text-red-500">จบเกม</span>
              )}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {gameOver === 'win'
                ? 'เจ้าแห่งแวมไพร์พ่ายแพ้แล้ว! ด้วยพลังแห่งสายสัมพันธ์และปณิธานที่แน่วแน่ เคนจึงได้รับชัยชนะ เหล่าเทพต่างยิ้มรับให้แก่คุณ'
                : gameOverReason === 'bankruptcy'
                ? 'ร้านค้าล้มละลาย... ไม่มีทั้งสินค้าและทองคำเหลืออยู่แม้แต่น้อย ไม่มีทางฟื้นตัวได้อีกแล้ว บางทีครั้งหน้าควรบริหารเงินให้ดีกว่านี้'
                : `เวลาผ่านไป ${MAX_TURNS} วันแล้ว แต่เจ้าแห่งแวมไพร์ยังคงครอบงำอยู่... เหล่าเทพเริ่มกระสับกระส่าย บางทีครั้งหน้า คุณควรสร้างสายสัมพันธ์ให้แน่นแฟ้นและเตรียมตัวให้ดีกว่านี้`
              }
            </p>
            <div className="flex flex-col gap-3 pt-4">
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                สำเร็จใน {day} วัน | ทอง: {gold} | สกิล: {companions.find(c => c.id === 'kane')?.unlockedSkills.length || 0}
              </div>
              <button
                onClick={() => {
                  deleteAllSaves();
                  resetGame();
                }}
                className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-xl uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-amber-500/20"
              >
                เล่นอีกครั้ง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <header className="hidden md:block border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl drop-shadow-lg">🏛️</span>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-amber-500 uppercase leading-none italic">Gods&apos; Arena</h1>
              <div className="text-[9px] text-slate-500 font-bold tracking-[0.25em] uppercase mt-1">วิหารแห่งเทพ</div>
            </div>
            <AIStatusBadge />
          </div>

          <div className="flex items-center gap-2">
            <NavTab label="ร้านค้า" active={phase === 'shop'} onClick={() => changeRoom('shop')} />
            <NavTab label="อารีน่า" active={phase === 'arena'} onClick={() => changeRoom('arena')} />
            <NavTab label="สำรวจ" active={phase === 'exploration'} onClick={() => setPhase('exploration')} />
            <NavTab label="หมู่บ้าน" active={phase === 'relationship'} onClick={() => changeRoom('village')} />
            <NavTab label="สถานะ" active={phase === 'status' as any} onClick={() => setPhase('status' as any)} />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[9px] text-amber-500/70 font-black uppercase tracking-widest flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Actions Left
              </span>
              <div className="font-black text-xl leading-none text-white">
                {choicesLeft} <span className="text-xs opacity-30">/ {MAX_CHOICES_PER_DAY}</span>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-right">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">วันที่</span>
              <div className={`font-black text-xl leading-none ${isUrgent ? 'text-red-400' : 'text-amber-400'}`}>
                {day} <span className="text-sm opacity-50">/ {MAX_TURNS}</span>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="flex items-center gap-2 text-amber-400 font-black text-xl">
              <span className="text-sm opacity-70">💰</span>
              <span>{gold.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[8px] text-amber-500/70 font-black uppercase leading-none mb-0.5">{choicesLeft} Left</div>
              <span className={`text-[10px] font-black uppercase ${isUrgent ? 'text-red-400' : 'text-slate-500'}`}>
                Day {day}/{MAX_TURNS}
              </span>
            </div>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-1.5 text-amber-400 font-black text-base">
              <span className="text-xs opacity-70">💰</span>
              <span>{gold.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {phase === 'shop' && 'ร้านค้าสวรรค์'}
              {phase === 'arena' && 'มหาอารีน่า'}
              {phase === 'exploration' && 'ป่าเถื่อน'}
              {phase === 'relationship' && 'หมู่บ้านเทพ'}
              {(phase as any) === 'status' && 'สถานะ'}
            </div>
            <AIStatusBadge compact />
          </div>
        </div>
      </header>

      {/* Urgency Warning Banner */}
      {isUrgent && !gameOver && (
        <div className={`max-w-7xl mx-auto px-4 md:px-6 pt-3 ${turnsLeft <= 3 ? 'animate-pulse' : ''}`}>
          <div className={`text-center py-2 px-4 rounded-xl text-xs font-black uppercase tracking-widest border ${
            turnsLeft <= 3
              ? 'bg-red-900/40 border-red-500/50 text-red-400'
              : 'bg-amber-900/30 border-amber-500/30 text-amber-400'
          }`}>
            {turnsLeft <= 3
              ? `เจ้าแห่งแวมไพร์แข็งแกร่งขึ้นทุกวัน เหลือเวลาอีกเพียง ${turnsLeft} วัน!`
              : `เวลาเริ่มจำกัด เหลืออีก ${turnsLeft} วัน — เตรียมตัวให้พร้อม`
            }
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-start relative">
        {/* Main View */}
        <div className="lg:col-span-8 space-y-6">
          <div className={`relative isolate group rounded-xl md:rounded-3xl overflow-hidden border-2 md:border-4 bg-slate-950 shadow-2xl aspect-[4/3] w-full max-w-full ${
            turnsLeft <= 3 && !gameOver ? 'border-red-500/60 shadow-red-500/20' : 'border-slate-800 shadow-black/50'
          }`}>
            <PhaserGame />
            <DialogueOverlay />
            
            {/* Global End Day Prompt - Only show if not busy */}
            {choicesLeft <= 0 && !isBusy && (
              <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-700">
                <button
                  onClick={() => endDay()}
                  className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl uppercase tracking-widest shadow-2xl shadow-indigo-500/40 animate-pulse transition-all hover:scale-105 active:scale-95 border-2 border-indigo-400/30"
                >
                  💤 แต้มหมดแล้ว ไปพักผ่อนเพื่อเริ่มวันใหม่
                </button>
              </div>
            )}
          </div>

          {/* Save/Reset buttons — desktop */}
          <div className="hidden md:flex gap-2 justify-end">
            <button
              onClick={() => {
                const relationships = companions.reduce((acc, c) => ({ ...acc, [c.id]: c.bond }), {});
                const saveItems = items.map(id => ({ id, name: id, price: 0, type: 'consumable' }));
                saveGame(gold, null, saveItems as any, relationships, 0, true);
                alert('บันทึกความคืบหน้าแล้ว!');
              }}
              className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
            >
              💾 บันทึก (Save)
            </button>
            <button
              onClick={() => {
                if (confirm('รีเซ็ตข้อมูลเกมทั้งหมด? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) {
                  deleteAllSaves();
                  resetGame();
                }
              }}
              className="px-4 py-2 bg-red-900/30 hover:bg-red-800/50 border border-red-500/30 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 text-red-400"
            >
              🗑 เริ่มใหม่ (Reset)
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          <div className="min-h-[200px] md:min-h-[400px]">
            {phase === 'shop' && <Shop />}
            {phase === 'arena' && <Arena />}
            {phase === 'exploration' && <Exploration />}
            {phase === 'relationship' && <Relationship />}
            {(phase as any) === 'status' && <ChampionStatus />}
          </div>
        </div>
      </div>
      {/* Bottom Nav — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md md:hidden">
        <div className="grid grid-cols-5 gap-0">
          <MobileNavTab label="ร้านค้า" active={phase === 'shop'} onClick={() => changeRoom('shop')} />
          <MobileNavTab label="อารีน่า" active={phase === 'arena'} onClick={() => changeRoom('arena')} />
          <MobileNavTab label="สำรวจ" active={phase === 'exploration'} onClick={() => setPhase('exploration')} />
          <MobileNavTab label="หมู่บ้าน" active={phase === 'relationship'} onClick={() => changeRoom('village')} />
          <MobileNavTab label="สถานะ" active={(phase as any) === 'status'} onClick={() => setPhase('status' as any)} />
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
