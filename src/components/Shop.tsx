'use client';
import { useGameStore } from '@/store/gameStore';

export default function Shop() {
  const { gold, items, spendGold, addItem } = useGameStore();
  
  const shopItems = [
    { id: 'potion_hp', name: '❤️ Potion (HP)', price: 50 },
    { id: 'potion_mp', name: '💙 Potion (MP)', price: 50 },
    { id: 'sword', name: '⚔️ Sword', price: 200 },
    { id: 'shield', name: '🛡️ Shield', price: 150 },
    { id: 'bow', name: '🏹 Bow', price: 180 },
  ];
  
  const handleBuy = (item: typeof shopItems[0]) => {
    if (spendGold(item.price)) {
      addItem(item.id);
    }
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>🏪 Shop</h2>
      
      <div style={{ 
        background: '#16213e', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        💰 Gold: {gold}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
        {shopItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleBuy(item)}
            style={{
              padding: '15px',
              background: '#374151',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>{item.name}</span>
            <span style={{ color: '#fbbf24' }}>{item.price}💰</span>
          </button>
        ))}
      </div>
      
      <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>🎒 Your Items:</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {items.map((item, i) => (
          <span key={i} style={{ 
            background: '#4b5563', 
            padding: '5px 10px', 
            borderRadius: '4px' 
          }}>
            {item}
          </span>
        ))}
        {items.length === 0 && <span style={{ color: '#888' }}>Empty</span>}
      </div>
    </div>
  );
}
