'use client';
import { useState } from 'react';

// Character sprites
const PLAYER_SPRITE = '/images/characters/player/minju/character_26/character_26_frame32x32.png';

const ENEMIES = [
  { id: 'slime', name: '🦠 Slime', hp: 30, atk: 5, reward: 20, sprite: null },
  { id: 'goblin', name: '👺 Goblin', hp: 50, atk: 10, reward: 40, sprite: null },
  { id: 'wolf', name: '🐺 Wolf', hp: 80, atk: 15, reward: 60, sprite: null },
  { id: 'dragon', name: '🐉 Dragon', hp: 150, atk: 25, reward: 100, sprite: null },
];

export default function Arena() {
  const [gold, setGold] = useState(500);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(50);
  const [turn, setTurn] = useState(1);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [selectedEnemy, setSelectedEnemy] = useState<typeof ENEMIES[0] | null>(null);
  const [inCombat, setInCombat] = useState(false);
  
  const startCombat = (enemy: typeof ENEMIES[0]) => {
    setSelectedEnemy(enemy);
    setEnemyHp(enemy.hp);
    setPlayerHp(100);
    setTurn(1);
    setResult(null);
    setCombatLog([`⚔️ Combat started: ${enemy.name}!`]);
    setInCombat(true);
  };
  
  const attack = () => {
    if (!selectedEnemy || result) return;
    
    // Player attacks
    const playerDmg = Math.floor(Math.random() * 15) + 10;
    const newEnemyHp = Math.max(0, enemyHp - playerDmg);
    setEnemyHp(newEnemyHp);
    setCombatLog(prev => [...prev, `⚔️ You dealt ${playerDmg} damage!`]);
    
    if (newEnemyHp <= 0) {
      setResult('win');
      setGold(g => g + selectedEnemy.reward);
      setCombatLog(prev => [...prev, `🎉 You won! +${selectedEnemy.reward} gold!`]);
      return;
    }
    
    // Enemy attacks
    setTimeout(() => {
      const enemyDmg = Math.floor(Math.random() * selectedEnemy.atk) + 5;
      const newPlayerHp = Math.max(0, playerHp - enemyDmg);
      setPlayerHp(newPlayerHp);
      setTurn(t => t + 1);
      setCombatLog(prev => [...prev, `${selectedEnemy.name} dealt ${enemyDmg} damage!`]);
      
      if (newPlayerHp <= 0) {
        setResult('lose');
        setCombatLog(prev => [...prev, `💀 You died!`]);
      }
    }, 500);
  };
  
  const flee = () => {
    setInCombat(false);
    setSelectedEnemy(null);
    setCombatLog([]);
  };
  
  if (inCombat && selectedEnemy) {
    return (
      <div style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>⚔️ Arena Combat</h2>
        
        {/* Sprites */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'center',
          marginBottom: '30px',
          padding: '20px',
          background: '#0f172a',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <img 
              src={PLAYER_SPRITE} 
              alt="Player"
              style={{ width: '64px', height: '64px', imageRendering: 'pixelated' }}
            />
            <div>👤 You</div>
          </div>
          <div style={{ fontSize: '2rem' }}>VS</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              background: '#1e293b',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}>
              {selectedEnemy.name.split(' ')[0]}
            </div>
            <div>{selectedEnemy.name.split(' ').slice(1).join(' ')}</div>
          </div>
        </div>
        
        {/* Health Bars */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>👤 You</span>
              <span>{playerHp}/100</span>
            </div>
            <div style={{ width: '100%', height: '20px', background: '#374151', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${playerHp}%`, 
                height: '100%', 
                background: playerHp > 50 ? '#22c55e' : playerHp > 25 ? '#eab308' : '#ef4444',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{selectedEnemy.name}</span>
              <span>{enemyHp}/{selectedEnemy.hp}</span>
            </div>
            <div style={{ width: '100%', height: '20px', background: '#374151', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${(enemyHp / selectedEnemy.hp) * 100}%`, 
                height: '100%', 
                background: '#ef4444',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={attack}
            disabled={!!result}
            style={{
              padding: '15px 30px',
              background: result ? '#6b7280' : '#ef4444',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: result ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            ⚔️ Attack
          </button>
          <button 
            onClick={flee}
            style={{
              padding: '15px 30px',
              background: '#6b7280',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🏃 Flee
          </button>
        </div>
        
        {/* Result */}
        {result && (
          <div style={{ 
            padding: '20px', 
            background: result === 'win' ? '#166534' : '#991b1b',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {result === 'win' ? '🎉 VICTORY!' : '💀 DEFEAT'}
            <br/>
            <button 
              onClick={flee}
              style={{
                marginTop: '10px',
                padding: '10px 20px',
                background: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Continue
            </button>
          </div>
        )}
        
        {/* Combat Log */}
        <div style={{ 
          background: '#1f2937', 
          padding: '10px', 
          borderRadius: '8px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          {combatLog.map((log, i) => (
            <div key={i} style={{ marginBottom: '5px', fontSize: '0.9rem' }}>{log}</div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>⚔️ Arena</h2>
      <p style={{ marginBottom: '20px', color: '#9ca3af' }}>Select an enemy to fight:</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
        {ENEMIES.map((enemy) => (
          <button
            key={enemy.id}
            onClick={() => startCombat(enemy)}
            style={{
              padding: '15px',
              background: '#374151',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span style={{ fontSize: '2rem' }}>{enemy.name.split(' ')[0]}</span>
            <span>{enemy.name.split(' ').slice(1).join(' ')}</span>
            <span style={{ color: '#ef4444' }}>HP: {enemy.hp}</span>
            <span style={{ color: '#fbbf24' }}>Reward: {enemy.reward}💰</span>
          </button>
        ))}
      </div>
    </div>
  );
}
