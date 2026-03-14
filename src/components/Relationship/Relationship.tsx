'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Companion } from '@/types/game';

// Sample companions
const INITIAL_COMPANIONS: Companion[] = [
  {
    id: 'companion_1',
    name: 'Athena',
    title: 'Goddess of Wisdom',
    image: '👩‍🦱',
    description: 'A wise goddess who offers strategic advice.',
    affinity: 0,
    maxAffinity: 100,
    unlocked: true,
    quests: [
      {
        id: 'quest_1',
        title: 'First Meeting',
        description: 'Introduce yourself to Athena.',
        requiredAffinity: 0,
        rewards: { exp: 50, gold: 20, affinity: 10 },
        completed: false,
      },
    ],
  },
  {
    id: 'companion_2',
    name: 'Ares',
    title: 'God of War',
    image: '⚔️',
    description: 'A fierce warrior who trains in combat.',
    affinity: 0,
    maxAffinity: 100,
    unlocked: true,
    quests: [
      {
        id: 'quest_2',
        title: 'Trial by Combat',
        description: 'Prove your strength to Ares.',
        requiredAffinity: 20,
        rewards: { exp: 80, gold: 30, affinity: 15 },
        completed: false,
      },
    ],
  },
  {
    id: 'companion_3',
    name: 'Aphrodite',
    title: 'Goddess of Love',
    image: '💕',
    description: 'A charming goddess who can influence others.',
    affinity: 0,
    maxAffinity: 100,
    unlocked: false,
    quests: [],
  },
];

export default function Relationship() {
  const { game, setCompanions, updateCompanionAffinity, addLog, addExp, addGold, setPhase } = useGameStore();
  const { player, companions } = game;

  useEffect(() => {
    if (!companions) {
      setCompanions(INITIAL_COMPANIONS);
    }
  }, []);

  const talkToCompanion = (companion: Companion) => {
    const affinityGain = Math.floor(Math.random() * 5) + 1;
    updateCompanionAffinity(companion.id, affinityGain);
    addLog(`💬 Talked to ${companion.name}. Affinity +${affinityGain}!`, 'system');
  };

  const giveGift = (companion: Companion) => {
    if (player.gold >= 20) {
      useGameStore.getState().removeGold(20);
      const affinityGain = Math.floor(Math.random() * 10) + 5;
      updateCompanionAffinity(companion.id, affinityGain);
      addLog(`🎁 Gave gift to ${companion.name}. Affinity +${affinityGain}!`, 'system');
    } else {
      addLog('❌ Not enough gold for a gift!', 'system');
    }
  };

  const completeQuest = (companion: Companion, quest: Companion['quests'][0]) => {
    if (companion.affinity >= quest.requiredAffinity) {
      addExp(quest.rewards.exp);
      addGold(quest.rewards.gold);
      updateCompanionAffinity(companion.id, quest.rewards.affinity);
      addLog(`🎉 Quest completed! +${quest.rewards.exp} EXP, +${quest.rewards.gold} Gold!`, 'system');
    } else {
      addLog(`❌ Need ${quest.requiredAffinity} affinity to complete this quest!`, 'system');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-yellow-400">
          💕 Divine Relationships
        </h1>
        
        {/* Player Info */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
          <div className="flex justify-between items-center">
            <span className="font-bold">{player.name} (Lv.{player.level})</span>
            <span className="text-yellow-400">💰 {player.gold} Gold</span>
          </div>
        </div>

        {/* Companions */}
        <div className="space-y-4 mb-4">
          {companions?.map((companion) => (
            <div 
              key={companion.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{companion.image}</span>
                <div>
                  <div className="font-bold">{companion.name}</div>
                  <div className="text-sm text-gray-400">{companion.title}</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-3">{companion.description}</p>
              
              {/* Affinity Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Affinity</span>
                  <span>{companion.affinity}/{companion.maxAffinity}</span>
                </div>
                <div className="bg-gray-700 h-2 rounded overflow-hidden">
                  <div 
                    className="bg-pink-500 h-full transition-all"
                    style={{ width: `${(companion.affinity / companion.maxAffinity) * 100}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => talkToCompanion(companion)}
                  className="py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm transition"
                >
                  💬 Talk
                </button>
                <button
                  onClick={() => giveGift(companion)}
                  disabled={player.gold < 20}
                  className="py-2 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-sm transition disabled:opacity-50"
                >
                  🎁 Gift (20g)
                </button>
              </div>

              {/* Quests */}
              {companion.quests.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-sm font-bold mb-2">Quests:</div>
                  {companion.quests.map((quest) => (
                    <div 
                      key={quest.id}
                      className="bg-gray-700/50 rounded p-2 mb-2 text-sm"
                    >
                      <div className="flex justify-between">
                        <span className="font-bold">{quest.title}</span>
                        <span className="text-gray-400">Req: {quest.requiredAffinity}</span>
                      </div>
                      <div className="text-gray-400 text-xs">{quest.description}</div>
                      <button
                        onClick={() => completeQuest(companion, quest)}
                        disabled={companion.affinity < quest.requiredAffinity}
                        className="mt-2 w-full py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-bold transition disabled:opacity-50"
                      >
                        Complete Quest
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
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
