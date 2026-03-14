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
    image: '/images/enemies/slime/idle/frame_1_0.png' // First valid frame of slime
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
  { 
    id: 'skeleton', 
    name: 'Skeleton', 
    emoji: '💀', 
    hp: 70, 
    atk: 12, 
    reward: 50,
    image: null
  },
  { 
    id: 'demon', 
    name: 'Demon', 
    emoji: '😈', 
    hp: 100, 
    atk: 20, 
    reward: 80,
    image: null
  },
  { 
    id: 'dragon', 
    name: 'Dragon', 
    emoji: '🐉', 
    hp: 200, 
    atk: 30, 
    reward: 150,
    image: null
  },
];

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
    setCombatLog([`⚔️ Combat started against ${enemy.name}!`]);
    setInCombat(true);
  };
  
  const attack = async () => {
    if (!selectedEnemy || result || isAttacking) return;
    
    setIsAttacking(true);
    
    // Apply bond bonuses from all companions
    const totalBonusAtk = companions.reduce((acc, c) => acc + getBondBonus(c.id).atk, 0);

    // Player attacks
    const playerDmg = Math.floor(Math.random() * 15) + 10 + totalBonusAtk;
    const newEnemyHp = Math.max(0, enemyHp - playerDmg);
    setEnemyHp(newEnemyHp);
    
    try {
      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'attack',
          playerName: 'Minju',
          enemyName: selectedEnemy.name,
          damage: playerDmg
        })
      });
      const data = await res.json();
      if (data.narrative) {
        setCombatLog(prev => [`⚔️ ${data.narrative}`, ...prev]);
      } else {
        setCombatLog(prev => [`⚔️ You dealt ${playerDmg} damage!`, ...prev]);
      }
    } catch (err) {
      setCombatLog(prev => [`⚔️ You dealt ${playerDmg} damage!`, ...prev]);
    }
    
    if (newEnemyHp <= 0) {
      setResult('win');
      addGold(selectedEnemy.reward);
      setCombatLog(prev => [`🎉 VICTORY! You earned ${selectedEnemy.reward}💰`, ...prev]);
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
            enemyName: 'Minju',
            damage: enemyDmg
          })
        });
        const data = await res.json();
        if (data.narrative) {
          setCombatLog(prev => [`💥 ${data.narrative}`, ...prev]);
        } else {
          setCombatLog(prev => [`💥 ${selectedEnemy.name} dealt ${enemyDmg} damage!`, ...prev]);
        }
      } catch (err) {
        setCombatLog(prev => [`💥 ${selectedEnemy.name} dealt ${enemyDmg} damage!`, ...prev]);
      }
      
      if (newPlayerHp <= 0) {
        setResult('lose');
        setCombatLog(prev => [`💀 DEFEAT! You were defeated by ${selectedEnemy.name}`, ...prev]);
      }
      setIsAttacking(false);
    }, 800);
  };
  
  const finishCombat = () => {
    setInCombat(false);
    setSelectedEnemy(null);
  };

  if (inCombat && selectedEnemy) {
    return (
      <div className="bg-slate-900/90 p-6 rounded-xl border border-red-500/20 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-red-500 uppercase tracking-tighter italic">Battle Phase</h2>
          <div className="bg-amber-500/10 px-4 py-1 rounded-full border border-amber-500/30 text-amber-400 font-bold text-sm">
            💰 {gold}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center mb-12 gap-8">
          {/* Enemy Display */}
          <div className="relative group">
            <div className={`w-32 h-32 flex items-center justify-center bg-slate-800 rounded-3xl border-4 border-red-500/30 shadow-2xl overflow-hidden transition-all duration-300 ${isAttacking ? 'scale-95 blur-[1px]' : 'group-hover:scale-105'}`}>
              {selectedEnemy.image ? (
                <img 
                  src={selectedEnemy.image} 
                  alt={selectedEnemy.name} 
                  className="w-24 h-24 object-contain image-pixelated animate-bounce" 
                  style={{ animationDuration: '3s' }}
                />
              ) : (
                <span className="text-6xl">{selectedEnemy.emoji}</span>
              )}
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
              {selectedEnemy.name}
            </div>
          </div>

          <div className="w-full max-w-md space-y-6">
            {/* Enemy HP */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black text-red-400 uppercase tracking-widest">
                <span>Enemy Health</span>
                <span>{enemyHp} / {selectedEnemy.hp} HP</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-500 rounded-full"
                  style={{ width: `${(enemyHp / selectedEnemy.hp) * 100}%` }}
                />
              </div>
            </div>

            {/* Player HP */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black text-blue-400 uppercase tracking-widest">
                <span>Your Health</span>
                <span>{playerHp} / 100 HP</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 rounded-full"
                  style={{ width: `${playerHp}%` }}
                />
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
                className="flex-1 py-5 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-900/40 active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-lg"
              >
                {isAttacking ? 'Wait...' : '⚔️ Strike'}
              </button>
              <button 
                onClick={finishCombat}
                disabled={isAttacking}
                className="px-8 py-5 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-2xl transition-all uppercase text-xs tracking-widest border border-slate-700"
              >
                Flee
              </button>
            </>
          ) : (
            <button 
              onClick={finishCombat}
              className={`flex-1 py-5 font-black rounded-2xl text-white transition-all transform hover:scale-[1.02] uppercase tracking-[0.2em] shadow-2xl ${result === 'win' ? 'bg-green-600 shadow-green-900/40' : 'bg-slate-700'}`}
            >
              {result === 'win' ? 'Victory Achieved' : 'Return to Shop'}
            </button>
          )}
        </div>

        <div className="bg-black/50 p-4 rounded-2xl h-32 overflow-y-auto border border-white/5 font-mono text-xs scrollbar-thin scrollbar-thumb-slate-800 leading-relaxed">
          {combatLog.map((log, i) => (
            <div key={i} className={`mb-2 ${i === 0 ? 'text-white font-bold' : 'text-slate-500'}`}>{log}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 p-6 rounded-2xl border border-white/5 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">Divine Arena</h2>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest italic">Choose your opponent, test your bonds.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ENEMIES.map((enemy) => (
          <button
            key={enemy.id}
            onClick={() => startCombat(enemy)}
            className="group p-4 bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-red-500/50 rounded-2xl transition-all text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
               <span className="text-4xl font-black uppercase italic">{enemy.name[0]}</span>
            </div>
            
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
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mb-1">Rank {enemy.reward / 20} Entity</div>
                <div className="flex gap-2">
                  <span className="text-[9px] font-black text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded uppercase">ATK {enemy.atk}</span>
                  <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase">Reward {enemy.reward}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
