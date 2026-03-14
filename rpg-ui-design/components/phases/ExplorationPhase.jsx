/**
 * 🗡️ Exploration Phase Component
 * 
 * Map, Monster encounters
 * Accessibility: Fixed with semantic buttons, ARIA labels, focus styles, WCAG color contrast
 */

import React, { useState } from 'react';
import Button, { IconButton } from '../Button';

// Map Node Component - Fixed: use button with aria-label
const MapNode = ({ node, onClick, isActive }) => (
  <button
    onClick={() => onClick(node)}
    aria-label={`เลือกสถานที่: ${node.name}`}
    aria-pressed={isActive}
    className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
      isActive ? 'bg-gradient-to-br from-green-500 to-emerald-700 shadow-lg shadow-green-500/50' : 'bg-gray-700'
    }`}
    style={{ left: node.x, top: node.y }}
  >
    <span aria-hidden="true">{node.icon}</span>
    {node.completed && (
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-xs flex items-center justify-center" aria-label="สำรวจแล้ว">
        ✓
      </span>
    )}
  </button>
);

// Monster Encounter Modal - Fixed: proper buttons with aria-labels
const MonsterEncounter = ({ monster, onBattle, onFlee, onClose }) => (
  <div 
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="monster-title"
  >
    <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-md border-2 border-red-500/50">
      <div className="text-center mb-6">
        <div 
          className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-600 to-orange-800 flex items-center justify-center text-5xl animate-pulse"
          aria-hidden="true"
        >
          {monster.icon}
        </div>
        <h2 id="monster-title" className="text-2xl font-bold text-white">{monster.name}</h2>
        <p className="text-gray-300">{monster.type}</p>
      </div>
      
      <div className="bg-gray-800/50 rounded-2xl p-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-300">ระดับ:</span>
          <span className="text-white font-bold">Lv.{monster.level}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-300">HP:</span>
          <span className="text-red-400 font-bold">{monster.hp}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-300">โจมตี:</span>
          <span className="text-white font-bold">{monster.attack}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">ทอง:</span>
          <span className="text-yellow-400 font-bold">💰{monster.gold}</span>
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button 
          onClick={onFlee} 
          variant="secondary" 
          ariaLabel="หนีจากมอนสเตอร์"
          className="flex-1"
        >
          🏃 หนี
        </Button>
        <Button 
          onClick={onBattle} 
          variant="danger" 
          ariaLabel={`สู้กับ ${monster.name}`}
          className="flex-1"
        >
          ⚔️ สู้!
        </Button>
      </div>
      
      <Button 
        onClick={onClose} 
        variant="ghost" 
        ariaLabel="ปิดหน้าต่าง"
        className="w-full mt-4"
      >
        ❌ ปิด
      </Button>
    </div>
  </div>
);

// Location Info Panel - Fixed: proper button
const LocationInfo = ({ location, onEnter }) => (
  <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
    <div className="flex items-center gap-4">
      <div 
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-800 flex items-center justify-center text-3xl"
        aria-hidden="true"
      >
        {location.icon}
      </div>
      <div className="flex-1">
        <h3 className="text-white font-bold text-lg">{location.name}</h3>
        <p className="text-gray-300 text-sm">{location.description}</p>
        <div className="flex gap-2 mt-2">
          {location.features.map((f, i) => (
            <span key={i} className="px-2 py-1 bg-blue-900/50 rounded-lg text-xs text-blue-200">
              {f}
            </span>
          ))}
        </div>
      </div>
      <Button
        onClick={onEnter}
        variant="success"
        ariaLabel={`เข้าสู่ ${location.name}`}
      >
        เข้า →
      </Button>
    </div>
  </div>
);

// Main Exploration Phase Component
export default function ExplorationPhase() {
  const [mapNodes] = useState([
    { id: 1, name: 'หมู่บ้าน', icon: '🏠', x: '10%', y: '80%', type: 'village', completed: true },
    { id: 2, name: 'ป่าดิบชื้น', icon: '🌲', x: '25%', y: '60%', type: 'forest', completed: false },
    { id: 3, name: 'ถ้ำมืด', icon: '🕳️', x: '50%', y: '40%', type: 'cave', completed: false },
    { id: 4, name: 'ภูเขา', icon: '⛰️', x: '75%', y: '30%', type: 'mountain', completed: false },
    { id: 5, name: 'วัดโบราณ', icon: '🏛️', x: '85%', y: '60%', type: 'temple', completed: false },
  ]);
  
  const [currentLocation, setCurrentLocation] = useState(null);
  const [encounteredMonster, setEncounteredMonster] = useState(null);
  const [exploredPercent, setExploredPercent] = useState(20);
  
  const locations = [
    { 
      id: 1, name: 'หมู่บ้านชาวนา', icon: '🏠', description: 'ศูนย์กลางการค้าและพักผ่อน',
      features: ['ร้านค้า', 'โรงเตี๊ยม', 'ผู้เล่าเรื่อง']
    },
    { 
      id: 2, name: 'ป่าดิบชื้น', icon: '🌲', description: 'ป่าที่มีสัตว์ประหลาดและสมบัติ',
      features: ['สัตว์ป่า', 'สมบัติ', 'พืชหายาก']
    },
  ];
  
  const monsters = [
    { id: 1, name: 'หมาป่า', icon: '🐺', type: 'สัตว์ป่า', level: 3, hp: 150, attack: 20, gold: 30 },
    { id: 2, name: 'Goblin', icon: '👺', type: 'ปีศาจ', level: 5, hp: 200, attack: 35, gold: 50 },
    { id: 3, name: 'สไลม์', icon: '🟢', type: 'มอนสเตอร์', level: 1, hp: 80, attack: 10, gold: 15 },
  ];
  
  const handleNodeClick = (node) => {
    setCurrentLocation(node);
  };
  
  const handleRandomEncounter = () => {
    const randomMonster = monsters[Math.floor(Math.random() * monsters.length)];
    setEncounteredMonster(randomMonster);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span aria-hidden="true">🗡️</span> สำรวจ
              <span className="text-lg font-normal text-green-400">Gods' Arena</span>
            </h1>
            <p className="text-gray-300 mt-1">สำรวจโลก พบกับมอนสเตอร์ และค้นหาสมบัติ</p>
          </div>
          
          {/* Progress */}
          <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3" role="progressbar" aria-valuenow={exploredPercent} aria-valuemin={0} aria-valuemax={100} aria-label="ความคืบหน้าการสำรวจ">
              <span className="text-2xl" aria-hidden="true">🗺️</span>
              <div>
                <p className="text-gray-300 text-sm">สำรวจแล้ว</p>
                <p className="text-white font-bold">{exploredPercent}%</p>
              </div>
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden" aria-hidden="true">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all" style={{ width: `${exploredPercent}%` }} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Map Section */}
        <div className="mb-8">
          <h2 className="text-xl text-white font-bold mb-4 flex items-center gap-2">
            <span aria-hidden="true">🗺️</span> แผนที่โลก
          </h2>
          
          {/* Map Container */}
          <div 
            className="relative h-96 bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl border-2 border-gray-700 overflow-hidden"
            role="application"
            aria-label="แผนที่โลกเกม"
          >
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'linear-gradient(gray 1px, transparent 1px), linear-gradient(90deg, gray 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} aria-hidden="true" />
            
            {/* Map Nodes */}
            {mapNodes.map(node => (
              <MapNode
                key={node.id}
                node={node}
                onClick={handleNodeClick}
                isActive={currentLocation?.id === node.id}
              />
            ))}
            
            {/* Current Location Marker */}
            <div className="absolute bottom-4 left-4 bg-blue-600/80 px-3 py-2 rounded-lg text-white text-sm" aria-live="polite">
              📍 ตำแหน่งปัจจุบัน: {currentLocation?.name || 'หมู่บ้าน'}
            </div>
          </div>
        </div>
        
        {/* Location Info */}
        {currentLocation && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl text-white font-bold">
                <span aria-hidden="true">📍</span> สถานที่ปัจจุบัน
              </h2>
              <IconButton 
                onClick={() => setCurrentLocation(null)}
                ariaLabel="ปิดข้อมูลสถานที่"
                variant="ghost"
              >
                ✕
              </IconButton>
            </div>
            
            <LocationInfo 
              location={currentLocation.type === 'village' ? locations[0] : locations[1]}
              onEnter={handleRandomEncounter}
            />
          </div>
        )}
        
        {/* Quick Actions */}
        <div>
          <h2 className="text-xl text-white font-bold mb-4">
            <span aria-hidden="true">⚡</span> การกระทำด่วน
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="group" aria-label="การกระทำด่วน">
            <Button 
              onClick={handleRandomEncounter} 
              variant="danger"
              ariaLabel="สุ่มเจอมอนสเตอร์"
              className="p-4 bg-red-900/30 rounded-2xl border border-red-500/30 hover:border-red-500 transition-all"
              fullWidth
            >
              <span className="text-3xl block mb-2" aria-hidden="true">👹</span>
              <span className="text-white font-medium">สุ่มเจอมอนสเตอร์</span>
            </Button>
            <Button 
              variant="primary"
              ariaLabel="ค้นหาสมบัติ"
              className="p-4 bg-blue-900/30 rounded-2xl border border-blue-500/30 hover:border-blue-500 transition-all"
              fullWidth
            >
              <span className="text-3xl block mb-2" aria-hidden="true">🔍</span>
              <span className="text-white font-medium">ค้นหาสมบัติ</span>
            </Button>
            <Button 
              variant="secondary"
              ariaLabel="เดินทางเร็ว"
              className="p-4 bg-purple-900/30 rounded-2xl border border-purple-500/30 hover:border-purple-500 transition-all"
              fullWidth
            >
              <span className="text-3xl block mb-2" aria-hidden="true">🧭</span>
              <span className="text-white font-medium">เดินทางเร็ว</span>
            </Button>
            <Button 
              variant="success"
              ariaLabel="พักผ่อน"
              className="p-4 bg-green-900/30 rounded-2xl border border-green-500/30 hover:border-green-500 transition-all"
              fullWidth
            >
              <span className="text-3xl block mb-2" aria-hidden="true">⛺</span>
              <span className="text-white font-medium">พักผ่อน</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Monster Encounter Modal */}
      {encounteredMonster && (
        <MonsterEncounter
          monster={encounteredMonster}
          onBattle={() => console.log('Start battle:', encounteredMonster)}
          onFlee={() => setEncounteredMonster(null)}
          onClose={() => setEncounteredMonster(null)}
        />
      )}
    </div>
  );
}
