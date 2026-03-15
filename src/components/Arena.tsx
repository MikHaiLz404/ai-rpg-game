'use client';
import { useState, useEffect } from 'react';
import { useGameStore, DivineSkill } from '@/store/gameStore';
import { EventBus } from '@/game/EventBus';

const ENEMIES = [
  { id: 'slime', name: 'Slime', emoji: '🦠', hp: 30, atk: 5, reward: 20, image: '/images/enemies/slime/idle/enemies-slime1_idle.png' },
  { id: 'skeleton', name: 'Skeleton', emoji: '💀', hp: 70, atk: 15, reward: 60, image: '/images/enemies/skeleton/idle/enemies-skeleton2_idle.png' },
  { id: 'demon', name: 'Demon', emoji: '🧛', hp: 120, atk: 25, reward: 150, image: '/images/enemies/demon/idle/enemies-vampire_idle.png' },
];

const CHAMPION = {
  id: 'kane',
  name: 'Kane',
  idleImage: '/images/characters/npcs/kane/idle/hero_idle_DOWN.png',
  attackImage: '/images/characters/npcs/kane/attack/hero_bow_RIGHT.png'
};

export default function Arena() {
  const { gold, addGold, companions, getBondBonus } = useGameStore();
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(0);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [selectedEnemy, setSelectedEnemy] = useState<typeof ENEMIES[0] | null>(null);
  const [inCombat, setInCombat] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  
  const availableSkills = companions.flatMap(c => c.unlockedSkills);

  const startCombat = (enemy: typeof ENEMIES[0]) => {
    setSelectedEnemy(enemy);
    setEnemyHp(enemy.hp);
    setPlayerHp(100);
    setResult(null);
    setCombatLog([`⚔️ Battle Started: Kane vs ${enemy.name}`]);
    setInCombat(true);
  };
  
  const executeAttack = async (skill?: DivineSkill) => {
    if (!selectedEnemy || result || isAttacking) return;
    
    setIsAttacking(true);
    
    // Play attack effect in Phaser
    EventBus.emit('arena-attack', { target: 'enemy' });

    const totalBonusAtk = companions.reduce((acc, c) => acc + getBondBonus(c.id).atk, 0);
    
    const multiplier = skill ? skill.multiplier : 1.0;
    const playerDmg = Math.floor((Math.random() * 10 + 15 + totalBonusAtk) * multiplier);
    
    const newEnemyHp = Math.max(0, enemyHp - playerDmg);
    setEnemyHp(newEnemyHp);
    
    try {
      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'attack',
          playerName: skill ? `Kane using ${skill.name}` : 'Kane',
          enemyName: selectedEnemy.name,
          damage: playerDmg
        })
      });
      const data = await res.json();
      setCombatLog(prev => [`🏹 ${data.narrative || `Kane hits for ${playerDmg}!`}`, ...prev]);
    } catch (err) {
      setCombatLog(prev => [`🏹 Kane hits for ${playerDmg}!`, ...prev]);
    }
    
    if (newEnemyHp <= 0) {
      setResult('win');
      addGold(selectedEnemy.reward);
      setIsAttacking(false);
      return;
    }
    
    // Enemy counter
    setTimeout(async () => {
      const enemyDmg = Math.floor(Math.random() * selectedEnemy.atk) + 5;
      const newPlayerHp = Math.max(0, playerHp - enemyDmg);
      setPlayerHp(newPlayerHp);
      
      // Play counter attack effect in Phaser
      EventBus.emit('arena-attack', { target: 'player' });

      if (newPlayerHp <= 0) setResult('lose');
      setIsAttacking(false);
    }, 800);
  };
  
  if (inCombat && selectedEnemy) {
    return (
      <div className="bg-slate-900/90 p-6 rounded-xl border border-red-500/20 shadow-2xl">
        <div className="flex justify-around items-center mb-12">
           <div className="text-center">
              <div className="w-20 h-20 bg-blue-900/20 rounded-2xl border-2 border-blue-500/30 overflow-hidden flex items-center justify-center mb-2">
                <div 
                    className="w-8 h-8 image-pixelated scale-[2.5]"
                    style={{
                      backgroundImage: `url(${isAttacking ? CHAMPION.attackImage : CHAMPION.idleImage})`,
                      backgroundSize: isAttacking ? '700% 100%' : '100% 100%',
                      animation: isAttacking ? 'play-attack 0.8s steps(7) infinite' : 'none'
                    }}
                  />
              </div>
              <div className="text-[10px] font-black text-blue-400 uppercase">{CHAMPION.name}</div>
              <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${playerHp}%` }} />
              </div>
           </div>

           <div className="text-2xl font-black text-white italic opacity-20">VS</div>

           <div className="text-center">
              <div className="w-20 h-20 bg-red-900/20 rounded-2xl border-2 border-red-500/30 overflow-hidden flex items-center justify-center mb-2">
                {selectedEnemy.image ? (
                  <img src={selectedEnemy.image} className="w-12 h-12 object-contain image-pixelated animate-bounce" />
                ) : <span className="text-3xl">{selectedEnemy.emoji}</span>}
              </div>
              <div className="text-[10px] font-black text-red-400 uppercase">{selectedEnemy.name}</div>
              <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${(enemyHp / selectedEnemy.hp) * 100}%` }} />
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <button 
            onClick={() => executeAttack()}
            disabled={isAttacking || !!result}
            className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl border border-white/10 uppercase text-[10px] tracking-widest disabled:opacity-50"
          >
            Standard Shot
          </button>
          {availableSkills.map((skill, i) => (
            <button 
              key={i}
              onClick={() => executeAttack(skill)}
              disabled={isAttacking || !!result}
              className="py-3 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white font-black rounded-xl shadow-lg uppercase text-[10px] tracking-widest disabled:opacity-50 border border-amber-400/20"
            >
              ✨ {skill.name}
            </button>
          ))}
        </div>

        {result && (
          <button 
            onClick={() => setInCombat(false)}
            className="w-full py-4 bg-white text-slate-900 font-black rounded-xl mb-4 uppercase tracking-widest"
          >
            {result === 'win' ? 'Claim Victory' : 'Retreat to Shop'}
          </button>
        )}

        <div className="bg-black/50 p-4 rounded-xl h-24 overflow-y-auto font-mono text-[10px] leading-relaxed">
          {combatLog.map((log, i) => (
            <div key={i} className={i === 0 ? 'text-white font-bold' : 'text-slate-500'}>{log}</div>
          ))}
        </div>

        <style jsx>{`
          @keyframes play-attack { from { background-position: 0% 0%; } to { background-position: 700% 0%; } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 p-6 rounded-2xl border border-white/5 shadow-2xl">
      <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-6 italic font-serif">Divine Arena</h2>
      <div className="space-y-3">
        {ENEMIES.map((enemy) => (
          <button
            key={enemy.id}
            onClick={() => startCombat(enemy)}
            className="w-full group p-4 bg-slate-800/40 hover:bg-slate-800 border border-white/5 hover:border-red-500/30 rounded-2xl transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-2xl border border-white/5 group-hover:scale-110 transition-transform overflow-hidden">
                {enemy.image ? <img src={enemy.image} className="w-8 h-8 object-contain image-pixelated" /> : enemy.emoji}
              </div>
              <div className="text-left">
                <div className="font-black text-white uppercase tracking-tight">{enemy.name}</div>
                <div className="text-[9px] font-black text-amber-500/70 uppercase">Reward: {enemy.reward} gold</div>
              </div>
            </div>
            <div className="text-[10px] font-black text-red-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Fight ⚔️</div>
          </button>
        ))}
      </div>
    </div>
  );
}
