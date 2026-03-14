'use client';

import dynamic from 'next/dynamic';

const PhaserGame = dynamic(() => import('@/game/PhaserGame'), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      minHeight: '100vh', 
      background: '#1a1a2e', 
      color: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '1.5rem'
    }}>
      ⚔️ Loading Gods' Arena...
    </div>
  )
});

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#1a1a2e' }}>
      <PhaserGame />
    </div>
  );
}
