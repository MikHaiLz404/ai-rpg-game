'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import Shop from '@/components/Shop';
import Arena from '@/components/Arena';
import Relationship from '@/components/Relationship';

export default function Home() {
  const { phase, setPhase, gold } = useGameStore();
  
  const phases = [
    { id: 'shop', emoji: '🏪', label: 'Shop', color: '#f59e0b' },
    { id: 'arena', emoji: '⚔️', label: 'Arena', color: '#ef4444' },
    { id: 'relationship', emoji: '💕', label: 'Relationship', color: '#ec4899' },
  ] as const;
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#1a1a2e', 
      color: '#fff',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        padding: '20px',
        background: '#16213e',
        borderRadius: '12px'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>
          ⚔️ Gods' Arena 🏪
        </h1>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px',
          alignItems: 'center'
        }}>
          <span style={{ 
            background: '#fbbf24', 
            color: '#000',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 'bold'
          }}>
            💰 {gold}
          </span>
        </div>
      </header>
      
      {/* Navigation */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px',
        marginBottom: '30px'
      }}>
        {phases.map((p) => (
          <button 
            key={p.id}
            onClick={() => setPhase(p.id)}
            style={{
              padding: '15px 30px',
              background: phase === p.id ? p.color : '#374151',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            {p.emoji} {p.label}
          </button>
        ))}
      </nav>
      
      {/* Main Content */}
      <main style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        background: '#16213e',
        borderRadius: '12px',
        minHeight: '400px'
      }}>
        {phase === 'shop' && <Shop />}
        {phase === 'arena' && <Arena />}
        {phase === 'relationship' && <Relationship />}
      </main>
      
      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        marginTop: '30px',
        color: '#666',
        fontSize: '0.8rem'
      }}>
        v1.0 MVP - Gods' Arena
      </footer>
    </div>
  );
}
