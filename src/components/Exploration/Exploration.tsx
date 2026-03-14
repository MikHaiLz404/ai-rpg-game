'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { ExplorationNode } from '@/types/game';

// Sample exploration map
const EXPLORATION_NODES: ExplorationNode[] = [
  {
    id: 'node_1',
    name: 'Forest of Beginnings',
    description: 'A mysterious forest where many gods first awaken.',
    type: 'enemy',
    difficulty: 1,
    visited: false,
    rewards: { exp: 20, gold: 10 },
  },
  {
    id: 'node_2',
    name: 'Ancient Shrine',
    description: 'A shrine dedicated to the old gods.',
    type: 'treasure',
    difficulty: 1,
    visited: false,
    rewards: { exp: 15, gold: 25 },
  },
  {
    id: 'node_3',
    name: 'Peaceful Glade',
    description: 'A quiet place to rest and recover.',
    type: 'rest',
    difficulty: 1,
    visited: false,
  },
  {
    id: 'node_4',
    name: 'Cavern of Trials',
    description: 'Dark caverns filled with dangerous enemies.',
    type: 'enemy',
    difficulty: 2,
    visited: false,
    rewards: { exp: 40, gold: 30 },
  },
  {
    id: 'node_5',
    name: 'Mysterious Portal',
    description: 'A glowing portal that leads to unknown places.',
    type: 'mystery',
    difficulty: 2,
    visited: false,
  },
  {
    id: 'node_6',
    name: 'Dragon\'s Lair',
    description: 'The legendary lair of an ancient dragon god.',
    type: 'boss',
    difficulty: 5,
    visited: false,
    rewards: { exp: 200, gold: 100 },
  },
];

export default function Exploration() {
  const { game, setExplorationNodes, setPhase, addLog, healPlayer, addExp, addGold, setCurrentNode, updateExplorationNode } = useGameStore();
  const { player, exploration } = game;

  useEffect(() => {
    if (!exploration) {
      setExplorationNodes(EXPLORATION_NODES);
    }
  }, []);

  const handleNodeClick = (node: ExplorationNode) => {
    if (node.visited) return;
    
    setCurrentNode(node.id);
    addLog(`📍 Entering: ${node.name}`, 'system');
    
    // Handle different node types
    switch (node.type) {
      case 'rest':
        healPlayer(50);
        addLog('✨ You rest and recover 50 HP!', 'system');
        updateExplorationNode(node.id, { visited: true });
        break;
      case 'treasure':
        if (node.rewards) {
          addExp(node.rewards.exp || 0);
          addGold(node.rewards.gold || 0);
          addLog(`🎁 Found treasure! +${node.rewards.exp} EXP, +${node.rewards.gold} Gold!`, 'system');
        }
        updateExplorationNode(node.id, { visited: true });
        break;
      case 'enemy':
      case 'boss':
        setPhase('combat');
        break;
      case 'mystery':
        // Random event
        const rand = Math.random();
        if (rand < 0.3) {
          healPlayer(30);
          addLog('🎁 Mystery gift! +30 HP!', 'system');
        } else if (rand < 0.6) {
          addGold(20);
          addLog('💰 Found hidden gold! +20 Gold!', 'system');
        } else {
          addLog('🔮 The portal fades away... nothing happens.', 'system');
        }
        updateExplorationNode(node.id, { visited: true });
        break;
    }
  };

  const visitedCount = exploration?.nodes.filter(n => n.visited).length || 0;
  const totalNodes = exploration?.nodes.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-yellow-400">
          🗺️ Divine Exploration
        </h1>
        
        {/* Player Stats */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
          <div className="flex justify-between items-center">
            <span className="font-bold">{player.name} (Lv.{player.level})</span>
            <span className="text-sm text-gray-400">Explored: {visitedCount}/{totalNodes}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm mt-2">
            <div>❤️ HP: {player.hp}/{player.maxHp}</div>
            <div>💎 MP: {player.mp}/{player.maxMp}</div>
            <div>💰 Gold: {player.gold}</div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
          <h2 className="font-bold mb-3 text-lg">Map</h2>
          <div className="grid grid-cols-2 gap-2">
            {exploration?.nodes.map((node) => (
              <button
                key={node.id}
                onClick={() => handleNodeClick(node)}
                disabled={node.visited}
                className={`p-3 rounded-lg text-left transition ${
                  node.visited 
                    ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                    : node.type === 'boss'
                      ? 'bg-red-900/50 border border-red-600 hover:bg-red-800'
                      : node.type === 'mystery'
                        ? 'bg-purple-900/50 border border-purple-600 hover:bg-purple-800'
                        : node.type === 'treasure'
                          ? 'bg-yellow-900/50 border border-yellow-600 hover:bg-yellow-800'
                          : node.type === 'rest'
                            ? 'bg-green-900/50 border border-green-600 hover:bg-green-800'
                            : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="font-bold text-sm">
                  {node.type === 'enemy' && '⚔️'}
                  {node.type === 'boss' && '🐉'}
                  {node.type === 'treasure' && '💎'}
                  {node.type === 'mystery' && '🔮'}
                  {node.type === 'rest' && '✨'}
                  {' '}{node.name}
                </div>
                <div className="text-xs text-gray-400">
                  {node.type === 'rest' ? 'Rest' : `Difficulty: ${'★'.repeat(node.difficulty)}`}
                </div>
              </button>
            ))}
          </div>
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
