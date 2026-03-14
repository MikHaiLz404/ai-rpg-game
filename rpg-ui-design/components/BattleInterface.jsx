/**
 * Battle Interface Component
 * Turn-based RPG Combat Screen
 * 
 * Features:
 * - Turn Timeline (ลำดับรอบ)
 * - Player & Enemy Stats
 * - Action Buttons
 * - Grid/Positioning Area
 */

import React, { useState } from 'react';

// Mock Data
const TURN_ORDER = [
  { id: 1, name: 'Hero', type: 'player', avatar: '🧙‍♂️', current: true },
  { id: 2, name: 'Slime', type: 'enemy', avatar: '🟢', current: false },
  { id: 3, name: 'Archer', type: 'player', avatar: '🏹', current: false },
  { id: 4, name: 'Goblin', type: 'enemy', avatar: '👺', current: false },
];

const PLAYER_STATS = {
  name: 'Hero',
  level: 15,
  hp: { current: 245, max: 300 },
  mp: { current: 85, max: 120 },
  exp: { current: 2450, max: 3000 },
  status: 'healthy',
};

const ENEMY_STATS = {
  name: 'Dark Slime',
  level: 12,
  hp: { current: 180, max: 250 },
  mp: { current: 30, max: 50 },
  status: 'enraged',
};

// Health Bar Component
const StatBar = ({ current, max, color = 'red', label }) => {
  const percentage = (current / max) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-300">{current}/{max}</span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <div 
          className={`h-full ${color === 'red' ? 'bg-gradient-to-r from-red-600 to-red-400' : 
            color === 'blue' ? 'bg-gradient-to-r from-blue-600 to-blue-400' : 
            'bg-gradient-to-r from-yellow-600 to-yellow-400'} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Turn Timeline Component
const TurnTimeline = ({ turns }) => {
  return (
    <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
        ⚔️ ลำดับรอบ
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {turns.map((turn, index) => (
          <div 
            key={turn.id}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              turn.current 
                ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-500/50 scale-105' 
                : turn.type === 'player' 
                  ? 'bg-blue-900/30 border border-blue-700/50' 
                  : 'bg-red-900/30 border border-red-700/50'
            }`}
          >
            <span className="text-lg">{turn.avatar}</span>
            <div className="text-sm">
              <span className={`font-medium ${turn.type === 'player' ? 'text-blue-300' : 'text-red-300'}`}>
                {turn.name}
              </span>
              {turn.current && (
                <span className="ml-2 text-xs text-amber-400 animate-pulse">▶ ตานี้</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Player Stats Panel
const PlayerStats = ({ stats }) => {
  return (
    <div className="bg-gradient-to-br from-blue-900/80 to-purple-900/80 rounded-xl p-4 border border-blue-500/30 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl shadow-lg">
          🧙‍♂️
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{stats.name}</h3>
          <span className="text-sm text-blue-300">Lv.{stats.level} • {stats.status}</span>
        </div>
      </div>
      <div className="space-y-2">
        <StatBar current={stats.hp.current} max={stats.hp.max} color="red" label="HP" />
        <StatBar current={stats.mp.current} max={stats.mp.max} color="blue" label="MP" />
        <StatBar current={stats.exp.current} max={stats.exp.max} color="yellow" label="EXP" />
      </div>
    </div>
  );
};

// Enemy Stats Panel
const EnemyStats = ({ stats }) => {
  return (
    <div className="bg-gradient-to-br from-red-900/80 to-gray-900/80 rounded-xl p-4 border border-red-500/30 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-gray-600 flex items-center justify-center text-2xl shadow-lg animate-pulse">
          🟢
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{stats.name}</h3>
          <span className="text-sm text-red-300">Lv.{stats.level} • {stats.status}</span>
        </div>
      </div>
      <div className="space-y-2">
        <StatBar current={stats.hp.current} max={stats.hp.max} color="red" label="HP" />
        <StatBar current={stats.mp.current} max={stats.mp.max} color="blue" label="MP" />
      </div>
    </div>
  );
};

// Action Buttons
const ActionButtons = ({ onAction }) => {
  const actions = [
    { id: 'attack', icon: '⚔️', label: 'โจมตี', color: 'from-red-500 to-red-600', shortcut: '1' },
    { id: 'defend', icon: '🛡️', label: 'ป้องกัน', color: 'from-blue-500 to-blue-600', shortcut: '2' },
    { id: 'skill', icon: '✨', label: 'สกิล', color: 'from-purple-500 to-purple-600', shortcut: '3' },
    { id: 'item', icon: '🎒', label: 'ไอเทม', color: 'from-green-500 to-green-600', shortcut: '4' },
    { id: 'flee', icon: '🏃', label: 'หนี', color: 'from-yellow-500 to-yellow-600', shortcut: '5' },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          className={`relative group flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br ${action.color} hover:scale-105 transition-all shadow-lg hover:shadow-xl active:scale-95`}
        >
          <span className="text-2xl mb-1">{action.icon}</span>
          <span className="text-xs font-medium text-white">{action.label}</span>
          <span className="absolute top-1 right-1 text-[10px] bg-black/30 px-1 rounded text-white/70">
            {action.shortcut}
          </span>
          <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
            กด {action.shortcut} เร็ว
          </div>
        </button>
      ))}
    </div>
  );
};

// Battle Grid
const BattleGrid = () => {
  const gridSize = 6;
  const cells = [];
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const isPlayerZone = col < 3;
      let content = null;
      if (row === 3 && col === 1) content = '🧙‍♂️';
      if (row === 2 && col === 1) content = '🏹';
      if (row === 3 && col === 4) content = '🟢';
      if (row === 2 && col === 4) content = '👺';
      
      cells.push(
        <div
          key={`${row}-${col}`}
          className={`aspect-square rounded-lg flex items-center justify-center text-2xl ${
            isPlayerZone 
              ? 'bg-blue-900/20 border-blue-700/30 hover:bg-blue-900/40' 
              : 'bg-red-900/20 border-red-700/30 hover:bg-red-900/40'
          } border border-dashed transition-all cursor-pointer hover:scale-105`}
        >
          {content}
        </div>
      );
    }
  }

  return (
    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-400">🗺️ สนามรบ</h3>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1 text-blue-400">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>ฝ่ายเรา
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>ศัตรู
          </span>
        </div>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
        {cells}
      </div>
    </div>
  );
};

// Combat Log
const CombatLog = () => {
  const logs = [
    { text: '🧙‍♂️ Hero ใช้ Fireball!', damage: 45 },
    { text: '🟢 Dark Slime ได้รับความเสียหาย 45', damage: -45 },
    { text: '👺 Goblin ใช้ Slash!', damage: 23 },
    { text: '🧙‍♂️ Hero ได้รับความเสียหาย 23', damage: -23 },
  ];

  return (
    <div className="bg-gray-900/90 rounded-xl p-3 border border-gray-700 h-32 overflow-y-auto">
      <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">📜 Combat Log</h3>
      <div className="space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="text-sm text-gray-300 flex items-center gap-2">
            <span>{log.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Battle Interface
export default function BattleInterface() {
  const handleAction = (action) => {
    console.log('Action:', action);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <TurnTimeline turns={TURN_ORDER} />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <PlayerStats stats={PLAYER_STATS} />
          </div>
          <div className="lg:col-span-2">
            <BattleGrid />
          </div>
          <div className="lg:col-span-1">
            <EnemyStats stats={ENEMY_STATS} />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">🎯 การกระทำ</h3>
          <ActionButtons onAction={handleAction} />
        </div>

        <CombatLog />
      </div>
    </div>
  );
}
