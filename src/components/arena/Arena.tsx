import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { gods, enemies } from '../../data/gods';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';

export const Arena: React.FC = () => {
  const { 
    selectedGod, selectGod, combatState, 
    startCombat, playerAttack, enemyAttack, endCombat, player 
  } = useGameStore();
  
  // ถ้ายังไม่ได้เลือกเทพ แสดงหน้าเลือกเทพ
  if (!selectedGod && !combatState.playerGod) {
    return (
      <div className="p-4">
        <h1 className="text-3xl font-bold text-red-400 mb-4">⚔️ อารีน่าแห่งทวยเทพ</h1>
        <p className="text-gray-300 mb-4">เลือกเทพที่จะสู้:</p>
        
        {player.god ? (
          <div className="mb-4 p-3 bg-amber-900/50 rounded-lg">
            <p className="text-amber-300">เทพที่เลือก: {player.god.nameTH}</p>
          </div>
        ) : (
          <p className="text-red-400 mb-4">⚠️ กรุณาเลือกเทพที่ Shop ก่อน!</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {gods.map(god => (
            <Card 
              key={god.id} 
              onClick={() => player.god && selectGod(god)}
              className="text-center"
            >
              <div className="text-5xl mb-2">{god.image}</div>
              <h3 className="font-bold text-xl text-amber-300">{god.nameTH}</h3>
              <p className="text-sm text-gray-400">{god.description}</p>
              <div className="mt-2 text-sm text-gray-300">
                <p>❤️ HP: {god.hp}</p>
                <p>⚔️ ATK: {god.attack}</p>
                <p>🛡️ DEF: {god.defense}</p>
              </div>
            </Card>
          ))}
        </div>
        
        <h2 className="text-xl text-red-300 mb-3">👹 เลือกศัตรู</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enemies.map(enemy => (
            <Card key={enemy.id} className="text-center">
              <div className="text-5xl mb-2">{enemy.image}</div>
              <h3 className="font-bold text-xl text-red-300">{enemy.nameTH}</h3>
              <div className="mt-2 text-sm text-gray-300">
                <p>❤️ HP: {enemy.hp}</p>
                <p>⚔️ ATK: {enemy.attack}</p>
                <p>🛡️ DEF: {enemy.defense}</p>
              </div>
              {selectedGod && (
                <Button 
                  className="mt-3"
                  onClick={() => startCombat(selectedGod, enemy)}
                >
                  ⚔️ สู้!
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // แสดง Combat
  return <CombatView />;
};

const CombatView: React.FC = () => {
  const { combatState, playerAttack, enemyAttack, endCombat, setPhase } = useGameStore();
  const { playerGod, enemy, log, isPlayerTurn, combatResult } = combatState;
  
  React.useEffect(() => {
    if (!isPlayerTurn && enemy && playerGod && !combatResult) {
      const timer = setTimeout(() => enemyAttack(), 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, enemy, playerGod, combatResult]);
  
  if (!playerGod || !enemy) return null;
  
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-red-400 mb-4">⚔️ สนามรบ</h1>
      
      {/* Combat Result */}
      {combatResult && (
        <div className={`text-center mb-6 p-6 rounded-xl ${combatResult === 'win' ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
          <h2 className="text-4xl font-bold mb-4">
            {combatResult === 'win' ? '🎉 ชนะ!' : '💀 แพ้!'}
          </h2>
          <Button onClick={() => { endCombat(combatResult); setPhase('shop'); }}>
            กลับร้านค้า
          </Button>
        </div>
      )}
      
      {/* Combat Area */}
      <div className="flex justify-between items-center mb-8">
        {/* Player */}
        <div className="text-center">
          <div className="text-6xl mb-2">{playerGod.image}</div>
          <h3 className="font-bold text-xl text-amber-300">{playerGod.nameTH}</h3>
          <div className="w-48 mt-2">
            <ProgressBar current={playerGod.hp} max={playerGod.maxHp} color="bg-green-500" />
            <p className="text-sm text-gray-300 mt-1">{playerGod.hp}/{playerGod.maxHp} HP</p>
          </div>
        </div>
        
        <div className="text-4xl">VS</div>
        
        {/* Enemy */}
        <div className="text-center">
          <div className="text-6xl mb-2">{enemy.image}</div>
          <h3 className="font-bold text-xl text-red-300">{enemy.nameTH}</h3>
          <div className="w-48 mt-2">
            <ProgressBar current={enemy.hp} max={enemy.maxHp} color="bg-red-500" />
            <p className="text-sm text-gray-300 mt-1">{enemy.hp}/{enemy.maxHp} HP</p>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      {!combatResult && (
        <div className="text-center mb-6">
          {isPlayerTurn ? (
            <Button onClick={playerAttack} className="text-xl px-8 py-3">
              ⚔️ โจมตี
            </Button>
          ) : (
            <p className="text-yellow-400 animate-pulse">⏳ รอศัตรูโจมตี...</p>
          )}
        </div>
      )}
      
      {/* Combat Log */}
      <div className="bg-gray-900 rounded-lg p-4 h-48 overflow-y-auto">
        {log.map((entry, i) => (
          <p key={i} className="text-gray-300 mb-1">{entry}</p>
        ))}
      </div>
    </div>
  );
};
