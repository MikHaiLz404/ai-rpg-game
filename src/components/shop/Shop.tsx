import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const Shop: React.FC = () => {
  const { player, shopItems, addItem, removeItem, addGold } = useGameStore();
  
  const handleBuy = (item: typeof shopItems[0]) => {
    if (player.gold >= item.price) {
      addItem(item);
      useGameStore.getState().removeGold(item.price);
    }
  };
  
  const handleSell = (item: typeof shopItems[0]) => {
    const sellPrice = Math.floor(item.price * 0.5);
    addGold(sellPrice);
    removeItem(item.id);
  };
  
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-amber-400 mb-4">🏪 ร้านค้าแห่งทวยเทพ</h1>
      
      <div className="bg-amber-900/50 p-3 rounded-lg mb-6">
        <span className="text-xl">💰 ทอง: {player.gold}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shop Items */}
        <div>
          <h2 className="text-xl text-amber-300 mb-3">🛒 สินค้าขาย</h2>
          <div className="space-y-3">
            {shopItems.map(item => (
              <Card key={item.id} className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white">{item.nameTH}</h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                  <p className="text-amber-400">💰 {item.price}</p>
                </div>
                <Button 
                  onClick={() => handleBuy(item)}
                  disabled={player.gold < item.price}
                >
                  ซื้อ
                </Button>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Player Items */}
        <div>
          <h2="🎒 กระเป๋าของคุณ</h2>
          {player.items.length === 0 ? (
            <p className="text-gray-400">ยังไม่มีไอเทม</p>
          ) : (
            <div className="space-y-3">
              {player.items.map(item => (
                <Card key={item.id} className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white">{item.nameTH}</h3>
                    <p className="text-amber-400">💰 {Math.floor(item.price * 0.5)}</p>
                  </div>
                  <Button variant="secondary" onClick={() => handleSell(item)}>
                    ขาย
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
