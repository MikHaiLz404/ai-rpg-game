/**
 * 🎮 Gods' Arena - Main Game UI
 * 
 * หน้าหลักแสดง 4 Game Phases:
 * - 🏪 Shop Phase - ร้านค้า
 * - ⚔️ Arena Phase - อารีน่า  
 * - 🗡️ Exploration Phase - สำรวจ
 * - 💕 Relationship Phase - ความสัมพันธ์
 */

import React, { useState } from 'react';
import Head from 'next/head';

// Import Phase Components
import ShopPhase from '../components/phases/ShopPhase';
import ArenaPhase from '../components/phases/ArenaPhase';
import ExplorationPhase from '../components/phases/ExplorationPhase';
import RelationshipPhase from '../components/phases/RelationshipPhase';

// Phase Navigation Component
const PhaseNavigation = ({ activePhase, onPhaseChange }) => {
  const phases = [
    { id: 'shop', icon: '🏪', label: 'ร้านค้า' },
    { id: 'arena', icon: '⚔️', label: 'อารีน่า' },
    { id: 'exploration', icon: '🗡️', label: 'สำรวจ' },
    { id: 'relationship', icon: '💕', label: 'ความสัมพันธ์' },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 p-3 z-50">
      <div className="max-w-4xl mx-auto flex justify-around md:justify-center md:gap-4">
        {phases.map(phase => (
          <button
            key={phase.id}
            onClick={() => onPhaseChange(phase.id)}
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-xl transition-all ${
              activePhase === phase.id 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span className="text-xl md:text-2xl">{phase.icon}</span>
            <span className="text-xs md:text-sm font-medium">{phase.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Phase Indicator
const PhaseIndicator = ({ phase }) => {
  const configs = {
    shop: { icon: '🏪', color: 'from-yellow-600 to-amber-600', label: 'ร้านค้า' },
    arena: { icon: '⚔️', color: 'from-red-600 to-orange-600', label: 'อารีน่า' },
    exploration: { icon: '🗡️', color: 'from-green-600 to-emerald-600', label: 'สำรวจ' },
    relationship: { icon: '💕', color: 'from-pink-600 to-rose-600', label: 'ความสัมพันธ์' },
  };
  
  const config = configs[phase];
  
  return (
    <div className={`bg-gradient-to-r ${config.color} px-4 py-2 rounded-full flex items-center gap-2 shadow-lg`}>
      <span className="text-lg">{config.icon}</span>
      <span className="font-bold text-white">{config.label}</span>
    </div>
  );
};

// Toast Component
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-24 right-4 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slideUp z-50 ${
    type === 'success' ? 'bg-green-600' : 
    type === 'warning' ? 'bg-yellow-600' : 
    type === 'error' ? 'bg-red-600' : 'bg-blue-600'
  }`}>
    <span className="text-white">{message}</span>
    <button onClick={onClose} className="text-white/70 hover:text-white">✕</button>
  </div>
);

// Main App Component
export default function GodsArena() {
  const [activePhase, setActivePhase] = useState('shop');
  const [toast, setToast] = useState(null);
  
  const handlePhaseChange = (phaseId) => {
    setActivePhase(phaseId);
    const phaseNames = {
      shop: '🏪 ร้านค้า',
      arena: '⚔️ อารีน่า',
      exploration: '🗡️ สำรวจ',
      relationship: '💕 ความสัมพันธ์'
    };
    setToast({ message: `📍 ไปยัง: ${phaseNames[phaseId]}`, type: 'info' });
    setTimeout(() => setToast(null), 2500);
  };
  
  const renderPhase = () => {
    switch (activePhase) {
      case 'shop':
        return <ShopPhase />;
      case 'arena':
        return <ArenaPhase />;
      case 'exploration':
        return <ExplorationPhase />;
      case 'relationship':
        return <RelationshipPhase />;
      default:
        return <ShopPhase />;
    }
  };
  
  return (
    <>
      <Head>
        <title>🎮 Gods' Arena - Turn-based RPG</title>
        <meta name="description" content="UI Design for Gods' Arena RPG Game" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="min-h-screen bg-gray-900" style={{ fontFamily: 'Kanit, sans-serif' }}>
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                🎮 Gods' Arena
              </h1>
              <p className="text-gray-400 text-sm">Turn-based RPG</p>
            </div>
            <PhaseIndicator phase={activePhase} />
          </div>
        </div>
        
        {/* Phase Content */}
        <div className="pb-24">
          {renderPhase()}
        </div>
        
        {/* Bottom Navigation */}
        <PhaseNavigation 
          activePhase={activePhase} 
          onPhaseChange={handlePhaseChange} 
        />
        
        {/* Toast */}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
        
        {/* CSS */}
        <style jsx global>{`
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slideUp { animation: slideUp 0.3s ease-out; }
          
          * {
            box-sizing: border-box;
          }
          
          body {
            margin: 0;
            padding: 0;
            background: #111827;
          }
          
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #1f2937;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #4b5563;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }
        `}</style>
      </div>
    </>
  );
}
