'use client';

import { useState } from 'react';

export default function Home() {
  const [phase, setPhase] = useState('shop');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#1a1a2e', 
      color: '#fff',
      padding: '20px',
      fontFamily: 'system-ui'
    }}>
      <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '20px' }}>
        ⚔️ Gods' Arena 🏪
      </h1>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <p>Welcome to Gods' Arena!</p>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>MVP Version - Assets Coming Soon</p>
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => setPhase('shop')}
          style={{
            padding: '15px 30px',
            background: phase === 'shop' ? '#f59e0b' : '#374151',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          🏪 Shop
        </button>
        
        <button 
          onClick={() => setPhase('arena')}
          style={{
            padding: '15px 30px',
            background: phase === 'arena' ? '#ef4444' : '#374151',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          ⚔️ Arena
        </button>
        
        <button 
          onClick={() => setPhase('relationship')}
          style={{
            padding: '15px 30px',
            background: phase === 'relationship' ? '#ec4899' : '#374151',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          💕 Relationship
        </button>
      </div>
      
      <div style={{ 
        marginTop: '40px', 
        textAlign: 'center',
        padding: '40px',
        background: '#16213e',
        borderRadius: '12px'
      }}>
        {phase === 'shop' && <div>🏪 Shop Phase - Coming Soon</div>}
        {phase === 'arena' && <div>⚔️ Arena Phase - Coming Soon</div>}
        {phase === 'relationship' && <div>💕 Relationship Phase - Coming Soon</div>}
      </div>
    </div>
  );
}
