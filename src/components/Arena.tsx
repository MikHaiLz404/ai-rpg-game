'use client';
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

const ENEMIES = [
  { 
    id: 'slime', 
    name: 'Slime', 
    emoji: '🦠', 
    hp: 30, 
    atk: 5, 
    reward: 20,
    image: '/images/enemies/slime/idle/frame_1_0.png'
  },
  { 
    id: 'goblin', 
    name: 'Goblin', 
    emoji: '👺', 
    hp: 50, 
    atk: 10, 
    reward: 40,
    image: null
  },
];

const CHAMPION = {
  id: 'kane',
  name: 'Kane',
  title: 'Divine Archer',
  idleImage: '/images/characters/npcs/kane/hero-pack-free_version/hero/color_1/idle/hero_idle_DOWN.png',
  attackImage: '/images/characters/npcs/kane/hero-pack-free_version/hero/color_1/bow/hero_bow_RIGHT.png'
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
  
  const startCombat = (enemy: typeof ENEMIES[0]) => {
    setSelectedEnemy(enemy);
    setEnemyHp(enemy.hp);
    setPlayerHp(100);
    setResult(null);
    setCombatLog([`⚔️ Combat started! Champion Kane vs ${enemy.name}!`]);
    setInCombat(true);
  };
  
  const attack = async () => {
    if (!selectedEnemy || result || isAttacking) return;
    
    setIsAttacking(true);
    
    // Apply bond bonuses from all companions
    const totalBonusAtk = companions.reduce((acc, c) => acc + getBondBonus(c.id).atk, 0);

    // Player attacks
    const playerDmg = Math.floor(Math.random() * 15) + 15 + totalBonusAtk; // Kane is stronger
    const newEnemyHp = Math.max(0, enemyHp - playerDmg);
    setEnemyHp(newEnemyHp);
    
    try {
      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'attack',
          playerName: 'Kane',
          enemyName: selectedEnemy.name,
          damage: playerDmg
        })
      });
      const data = await res.json();
      if (data.narrative) {
        setCombatLog(prev => [`🏹 ${data.narrative}`, ...prev]);
      } else {
        setCombatLog(prev => [`🏹 Kane fires an arrow for ${playerDmg} damage!`, ...prev]);
      }
    } catch (err) {
      setCombatLog(prev => [`🏹 Kane fires an arrow for ${playerDmg} damage!`, ...prev]);
    }
    
    if (newEnemyHp <= 0) {
      setResult('win');
      addGold(selectedEnemy.reward);
      setCombatLog(prev => [`🎉 VICTORY! Kane defeated the enemy. Earned ${selectedEnemy.reward}💰`, ...prev]);
      setIsAttacking(false);
      return;
    }
    
    // Enemy attacks
    setTimeout(async () => {
      const enemyDmg = Math.floor(Math.random() * selectedEnemy.atk) + 5;
      const newPlayerHp = Math.max(0, playerHp - enemyDmg);
      setPlayerHp(newPlayerHp);
      
      try {
        const res = await fetch('/api/narrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'attack',
            playerName: selectedEnemy.name,
            enemyName: 'Kane',
            damage: enemyDmg
          })
        });
        const data = await res.json();
        if (data.narrative) {
          setCombatLog(prev => [`💥 ${data.narrative}`, ...prev]);
        } else {
          setCombatLog(prev => [`💥 ${selectedEnemy.name} strikes Kane for ${enemyDmg} damage!`, ...prev]);
        }
      } catch (err) {
        setCombatLog(prev => [`💥 ${selectedEnemy.name} strikes Kane for ${enemyDmg} damage!`, ...prev]);
      }
      
      if (newPlayerHp <= 0) {
        setResult('lose');
        setCombatLog(prev => [`💀 DEFEAT! Kane was defeated by ${selectedEnemy.name}`, ...prev]);
      }
      setIsAttacking(false);
    }, 1000);
  };
  
  const finishCombat = () => {
    setInCombat(false);
    setSelectedEnemy(null);
  };

  if (inCombat && selectedEnemy) {
    return (
      <div className="bg-slate-900/90 p-6 rounded-xl border border-red-500/20 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-red-500 uppercase tracking-tighter italic font-serif">Arena Combat</h2>
          <div className="bg-amber-500/10 px-4 py-1 rounded-full border border-amber-500/30 text-amber-400 font-bold text-sm">
            💰 {gold}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center mb-12 gap-8">
          <div className="flex justify-around w-full items-center">
            {/* Champion Kane */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className={`w-24 h-24 flex items-center justify-center bg-blue-900/20 rounded-2xl border-2 border-blue-500/30 shadow-inner overflow-hidden transition-all duration-300 ${isAttacking ? 'scale-110 translate-x-4' : ''}`}>
                  <div 
                    className="w-8 h-8 image-pixelated scale-[3]"
                    style={{
                      backgroundImage: `url(${isAttacking ? CHAMPION.attackImage : CHAMPION.idleImage})`,
                      backgroundSize: isAttacking ? '700% 100%' : '100% 100%',
                      backgroundPosition: isAttacking ? '0% 0%' : '0% 0%',
                      animation: isAttacking ? 'play-attack 0.8s steps(7) infinite' : 'none'
                    }}
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                  {CHAMPION.name}
                </div>
              </div>
              <div className="w-32 space-y-1">
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${playerHp}%` }} />
                </div>
                <div className="text-[8px] font-bold text-blue-400 text-center uppercase tracking-tighter">HP: {playerHp}/100</div>
              </div>
            </div>

            <div className="text-2xl font-black text-slate-700 italic">VS</div>

            {/* Enemy Display */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className={`w-24 h-24 flex items-center justify-center bg-red-900/20 rounded-2xl border-2 border-red-500/30 shadow-inner overflow-hidden transition-all duration-300 ${isAttacking ? 'animate-shake' : ''}`}>
                  {selectedEnemy.image ? (
                    <img src={selectedEnemy.image} alt={selectedEnemy.name} className="w-16 h-16 object-contain image-pixelated animate-bounce" />
                  ) : (
                    <span className="text-4xl">{selectedEnemy.emoji}</span>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                  {selectedEnemy.name}
                </div>
              </div>
              <div className="w-32 space-y-1">
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(enemyHp / selectedEnemy.hp) * 100}%` }} />
                </div>
                <div className="text-[8px] font-bold text-red-400 text-center uppercase tracking-tighter">HP: {enemyHp}/{selectedEnemy.hp}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          {!result ? (
            <>
              <button 
                onClick={attack}
                disabled={isAttacking}
                className="flex-1 py-4 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-black rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-sm"
              >
                {isAttacking ? 'Firing...' : '🏹 Archer Strike'}
              </button>
              <button 
                onClick={finishCombat}
                disabled={isAttacking}
                className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl transition-all uppercase text-[10px] tracking-widest border border-slate-700"
              >
                Flee
              </button>
            </>
          ) : (
            <button 
              onClick={finishCombat}
              className={`flex-1 py-4 font-black rounded-xl text-white transition-all transform hover:scale-[1.02] uppercase tracking-[0.2em] shadow-xl ${result === 'win' ? 'bg-green-600 shadow-green-900/40' : 'bg-slate-700'}`}
            >
              {result === 'win' ? 'Victory Achieved' : 'Return to Shop'}
            </button>
          )}
        </div>

        <div className="bg-black/50 p-4 rounded-xl h-32 overflow-y-auto border border-white/5 font-mono text-[10px] scrollbar-thin scrollbar-thumb-slate-800 leading-relaxed">
          {combatLog.map((log, i) => (
            <div key={i} className={`mb-1 ${i === 0 ? 'text-white font-bold' : 'text-slate-500'}`}>{log}</div>
          ))}
        </div>

        <style jsx>{`
          @keyframes play-attack {
            from { background-position: 0% 0%; }
            to { background-position: 700% 0%; }
          }
          .animate-shake {
            animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
          }
          @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 p-6 rounded-2xl border border-white/5 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2 font-serif italic">Divine Arena</h2>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest italic">Choose your opponent, test your bonds.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {ENEMIES.map((enemy) => (
          <button
            key={enemy.id}
            onClick={() => startCombat(enemy)}
            className="group p-4 bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-red-500/50 rounded-2xl transition-all text-left relative overflow-hidden"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-3xl border border-white/5 group-hover:border-red-500/30 transition-colors overflow-hidden">
                {enemy.image ? (
                  <img src={enemy.image} alt={enemy.name} className="w-12 h-12 object-contain image-pixelated" />
                ) : (
                  enemy.emoji
                )}
              </div>
              <div>
                <div className="font-black text-white uppercase tracking-tight group-hover:text-red-400 transition-colors">{enemy.name}</div>
                <div className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase mt-1">Reward {enemy.reward}💰</div>
              </div>
              <div className="ml-auto">
                 <span className="text-[10px] font-black text-slate-600 uppercase group-hover:text-red-500 transition-colors">Fight ⚔️</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
