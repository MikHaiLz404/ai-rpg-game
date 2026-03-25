'use client';
import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { EventBus } from '@/game/EventBus';
import { broadcastAISource } from './AIStatusBadge';
import { GoldIcon, PackageIcon } from './Icons';

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
  { id: 'herbs', name: 'Herbs', emoji: '🌿', price: 40, desc: 'สมุนไพรสดจากป่า' },
  { id: 'ore', name: 'Ore', emoji: '🪨', price: 60, desc: 'แร่เหล็กคุณภาพดี' },
  { id: 'wood', name: 'Wood', emoji: '🪵', price: 30, desc: 'ไม้เนื้อแข็ง' },
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

function pickWeightedItem(day: number, isGod: boolean): typeof ITEMS[number] {
  const weights = ITEMS.map(item => {
    const tier = item.price <= 50 ? 'common' : item.price <= 150 ? 'uncommon' : 'rare';
    let w: number;
    if (day <= 7) w = tier === 'common' ? 60 : tier === 'uncommon' ? 30 : 10;
    else if (day <= 14) w = tier === 'common' ? 30 : tier === 'uncommon' ? 40 : 30;
    else w = tier === 'common' ? 10 : tier === 'uncommon' ? 30 : 60;
    if (isGod && tier === 'common') w *= 0.5;
    if (isGod && tier === 'rare') w *= 1.5;
    return w;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < ITEMS.length; i++) {
    r -= weights[i];
    if (r <= 0) return ITEMS[i];
  }
  return ITEMS[ITEMS.length - 1];
}

function calcOfferedGold(price: number, day: number, isGod: boolean): number {
  let min: number, max: number;
  if (isGod) { min = 1.5; max = 2.0; } else { min = 0.6; max = 1.0; }
  if (day >= 15) { min += 0.2; max += 0.3; }
  return Math.floor(price * (min + Math.random() * (max - min)));
}

export default function Shop() {
  const {
    gold, addGold, spendGold, addItem, items, removeItem,
    currentCustomer, setCustomer, companions, addBond,
    day, choicesLeft, customersServed, isShiftActive, startShift, endShift, incrementServed,
    setDialogue, restockCostMultiplier, addAILog,
    currentDailyEventEffect, goldDebt
  } = useGameStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [incomingProgress, setIncomingProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const shiftTarget = Math.min(7, 3 + Math.floor((day - 1) / 4));

  useEffect(() => {
    const onArrival = async (npc: { id: string, name: string }) => {
      if (!isShiftActive) return;
      setDialogue(null);
      setIsGenerating(true);
      setIncomingProgress(0);
      if (progressInterval.current) clearInterval(progressInterval.current);

      const isGod = companions.some(c => c.name === npc.name);
      
      // Feature: Bundle Requests (multiple items)
      // Chance increases with day: Day 1-5 (5%), Day 6-10 (15%), Day 11+ (30%)
      const bundleChance = day <= 5 ? 0.05 : day <= 10 ? 0.15 : 0.30;
      const isBundle = Math.random() < bundleChance;
      const itemCount = isBundle ? (day >= 15 ? 3 : 2) : 1;
      
      const wantedItems: typeof ITEMS[0][] = [];
      let totalValue = 0;
      
      for (let i = 0; i < itemCount; i++) {
        const item = pickWeightedItem(day, isGod);
        wantedItems.push(item);
        totalValue += item.price;
      }

      const offeredGold = calcOfferedGold(totalValue, day, isGod);
      const wantedItemNames = wantedItems.map(i => i.name).join(' และ ');

      try {
        const res = await fetch('/api/narrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'shop_talk',
            playerName: 'Minju',
            npcName: npc.name,
            npcMood: isGod ? 'เทพผู้สง่างาม มาซื้อของด้วยท่าทีเหนือมนุษย์' : 'ชาวบ้านธรรมดา อัธยาศัยดี',
            wantedItem: wantedItemNames,
            offeredGold
          })
        });
        const data = await res.json();
        
        broadcastAISource(data.source || 'fallback');

        addAILog({
          action: 'shop_talk',
          model: data.model || 'AI Model',
          source: (data.source as any) || 'unknown',
          prompt: data.prompt || '',
          response: data.narrative || '',
          tokensInput: data.usage?.prompt_tokens || 0,
          tokensOutput: data.usage?.completion_tokens || 0,
          gatewayLogs: data.gatewayLogs
        });

        setCustomer({
          id: npc.id,
          name: npc.name,
          request: data.narrative || `สวัสดีค่ะ มี ${wantedItemNames} มั้ยคะ?`,
          offeredGold,
          wantedItemIds: wantedItems.map(i => i.id),
          isGod
        });
      } catch (err) {
        console.error('Failed to generate customer narration:', err);
        setCustomer({
          id: npc.id,
          name: npc.name,
          request: `สวัสดี! มี ${wantedItemNames} ขายมั้ย? จ่ายได้ ${offeredGold} gold เลยนะ`,
          offeredGold,
          wantedItemIds: wantedItems.map(i => i.id),
          isGod
        });
      } finally {
        setIsGenerating(false);
      }
    };

    const onIncoming = ({ delay }: { delay: number }) => {
      if (!isShiftActive || currentCustomer || isGenerating) return;
      setIncomingProgress(0);
      if (progressInterval.current) clearInterval(progressInterval.current);
      const startTime = Date.now();
      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / delay) * 100);
        setIncomingProgress(progress);
        if (progress >= 100 && progressInterval.current) clearInterval(progressInterval.current);
      }, 50);
    };

    EventBus.on('customer-arrival', onArrival);
    EventBus.on('customer-incoming', onIncoming);
    return () => {
      EventBus.off('customer-arrival', onArrival);
      EventBus.off('customer-incoming', onIncoming);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [setCustomer, companions, isShiftActive, currentCustomer, isGenerating, day, addAILog, setDialogue]);

  const handleSell = () => {
    if (!currentCustomer) return;
    EventBus.emit('play-sfx', 'click');
    
    // Check if player has all items in the bundle
    const inventory = [...items];
    const canSell = currentCustomer.wantedItemIds.every(id => {
      const idx = inventory.indexOf(id);
      if (idx > -1) {
        inventory.splice(idx, 1);
        return true;
      }
      return false;
    });

    if (canSell) {
      currentCustomer.wantedItemIds.forEach(id => removeItem(id));
      
      // Apply Dynamic Gold Boost
      let finalGold = currentCustomer.offeredGold;
      if (currentDailyEventEffect?.type === 'gold_boost') {
        finalGold = Math.floor(finalGold * currentDailyEventEffect.value);
      }
      
      addGold(finalGold);
      
      // Visual feedback in Phaser
      EventBus.emit('spawn-floating-text', { text: `+${finalGold} Gold`, color: '#ffd700' });

      if (currentCustomer.isGod) {
        const companion = companions.find(c => c.name === currentCustomer.name);
        if (companion) addBond(companion.id, 2);
      }
      setDialogue({
        speaker: 'Minju',
        text: `ขายได้แล้ว! ได้ ${finalGold} ทองมาเพิ่ม ขอบคุณที่อุดหนุนนะคะ~`,
        portrait: 'happy'
      });
      incrementServed();
      setCustomer(null);
      EventBus.emit('clear-customer');
      if (customersServed + 1 >= shiftTarget) {
        setTimeout(() => {
          endShift();
          setDialogue({ speaker: 'Minju', text: `เฮ้อ! เป็นวันที่วุ่นวายจริงๆ ได้เวลาปิดร้านแล้วมานับเงินกันเถอะค่ะ`, portrait: 'work' });
        }, 2000);
      }
    } else {
      setDialogue({ speaker: 'Minju', text: `แย่แล้ว! ของในสต็อกไม่ครบตามที่ลูกค้าต้องการเลยค่ะ ขอโทษด้วยนะคะ!`, portrait: 'shock' });
    }
  };

  const handleDecline = () => {
    setDialogue({ speaker: 'Minju', text: `ขอโทษด้วยนะคะ แต่ฉันรับข้อเสนอนี้ไม่ได้จริงๆ ไว้โอกาสหน้านะคะ!`, portrait: 'angry' });
    incrementServed(); setCustomer(null); EventBus.emit('clear-customer');
    if (customersServed + 1 >= shiftTarget) setTimeout(() => endShift(), 2000);
  };

  const getWholesalePrice = (item: typeof ITEMS[0]) => {
    let price = Math.floor(item.price * 0.6 * restockCostMultiplier);
    if (currentDailyEventEffect?.type === 'restock_penalty' || currentDailyEventEffect?.type === 'restock_discount') {
      price = Math.floor(price * currentDailyEventEffect.value);
    }
    return price;
  };

  const handleRestock = (item: typeof ITEMS[0]) => {
    const wholesalePrice = getWholesalePrice(item);
    if (gold >= wholesalePrice) {
      if (spendGold(wholesalePrice)) {
        addItem(item.id);
        setDialogue({ speaker: 'Minju', text: `เติมของ ${item.name} เรียบร้อย! ชั้นวางดูดีขึ้นเยอะเลยค่ะ`, portrait: 'work' });
      }
    } else {
      setDialogue({ speaker: 'Minju', text: `ทองไม่พอค่ะ! เราต้องมีอย่างน้อย ${wholesalePrice} ทองนะคะ`, portrait: 'shock' });
    }
  };

  return (
    <div className="space-y-6">
      {!isShiftActive && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl text-center space-y-3">
          <div className="text-[10px] md:text-xs font-bold text-rose-500 uppercase tracking-widest flex items-center justify-center gap-2 font-serif">
            <div className="w-2 h-2 rounded-full animate-pulse bg-rose-500" /> Sanctum is Closed
          </div>
          <button
            onClick={startShift}
            disabled={choicesLeft <= 0}
            aria-label={choicesLeft > 0 ? 'Open shop for trading' : 'No actions remaining to open shop'}
            aria-disabled={choicesLeft <= 0}
            onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && choicesLeft > 0) { e.preventDefault(); startShift(); } }}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-slate-900 text-xs md:text-sm font-black rounded-xl transition-all shadow-lg shadow-amber-500/20 uppercase tracking-widest font-serif focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            {choicesLeft > 0 ? 'Open Shop' : 'No Actions Left'}
          </button>
        </div>
      )}
      {goldDebt && goldDebt > 0 && (
        <div className="bg-red-900/20 rounded-xl border border-red-500/30 p-3 text-center" role="status" aria-live="polite">
          <span className="text-[10px] md:text-xs font-bold text-red-400 uppercase tracking-widest font-serif">
            Recovering debt: -{goldDebt} gold from next income
          </span>
        </div>
      )}
      {isShiftActive && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl flex items-center justify-between gap-4">
           <div className="flex-1">
             <div className="flex justify-between items-center mb-1.5">
               <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest font-serif">{currentCustomer ? 'Interacting' : isGenerating ? 'Preparing...' : 'Waiting for Customer'}</span>
               <span className="text-[10px] md:text-xs font-bold text-amber-500 font-serif">{customersServed} / {shiftTarget} Served</span>
             </div>
             <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
               <div className={`h-full transition-all duration-300 rounded-full ${currentCustomer ? 'bg-amber-500 w-full' : isGenerating ? 'bg-blue-500 w-1/2 animate-pulse' : 'bg-amber-500/40'}`} style={{ width: !currentCustomer && !isGenerating ? `${incomingProgress}%` : undefined }} />
             </div>
           </div>
        </div>
      )}
      {currentCustomer && isShiftActive && (
        <div className="bg-slate-900/95 p-6 rounded-2xl border-2 border-amber-500/30 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-2xl border border-amber-500/20 shadow-inner">{currentCustomer.isGod ? '✨' : '👤'}</div>
            <div>
              <div className="font-black text-white uppercase tracking-tight font-serif">{currentCustomer.name}</div>
              <div className="text-[10px] md:text-xs text-amber-500/70 font-bold uppercase font-serif">{currentCustomer.isGod ? 'Divine Entity' : 'Mortal Soul'}</div>
            </div>
          </div>
          <p className="text-slate-200 italic text-sm leading-relaxed mb-4 border-l-4 border-amber-500/50 pl-4 py-1">"{currentCustomer.request}"</p>
          <div className="bg-black/30 p-3 rounded-xl border border-white/5 mb-4 font-serif">
            <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-2">Request</div>
            <div className="space-y-2">
              {currentCustomer.wantedItemIds.map((itemId, idx) => {
                const found = ITEMS.find(i => i.id === itemId);
                if (!found) return null;
                const hasItem = items.includes(itemId);
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ItemIcon item={found} />
                      <span className={`font-bold ${hasItem ? 'text-slate-200' : 'text-rose-500/70'}`}>{found.name}</span>
                    </div>
                    {hasItem ? (
                      <span className="text-[8px] text-emerald-500 font-black uppercase">In Stock</span>
                    ) : (
                      <span className="text-[8px] text-rose-500 font-black uppercase">Missing</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-3">
            {(() => {
              const inventory = [...items];
              const canSellAll = currentCustomer.wantedItemIds.every(id => {
                const idx = inventory.indexOf(id);
                if (idx > -1) {
                  inventory.splice(idx, 1);
                  return true;
                }
                return false;
              });
              return (
                <button
                  onClick={handleSell}
                  disabled={!canSellAll}
                  aria-label={`Sell items for ${currentCustomer.offeredGold} gold`}
                  aria-disabled={!canSellAll}
                  className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg text-xs md:text-sm font-serif flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${canSellAll ? 'bg-amber-500 hover:bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
                >
                  Sell ({currentCustomer.offeredGold} <GoldIcon size={14} className={canSellAll ? 'text-slate-900' : 'text-slate-500'} />)
                </button>
              );
            })()}
            <button onClick={handleDecline} aria-label="Decline customer request" className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-all uppercase text-[10px] md:text-xs tracking-widest font-serif focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500">Decline</button>
          </div>
        </div>
      )}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <h3 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex justify-between items-center font-serif">
          <span className="flex items-center gap-1.5"><PackageIcon size={14} /> Inventory</span>
          <span className="text-amber-500/50 font-bold">{items.length} Units</span>
        </h3>
        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          {ITEMS.map(itemType => { const count = items.filter(id => id === itemType.id).length; if (count === 0) return null; return ( <div key={itemType.id} className="bg-slate-800/50 px-3 py-2 rounded-lg border border-white/5 flex items-center justify-between font-serif"><div className="flex items-center gap-2.5"><ItemIcon item={itemType} size="sm" /><span className="text-[10px] md:text-xs font-bold text-slate-200 uppercase">{itemType.name}</span><span className="text-[9px] md:text-[11px] font-bold text-slate-500 font-sans">(x{count})</span></div><span className="text-[9px] md:text-[11px] font-bold text-amber-500 flex items-center gap-1 font-sans">{itemType.price} <GoldIcon size={10} /></span></div> ); })}
          {items.length === 0 && <div className="py-4 text-center text-[10px] md:text-xs text-slate-600 italic">Inventory is empty. Use Restock below.</div>}
        </div>
      </div>
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.2em] font-serif">Stockroom & Restock</h3>
          <span className="text-[9px] md:text-[10px] font-bold text-amber-500/70 font-sans">
            {restockCostMultiplier > 1.1 ? `Wholesale: ${restockCostMultiplier.toFixed(1)}x` : 'Wholesale: 1.0x'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          {ITEMS.map((item) => { const count = items.filter(id => id === item.id).length; const wholesale = getWholesalePrice(item); const isExpensive = restockCostMultiplier > 1.2 || (currentDailyEventEffect?.type === 'restock_penalty'); return ( <div key={item.id} className="bg-slate-800/30 p-2.5 rounded-xl border border-white/5 flex flex-col gap-2 font-serif"><div className="flex items-center gap-2"><ItemIcon item={item} size="sm" /><div className="min-w-0 flex-1"><div className="text-[9px] md:text-[11px] font-bold text-slate-200 uppercase leading-tight truncate">{item.name}</div><div className="text-[8px] md:text-[10px] text-slate-500 font-sans">(x{count})</div></div></div><button onClick={() => handleRestock(item)} disabled={gold < wholesale} aria-label={`Restock ${item.name} for ${wholesale} gold`} aria-disabled={gold < wholesale} className="w-full py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:grayscale text-slate-200 text-[8px] md:text-[10px] font-bold rounded-lg transition-all border border-slate-600 font-sans flex items-center justify-center gap-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500">{wholesale} <GoldIcon size={10} className={gold >= wholesale ? 'text-amber-400' : 'text-slate-500'} /> {(isExpensive || currentDailyEventEffect?.type === 'restock_discount') && <span className={currentDailyEventEffect?.type === 'restock_discount' ? "text-emerald-400" : "text-red-400"}>{currentDailyEventEffect?.type === 'restock_discount' ? '↓' : '↑'}</span>}</button></div> ); })}
        </div>
      </div>
    </div>
  );
}
