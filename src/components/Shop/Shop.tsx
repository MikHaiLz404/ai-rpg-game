'use client';

import { useGameStore } from '@/store/gameStore';
import { ShopItem } from '@/types/game';

// Sample shop items
const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'potion_hp',
    name: 'Health Potion',
    description: 'Restores 50 HP',
    type: 'potion',
    price: 50,
    effect: { hp: 50 },
  },
  {
    id: 'potion_mp',
    name: 'Mana Potion',
    description: 'Restores 30 MP',
    type: 'potion',
    price: 40,
    effect: { mp: 30 },
  },
  {
    id: 'weapon_bronze',
    name: 'Bronze Sword',
    description: 'ATK +5',
    type: 'weapon',
    price: 200,
    effect: { atk: 5 },
  },
  {
    id: 'armor_bronze',
    name: 'Bronze Armor',
    description: 'DEF +3',
    type: 'armor',
    price: 150,
    effect: { def: 3 },
  },
  {
    id: 'accessory_ring',
    name: 'Power Ring',
    description: 'ATK +2, DEF +2',
    type: 'accessory',
    price: 300,
    effect: { atk: 2, def: 2 },
  },
];

export default function Shop() {
  const { game, addGold, removeGold, addToInventory, addLog } = useGameStore();
  const { player } = game;

  const buyItem = (item: ShopItem) => {
    if (player.gold >= item.price) {
      removeGold(item.price);
      addToInventory(item);
      addLog(`🛒 Bought ${item.name} for ${item.price} gold!`, 'system');
    } else {
      addLog(`❌ Not enough gold! Need ${item.price} gold.`, 'system');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-yellow-400">
          🏪 Divine Shop
        </h1>
        
        {/* Player Gold */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">{player.name}</span>
            <span className="text-yellow-400 font-bold">💰 {player.gold} Gold</span>
          </div>
        </div>

        {/* Shop Items */}
        <div className="grid gap-3 mb-4">
          {SHOP_ITEMS.map((item) => (
            <div 
              key={item.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex justify-between items-center"
            >
              <div>
                <div className="font-bold">{item.name}</div>
                <div className="text-sm text-gray-400">{item.description}</div>
              </div>
              <button
                onClick={() => buyItem(item)}
                disabled={player.gold < item.price}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💰 {item.price}
              </button>
            </div>
          ))}
        </div>

        {/* Back to Menu */}
        <button
          onClick={() => useGameStore.getState().setPhase('start')}
          className="w-full py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold transition"
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  );
}
