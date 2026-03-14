/**
 * Navigation Component
 * 
 * เปลี่ยนระหว่าง battle, conversation, exploration
 */

import React, { useState } from 'react';

// Nav Item Component
const NavItem = ({ icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-gradient-to-b from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30' 
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`}
  >
    <span className="text-2xl">{icon}</span>
    <span className="text-xs font-medium">{label}</span>
    {badge && (
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
        {badge}
      </span>
    )}
    {active && (
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
    )}
  </button>
);

// Context Indicator (แสดงว่าอยู่ใน mode ไหน)
const ContextIndicator = ({ mode }) => {
  const configs = {
    battle: { icon: '⚔️', color: 'from-red-600 to-orange-600', label: 'โหมดต่อสู้' },
    conversation: { icon: '💬', color: 'from-green-600 to-teal-600', label: 'บทสนทนา' },
    exploration: { icon: '🗺️', color: 'from-blue-600 to-purple-600', label: 'สำรวจ' },
  };
  
  const config = configs[mode];
  
  return (
    <div className={`bg-gradient-to-r ${config.color} px-4 py-2 rounded-full flex items-center gap-2 shadow-lg`}>
      <span>{config.icon}</span>
      <span className="font-medium text-white text-sm">{config.label}</span>
    </div>
  );
};

// Notification Toast
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-24 right-4 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-slideUp ${
    type === 'success' ? 'bg-green-600' : 
    type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
  }`}>
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
  </div>
);

// Main Navigation Component
export default function Navigation() {
  const [activeTab, setActiveTab] = useState('exploration');
  const [toast, setToast] = useState(null);
  
  const tabs = [
    { id: 'exploration', icon: '🗺️', label: 'สำรวจ', badge: null },
    { id: 'battle', icon: '⚔️', label: 'ต่อสู้', badge: 2 },
    { id: 'conversation', icon: '💬', label: 'บทสนทนา', badge: 3 },
    { id: 'skills', icon: '✨', label: 'สกิล', badge: null },
    { id: 'inventory', icon: '🎒', label: 'กระเป๋า', badge: 5 },
    { id: 'party', icon: '👥', label: 'ทีม', badge: null },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setToast({ 
      message: `เปลี่ยนไปยัง: ${tabs.find(t => t.id === tabId).label}`, 
      type: 'info' 
    });
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">RPG Navigation</h1>
            <p className="text-gray-400">Turn-based RPG UI Demo</p>
          </div>
          <ContextIndicator mode={activeTab} />
        </div>

        {/* Preview Cards */}
        <div className="grid grid-cols-3 gap-4">
          {tabs.slice(0, 3).map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`p-6 rounded-2xl border-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-purple-500 bg-purple-900/30' 
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <span className="text-4xl block mb-2">{tab.icon}</span>
              <span className="text-white font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 p-4">
          <div className="max-w-4xl mx-auto flex justify-around">
            {tabs.map(tab => (
              <NavItem
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                badge={tab.badge}
                active={activeTab === tab.id}
                onClick={() => handleTabClick(tab.id)}
              />
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
      </div>
      
      {/* CSS for animation */}
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
