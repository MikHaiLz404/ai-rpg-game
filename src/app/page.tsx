'use client';

import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { ActionType, Enemy } from '@/types/game';

// Components
import Arena from '@/components/Arena';
import Shop from '@/components/Shop';
import Exploration from '@/components/Exploration';
import Relationship from '@/components/Relationship';

// Sample enemies
const ENEMIES: Omit<Enemy, 'hp'>[] = [
  { name: 'Slime', maxHp: 30, atk: 5, def: 2, exp: 10, gold: 5, rank: 1 },
  { name: 'Goblin', maxHp: 50, atk: 8, def: 3, exp: 20, gold: 10, rank: 1 },
  { name: 'Wolf', maxHp: 45, atk: 10, def: 2, exp: 25, gold: 12, rank: 2 },
  { name: 'Orc', maxHp: 80, atk: 12, def: 5, exp: 40, gold: 20, rank: 2 },
  { name: 'Dragon', maxHp: 150, atk: 20, def: 8, exp: 100, gold: 50, rank: 3 },
];

function createEnemy(index: number): Enemy {
  const template = ENEMIES[Math.min(index, ENEMIES.length - 1)];
  return {
    ...template,
    hp: template.maxHp,
  };
}

function CombatView() {
  const { 
    game, 
    setPhase, 
    addLog, 
    clearLogs, 
    setCurrentEnemy, 
    setTurn,
    updatePlayer,
    incrementBattleCount,
    addExp,
    addGold,
    restoreMp
  } = useGameStore();
  
  const { player, currentEnemy, turn, logs, battleCount } = game;
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [narrative, setNarrative] = React.useState<string>('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const generateNarrative = async (action: ActionType, playerName: string, enemyName: string, damage: number) => {
    setIsGenerating(true);
    setNarrative('✨ AI is weaving the story...');
    
    try {
      const response = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, playerName, enemyName, damage }),
      });
      
      if (!response.ok) throw new Error('Failed to generate');
      
      const data = await response.json();
      setNarrative(data.narrative || '');
    } catch (e) {
      const fallbacks: Record<ActionType, string> = {
        attack: `⚔️ ${playerName} strikes ${enemyName} with mighty blow!`,
        defend: `🛡️ ${playerName} raises their shield, ready for anything!`,
        heal: `✨ A warm light surrounds ${playerName}, healing their wounds!`,
        fireball: `🔥 ${playerName} casts a blazing fireball at ${enemyName}!`,
      };
      setNarrative(fallbacks[action]);
    } finally {
      setIsGenerating(false);
    }
  };

  const startBattle = () => {
    const enemy = createEnemy(battleCount);
    setCurrentEnemy(enemy);
    setTurn('player');
    clearLogs();
    addLog(`⚔️ A wild ${enemy.name} appears!`, 'system');
  };

  const handleAction = async (action: ActionType) => {
    if (turn !== 'player' || !currentEnemy) return;

    let updatedPlayer = { ...player };
    let enemy = { ...currentEnemy };
    let damage = 0;

    switch (action) {
      case 'attack':
        damage = Math.max(1, player.atk - enemy.def + Math.floor(Math.random() * 5));
        enemy.hp = Math.max(0, enemy.hp - damage);
        addLog(`⚔️ You attack ${enemy.name} for ${damage} damage!`, 'player');
        break;
        
      case 'defend':
        addLog(`🛡️ You brace yourself for the next attack!`, 'player');
        break;
        
      case 'heal':
        if (player.mp >= 10) {
          const healAmount = 20;
          updatedPlayer.hp = Math.min(player.maxHp, player.hp + healAmount);
          updatedPlayer.mp = player.mp - 10;
          addLog(`✨ You heal for ${healAmount} HP!`, 'player');
          updatePlayer({ hp: updatedPlayer.hp, mp: updatedPlayer.mp });
        } else {
          addLog(`❌ Not enough MP!`, 'system');
          return;
        }
        break;
        
      case 'fireball':
        if (player.mp >= 15) {
          damage = Math.max(1, player.atk * 2 - enemy.def + Math.floor(Math.random() * 10));
          enemy.hp = Math.max(0, enemy.hp - damage);
          updatedPlayer.mp = player.mp - 15;
          addLog(`🔥 Fireball hits ${enemy.name} for ${damage} damage!`, 'player');
          updatePlayer({ mp: updatedPlayer.mp });
        } else {
          addLog(`❌ Not enough MP!`, 'system');
          return;
        }
        break;
    }

    await generateNarrative(action, player.name, enemy.name, damage);

    if (enemy.hp <= 0) {
      addExp(enemy.exp);
      addGold(enemy.gold);
      restoreMp(5);
      setCurrentEnemy(null);
      incrementBattleCount();
      addLog(`🎉 Victory! Gained ${enemy.exp} EXP and ${enemy.gold} gold!`, 'system');
      setPhase('victory');
      return;
    }

    setCurrentEnemy(enemy);
    setTurn('enemy');

    setTimeout(() => {
      const enemyDmg = Math.max(1, enemy.atk - player.def + Math.floor(Math.random() * 3));
      const isDefending = action === 'defend';
      const finalDmg = isDefending ? Math.floor(enemyDmg / 2) : enemyDmg;
      
      const newHp = Math.max(0, player.hp - finalDmg);
      updatePlayer({ hp: newHp });
      
      if (isDefending) {
        addLog(`🛡️ You blocked! ${enemy.name} deals only ${finalDmg} damage!`, 'enemy');
      } else {
        addLog(`👾 ${enemy.name} attacks you for ${finalDmg} damage!`, 'enemy');
      }

      if (newHp <= 0) {
        setPhase('defeat');
        addLog(`💀 You have been defeated...`, 'system');
      } else {
        setTurn('player');
      }
    }, 500);
  };

  // Auto-start battle when entering combat
  React.useEffect(() => {
    if (!currentEnemy && player.hp > 0) {
      startBattle();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-yellow-400">
          ⚔️ AI RPG Adventure
        </h1>

        {/* Player Stats */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-lg">{player.name}</span>
            <span className="text-sm text-gray-400">Battle #{battleCount + 1}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8">❤️</span>
              <div className="flex-1 bg-gray-700 h-4 rounded overflow-hidden">
                <div 
                  className="bg-red-500 h-full transition-all"
                  style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                />
              </div>
              <span className="text-sm w-20">{player.hp}/{player.maxHp}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8">💎</span>
              <div className="flex-1 bg-gray-700 h-4 rounded overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${(player.mp / player.maxMp) * 100}%` }}
                />
              </div>
              <span className="text-sm w-20">{player.mp}/{player.maxMp}</span>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            ATK: {player.atk} | DEF: {player.def} | 💰 {player.gold}
          </div>
        </div>

        {/* Enemy */}
        {currentEnemy && (
          <div className="bg-red-900/30 rounded-lg p-4 mb-4 border border-red-700">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg text-red-400">{currentEnemy.name}</span>
              <span className="text-sm text-gray-400">Rank {currentEnemy.rank}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8">👾</span>
              <div className="flex-1 bg-gray-700 h-4 rounded overflow-hidden">
                <div 
                  className="bg-red-500 h-full transition-all"
                  style={{ width: `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%` }}
                />
              </div>
              <span className="text-sm w-20">{currentEnemy.hp}/{currentEnemy.maxHp}</span>
            </div>
          </div>
        )}

        {/* Narrative */}
        {narrative && (
          <div className="bg-purple-900/30 rounded-lg p-4 mb-4 border border-purple-700">
            <p className="text-purple-200">{narrative}</p>
          </div>
        )}

        {/* Game Log */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4 h-48 overflow-y-auto border border-gray-700">
          {logs.map((log, i) => (
            <div 
              key={i} 
              className={`mb-1 ${
                log.type === 'player' ? 'text-blue-300' :
                log.type === 'enemy' ? 'text-red-300' :
                log.type === 'narrative' ? 'text-purple-300' :
                'text-gray-400'
              }`}
            >
              {log.message}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>

        {/* Actions */}
        {turn === 'player' && currentEnemy && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAction('attack')}
              disabled={isGenerating}
              className="py-3 bg-red-600 hover:bg-red-500 rounded-lg font-bold transition disabled:opacity-50"
            >
              ⚔️ Attack
            </button>
            <button
              onClick={() => handleAction('defend')}
              disabled={isGenerating}
              className="py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition disabled:opacity-50"
            >
              🛡️ Defend
            </button>
            <button
              onClick={() => handleAction('heal')}
              disabled={isGenerating || player.mp < 10}
              className="py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition disabled:opacity-50"
            >
              ✨ Heal (10 MP)
            </button>
            <button
              onClick={() => handleAction('fireball')}
              disabled={isGenerating || player.mp < 15}
              className="py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition disabled:opacity-50"
            >
              🔥 Fireball (15 MP)
            </button>
          </div>
        )}

        {game.phase === 'victory' && (
          <button
            onClick={() => setPhase('exploration')}
            className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-lg transition"
          >
            🏆 Continue Adventure
          </button>
        )}

        {game.phase === 'defeat' && (
          <button
            onClick={() => {
              useGameStore.getState().updatePlayer({ hp: player.maxHp, mp: player.maxMp });
              setPhase('start');
            }}
            className="w-full py-4 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold text-lg transition"
          >
            🔄 Return to Menu
          </button>
        )}
      </div>
    </div>
  );
}

function MainMenu() {
  const { game, setPhase, healPlayer } = useGameStore();
  const { player } = game;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-yellow-400">
          ⚔️ Gods' Arena
        </h1>
        <p className="text-center text-gray-400 mb-8">RPG Adventure</p>

        {/* Player Stats */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-lg">{player.name}</span>
            <span className="text-yellow-400">Level {player.level}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>❤️ HP: {player.hp}/{player.maxHp}</div>
            <div>💎 MP: {player.mp}/{player.maxMp}</div>
            <div>💰 Gold: {player.gold}</div>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            ATK: {player.atk} | DEF: {player.def}
          </div>
          <div className="mt-2">
            <div className="text-xs text-gray-400 mb-1">EXP: {player.exp}/{player.expToNextLevel}</div>
            <div className="bg-gray-700 h-2 rounded overflow-hidden">
              <div 
                className="bg-yellow-500 h-full transition-all"
                style={{ width: `${(player.exp / player.expToNextLevel) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Menu Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              healPlayer(player.maxHp);
              setPhase('exploration');
            }}
            className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-lg transition"
          >
            🗺️ Exploration
          </button>
          
          <button
            onClick={() => setPhase('arena')}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-lg transition"
          >
            🏟️ Arena
          </button>
          
          <button
            onClick={() => setPhase('shop')}
            className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-bold text-lg transition"
          >
            🏪 Shop
          </button>
          
          <button
            onClick={() => setPhase('relationship')}
            className="w-full py-4 bg-pink-600 hover:bg-pink-500 rounded-lg font-bold text-lg transition"
          >
            💕 Relationships
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RPGGame() {
  const { game } = useGameStore();
  const { phase } = game;

  switch (phase) {
    case 'start':
      return <MainMenu />;
    case 'arena':
      return <Arena />;
    case 'shop':
      return <Shop />;
    case 'exploration':
      return <Exploration />;
    case 'relationship':
      return <Relationship />;
    case 'combat':
    case 'victory':
    case 'defeat':
      return <CombatView />;
    default:
      return <MainMenu />;
  }
}
