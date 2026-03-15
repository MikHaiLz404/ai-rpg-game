'use client';
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { EventBus } from '@/game/EventBus';

const ITEM_SPRITES: Record<string, { src: string, fw: number, fh: number, sw: number, sh: number }> = {
  potion_health: { src: '/images/items/potion_health/sprite/potion_health.png', fw: 16, fh: 16, sw: 336, sh: 240 },
  potion_mana: { src: '/images/items/potion_mana/sprite/potion_mana.png', fw: 16, fh: 16, sw: 704, sh: 272 },
  basket: { src: '/images/items/basket/sprite/basket.png', fw: 32, fh: 32, sw: 128, sh: 96 },
  cloth: { src: '/images/items/cloth/sprite/cloth.png', fw: 16, fh: 16, sw: 144, sh: 304 },
  sword: { src: '/images/items/sword/sprite/sword.png', fw: 32, fh: 32, sw: 128, sh: 144 },
  shield: { src: '/images/items/shield/sprite/shd_0108_v01.png', fw: 32, fh: 32, sw: 256, sh: 256 },
};

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

function ItemIcon({ item, size = 'md' }: { item: typeof ITEMS[number], size?: 'sm' | 'md' }) {
  const sprite = ITEM_SPRITES[item.id];
  const displaySize = size === 'sm' ? 24 : 32;
  if (sprite) {
    const scale = displaySize / sprite.fw;
    return (
      <div
        className="image-pixelated flex-shrink-0"
        style={{
          width: displaySize,
          height: displaySize,
          backgroundImage: `url(${sprite.src})`,
          backgroundPosition: '0 0',
          backgroundSize: `${sprite.sw * scale}px ${sprite.sh * scale}px`,
          backgroundRepeat: 'no-repeat',
        }}
      />
    );
  }
  return <span className={size === 'sm' ? 'text-base' : 'text-xl'}>{item.emoji}</span>;
}

export default function Shop() {
  const { 
    gold, addGold, spendGold, addItem, items, removeItem, 
    currentCustomer, setCustomer, companions, addBond,
    day, customersServed, isShiftActive, startShift, endShift, incrementServed,
    setDialogue
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
            action: 'shop_talk',
            playerName: 'Minju',
            npcName: npc.name,
            npcMood: isGod ? 'เทพผู้สง่างาม มาซื้อของด้วยท่าทีเหนือมนุษย์' : 'ชาวบ้านธรรมดา อัธยาศัยดี',
            wantedItem: wantedItem.name,
            offeredGold
          })
        });
        const data = await res.json();
        setCustomer({
          id: npc.id,
          name: npc.name,
          request: data.narrative || `สวัสดีค่ะ มี ${wantedItem.name} มั้ยคะ?`,
          offeredGold,
          wantedItemId: wantedItem.id,
          isGod
        });
      } catch (err) {
        setCustomer({
          id: npc.id,
          name: npc.name,
          request: `สวัสดี! มี ${wantedItem.name} ขายมั้ย? จ่ายได้ ${offeredGold} gold เลยนะ`,
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

      // Minju is happy with the sale
      setDialogue({
        speaker: 'Minju',
        text: `Wonderful! That's ${currentCustomer.offeredGold} gold for our collection. Pleasure doing business!`,
        portrait: 'happy'
      });

      incrementServed();
      setCustomer(null);
      EventBus.emit('clear-customer');

      // Check if shift is done
      if (customersServed + 1 >= SHIFT_TARGET) {
        setTimeout(() => {
          endShift();
          setDialogue({
            speaker: 'Minju',
            text: `Whew! What a day. Time to close up and count our earnings.`,
            portrait: 'work'
          });
        }, 2000);
      }
    } else {
      // Don't have the item
      setDialogue({
        speaker: 'Minju',
        text: `Oh no! We're actually out of stock for that. My apologies!`,
        portrait: 'shock'
      });
    }
  };

  const handleDecline = () => {
    setDialogue({
      speaker: 'Minju',
      text: `I'm sorry, but I cannot accept that offer. Perhaps next time!`,
      portrait: 'angry'
    });

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
        setDialogue({
          speaker: 'Minju',
          text: `Restocked ${item.name}. Our shelves are looking better already!`,
          portrait: 'work'
        });
      }
    } else {
      setDialogue({
        speaker: 'Minju',
        text: `We don't have enough gold for that! We need at least ${wholesalePrice}.`,
        portrait: 'shock'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Open Shop Button */}
      {!isShiftActive && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl text-center space-y-3">
          <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse bg-rose-500" />
            Sanctum is Closed
          </div>
          <button
            onClick={startShift}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-black rounded-xl transition-all shadow-lg shadow-amber-500/20 uppercase tracking-widest"
          >
            Open Shop
          </button>
        </div>
      )}

      {/* Customer Interaction */}
      {currentCustomer && isShiftActive && (
        <div className="bg-slate-900/95 p-6 rounded-2xl border-2 border-amber-500/30 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-2xl border border-amber-500/20 shadow-inner">
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
          <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5 mb-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Request</div>
            <div className="flex items-center gap-2">
              {(() => { const found = ITEMS.find(i => i.id === currentCustomer.wantedItemId); return found ? <><ItemIcon item={found} /><span className="font-bold text-slate-200">{found.name}</span></> : null; })()}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSell}
              disabled={!items.includes(currentCustomer.wantedItemId)}
              className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg text-xs
                ${items.includes(currentCustomer.wantedItemId) 
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-900' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}
              `}
            >
              Sell ({currentCustomer.offeredGold}💰)
            </button>
            <button
              onClick={handleDecline}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-all uppercase text-[10px] tracking-widest"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Inventory Section (E) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex justify-between items-center">
          <span>Inventory</span>
          <span className="text-amber-500/50 font-bold">{items.length} Units</span>
        </h3>
        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          {ITEMS.map(itemType => {
            const count = items.filter(id => id === itemType.id).length;
            if (count === 0) return null;
            return (
              <div key={itemType.id} className="bg-slate-800/50 px-3 py-2 rounded-lg border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ItemIcon item={itemType} size="sm" />
                  <span className="text-[10px] font-bold text-slate-200 uppercase">{itemType.name}</span>
                  <span className="text-[9px] font-bold text-slate-500">(x{count})</span>
                </div>
                <span className="text-[9px] font-bold text-amber-500">{itemType.price}</span>
              </div>
            );
          })}
          {items.length === 0 && <div className="py-4 text-center text-[10px] text-slate-600 italic">Inventory is empty. Use Restock below.</div>}
        </div>
      </div>

      {/* Stockroom & Restock Section (F) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
          Stockroom & Restock
        </h3>
        <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          {ITEMS.map((item) => {
            const count = items.filter(id => id === item.id).length;
            return (
              <div key={item.id} className="bg-slate-800/30 p-2.5 rounded-xl border border-white/5 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <ItemIcon item={item} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] font-bold text-slate-200 uppercase leading-tight truncate">{item.name}</div>
                    <div className="text-[8px] text-slate-500">(x{count})</div>
                  </div>
                </div>
                <button
                  onClick={() => handleRestock(item)}
                  disabled={gold < Math.floor(item.price * 0.6)}
                  className="w-full py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:grayscale text-slate-200 text-[8px] font-bold rounded-lg transition-all border border-slate-600"
                >
                  สั่งซื้อ (Restock)
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
