'use client';
import { useGameStore } from '@/store/gameStore';

const ITEMS = [
  { id: 'potion_hp', name: 'Potion (HP)', emoji: '❤️', price: 50, desc: 'ฟื้นฟู 30 HP' },
  { id: 'potion_mp', name: 'Potion (MP)', emoji: '💙', price: 50, desc: 'ฟื้นฟู 30 MP' },
  { id: 'sword', name: 'Sword', emoji: '⚔️', price: 200, desc: 'อาวุธโจมตี +10' },
  { id: 'shield', name: 'Shield', emoji: '🛡️', price: 150, desc: 'เกราะป้องกัน +5' },
  { id: 'bow', name: 'Bow', emoji: '🏹', price: 180, desc: 'อาวุธระยะไกล +8' },
];

export default function Shop() {
  const { gold, spendGold, addItem, items } = useGameStore();
  
  const handleBuy = (item: typeof ITEMS[0]) => {
    if (spendGold(item.price)) {
      addItem(item.id);
    }
  };
  
  return (
    <div className="p-4 bg-slate-900/80 rounded-xl shadow-lg border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-amber-400">🏪 Shop Management</h2>
        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-amber-500/30 flex items-center gap-2">
          <span className="text-xl">💰</span>
          <span className="text-xl font-bold text-amber-400">{gold}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buy Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-300 border-b border-slate-700 pb-2">🛒 Items for Sale</h3>
          <div className="grid grid-cols-1 gap-3">
            {ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleBuy(item)}
                disabled={gold < item.price}
                className={`
                  p-3 rounded-lg border text-left transition-all
                  ${gold >= item.price 
                    ? 'bg-slate-800 border-slate-700 hover:border-amber-500/50 hover:bg-slate-700' 
                    : 'bg-slate-800/50 border-slate-800 opacity-50 cursor-not-allowed'}
                `}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <span className="text-3xl bg-slate-700 p-2 rounded-lg">{item.emoji}</span>
                    <div>
                      <div className="font-bold text-slate-100">{item.name}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                  </div>
                  <div className="text-amber-400 font-bold">{item.price}💰</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Inventory Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-300 border-b border-slate-700 pb-2">🎒 Current Inventory</h3>
          <div className="bg-slate-800/50 p-4 rounded-lg min-h-[200px] border border-slate-700/50">
            {items.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {items.map((itemId, i) => {
                  const item = ITEMS.find(t => t.id === itemId);
                  return (
                    <div key={i} className="bg-slate-700/50 p-2 rounded border border-slate-600 flex items-center gap-2 text-sm">
                      <span>{item?.emoji || '📦'}</span>
                      <span className="truncate">{item?.name || itemId}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 italic">
                Your inventory is empty
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
