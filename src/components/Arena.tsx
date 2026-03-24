'use client';
import { useState, useEffect } from 'react';
import { useGameStore, DivineSkill } from '@/store/gameStore';
import { EventBus } from '@/game/EventBus';
import { broadcastAISource } from './AIStatusBadge';
import { GoldIcon, HPIcon, SwordIcon, ShieldIcon, IPIcon, SparklesIcon } from './Icons';

const BASE_ENEMIES = [
  { id: 'slime', name: 'Slime', emoji: '💧', baseHp: 50, baseAtk: 8, baseDef: 1, gold: 30, xp: 5 },
  { id: 'skeleton', name: 'Skeleton', emoji: '💀', baseHp: 80, baseAtk: 12, baseDef: 3, gold: 60, xp: 12 },
  { id: 'boss', name: 'Vampire Lord', emoji: '🧛', baseHp: 250, baseAtk: 35, baseDef: 8, gold: 500, xp: 100 },
];

export default function Arena() {
  const { 
    choicesLeft, consumeChoice, gold, addGold, day, companions, 
    interventionPoints, useIP, addAILog, setDialogue,
    kaneStats 
  } = useGameStore();
  
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isFighting, setIsFighting] = useState(false);
  const [enemy, setEnemy] = useState<any>(null);
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp, setPlayerMaxHp] = useState(100);
  const [turn, setTurn] = useState(0);
  const [wave, setWave] = useState(1);
  const [totalWaves, setTotalWaves] = useState(1);
  const [pendingGold, setPendingGold] = useState(0);
  const [baseEnemyPool, setBaseEnemyPool] = useState<any>(null);

  const kane = companions.find(c => c.id === 'kane');
  const gods = companions.filter(c => c.id !== 'kane');

  const startCombat = (baseEnemy: any) => {
    if (choicesLeft <= 0 || isFighting) return;
    
    // Wave System: Determine wave count based on day and enemy difficulty
    // High difficulty enemies or late game = more waves
    const numWaves = day >= 15 ? 3 : day >= 8 ? 2 : 1;
    setWave(1);
    setTotalWaves(numWaves);
    setPendingGold(0);
    setBaseEnemyPool(baseEnemy);

    spawnWaveEnemy(baseEnemy, 1);
    
    // Fix: Sync with actual Kane stats
    setPlayerHp(kaneStats?.hp || 100);
    setPlayerMaxHp(kaneStats?.maxHp || 100);
    
    setIsFighting(true);
    setTurn(1);
    setCombatLog([`⚔️ การต่อสู้เริ่มขึ้นแล้ว! (Wave 1/${numWaves})`]);
  };

  const spawnWaveEnemy = (baseEnemy: any, currentWave: number) => {
    const scale = (1 + (day - 1) * 0.03) * (1 + (currentWave - 1) * 0.1); // Each wave is 10% stronger
    const scaledEnemy = {
      ...baseEnemy,
      hp: Math.floor(baseEnemy.baseHp * scale),
      maxHp: Math.floor(baseEnemy.baseHp * scale),
      atk: Math.floor(baseEnemy.baseAtk * scale),
      def: Math.floor(baseEnemy.baseDef * scale),
    };

    setEnemy(scaledEnemy);
    EventBus.emit('arena-enemy-change', { enemyType: baseEnemy.id });
  };

  const logAction = (text: string) => {
    setCombatLog(prev => [text, ...prev].slice(0, 10));
  };

  const handleDivineIntervention = async (godId: string, skill: DivineSkill) => {
    if (!isFighting || !enemy || interventionPoints < 2) return;
    
    if (useIP(2)) {
      logAction(`✨ ${skill.name} ถูกเปิดใช้งานโดยพรแห่งเทพ!`);
      EventBus.emit('play-sfx', 'divine_skill');
      
      // Feature: Use skill increases bond
      const { addBond } = useGameStore.getState();
      addBond(godId, 1);
      
      // Feature: God Visual Manifestation
      EventBus.emit('arena-god-support', { godId, skillName: skill.name });

      // Improved: Use actual Kane stats for divine damage
      const damage = Math.floor((kaneStats.atk * skill.multiplier) - enemy.def);
      const finalDmg = Math.max(5, damage);
      
      const newEnemyHp = Math.max(0, enemy.hp - finalDmg);
      setEnemy({ ...enemy, hp: newEnemyHp });
      
      EventBus.emit('arena-attack', { target: 'enemy' });
      logAction(`💥 ${skill.name} สร้างความเสียหาย ${finalDmg} หน่วย!`);

      try {
        const res = await fetch('/api/narrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'divine_intervention', playerName: 'Kane', npcName: skill.name, enemyName: enemy.name, damage: finalDmg })
        });
        const data = await res.json();
        broadcastAISource(data.source || 'fallback');
        addAILog({ 
          action: 'arena_intervention', 
          model: data.model || 'AI Model', 
          source: (data.source as any) || 'unknown', 
          prompt: data.prompt || '', 
          response: data.narrative || '', 
          tokensInput: data.usage?.prompt_tokens || 0, 
          tokensOutput: data.usage?.completion_tokens || 0,
          gatewayLogs: data.gatewayLogs
        });
        if (data.narrative) setDialogue({ speaker: 'Narrator', text: data.narrative });
      } catch (e) {}

      if (newEnemyHp <= 0) winCombat();
    }
  };

  const executeTurn = () => {
    if (!isFighting || !enemy) return;
    EventBus.emit('play-sfx', 'attack');

    // Improved: Use actual Kane stats
    const pDmg = Math.max(2, (kaneStats?.atk || 15) - enemy.def);
    const newEnemyHp = Math.max(0, enemy.hp - pDmg);
    setEnemy({ ...enemy, hp: newEnemyHp });
    EventBus.emit('arena-attack', { target: 'enemy' });
    logAction(`🏹 Kane โจมตี ${enemy.name} สร้างความเสียหาย ${pDmg}`);

    if (newEnemyHp <= 0) {
      winCombat();
      return;
    }

    setTimeout(() => {
      if (!isFighting) return;
      // Improved: Use actual Kane defense
      const eDmg = Math.max(1, enemy.atk - (kaneStats?.def || 10));
      const newPlayerHp = Math.max(0, playerHp - eDmg);
      setPlayerHp(newPlayerHp);
      EventBus.emit('arena-attack', { target: 'player' });
      logAction(`👹 ${enemy.name} โจมตี Kane สร้างความเสียหาย ${eDmg}`);
      if (newPlayerHp <= 0) loseCombat();
      else setTurn(prev => prev + 1);
    }, 800);
  };

  const winCombat = () => {
    // Collect gold for this wave
    const waveGold = enemy.gold;
    setPendingGold(prev => prev + waveGold);
    EventBus.emit('arena-enemy-death');

    if (wave < totalWaves) {
      logAction(`✨ Wave ${wave} สำเร็จ! กำลังรอศัตรูถัดไป...`);
      // Feature: Divine Recovery (Heal 20% between waves)
      const healAmount = Math.floor(playerMaxHp * 0.2);
      const newHp = Math.min(playerMaxHp, playerHp + healAmount);
      setPlayerHp(newHp);
      logAction(`💖 พรแห่งเทพฟื้นฟู Kane ${healAmount} HP!`);

      setTimeout(() => {
        setWave(prev => prev + 1);
        spawnWaveEnemy(baseEnemyPool, wave + 1);
        logAction(`⚔️ Wave ${wave + 1}/${totalWaves} เริ่มต้นขึ้น!`);
      }, 1500);
    } else {
      const finalGold = pendingGold + waveGold;
      logAction(`🏆 ชัยชนะครั้งยิ่งใหญ่! ได้รับรวม ${finalGold} ทอง`);
      addGold(finalGold);
      const { incrementArenaWins, addIP } = useGameStore.getState();
      incrementArenaWins();
      addIP(3 * totalWaves); // Buff: 3 IP per wave
      EventBus.emit('spawn-floating-text', { text: `+${finalGold} Gold`, color: '#ffd700' });
      setIsFighting(false);
      consumeChoice();
      setTimeout(() => { setEnemy(null); EventBus.emit('arena-combat-end'); }, 2000);
    }
  };

  const loseCombat = () => {
    logAction(`💀 พ่ายแพ้... Kane ถอยทัพกลับมาเลียแผล`);
    setIsFighting(false);
    consumeChoice();
    setTimeout(() => { setEnemy(null); EventBus.emit('arena-combat-end'); }, 2000);
  };

  return (
    <div className="p-4 bg-slate-900/95 rounded-xl border border-red-500/20 shadow-2xl space-y-4 h-[600px] flex flex-col font-sans">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-red-500 uppercase tracking-tighter italic font-serif">โคลอสเซียมแห่งเกียรติยศ</h2>
        {isFighting && (
          <div className="bg-red-900/30 border border-red-500/30 px-3 py-1 rounded-full">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Wave {wave}/{totalWaves}</span>
          </div>
        )}
      </div>
      {isFighting && enemy ? (
        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 p-3 rounded-xl border border-blue-500/20">
              <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black text-blue-400 uppercase font-serif">Kane</span><span className="text-[10px] font-bold text-slate-500 font-sans">{playerHp}/{playerMaxHp}</span></div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(playerHp/playerMaxHp)*100}%` }} /></div>
            </div>
            <div className="bg-black/40 p-3 rounded-xl border border-red-500/20">
              <div className="flex justify-between items-center mb-1 font-serif">
                <span className="text-[10px] font-black text-red-400 uppercase">{enemy?.name || 'Enemy'}</span>
                <span className="text-[10px] font-bold text-slate-500 font-sans">
                  {enemy ? `${enemy.hp}/${enemy.maxHp}` : '0/0'}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-500" 
                  style={{ width: `${enemy ? (enemy.hp / enemy.maxHp) * 100 : 0}%` }} 
                />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/30 p-3 rounded-xl border border-white/5 font-serif">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex justify-between"><span>พลังแห่งทวยเทพ</span><span className="text-purple-400 flex items-center gap-1 font-sans"><IPIcon size={10} /> {interventionPoints} IP</span></div>
            <div className="grid grid-cols-3 gap-2">
              {gods.map(god => (
                <div key={god.id} className="space-y-1">
                  {(god.unlockedSkills || []).slice(0, 1).map((skill, idx) => (
                    <button key={idx} onClick={() => handleDivineIntervention(god.id, skill)} disabled={interventionPoints < 2} className="w-full py-1.5 bg-purple-900/20 hover:bg-purple-800/40 border border-purple-500/30 rounded-lg text-[8px] font-black text-purple-300 uppercase transition-all disabled:opacity-30 flex flex-col items-center"><SparklesIcon size={10} className="mb-0.5" />{skill.name}</button>
                  ))}
                  {(!god.unlockedSkills || god.unlockedSkills.length === 0) && <div className="h-full bg-slate-900/50 rounded-lg border border-dashed border-slate-700 flex items-center justify-center"><span className="text-[7px] text-slate-600 uppercase">ล็อค</span></div>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-black/60 rounded-xl p-3 font-mono text-[11px] overflow-y-auto border border-white/5 space-y-1 custom-scrollbar">
            {combatLog.map((log, i) => (<div key={i} className={i === 0 ? "text-white font-bold" : "text-slate-500"}>{log}</div>))}
          </div>
          <button onClick={executeTurn} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl shadow-lg shadow-red-900/20 uppercase tracking-[0.2em] transition-all active:scale-95 font-serif">ดำเนินการต่อ (เทิร์น {turn})</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-1 font-serif">
          {BASE_ENEMIES.map(be => (
            <button key={be.id} onClick={() => startCombat(be)} disabled={choicesLeft <= 0} className="group p-4 bg-slate-800/40 hover:bg-slate-800 border border-white/5 hover:border-red-500/30 rounded-2xl transition-all flex items-center gap-4 relative overflow-hidden">
              <div className="text-4xl group-hover:scale-110 transition-transform">{be.emoji}</div>
              <div className="flex-1 text-left">
                <div className="font-black text-white uppercase tracking-tight font-serif">{be.name}</div>
                <div className="flex gap-3 mt-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1 font-sans"><HPIcon size={10} /> {Math.floor(be.baseHp * (1 + (day - 1) * 0.03))}</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1 font-sans"><SwordIcon size={10} /> {Math.floor(be.baseAtk * (1 + (day - 1) * 0.03))}</span>
                  <span className="text-[9px] font-bold text-amber-500 flex items-center gap-1 font-sans"><GoldIcon size={10} /> {be.gold}</span>
                </div>
              </div>
              <div className="text-xs font-black text-red-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity font-serif">{choicesLeft > 0 ? 'สู้ ⚔️' : 'แต้มหมด'}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
