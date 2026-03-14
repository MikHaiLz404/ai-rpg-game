/**
 * ⚔️ Arena Phase Component
 * 
 * เลือกเทพ, ดู combat, ใช้ buffs
 * Accessibility: Fixed with semantic buttons, ARIA labels, focus styles, WCAG color contrast
 */

import React, { useState } from 'react';
import Button, { IconButton } from '../Button';

// God Card Component - Fixed: use button for selection
const GodCard = ({ god, selected, onSelect, onViewStats }) => (
  <button
    onClick={() => onSelect(god.id)}
    aria-pressed={selected}
    aria-label={`เลือกเทพ ${god.name}, ${god.title}`}
    className={`relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border-2 cursor-pointer transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
      selected ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 'border-gray-700 hover:border-gray-600'
    }`}
  >
    {/* Selection Indicator */}
    {selected && (
      <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm" aria-label="เลือกแล้ว">
        ✓
      </div>
    )}
    
    {/* God Avatar */}
    <div 
      className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center text-4xl shadow-lg"
      aria-hidden="true"
    >
      {god.avatar}
    </div>
    
    {/* God Info */}
    <h3 className="text-white font-bold text-lg text-center">{god.name}</h3>
    <p className="text-gray-300 text-sm text-center mb-3">{god.title}</p>
    
    {/* Stats Preview */}
    <div className="grid grid-cols-3 gap-2 text-center mb-4" role="group" aria-label="สถิติเทพ">
      <div>
        <p className="text-red-400 text-xs" aria-hidden="true">⚔️</p>
        <p className="text-white font-bold">{god.stats.attack}</p>
      </div>
      <div>
        <p className="text-blue-400 text-xs" aria-hidden="true">🛡️</p>
        <p className="text-white font-bold">{god.stats.defense}</p>
      </div>
      <div>
        <p className="text-yellow-400 text-xs" aria-hidden="true">⚡</p>
        <p className="text-white font-bold">{god.stats.speed}</p>
      </div>
    </div>
    
    {/* Buffs Available */}
    <div className="flex flex-wrap gap-1 justify-center" role="list" aria-label="บัฟที่มี">
      {god.buffs.map((buff, idx) => (
        <span key={idx} className="px-2 py-1 bg-purple-900/50 rounded-lg text-xs text-purple-200" role="listitem">
          {buff}
        </span>
      ))}
    </div>
    
    <Button 
      onClick={(e) => { e.stopPropagation(); onViewStats(god); }}
      variant="secondary"
      size="sm"
      ariaLabel={`ดูสถิติของ ${god.name}`}
      className="w-full mt-4"
    >
      📊 ดูสถิติ
    </Button>
  </button>
);

// Combat Arena View
const CombatView = ({ god, enemy, logs, onUseBuff }) => {
  const [godHP, setGodHP] = useState(god.stats.hp);
  const [enemyHP, setEnemyHP] = useState(enemy.stats.hp);
  
  const godPercent = (godHP / god.stats.hp) * 100;
  const enemyPercent = (enemyHP / enemy.stats.hp) * 100;
  
  return (
    <div className="bg-gray-900/80 rounded-3xl p-6 border border-gray-700">
      {/* Combat Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center text-3xl"
            aria-hidden="true"
          >
            {god.avatar}
          </div>
          <div>
            <h3 className="text-white font-bold">{god.name}</h3>
            <div 
              className="w-32 h-3 bg-gray-700 rounded-full mt-1 overflow-hidden" 
              role="progressbar" 
              aria-valuenow={godPercent} 
              aria-valuemin={0} 
              aria-valuemax={100}
              aria-label="HP ของเทพ"
            >
              <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all" style={{ width: `${godPercent}%` }} />
            </div>
            <p className="text-gray-300 text-xs mt-1">{godHP}/{god.stats.hp} HP</p>
          </div>
        </div>
        
        <span className="text-3xl text-gray-400" aria-hidden="true">VS</span>
        
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-white font-bold text-right">{enemy.name}</h3>
            <div 
              className="w-32 h-3 bg-gray-700 rounded-full mt-1 overflow-hidden" 
              role="progressbar" 
              aria-valuenow={enemyPercent} 
              aria-valuemin={0} 
              aria-valuemax={100}
              aria-label="HP ของศัตรู"
            >
              <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all" style={{ width: `${enemyPercent}%` }} />
            </div>
            <p className="text-gray-300 text-xs mt-1 text-right">{enemyHP}/{enemy.stats.hp} HP</p>
          </div>
          <div 
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-orange-800 flex items-center justify-center text-3xl"
            aria-hidden="true"
          >
            {enemy.avatar}
          </div>
        </div>
      </div>
      
      {/* Buff Buttons */}
      <div className="flex gap-3 mb-6" role="group" aria-label="ปุ่มบัฟ">
        {god.buffs.map((buff, idx) => (
          <Button
            key={idx}
            onClick={() => onUseBuff(buff)}
            variant="primary"
            ariaLabel={`ใช้บัฟ ${buff}`}
            className="flex-1"
          >
            ✨ {buff}
          </Button>
        ))}
      </div>
      
      {/* Combat Log */}
      <div 
        className="bg-gray-800/50 rounded-2xl p-4 h-48 overflow-y-auto"
        role="log" 
        aria-label="บันทึกการต่อสู้"
        aria-live="polite"
      >
        <h4 className="text-gray-300 text-sm mb-3">⚔️ บันทึกการต่อสู้</h4>
        <div className="space-y-2" role="list">
          {logs.map((log, idx) => (
            <div key={idx} className="text-sm" role="listitem">
              <span className="text-gray-500">[{idx + 1}]</span>{' '}
              <span className={log.type === 'god' ? 'text-purple-200' : log.type === 'enemy' ? 'text-red-200' : 'text-yellow-200'}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Arena Phase Component
export default function ArenaPhase() {
  const [gods, setGods] = useState([
    { 
      id: 1, name: 'โอดิน', title: 'ราชาแห่งความวิเศษ', avatar: '👑', 
      stats: { hp: 1000, attack: 85, defense: 70, speed: 90 },
      buffs: ['ฟื้นฟู', 'เร่งความเร็ว', 'โจมตีพิเศษ']
    },
    { 
      id: 2, name: 'อาธีน่า', title: 'เทพีแห่งปัญญา', avatar: '🦉', 
      stats: { hp: 800, attack: 60, defense: 95, speed: 75 },
      buffs: ['เกราะเวท', 'ชะลอศัตรู', 'รักษา']
    },
    { 
      id: 3, name: 'อพอลโล', title: 'เทพีแห่งดนตรี', avatar: '🎵', 
      stats: { hp: 750, attack: 95, defense: 60, speed: 85 },
      buffs: ['เสียงประหลาด', 'พลังเสียง', 'ร่ายระบำ']
    },
    { 
      id: 4, name: 'อาร์เทมิส', title: 'นักล่าแห่งป่า', avatar: '🏹', 
      stats: { hp: 700, attack: 100, defense: 55, speed: 95 },
      buffs: ['ลอบเร้น', 'ธนูพิษ', 'เรียกหมาป่า']
    },
  ]);
  
  const [selectedGod, setSelectedGod] = useState(null);
  const [showCombat, setShowCombat] = useState(false);
  const [combatLogs, setCombatLogs] = useState([]);
  
  const enemies = [
    { id: 1, name: 'มังกร', avatar: '🐉', stats: { hp: 2000, attack: 80, defense: 60, speed: 50 } },
    { id: 2, name: 'ไททัน', avatar: '🗿', stats: { hp: 2500, attack: 90, defense: 80, speed: 30 } },
  ];
  
  const handleStartCombat = () => {
    if (!selectedGod) return;
    setShowCombat(true);
    setCombatLogs([
      { type: 'info', message: '⚔️ การต่อสู้เริ่มต้น!' },
      { type: 'god', message: `✨ ${gods.find(g => g.id === selectedGod).name} พร้อมแล้ว` },
      { type: 'enemy', message: `🐉 มังกรปรากฏกาณ!` },
    ]);
  };
  
  const handleUseBuff = (buff) => {
    setCombatLogs([...combatLogs, { type: 'god', message: `✨ ใช้บัฟ: ${buff}!` }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span aria-hidden="true">⚔️</span> อารีน่า
              <span className="text-lg font-normal text-purple-400">Gods' Arena</span>
            </h1>
            <p className="text-gray-300 mt-1">เลือกเทพและเข้าร่วมการต่อสู้</p>
          </div>
          
          {selectedGod && !showCombat && (
            <Button
              onClick={handleStartCombat}
              variant="danger"
              ariaLabel="เริ่มการต่อสู้"
            >
              ⚔️ เริ่มต่อสู้
            </Button>
          )}
        </div>
        
        {!showCombat ? (
          <>
            {/* God Selection */}
            <div className="mb-6">
              <h2 className="text-xl text-white font-bold mb-4">
                <span aria-hidden="true">👥</span> เลือกเทพ (เลือกได้ 1 ตัว)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="listbox" aria-label="รายชื่อเทพ">
                {gods.map(god => (
                  <GodCard
                    key={god.id}
                    god={god}
                    selected={selectedGod === god.id}
                    onSelect={setSelectedGod}
                    onViewStats={(g) => console.log('View stats:', g)}
                  />
                ))}
              </div>
            </div>
            
            {/* Enemy Info */}
            <div>
              <h2 className="text-xl text-white font-bold mb-4">
                <span aria-hidden="true">👹</span> ศัตรู
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list" aria-label="รายชื่อศัตรู">
                {enemies.map(enemy => (
                  <div 
                    key={enemy.id} 
                    className="bg-gray-800/80 rounded-2xl p-5 border border-gray-700"
                    role="listitem"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-orange-800 flex items-center justify-center text-3xl"
                        aria-hidden="true"
                      >
                        {enemy.avatar}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{enemy.name}</h3>
                        <p className="text-gray-300 text-sm">HP: {enemy.stats.hp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Combat View */
          <div>
            <div className="flex justify-between items-center mb-6">
              <Button
                onClick={() => setShowCombat(false)}
                variant="secondary"
                ariaLabel="กลับไปหน้าเลือกเทพ"
              >
                ← กลับ
              </Button>
              <h2 className="text-xl text-white font-bold">
                <span aria-hidden="true">⚔️</span> กำลังต่อสู้
              </h2>
              <div className="w-24" />
            </div>
            
            <CombatView
              god={gods.find(g => g.id === selectedGod)}
              enemy={enemies[0]}
              logs={combatLogs}
              onUseBuff={handleUseBuff}
            />
          </div>
        )}
      </div>
    </div>
  );
}
