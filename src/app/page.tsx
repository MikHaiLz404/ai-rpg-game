'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Shop from '@/components/Shop';
import Arena from '@/components/Arena';
import Relationship from '@/components/Relationship';

// Dynamic import for Phaser (client-side only)
const PhaserGame = dynamic(() => import('@/game/PhaserGame'), { 
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading game...</div>
});

export default function Home() {
  const [phase, setPhase] = useState('exploration');
  
  const phases = [
    { id: 'exploration', emoji: '🗺️', label: 'Explore', color: '#22c55e' },
    { id: 'shop', emoji: '🏪', label: 'Shop', color: '#f59e0b' },
    { id: 'arena', emoji: '⚔️', label: 'Arena', color: '#ef4444' },
    { id: 'relationship', emoji: '💕', label: 'Relationship', color: '#ec4899' },
  ] as const;
  
  return (
    <div style={{ minHeight: '100vh', background: '#1a1a2e', color: '#fff', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px', padding: '20px', background: '#16213e', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>⚔️ Gods' Arena 🏪</h1>
        <span style={{ background: '#fbbf24', color: '#000', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }}>💰 500</span>
      </header>
      
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {phases.map((p) => (
          <button 
            key={p.id}
            onClick={() => setPhase(p.id)}
            style={{
              padding: '12px 20px',
              background: phase === p.id ? p.color : '#374151',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {p.emoji} {p.label}
          </button>
        ))}
      </nav>
      
      <main style={{ maxWidth: '800px', margin: '0 auto', background: '#16213e', borderRadius: '12px', minHeight: '500px' }}>
        {phase === 'exploration' && <PhaserGame />}
        {phase === 'shop' && <Shop />}
        {phase === 'arena' && <Arena />}
        {phase === 'relationship' && <Relationship />}
      </main>
      
      <footer style={{ textAlign: 'center', marginTop: '30px', color: '#666', fontSize: '0.8rem' }}>
        v1.0 MVP - Gods' Arena
      </footer>
    </div>
  );
}
