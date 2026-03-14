'use client';
import { useGameStore } from '@/store/gameStore';

const ITEMS = [
  { id: 'potion_health', name: 'Health Potion', emoji: '❤️', price: 50, desc: 'ฟื้นฟูพลังชีวิต' },
  { id: 'potion_mana', name: 'Mana Potion', emoji: '💙', price: 50, desc: 'ฟื้นฟูมานา' },
  { id: 'soap', name: 'Soap', emoji: '🧼', price: 30, desc: 'สบู่หอมสะอาดยิ่งนัก' },
  { id: 'perfume', name: 'Perfume', emoji: '✨', price: 120, desc: 'น้ำหอมมหาเสน่ห์' },
  { id: 'basket', name: 'Basket', emoji: '🧺', price: 80, desc: 'ตะกร้าสานมือ' },
  { id: 'cloth', name: 'Cloth', emoji: '🧣', price: 100, desc: 'ผ้าไหมเนื้อดี' },
  { id: 'flower', name: 'Flower', emoji: '🌸', price: 20, desc: 'ดอกไม้สดใส' },
  { id: 'mirror', name: 'Mirror', emoji: '🪞', price: 150, desc: 'กระจกเงาวิจิตร' },
  { id: 'sword', name: 'Sword', emoji: '⚔️', price: 200, desc: 'ดาบเหล็กกล้า' },
  { id: 'shield', name: 'Shield', emoji: '🛡️', price: 150, desc: 'โล่ป้องกัน' },
  { id: 'bow', name: 'Bow', emoji: '🏹', price: 180, desc: 'ธนูไม้สน' },
  { id: 'olympian_coin', name: 'Olympian Coin', emoji: '🪙', price: 500, desc: 'เหรียญโอลิมเปียหายาก' },
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
      
      <div className="grid grid-cols-1 gap-6">
        {/* Buy Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-300 border-b border-slate-700 pb-2">🛒 Items for Sale (MVP)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
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
                  <div className="flex gap-2">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <div className="font-bold text-xs text-slate-100">{item.name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{item.desc}</div>
                    </div>
                  </div>
                  <div className="text-amber-400 font-bold text-xs">{item.price}💰</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Inventory Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-300 border-b border-slate-700 pb-2">🎒 Your Inventory</h3>
          <div className="bg-slate-800/50 p-4 rounded-lg min-h-[100px] border border-slate-700/50">
            {items.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {items.map((itemId, i) => {
                  const item = ITEMS.find(t => t.id === itemId);
                  return (
                    <div key={i} className="bg-slate-700/50 p-2 rounded border border-slate-600 flex items-center gap-2 text-xs" title={item?.name || itemId}>
                      <span>{item?.emoji || '📦'}</span>
                      <span className="max-w-[80px] truncate">{item?.name || itemId}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 italic text-sm py-4">
                Your inventory is empty
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
