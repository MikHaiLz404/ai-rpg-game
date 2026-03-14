import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Shop } from './shop/Shop';
import { Arena } from './arena/Arena';
import { Relationship } from './relationship/Relationship';
import { Button } from './ui/Button';

export const Game: React.FC = () => {
  const { phase, setPhase, player } = useGameStore();
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4 border-b border-amber-500/30">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-amber-400">🏛️ Gods' Arena</h1>
          <div className="flex items-center gap-4">
            <span className="text-xl">💰 {player.gold}</span>
            {player.god && (
              <span className="text-lg">{player.god.image} {player.god.nameTH}</span>
            )}
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-gray-800/50 p-2">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Button 
            variant={phase === 'shop' ? 'primary' : 'secondary'}
            onClick={() => setPhase('shop')}
          >
            🏪 ร้านค้า
          </Button>
          <Button 
            variant={phase === 'arena' ? 'primary' : 'secondary'}
            onClick={() => setPhase('arena')}
          >
            ⚔️ อารีน่า
          </Button>
          <Button 
            variant={phase === 'relationship' ? 'primary' : 'secondary'}
            onClick={() => setPhase('relationship')}
          >
            💕 ความสัมพันธ์
          </Button>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6">
        {phase === 'shop' && <Shop />}
        {phase === 'arena' && <Arena />}
        {phase === 'relationship' && <Relationship />}
      </main>
    </div>
  );
};
