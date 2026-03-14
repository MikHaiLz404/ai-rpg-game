'use client';
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { EventBus } from '@/game/EventBus';

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
  const { 
    gold, addGold, spendGold, addItem, items, removeItem, 
    currentCustomer, setCustomer, companions, addBond,
    day, customersServed, isShiftActive, startShift, endShift, incrementServed
  } = useGameStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [shiftSummary, setShiftSummary] = useState<{gold: number, bond: number} | null>(null);

  const SHIFT_TARGET = 3; // Serve 3 customers to end the day

  useEffect(() => {
    const onArrival = async (npc: { id: string, name: string }) => {
      if (!isShiftActive) return;
      
      setIsGenerating(true);
      const wantedItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      const offeredGold = Math.floor(wantedItem.price * (0.8 + Math.random() * 0.5));
      const isGod = companions.some(c => c.name === npc.name);

      try {
        const res = await fetch('/api/narrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'talk',
            playerName: 'Minju',
            npcName: npc.name,
            npcMood: isGod ? 'divine' : 'curious',
            lastMessage: `I am looking for a ${wantedItem.name}.`
          })
        });
        const data = await res.json();
        setCustomer({
          id: npc.id,
          name: npc.name,
          request: data.narrative || `I need a ${wantedItem.name}.`,
          offeredGold,
          wantedItemId: wantedItem.id,
          isGod
        });
      } catch (err) {
        setCustomer({
          id: npc.id,
          name: npc.name,
          request: `Greetings! Do you have a ${wantedItem.name}?`,
          offeredGold,
          wantedItemId: wantedItem.id,
          isGod
        });
      } finally {
        setIsGenerating(false);
      }
    };

    EventBus.on('customer-arrival', onArrival);
    return () => {
      EventBus.off('customer-arrival', onArrival);
    };
  }, [setCustomer, companions, isShiftActive]);

  const handleSell = () => {
    if (!currentCustomer) return;
    if (items.includes(currentCustomer.wantedItemId)) {
      removeItem(currentCustomer.wantedItemId);
      addGold(currentCustomer.offeredGold);
      
      let bondGain = 0;
      if (currentCustomer.isGod) {
        const companion = companions.find(c => c.name === currentCustomer.name);
        if (companion) {
          addBond(companion.id, 2);
          bondGain = 2;
        }
      }
      
      setShiftSummary(prev => ({
        gold: (prev?.gold || 0) + currentCustomer.offeredGold,
        bond: (prev?.bond || 0) + bondGain
      }));

      incrementServed();
      setCustomer(null);
      EventBus.emit('clear-customer');

      // Check if shift is done
      if (customersServed + 1 >= SHIFT_TARGET) {
        setTimeout(() => {
          endShift();
        }, 2000);
      }
    }
  };

  const handleDecline = () => {
    incrementServed();
    setCustomer(null);
    EventBus.emit('clear-customer');
    
    if (customersServed + 1 >= SHIFT_TARGET) {
      setTimeout(() => {
        endShift();
      }, 2000);
    }
  };

  const handleRestock = (item: typeof ITEMS[0]) => {
    const wholesalePrice = Math.floor(item.price * 0.6);
    if (gold >= wholesalePrice) {
      if (spendGold(wholesalePrice)) {
        addItem(item.id);
      }
    }
  };

  const handleOpenShop = () => {
    setShiftSummary(null);
    startShift();
  };

  return (
    <div className="p-4 bg-slate-900/95 rounded-xl shadow-2xl border border-amber-500/20">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-black text-amber-500 uppercase tracking-tighter leading-none">Day {day}</h2>
          <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">
            {isShiftActive ? `Shift Progress: ${customersServed}/${SHIFT_TARGET}` : 'Shop is Closed'}
          </div>
        </div>
        <div className="bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/30 flex items-center gap-2">
          <span className="text-xl">💰</span>
          <span className="text-xl font-black text-amber-400">{gold.toLocaleString()}</span>
        </div>
      </div>

      {!isShiftActive ? (
        <div className="space-y-6">
          {shiftSummary ? (
            <div className="bg-amber-500/10 p-6 rounded-2xl border border-amber-500/30 animate-in zoom-in-95 duration-500">
              <h3 className="text-center font-black text-amber-500 uppercase tracking-widest mb-4">Shift Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-white">+{shiftSummary.gold}</div>
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Gold Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-pink-500">+{shiftSummary.bond}</div>
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Divine Bond</div>
                </div>
              </div>
              <div className="mt-6 text-center text-xs text-slate-400 italic">
                "A productive day. The gods are pleased."
              </div>
            </div>
          ) : (
            <div className="py-12 bg-slate-800/30 rounded-2xl border border-slate-800 border-dashed text-center">
              <div className="text-4xl mb-2">🌙</div>
              <p className="text-slate-400 text-sm italic">The shop is quiet tonight.</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleOpenShop}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-amber-500/10 transition-all active:scale-95"
            >
              Open Shop for Day {day}
            </button>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase font-bold">OR</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-center opacity-50">
                <div className="text-xs font-bold text-slate-300">GO TO ARENA</div>
                <div className="text-[8px] text-slate-500 mt-1">Walk to the Right</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-center opacity-50">
                <div className="text-xs font-bold text-slate-300">VISIT VILLAGE</div>
                <div className="text-[8px] text-slate-500 mt-1">Walk Downstairs</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {currentCustomer ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-800/80 p-6 rounded-2xl border-2 border-amber-500/30 relative">
                <div className="absolute -top-3 left-6 bg-amber-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                  Current Customer
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-2xl border border-amber-500/20">
                    {currentCustomer.isGod ? '✨' : '👤'}
                  </div>
                  <div>
                    <div className="font-black text-white uppercase tracking-tight">{currentCustomer.name}</div>
                    <div className="text-[10px] text-amber-500/70 font-bold uppercase">{currentCustomer.isGod ? 'Divine Entity' : 'Mortal Soul'}</div>
                  </div>
                </div>
                <p className="text-slate-200 italic text-sm leading-relaxed mb-4 border-l-4 border-amber-500/50 pl-4 py-1">
                  "{currentCustomer.request}"
                </p>
                <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Wants to buy</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ITEMS.find(i => i.id === currentCustomer.wantedItemId)?.emoji}</span>
                    <span className="font-bold text-slate-200">{ITEMS.find(i => i.id === currentCustomer.wantedItemId)?.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSell}
                  disabled={!items.includes(currentCustomer.wantedItemId)}
                  className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg
                    ${items.includes(currentCustomer.wantedItemId) 
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-900' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}
                  `}
                >
                  Sell for {currentCustomer.offeredGold}💰
                </button>
                <button
                  onClick={handleDecline}
                  className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-all uppercase text-[10px] tracking-widest"
                >
                  Decline
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-4 bg-slate-800/30 rounded-2xl border border-slate-800 border-dashed">
              {isGenerating ? (
                <div className="animate-pulse flex flex-col items-center gap-3">
                  <div className="text-4xl">⏳</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">A soul approaches...</div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 opacity-50">
                  <div className="text-4xl">🏪</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Waiting for customers</div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Common View Elements */}
      <div className="mt-6">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex justify-between items-center">
          <span>Inventory ({items.length})</span>
        </h3>
        <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
          {items.map((itemId, i) => {
            const item = ITEMS.find(t => t.id === itemId);
            return (
              <div key={i} className="bg-slate-800/80 p-2 rounded-lg border border-slate-700 flex items-center gap-2 group hover:border-amber-500/30 transition-colors shadow-sm">
                <span className="text-lg">{item?.emoji || '📦'}</span>
                <span className="text-[9px] font-bold text-slate-300 uppercase leading-none hidden md:inline">{item?.name || itemId}</span>
              </div>
            );
          })}
          {items.length === 0 && <div className="text-[10px] text-red-400 italic font-bold">Out of Stock!</div>}
        </div>
      </div>

      <div className="mt-6 border-t border-slate-800 pt-6">
        <h3 className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest mb-4">
          Wholesale Restock
        </h3>
        <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
          {ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleRestock(item)}
              disabled={gold < Math.floor(item.price * 0.6)}
              className="flex items-center justify-between bg-slate-800/40 p-2 rounded-lg border border-slate-700 hover:border-amber-500/30 hover:bg-slate-800 transition-all text-left group disabled:opacity-30 disabled:grayscale"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.emoji}</span>
                <div className="text-[9px] font-bold text-slate-300 uppercase leading-tight">{item.name}</div>
              </div>
              <div className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors">
                {Math.floor(item.price * 0.6)}💰
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
