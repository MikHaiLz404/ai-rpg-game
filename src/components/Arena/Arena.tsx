'use client';

import { useGameStore } from '@/store/gameStore';
import { ArenaMatch, ArenaResult } from '@/types/game';

export default function Arena() {
  const { game, setPhase, addLog, setArenaMatch } = useGameStore();
  const { player, arena } = game;

  const startArenaMatch = () => {
    // TODO: Create arena match logic
    addLog('🏟️ Welcome to the Arena of the Gods!', 'system');
    setPhase('combat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-yellow-400">
          🏟️ Arena of the Gods
        </h1>
        
        {/* Player Stats */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-lg">{player.name}</span>
            <span className="text-sm text-gray-400">Level {player.level}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>❤️ HP: {player.hp}/{player.maxHp}</div>
            <div>💎 MP: {player.mp}/{player.maxMp}</div>
            <div>💰 Gold: {player.gold}</div>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            ATK: {player.atk} | DEF: {player.def}
          </div>
        </div>

        {/* Arena Info */}
        <div className="bg-purple-900/30 rounded-lg p-6 mb-4 border border-purple-700 text-center">
          <p className="text-lg mb-4">
            Battle against other gods in the celestial arena!
          </p>
          <button
            onClick={startArenaMatch}
            className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-bold text-lg transition"
          >
            ⚔️ Enter Arena
          </button>
        </div>

        {/* Back to Menu */}
        <button
          onClick={() => setPhase('start')}
          className="w-full py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold transition"
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  );
}
