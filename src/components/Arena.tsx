'use client';
import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';

const ENEMIES = [
  { id: 'slime', name: 'Slime', emoji: '🦠', hp: 30, atk: 5, reward: 20 },
  { id: 'goblin', name: 'Goblin', emoji: '👺', hp: 50, atk: 10, reward: 40 },
  { id: 'wolf', name: 'Wolf', emoji: '🐺', hp: 80, atk: 15, reward: 60 },
  { id: 'dragon', name: 'Dragon', emoji: '🐉', hp: 150, atk: 25, reward: 100 },
];

export default function Arena() {
  const { gold, addGold } = useGameStore();
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(0);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [selectedEnemy, setSelectedEnemy] = useState<typeof ENEMIES[0] | null>(null);
  const [inCombat, setInCombat] = useState(false);
  
  const startCombat = (enemy: typeof ENEMIES[0]) => {
    setSelectedEnemy(enemy);
    setEnemyHp(enemy.hp);
    setPlayerHp(100);
    setResult(null);
    setCombatLog([`⚔️ Combat started against ${enemy.emoji} ${enemy.name}!`]);
    setInCombat(true);
  };
  
  const attack = () => {
    if (!selectedEnemy || result) return;
    
    // Player attacks
    const playerDmg = Math.floor(Math.random() * 15) + 10;
    const newEnemyHp = Math.max(0, enemyHp - playerDmg);
    setEnemyHp(newEnemyHp);
    setCombatLog(prev => [`⚔️ You dealt ${playerDmg} damage!`, ...prev]);
    
    if (newEnemyHp <= 0) {
      setResult('win');
      addGold(selectedEnemy.reward);
      setCombatLog(prev => [`🎉 VICTORY! You earned ${selectedEnemy.reward}💰`, ...prev]);
      return;
    }
    
    // Enemy attacks
    setTimeout(() => {
      const enemyDmg = Math.floor(Math.random() * selectedEnemy.atk) + 5;
      const newPlayerHp = Math.max(0, playerHp - enemyDmg);
      setPlayerHp(newPlayerHp);
      setCombatLog(prev => [`💥 ${selectedEnemy.emoji} ${selectedEnemy.name} dealt ${enemyDmg} damage!`, ...prev]);
      
      if (newPlayerHp <= 0) {
        setResult('lose');
        setCombatLog(prev => [`💀 DEFEAT! You were defeated by ${selectedEnemy.name}`, ...prev]);
      }
    }, 400);
  };
  
  const finishCombat = () => {
    setInCombat(false);
    setSelectedEnemy(null);
  };

  if (inCombat && selectedEnemy) {
    return (
      <div className="bg-slate-900/80 p-6 rounded-xl border border-red-900/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-red-500">⚔️ Battle in Progress</h2>
          <div className="text-amber-400 font-bold">💰 {gold}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Player side */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-blue-500/20">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xl font-bold">👤 Hero</span>
              <span className="text-sm">{playerHp} / 100 HP</span>
            </div>
            <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${playerHp}%` }}
              />
            </div>
          </div>

          {/* Enemy side */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-red-500/20">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xl font-bold">{selectedEnemy.emoji} {selectedEnemy.name}</span>
              <span className="text-sm">{enemyHp} / {selectedEnemy.hp} HP</span>
            </div>
            <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${(enemyHp / selectedEnemy.hp) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          {!result ? (
            <>
              <button 
                onClick={attack}
                className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-red-900/20"
              >
                ⚔️ ATTACK
              </button>
              <button 
                onClick={finishCombat}
                className="px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                🏃 FLEE
              </button>
            </>
          ) : (
            <button 
              onClick={finishCombat}
              className={`flex-1 py-4 font-bold rounded-lg text-white ${result === 'win' ? 'bg-green-600 hover:bg-green-500' : 'bg-slate-600 hover:bg-slate-500'}`}
            >
              {result === 'win' ? 'CONTINUE VICTORIOUS' : 'RETURN TO CAMP'}
            </button>
          )}
        </div>

        <div className="bg-black/40 p-4 rounded-lg h-40 overflow-y-auto border border-slate-800 font-mono text-sm">
          {combatLog.map((log, i) => (
            <div key={i} className={`mb-1 ${i === 0 ? 'text-white' : 'text-slate-500'}`}>{log}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700">
      <h2 className="text-2xl font-bold mb-6 text-red-400">⚔️ Divine Arena</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ENEMIES.map((enemy) => (
          <button
            key={enemy.id}
            onClick={() => startCombat(enemy)}
            className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-red-500/50 rounded-xl transition-all flex flex-col items-center gap-3 group"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">{enemy.emoji}</span>
            <div className="text-center">
              <div className="font-bold">{enemy.name}</div>
              <div className="text-xs text-red-400">HP: {enemy.hp}</div>
              <div className="text-xs text-amber-500">💰 {enemy.reward}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
