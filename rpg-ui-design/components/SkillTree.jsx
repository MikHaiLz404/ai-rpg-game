/**
 * Skill Tree UI Component
 * 
 * Features:
 * - Main Skill Tree Visualization (Node-based)
 * - Relationship Skill Tree (AI-generated connections)
 */

import React, { useState } from 'react';

// Skill Node Data
const SKILL_NODES = {
  // Fire Branch
  fire1: { id: 'fire1', name: 'Fireball', icon: '🔥', x: 0, y: 0, unlocked: true, cost: 1 },
  fire2a: { id: 'fire2a', name: 'Inferno', icon: '🔥', x: 1, y: -1, unlocked: true, cost: 2, parent: 'fire1' },
  fire2b: { id: 'fire2b', name: 'Fire Shield', icon: '🛡️', x: 1, y: 1, unlocked: false, cost: 2, parent: 'fire1' },
  fire3: { id: 'fire3', name: 'Meteor', icon: '☄️', x: 2, y: -1, unlocked: false, cost: 3, parent: 'fire2a' },
  
  // Ice Branch
  ice1: { id: 'ice1', name: 'Ice Bolt', icon: '❄️', x: 0, y: 3, unlocked: true, cost: 1 },
  ice2a: { id: 'ice2a', name: 'Blizzard', icon: '🌨️', x: 1, y: 2, unlocked: false, cost: 2, parent: 'ice1' },
  ice2b: { id: 'ice2b', name: 'Ice Wall', icon: '🧊', x: 1, y: 4, unlocked: true, cost: 2, parent: 'ice1' },
  ice3: { id: 'ice3', name: 'Absolute Zero', icon: '🥶', x: 2, y: 3, unlocked: false, cost: 3, parent: 'ice2a' },
  
  // Lightning Branch
  lightning1: { id: 'lightning1', name: 'Thunder', icon: '⚡', x: 0, y: 6, unlocked: true, cost: 1 },
  lightning2: { id: 'lightning2', name: 'Chain Lightning', icon: '💥', x: 1, y: 6, unlocked: false, cost: 2, parent: 'lightning1' },
  
  // Ultimate
  ultimate: { id: 'ultimate', name: 'Elemental Mastery', icon: '🌟', x: 3, y: 1, unlocked: false, cost: 5, requires: ['fire3', 'ice3', 'lightning2'] },
};

// Relationship Data (AI-generated connections)
const RELATIONSHIPS = [
  { from: 'fire1', to: 'fire2a', type: 'synergy', label: 'เพิ่มความเสียหาย +20%' },
  { from: 'fire1', to: 'fire2b', type: 'tradeoff', label: 'แลกเปลี่ยน: MP -10' },
  { from: 'ice1', to: 'ice2a', type: 'synergy', label: 'Freeze เพิ่ม 1 เทิร์น' },
  { from: 'fire2a', to: 'fire3', type: 'synergy', label: 'ติด Crit +15%' },
  { from: 'fire3', to: 'ultimate', type: 'unlock', label: 'ปลดล็อก Ultimate' },
  { from: 'ice3', to: 'ultimate', type: 'unlock', label: 'ปลดล็อก Ultimate' },
  { from: 'lightning2', to: 'ultimate', type: 'unlock', label: 'ปลดล็อก Ultimate' },
];

// Skill Node Component
const SkillNode = ({ skill, onClick, selected }) => {
  const isLocked = !skill.unlocked;
  const canUnlock = !isLocked;
  
  return (
    <div
      onClick={() => canUnlock && onClick(skill)}
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer ${
        isLocked ? 'opacity-40 grayscale' : 'hover:scale-110'
      } ${selected ? 'scale-125 z-10' : ''}`}
      style={{ left: `${20 + skill.x * 25}%`, top: `${15 + skill.y * 10}%` }}
    >
      <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center border-2 transition-all ${
        isLocked 
          ? 'bg-gray-800 border-gray-600' 
          : skill.cost <= 1 
            ? 'bg-gradient-to-br from-green-600 to-green-500 border-green-400 shadow-green-500/30 shadow-lg'
            : skill.cost <= 2
              ? 'bg-gradient-to-br from-blue-600 to-blue-500 border-blue-400 shadow-blue-500/30 shadow-lg'
              : 'bg-gradient-to-br from-purple-600 to-purple-500 border-purple-400 shadow-purple-500/30 shadow-lg'
      }`}>
        <span className="text-2xl">{skill.icon}</span>
        <span className="text-[10px] text-white/80 mt-1 text-center px-1">{skill.name}</span>
      </div>
      {skill.unlocked && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs">
          ✓
        </div>
      )}
    </div>
  );
};

// Connection Lines (SVG)
const SkillConnections = () => {
  const lines = [];
  
  Object.values(SKILL_NODES).forEach(skill => {
    if (skill.parent) {
      const parent = SKILL_NODES[skill.parent];
      const x1 = 20 + parent.x * 25;
      const y1 = 15 + parent.y * 10;
      const x2 = 20 + skill.x * 25;
      const y2 = 15 + skill.y * 10;
      
      lines.push(
        <line
          key={`${skill.parent}-${skill.id}`}
          x1={`${x1}%`}
          y1={`${y1}%`}
          x2={`${x2}%`}
          y2={`${y2}%`}
          className="stroke-gray-600"
          strokeWidth="2"
          strokeDasharray={skill.unlocked ? "0" : "5,5"}
        />
      );
    }
  });
  
  return <svg className="absolute inset-0 w-full h-full pointer-events-none">{lines}</svg>;
};

// Skill Detail Panel
const SkillDetail = ({ skill, onClose }) => {
  if (!skill) return null;
  
  return (
    <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl p-4 border border-gray-700 fixed right-4 top-4 w-64 z-50">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{skill.icon}</span>
          <div>
            <h3 className="font-bold text-white">{skill.name}</h3>
            <span className="text-xs text-gray-400">Cost: {skill.cost} SP</span>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">สถานะ:</span>
          <span className={skill.unlocked ? 'text-green-400' : 'text-yellow-400'}>
            {skill.unlocked ? '✅ ปลดล็อกแล้ว' : '🔒 ยังไม่ปลดล็อก'}
          </span>
        </div>
        
        <p className="text-gray-300 text-xs">
          {skill.id.includes('fire') && '🔥 สกิลไฟ - ความเสียหายสูง ใช้ MP ปานกลาง'}
          {skill.id.includes('ice') && '❄️ สกิลน้ำแข็ง - ความช้ำปานกลาง มีโอกาส Freeze'}
          {skill.id.includes('lightning') && '⚡ สกิลสายฟ้า - ความเร็วสูง กระจายได้'}
          {skill.id.includes('ultimate') && '🌟 สกิลท่าไม้ตาย - ทำความเสียหายทุกธาตุ'}
        </p>
        
        {!skill.unlocked && skill.cost && (
          <button className="w-full mt-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white text-sm font-medium hover:opacity-90">
            🔓 ปลดล็อก ({skill.cost} SP)
          </button>
        )}
      </div>
    </div>
  );
};

// Relationship Tree View
const RelationshipTree = () => {
  return (
    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-400 mb-4">🔗 ความสัมพันธ์ระหว่างสกิล (AI Analysis)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {RELATIONSHIPS.map((rel, i) => {
          const fromSkill = SKILL_NODES[rel.from];
          const toSkill = SKILL_NODES[rel.to];
          
          return (
            <div key={i} className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{fromSkill.icon}</span>
                <span className="text-gray-500">→</span>
                <span className="text-lg">{toSkill.icon}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-300">{fromSkill.name}</span>
                <span className="text-xs text-gray-500">→</span>
                <span className="text-sm text-gray-300">{toSkill.name}</span>
              </div>
              <div className={`text-xs px-2 py-1 rounded inline-block ${
                rel.type === 'synergy' ? 'bg-green-900/50 text-green-300' :
                rel.type === 'tradeoff' ? 'bg-yellow-900/50 text-yellow-300' :
                'bg-blue-900/50 text-blue-300'
              }`}>
                {rel.type === 'synergy' && '🤝 Synergy'}
                {rel.type === 'tradeoff' && '⚖️ Trade-off'}
                {rel.type === 'unlock' && '🔓 Unlock'}
              </div>
              <p className="text-xs text-gray-400 mt-2">{rel.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Tab Component
const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium transition-all ${
      active 
        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
    }`}
  >
    {children}
  </button>
);

// Main Skill Tree Component
export default function SkillTree() {
  const [activeTab, setActiveTab] = useState('main');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillPoints] = useState(8); // Available skill points

  const handleSkillClick = (skill) => {
    setSelectedSkill(skill);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">🌳 ทรีสกิล</h1>
            <p className="text-gray-400">จัดการและปลดล็อกสกิลต่างๆ</p>
          </div>
          <div className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700">
            <span className="text-2xl">⭐</span>
            <div>
              <span className="text-sm text-gray-400">Skill Points</span>
              <div className="text-2xl font-bold text-yellow-400">{skillPoints}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <TabButton active={activeTab === 'main'} onClick={() => setActiveTab('main')}>
            🌳 ทรีหลัก
          </TabButton>
          <TabButton active={activeTab === 'relationships'} onClick={() => setActiveTab('relationships')}>
            🔗 ความสัมพันธ์
          </TabButton>
          <TabButton active={activeTab === 'learned'} onClick={() => setActiveTab('learned')}>
            ✅ สกิลที่เรียนแล้ว
          </TabButton>
        </div>

        {/* Main Skill Tree */}
        {activeTab === 'main' && (
          <div className="relative bg-gray-900/70 rounded-2xl p-8 border border-gray-700 h-[500px] overflow-hidden">
            {/* Branch Labels */}
            <div className="absolute top-4 left-4 text-sm">
              <span className="text-red-400">🔥 Fire</span>
            </div>
            <div className="absolute top-4 left-1/3 text-sm">
              <span className="text-blue-400">❄️ Ice</span>
            </div>
            <div className="absolute top-4 right-4 text-sm">
              <span className="text-yellow-400">⚡ Lightning</span>
            </div>
            
            {/* Connections */}
            <SkillConnections />
            
            {/* Skill Nodes */}
            {Object.values(SKILL_NODES).map(skill => (
              <SkillNode 
                key={skill.id} 
                skill={skill} 
                onClick={handleSkillClick}
                selected={selectedSkill?.id === skill.id}
              />
            ))}
            
            {/* Skill Detail Panel */}
            <SkillDetail skill={selectedSkill} onClose={() => setSelectedSkill(null)} />
          </div>
        )}

        {/* Relationship Tree */}
        {activeTab === 'relationships' && <RelationshipTree />}

        {/* Learned Skills */}
        {activeTab === 'learned' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(SKILL_NODES).filter(s => s.unlocked).map(skill => (
              <div key={skill.id} className="bg-gray-800/70 rounded-xl p-4 border border-gray-600 flex items-center gap-3">
                <span className="text-3xl">{skill.icon}</span>
                <div>
                  <h4 className="font-bold text-white">{skill.name}</h4>
                  <span className="text-xs text-gray-400">Lv.{skill.cost}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
