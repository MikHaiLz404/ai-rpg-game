/**
 * 🎮 Phase Navigation Component
 * 
 * นำทางระหว่าง 4 Game Phases:
 * - 🏪 Shop Phase
 * - ⚔️ Arena Phase  
 * - 🗡️ Exploration Phase
 * - 💕 Relationship Phase
 */

import React, { useState } from 'react';

// Phase Tab Component
const PhaseTab = ({ phase, icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col items-center gap-2 px-6 py-4 rounded-2xl transition-all ${
      active 
        ? 'bg-gradient-to-b from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30' 
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`}
  >
    <span className="text-3xl">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
    {badge > 0 && (
      <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
        {badge}
      </span>
    )}
    {active && (
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-white rounded-full" />
    )}
  </button>
);

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
    <div className={`bg-gradient-to-r ${config.color} px-5 py-2 rounded-full flex items-center gap-2 shadow-lg`}>
      <span className="text-xl">{config.icon}</span>
      <span className="font-bold text-white">{config.label}</span>
    </div>
  );
};

// Toast Notification
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-28 right-4 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slideUp z-50 ${
    type === 'success' ? 'bg-green-600' : 
    type === 'warning' ? 'bg-yellow-600' : 
    type === 'error' ? 'bg-red-600' : 'bg-blue-600'
  }`}>
    <span className="text-white">{message}</span>
    <button onClick={onClose} className="text-white/70 hover:text-white">✕</button>
  </div>
);

// Main Phase Navigation Component
export default function PhaseNavigation() {
  const [activePhase, setActivePhase] = useState('exploration');
  const [toast, setToast] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const phases = [
    { id: 'shop', icon: '🏪', label: 'ร้านค้า', badge: 3 },
    { id: 'arena', icon: '⚔️', label: 'อารีน่า', badge: 0 },
    { id: 'exploration', icon: '🗡️', label: 'สำรวจ', badge: 0 },
    { id: 'relationship', icon: '💕', label: 'ความสัมพันธ์', badge: 5 },
  ];
  
  const handlePhaseChange = (phaseId) => {
    setActivePhase(phaseId);
    setShowMobileMenu(false);
    setToast({ 
      message: `📍 ไปยัง: ${phases.find(p => p.id === phaseId).label}`, 
      type: 'info' 
    });
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Main Content Area */}
      <div className="pb-24">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">🎮 Gods' Arena</h1>
              <p className="text-gray-400 text-sm">Turn-based RPG</p>
            </div>
            <PhaseIndicator phase={activePhase} />
          </div>
        </div>
        
        {/* Phase Content */}
        <div className="max-w-6xl mx-auto">
          {/* This would be replaced by actual phase components in the full app */}
          <div className="p-6">
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">{phases.find(p => p.id === activePhase)?.icon}</span>
              <h2 className="text-3xl font-bold text-white mb-2">
                {phases.find(p => p.id === activePhase)?.label}
              </h2>
              <p className="text-gray-400">
                Phase: {activePhase}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation - Desktop */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 p-4 z-50">
        <div className="max-w-4xl mx-auto flex justify-around">
          {phases.map(phase => (
            <PhaseTab
              key={phase.id}
              {...phase}
              active={activePhase === phase.id}
              onClick={() => handlePhaseChange(phase.id)}
            />
          ))}
        </div>
      </div>
      
      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 p-3 z-50">
        <div className="flex justify-around">
          {phases.map(phase => (
            <button
              key={phase.id}
              onClick={() => handlePhaseChange(phase.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                activePhase === phase.id ? 'text-white' : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{phase.icon}</span>
              <span className="text-[10px]">{phase.label}</span>
              {phase.badge > 0 && (
                <span className="absolute w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white -top-1">
                  {phase.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {/* CSS Animation */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}
