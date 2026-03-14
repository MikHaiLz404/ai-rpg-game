/**
 * 💕 Relationship Phase Component
 * 
 * คุยกับเทพ, Bond UI
 * Accessibility: Fixed with semantic buttons, ARIA labels, focus styles, WCAG color contrast
 */

import React, { useState } from 'react';
import Button, { IconButton } from '../Button';

// God Profile Card - Fixed: use button
const GodProfileCard = ({ god, onSelect, isSelected }) => (
  <button
    onClick={() => onSelect(god.id)}
    aria-pressed={isSelected}
    aria-label={`เลือกเทพ ${god.name}, ${god.title}, ระดับความผูกพัน ${god.bondLevel}`}
    className={`w-full bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border-2 cursor-pointer transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
      isSelected ? 'border-pink-500 shadow-lg shadow-pink-500/30' : 'border-gray-700 hover:border-gray-600'
    }`}
  >
    <div className="flex items-center gap-4">
      {/* Avatar */}
      <div 
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-800 flex items-center justify-center text-3xl"
        aria-hidden="true"
      >
        {god.avatar}
      </div>
      
      {/* Info */}
      <div className="flex-1 text-left">
        <h3 className="text-white font-bold text-lg">{god.name}</h3>
        <p className="text-gray-300 text-sm">{god.title}</p>
        
        {/* Bond Level */}
        <div className="flex items-center gap-2 mt-2">
          <div 
            className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden" 
            role="progressbar" 
            aria-valuenow={god.bond} 
            aria-valuemin={0} 
            aria-valuemax={god.maxBond}
            aria-label="แถบความผูกพัน"
          >
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all" 
              style={{ width: `${(god.bond / god.maxBond) * 100}%` }} 
            />
          </div>
          <span className="text-pink-300 text-sm font-bold">Lv.{god.bondLevel}</span>
        </div>
      </div>
      
      {/* Heart Indicator */}
      <div className="text-2xl" aria-hidden="true">💕</div>
    </div>
  </button>
);

// Chat Message
const ChatMessage = ({ message, isPlayer }) => (
  <div className={`flex ${isPlayer ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`max-w-[70%] ${isPlayer ? 'order-2' : 'order-1'}`}>
      {!isPlayer && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl" aria-hidden="true">{message.avatar}</span>
          <span className="text-white font-medium text-sm">{message.sender}</span>
        </div>
      )}
      <div 
        className={`rounded-2xl p-4 ${
          isPlayer 
            ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white' 
            : 'bg-gray-800 text-gray-100 border border-gray-700'
        }`}
      >
        <p>{message.text}</p>
      </div>
      <p className="text-gray-500 text-xs mt-1">{message.time}</p>
    </div>
  </div>
);

// Chat Options - Fixed: proper buttons
const ChatOptions = ({ options, onSelect }) => (
  <div className="space-y-2 mt-4" role="group" aria-label="ตัวเลือกการสนทนา">
    {options.map((option, idx) => (
      <Button
        key={idx}
        onClick={() => onSelect(option)}
        variant="secondary"
        ariaLabel={`เลือก: ${option}`}
        className="w-full text-left justify-start"
      >
        {option}
      </Button>
    ))}
  </div>
);

// Bond Event Card
const BondEventCard = ({ event, onTrigger }) => (
  <article className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
    <div className="flex items-start gap-3">
      <div className="text-3xl" aria-hidden="true">{event.icon}</div>
      <div className="flex-1">
        <h4 className="text-white font-bold">{event.title}</h4>
        <p className="text-gray-300 text-sm mb-2">{event.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-pink-300 text-sm">+{event.bondGain} 💕</span>
          <Button 
            onClick={() => onTrigger(event)}
            variant="primary"
            size="sm"
            ariaLabel={`ทำกิจกรรม ${event.title}`}
          >
            ทำ
          </Button>
        </div>
      </div>
    </div>
  </article>
);

// Main Relationship Phase Component
export default function RelationshipPhase() {
  const [gods, setGods] = useState([
    { 
      id: 1, name: 'อธีน่า', title: 'เทพีแห่งปัญญา', avatar: '🦉', 
      bond: 65, maxBond: 100, bondLevel: 3,
      dialogue: [
        { sender: 'อธีน่า', text: 'สวัสดี นักเดินทาง... วันนี้มีอะไรให้ช่วยไหม?', time: '10:00', avatar: '🦉' }
      ]
    },
    { 
      id: 2, name: 'อพอลโล', title: 'เทพีแห่งดนตรี', avatar: '🎵', 
      bond: 40, maxBond: 100, bondLevel: 2,
      dialogue: []
    },
    { 
      id: 3, name: 'อาร์เทมิส', title: 'นักล่าแห่งป่า', avatar: '🏹', 
      bond: 20, maxBond: 100, bondLevel: 1,
      dialogue: []
    },
    { 
      id: 4, name: 'ไดโอนีซัส', title: 'เทพีแห่งสุข', avatar: '🍷', 
      bond: 10, maxBond: 100, bondLevel: 1,
      dialogue: []
    },
  ]);
  
  const [selectedGodId, setSelectedGodId] = useState(1);
  const [messages, setMessages] = useState([
    { sender: 'อธีน่า', text: 'สวัสดี นักเดินทาง... วันนี้มีอะไรให้ช่วยไหม?', time: '10:00', avatar: '🦉', isPlayer: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [showBondEvents, setShowBondEvents] = useState(false);
  
  const selectedGod = gods.find(g => g.id === selectedGodId);
  
  const chatOptions = [
    '👋 ทักทาย',
    '❓ ถามเรื่องต่างๆ',
    '🎁 ให้ของขวัญ',
    '⚔️ ขอความช่วยเหลือ',
    '💕 บอกความในใจ',
  ];
  
  const bondEvents = [
    { id: 1, icon: '🍽️', title: 'รับประทานอาหารร่วมกัน', description: 'ชวนกินข้าวที่ร้านอาหาร', bondGain: 15 },
    { id: 2, icon: '🎵', title: 'ฟังดนตรี', description: 'ฟังเพลงจากอพอลโล', bondGain: 10 },
    { id: 3, icon: '🌙', title: 'เดินเล่นกลางคืน', description: 'ชมดาวและพูดคุย', bondGain: 20 },
  ];
  
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    setMessages([...messages, { 
      text: inputText, 
      isPlayer: true, 
      time: '10:05' 
    }]);
    
    // Simulated response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: selectedGod.name,
        text: 'เข้าใจแล้ว... ขอบคุณที่บอกนะ',
        time: '10:06',
        avatar: selectedGod.avatar,
        isPlayer: false
      }]);
    }, 500);
    
    setInputText('');
  };
  
  const handleOptionSelect = (option) => {
    const optionResponses = {
      '👋 ทักทาย': `สวัสดีค่ะ ${selectedGod.name}!`,
      '❓ ถามเรื่องต่างๆ': 'มีอะไรอยากรู้คะ?',
      '🎁 ให้ของขวัญ': 'ขอบคุณมากค่ะ! 🎁',
      '⚔️ ขอความช่วยเหลือ': 'จะช่วยเต็มที่ค่ะ!',
      '💕 บอกความในใจ': '...ขอบคุณนะคะ 💕',
    };
    
    setMessages([...messages, { text: optionResponses[option], isPlayer: true, time: '10:05' }]);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: selectedGod.name,
        text: 'เข้าใจแล้วค่ะ',
        time: '10:06',
        avatar: selectedGod.avatar,
        isPlayer: false
      }]);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-pink-900/20 to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span aria-hidden="true">💕</span> ความสัมพันธ์
              <span className="text-lg font-normal text-pink-400">Gods' Arena</span>
            </h1>
            <p className="text-gray-300 mt-1">สร้างความผูกพันกับเทพ</p>
          </div>
          
          <Button
            onClick={() => setShowBondEvents(!showBondEvents)}
            variant="primary"
            ariaLabel={showBondEvents ? 'กลับไปหน้าแชท' : 'ไปหน้ากิจกรรม'}
          >
            {showBondEvents ? '💬 แชท' : '🎯 กิจกรรม'}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* God List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl text-white font-bold mb-4">
              <span aria-hidden="true">👥</span> เทพที่รู้จัก
            </h2>
            <div className="space-y-3" role="listbox" aria-label="รายชื่อเทพ">
              {gods.map(god => (
                <GodProfileCard
                  key={god.id}
                  god={god}
                  onSelect={setSelectedGodId}
                  isSelected={selectedGodId === god.id}
                />
              ))}
            </div>
          </div>
          
          {/* Chat / Bond Events */}
          <div className="lg:col-span-2">
            {showBondEvents ? (
              /* Bond Events */
              <div>
                <h2 className="text-xl text-white font-bold mb-4">
                  <span aria-hidden="true">🎯</span> กิจกรรมเพิ่มความผูกพัน
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="รายการกิจกรรม">
                  {bondEvents.map(event => (
                    <BondEventCard
                      key={event.id}
                      event={event}
                      onTrigger={(e) => console.log('Trigger:', e)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Chat Interface */
              <div 
                className="bg-gray-800/50 rounded-3xl p-4 border border-gray-700 h-[600px] flex flex-col"
                role="application"
                aria-label="ห้องแชทกับเทพ"
              >
                {/* Chat Header */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-700 mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-600 to-rose-800 flex items-center justify-center text-2xl"
                    aria-hidden="true"
                  >
                    {selectedGod.avatar}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{selectedGod.name}</h3>
                    <p className="text-gray-300 text-sm">💕 ความผูกพัน: {selectedGod.bond}/{selectedGod.maxBond}</p>
                  </div>
                </div>
                
                {/* Messages */}
                <div 
                  className="flex-1 overflow-y-auto space-y-2"
                  role="log"
                  aria-label="ข้อความในแชท"
                  aria-live="polite"
                >
                  {messages.map((msg, idx) => (
                    <ChatMessage
                      key={idx}
                      message={msg}
                      isPlayer={msg.isPlayer}
                    />
                  ))}
                </div>
                
                {/* Chat Options */}
                <ChatOptions options={chatOptions} onSelect={handleOptionSelect} />
                
                {/* Input */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                  <label htmlFor="chat-input" className="sr-only">พิมพ์ข้อความ</label>
                  <input
                    id="chat-input"
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="พิมพ์ข้อความ..."
                    className="flex-1 bg-gray-700 text-white rounded-xl px-4 py-3 border border-gray-600 focus:border-pink-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                    aria-label="พิมพ์ข้อความ"
                  />
                  <Button
                    onClick={handleSendMessage}
                    variant="primary"
                    ariaLabel="ส่งข้อความ"
                  >
                    ➤
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
