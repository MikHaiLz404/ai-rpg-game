'use client';
import { useState } from 'react';

// Item sprites (will use when available)
const ITEMS = [
  { id: 'potion_hp', name: 'Potion (HP)', emoji: '❤️', price: 50, desc: 'ฟื้นฟู 30 HP' },
  { id: 'potion_mp', name: 'Potion (MP)', emoji: '💙', price: 50, desc: 'ฟื้นฟู 30 MP' },
  { id: 'sword', name: 'Sword', emoji: '⚔️', price: 200, desc: 'อาวุธโจมตี +10' },
  { id: 'shield', name: 'Shield', emoji: '🛡️', price: 150, desc: 'เกราะป้องกัน +5' },
  { id: 'bow', name: 'Bow', emoji: '🏹', price: 180, desc: 'อาวุธระยะไกล +8' },
];

export default function Shop() {
  const [gold, setGold] = useState(500);
  const [items, setItems] = useState<string[]>([]);
  
  const handleBuy = (item: typeof ITEMS[0]) => {
    if (gold >= item.price) {
      setGold(g => g - item.price);
      setItems(prev => [...prev, item.id]);
    }
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>🏪 Shop</h2>
      
      {/* Gold Display */}
      <div style={{ 
        background: '#16213e', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ fontSize: '1.5rem' }}>💰</span>
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24' }}>
          {gold}
        </span>
      </div>
      
      {/* Shop Items */}
      <h3 style={{ marginBottom: '10px' }}>🛒 Items for Sale:</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '30px' }}>
        {ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleBuy(item)}
            disabled={gold < item.price}
            style={{
              padding: '15px',
              background: gold >= item.price ? '#374151' : '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: gold >= item.price ? 'pointer' : 'not-allowed',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
              opacity: gold >= item.price ? 1 : 0.5
            }}
          >
            <span style={{ fontSize: '2rem' }}>{item.emoji}</span>
            <span style={{ fontWeight: 'bold' }}>{item.name}</span>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{item.desc}</span>
            <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{item.price}💰</span>
          </button>
        ))}
      </div>
      
      {/* Inventory */}
      <h3 style={{ marginBottom: '10px' }}>🎒 Your Inventory:</h3>
      <div style={{ 
        background: '#16213e', 
        padding: '15px', 
        borderRadius: '8px',
        minHeight: '100px'
      }}>
        {items.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {items.map((itemId, i) => {
              const item = ITEMS.find(t => t.id === itemId);
              return (
                <span key={i} style={{ 
                  background: '#4b5563', 
                  padding: '5px 10px', 
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {item?.emoji} {item?.name}
                </span>
              );
            })}
          </div>
        ) : (
          <span style={{ color: '#666' }}>Your inventory is empty</span>
        )}
      </div>
    </div>
  );
}
