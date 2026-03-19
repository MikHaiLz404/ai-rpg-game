'use client';
import { useState, useEffect } from 'react';
import { useGameStore, DivineSkill } from '@/store/gameStore';
import { EventBus } from '@/game/EventBus';
import { GoldIcon, HPIcon, SwordIcon, ShieldIcon, IPIcon, SparklesIcon } from './Icons';

const BASE_ENEMIES = [
  { id: 'slime', name: 'Slime', emoji: '💧', baseHp: 50, baseAtk: 8, baseDef: 2, gold: 30, xp: 5 },
  { id: 'skeleton', name: 'Skeleton', emoji: '💀', baseHp: 80, baseAtk: 12, baseDef: 5, gold: 60, xp: 12 },
  { id: 'demon', name: 'Demon', emoji: '😈', baseHp: 150, baseAtk: 20, baseDef: 10, gold: 150, xp: 30 },
];

export default function Arena() {
  const { choicesLeft, consumeChoice, gold, addGold, day, companions, interventionPoints, useIP, addAILog, setDialogue } = useGameStore();
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isFighting, setIsFighting] = useState(false);
  const [enemy, setEnemy] = useState<any>(null);
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp, setPlayerMaxHp] = useState(100);
  const [turn, setTurn] = useState(0);

  const kane = companions.find(c => c.id === 'kane');
  const gods = companions.filter(c => c.id !== 'kane');

  const startCombat = (baseEnemy: any) => {
    if (choicesLeft <= 0 || isFighting) return;
    
    // Scale enemy by day (5% increase per day)
    const scale = 1 + (day - 1) * 0.05;
    const scaledEnemy = {
      ...baseEnemy,
      hp: Math.floor(baseEnemy.baseHp * scale),
      maxHp: Math.floor(baseEnemy.baseHp * scale),
      atk: Math.floor(baseEnemy.baseAtk * scale),
      def: Math.floor(baseEnemy.baseDef * scale),
    };

    setEnemy(scaledEnemy);
    setPlayerHp(100);
    setPlayerMaxHp(100);
    setIsFighting(true);
    setTurn(1);
    setCombatLog([`⚔️ การต่อสู้กับ ${scaledEnemy.name} เริ่มขึ้นแล้ว!`]);
    
    EventBus.emit('arena-enemy-change', { enemyType: baseEnemy.id });
  };

  const logAction = (text: string) => {
    setCombatLog(prev => [text, ...prev].slice(0, 10));
  };

  const handleDivineIntervention = async (godId: string, skill: DivineSkill) => {
    if (!isFighting || !enemy || interventionPoints < 2) return;
    
    if (useIP(2)) {
      logAction(`✨ ${skill.name} ถูกเปิดใช้งานโดยพรแห่งเทพ!`);
      
      const damage = Math.floor((15 * skill.multiplier) - enemy.def);
      const finalDmg = Math.max(5, damage);
      
      const newEnemyHp = Math.max(0, enemy.hp - finalDmg);
      setEnemy({ ...enemy, hp: newEnemyHp });
      
      EventBus.emit('arena-attack', { target: 'enemy' });
      logAction(`💥 ${skill.name} สร้างความเสียหาย ${finalDmg} หน่วย!`);

      // Record to AI Log
      try {
        const res = await fetch('/api/narrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'divine_intervention',
            playerName: 'Kane',
            npcName: skill.name,
            enemyName: enemy.name,
            damage: finalDmg
          })
        });
        const data = await res.json();
        addAILog({
          action: 'arena_intervention',
          model: data.model || 'AI Model',
          source: data.source || 'unknown',
          prompt: data.prompt || '',
          response: data.narrative || '',
          tokensInput: data.usage?.prompt_tokens || 0,
          tokensOutput: data.usage?.completion_tokens || 0
        });
        if (data.narrative) setDialogue({ speaker: 'Narrator', text: data.narrative });
      } catch (e) {}

      if (newEnemyHp <= 0) {
        winCombat();
      }
    }
  };

  const executeTurn = () => {
    if (!isFighting || !enemy) return;

    // Player Turn
    const pDmg = Math.max(2, 15 - enemy.def);
    const newEnemyHp = Math.max(0, enemy.hp - pDmg);
    setEnemy({ ...enemy, hp: newEnemyHp });
    EventBus.emit('arena-attack', { target: 'enemy' });
    logAction(`🏹 Kane โจมตี ${enemy.name} สร้างความเสียหาย ${pDmg}`);

    if (newEnemyHp <= 0) {
      winCombat();
      return;
    }

    // Enemy Turn
    setTimeout(() => {
      if (!isFighting) return;
      const eDmg = Math.max(1, enemy.atk - 10);
      const newPlayerHp = Math.max(0, playerHp - eDmg);
      setPlayerHp(newPlayerHp);
      EventBus.emit('arena-attack', { target: 'player' });
      logAction(`👹 ${enemy.name} โจมตี Kane สร้างความเสียหาย ${eDmg}`);

      if (newPlayerHp <= 0) {
        loseCombat();
      } else {
        setTurn(prev => prev + 1);
      }
    }, 800);
  };

  const winCombat = () => {
    logAction(`🏆 ชัยชนะ! ได้รับ ${enemy.gold} ทอง`);
    addGold(enemy.gold);
    
    // Visual feedback in Phaser
    EventBus.emit('spawn-floating-text', { text: `+${enemy.gold} Gold`, color: '#ffd700' });

    setIsFighting(false);
    consumeChoice();
    EventBus.emit('arena-enemy-death');
    setTimeout(() => {
      setEnemy(null);
      EventBus.emit('arena-combat-end');
    }, 2000);
  };

  const loseCombat = () => {
    logAction(`💀 พ่ายแพ้... Kane ถอยทัพกลับมาเลียแผล`);
    setIsFighting(false);
    consumeChoice();
    setTimeout(() => {
      setEnemy(null);
      EventBus.emit('arena-combat-end');
    }, 2000);
  };

  return (
    <div className="p-4 bg-slate-900/95 rounded-xl border border-red-500/20 shadow-2xl space-y-4 h-[600px] flex flex-col font-sans">
      <h2 className="text-2xl font-black text-red-500 uppercase tracking-tighter italic font-serif">โคลอสเซียมแห่งเกียรติยศ</h2>
      
      {isFighting && enemy ? (
        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          {/* Battle HUD */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 p-3 rounded-xl border border-blue-500/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-blue-400 uppercase font-serif">Kane</span>
                <span className="text-[10px] font-bold text-slate-500 font-sans">{playerHp}/{playerMaxHp}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(playerHp/playerMaxHp)*100}%` }} />
              </div>
            </div>
            <div className="bg-black/40 p-3 rounded-xl border border-red-500/20">
              <div className="flex justify-between items-center mb-1 font-serif">
                <span className="text-[10px] font-black text-red-400 uppercase">{enemy.name}</span>
                <span className="text-[10px] font-bold text-slate-500 font-sans">{enemy.hp}/{enemy.maxHp}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(enemy.hp/enemy.maxHp)*100}%` }} />
              </div>
            </div>
          </div>

          {/* Divine Skills Grid */}
          <div className="bg-slate-800/30 p-3 rounded-xl border border-white/5 font-serif">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
              <span>พลังแห่งทวยเทพ</span>
              <span className="text-purple-400 flex items-center gap-1 font-sans"><IPIcon size={10} /> {interventionPoints} IP</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {gods.map(god => (
                <div key={god.id} className="space-y-1">
                  {god.unlockedSkills.slice(0, 1).map((skill, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDivineIntervention(god.id, skill)}
                      disabled={interventionPoints < 2}
                      className="w-full py-1.5 bg-purple-900/20 hover:bg-purple-800/40 border border-purple-500/30 rounded-lg text-[8px] font-black text-purple-300 uppercase transition-all disabled:opacity-30 flex flex-col items-center"
                    >
                      <SparklesIcon size={10} className="mb-0.5" />
                      {skill.name}
                    </button>
                  ))}
                  {god.unlockedSkills.length === 0 && (
                    <div className="h-full bg-slate-900/50 rounded-lg border border-dashed border-slate-700 flex items-center justify-center">
                      <span className="text-[7px] text-slate-600 uppercase">ล็อค</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Combat Log */}
          <div className="flex-1 bg-black/60 rounded-xl p-3 font-mono text-[11px] overflow-y-auto border border-white/5 space-y-1 custom-scrollbar">
            {combatLog.map((log, i) => (
              <div key={i} className={i === 0 ? "text-white font-bold" : "text-slate-500"}>{log}</div>
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={executeTurn}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl shadow-lg shadow-red-900/20 uppercase tracking-[0.2em] transition-all active:scale-95 font-serif"
          >
            ดำเนินการต่อ (เทิร์น {turn})
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-1 font-serif">
          {BASE_ENEMIES.map(be => (
            <button
              key={be.id}
              onClick={() => startCombat(be)}
              disabled={choicesLeft <= 0}
              className="group p-4 bg-slate-800/40 hover:bg-slate-800 border border-white/5 hover:border-red-500/30 rounded-2xl transition-all flex items-center gap-4 relative overflow-hidden"
            >
              <div className="text-4xl group-hover:scale-110 transition-transform">{be.emoji}</div>
              <div className="flex-1 text-left">
                <div className="font-black text-white uppercase tracking-tight font-serif">{be.name}</div>
                <div className="flex gap-3 mt-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1 font-sans"><HPIcon size={10} /> {Math.floor(be.baseHp * (1 + (day - 1) * 0.05))}</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1 font-sans"><SwordIcon size={10} /> {Math.floor(be.baseAtk * (1 + (day - 1) * 0.05))}</span>
                  <span className="text-[9px] font-bold text-amber-500 flex items-center gap-1 font-sans"><GoldIcon size={10} /> {be.gold}</span>
                </div>
              </div>
              <div className="text-xs font-black text-red-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity font-serif">
                {choicesLeft > 0 ? 'สู้ ⚔️' : 'แต้มหมด'}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
