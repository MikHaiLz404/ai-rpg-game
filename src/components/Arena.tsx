'use client';
import { useState, useEffect } from 'react';
import { useGameStore, DivineSkill } from '@/store/gameStore';
import { EventBus } from '@/game/EventBus';

const ENEMIES = [
  { id: 'slime', name: 'Slime', emoji: '🦠', hp: 30, atk: 5, reward: 20, image: '/images/enemies/slime/idle/enemies-slime1_idle.png', frames: 3 },
  { id: 'skeleton', name: 'Skeleton', emoji: '💀', hp: 70, atk: 15, reward: 60, image: '/images/enemies/skeleton/idle/enemies-skeleton2_idle.png', frames: 6 },
  { id: 'demon', name: 'Vampire Lord', emoji: '🧛', hp: 250, atk: 45, reward: 500, image: '/images/enemies/demon/idle/enemies-vampire_idle.png', frames: 6 },
];

const CHAMPION = {
  id: 'kane',
  name: 'Kane',
  idleImage: '/images/characters/npcs/kane/idle/hero_idle_RIGHT.png',
  attackImage: '/images/characters/npcs/kane/attack/hero_bow_RIGHT.png'
};

export default function Arena() {
  const { gold, addGold, companions, getBondBonus, addBond, setDialogue, defeatVampire, gameOver, choicesLeft, consumeChoice } = useGameStore();
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(0);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [selectedEnemy, setSelectedEnemy] = useState<typeof ENEMIES[0] | null>(null);
  const [inCombat, setInCombat] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [spriteFrame, setSpriteFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSpriteFrame(f => f + 1), 150);
    return () => clearInterval(interval);
  }, []);

  const availableSkills = companions.flatMap(c => c.unlockedSkills);

  const startCombat = (enemy: typeof ENEMIES[0]) => {
    if (choicesLeft <= 0) {
      setDialogue({
        speaker: 'Minju',
        text: 'วันนี้เหนื่อยมากแล้วค่ะ... เราพักผ่อนแล้วค่อยลุยใหม่พรุ่งนี้ดีไหมคะ?',
        portrait: 'work'
      });
      return;
    }

    setSelectedEnemy(enemy);
    setEnemyHp(enemy.hp);
    setPlayerHp(100);
    setResult(null);
    setCombatLog([`⚔️ เริ่มการต่อสู้: Kane ปะทะ ${enemy.name}`]);
    setInCombat(true);
    consumeChoice();

    // Update Phaser scene enemy sprite
    EventBus.emit('arena-enemy-change', { enemyType: enemy.id });

    setDialogue({
      speaker: 'Minju',
      text: `เคน ตั้งสมาธินะ! ${enemy.name} ตัวนี้ดูอันตรายมาก ถ้าจำเป็นก็ใช้พลังเทพช่วยเลย!`,
      portrait: 'work'
    });
  };
  
  const executeAttack = async (skill?: DivineSkill) => {
    if (!selectedEnemy || result || isAttacking) return;
    
    setIsAttacking(true);
    
    // Play attack effect in Phaser
    EventBus.emit('arena-attack', { target: 'enemy' });

    const totalBonusAtk = companions.reduce((acc, c) => acc + getBondBonus(c.id).atk, 0);
    
    const multiplier = skill ? skill.multiplier : 1.0;
    const playerDmg = Math.floor((Math.random() * 10 + 15 + totalBonusAtk) * multiplier);
    
    const newEnemyHp = Math.max(0, enemyHp - playerDmg);
    setEnemyHp(newEnemyHp);
    
    try {
      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'attack',
          playerName: skill ? `Kane using ${skill.name}` : 'Kane',
          enemyName: selectedEnemy.name,
          damage: playerDmg
        })
      });
      const data = await res.json();
      const narrative = data.narrative || `Kane โจมตีใส่ ${playerDmg}!`;
      setCombatLog(prev => [`🏹 ${narrative}`, ...prev]);
      
      if (skill) {
        // Using a god's skill increases bond with that god
        if (skill.godId) {
          addBond(skill.godId, 1);
        }
        setDialogue({
          speaker: 'Minju',
          text: `เยี่ยมมาก! ${skill.name} เมื่อกี้สมบูรณ์แบบที่สุด ลุยต่อเลย!`,
          portrait: 'happy'
        });
      }
    } catch (err) {
      setCombatLog(prev => [`🏹 Kane โจมตีใส่ ${playerDmg}!`, ...prev]);
    }
    
    if (newEnemyHp <= 0) {
      setResult('win');
      addGold(selectedEnemy.reward);
      setIsAttacking(false);

      // Play death animation in Phaser
      EventBus.emit('arena-enemy-death');

      // Check if vampire lord defeated
      if (selectedEnemy.id === 'demon') {
        defeatVampire();
        setDialogue({
          speaker: 'Minju',
          text: `เรา... เราล้มเจ้าแห่งแวมไพร์ได้จริงๆ ด้วย! พรของเหล่าเทพช่วยเราไว้แท้ๆ เลย!`,
          portrait: 'happy'
        });
      } else {
        setDialogue({
          speaker: 'Minju',
          text: `ชัยชนะเป็นของเรา! ทำได้ดีมากเคน! ทอง ${selectedEnemy.reward} เหรียญนี้จะช่วยร้านเราได้เยอะเลย`,
          portrait: 'happy'
        });
      }
      return;
    }
    
    // Enemy counter
    setTimeout(async () => {
      const enemyDmg = Math.floor(Math.random() * selectedEnemy.atk) + 5;
      const newPlayerHp = Math.max(0, playerHp - enemyDmg);
      setPlayerHp(newPlayerHp);
      
      // Play counter attack effect in Phaser
      EventBus.emit('arena-attack', { target: 'player' });

      if (newPlayerHp <= 0) {
        setResult('lose');
        setDialogue({
          speaker: 'Minju',
          text: `เคน! ไม่นะ! เรารีบถอยไปพักผ่อนกันก่อนเถอะ อย่าฝืนตัวเองเกินไปนะ!`,
          portrait: 'shock'
        });
      } else if (enemyDmg > 15) {
        setDialogue({
          speaker: 'Minju',
          text: `ระวัง! โดนเข้าไปเมื่อกี้ดูเจ็บน่าดูเลย!`,
          portrait: 'shock'
        });
      }

      setIsAttacking(false);
    }, 800);
  };
  
  if (inCombat && selectedEnemy) {
    return (
      <div className="bg-slate-900/90 p-6 rounded-xl border border-red-500/20 shadow-2xl">
        <div className="flex justify-around items-center mb-12">
           <div className="text-center">
              <div className="w-20 h-20 bg-blue-900/20 rounded-2xl border-2 border-blue-500/30 overflow-hidden flex items-center justify-center mb-2 shadow-inner">
                <div
                    className="w-8 h-8 image-pixelated scale-[2.5]"
                    style={{
                      backgroundImage: `url(${isAttacking ? CHAMPION.attackImage : CHAMPION.idleImage})`,
                      backgroundSize: 'auto 100%',
                      backgroundPosition: isAttacking ? `-${(spriteFrame % 7) * 32}px 0` : '0 0'
                    }}
                  />
              </div>
              <div className="text-[10px] font-black text-blue-400 uppercase">{CHAMPION.name}</div>
              <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${playerHp}%` }} />
              </div>
           </div>

           <div className="text-2xl font-black text-white italic opacity-20 animate-pulse">VS</div>

           <div className="text-center">
              <div className="w-20 h-20 bg-red-900/20 rounded-2xl border-2 border-blue-500/30 overflow-hidden flex items-center justify-center mb-2 shadow-inner">
                {selectedEnemy.image ? (
                  <div
                    className="w-8 h-8 image-pixelated scale-[2.5]"
                    style={{
                      backgroundImage: `url(${selectedEnemy.image})`,
                      backgroundSize: 'auto 100%',
                      backgroundPosition: `-${(spriteFrame % selectedEnemy.frames) * 32}px 0`
                    }}
                  />
                ) : <span className="text-3xl">{selectedEnemy.emoji}</span>}
              </div>
              <div className="text-[10px] font-black text-red-400 uppercase">{selectedEnemy.name}</div>
              <div className="text-left w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${(enemyHp / selectedEnemy.hp) * 100}%` }} />
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <button 
            onClick={() => executeAttack()}
            disabled={isAttacking || !!result}
            className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl border border-white/10 uppercase text-[10px] tracking-widest disabled:opacity-50 transition-all"
          >
            ยิงธรรมดา
          </button>
          {availableSkills.map((skill, i) => (
            <button 
              key={i}
              onClick={() => executeAttack(skill)}
              disabled={isAttacking || !!result}
              className="py-3 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white font-black rounded-xl shadow-lg uppercase text-[10px] tracking-widest disabled:opacity-50 border border-amber-400/20 transition-all"
            >
              ✨ {skill.name}
            </button>
          ))}
        </div>

        {result && (
          <button
            onClick={() => { setInCombat(false); EventBus.emit('arena-combat-end'); }}
            className={`w-full py-4 font-black rounded-xl mb-4 uppercase tracking-widest transition-all scale-100 hover:scale-105 active:scale-95
              ${result === 'win' ? 'bg-amber-500 text-slate-900 shadow-amber-500/20 shadow-xl' : 'bg-slate-700 text-slate-300'}
            `}
          >
            {result === 'win' ? 'รับชัยชนะ' : 'ถอยกลับร้าน'}
          </button>
        )}

        <div className="bg-black/50 p-4 rounded-xl h-24 overflow-y-auto font-mono text-[10px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
          {combatLog.map((log, i) => (
            <div key={i} className={i === 0 ? 'text-white font-bold' : 'text-slate-500'}>{log}</div>
          ))}
        </div>

      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-2xl">
      <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-6 italic font-serif">สนามประลองเทพ</h2>
      <div className="space-y-3">
        {ENEMIES.map((enemy) => (
          <button
            key={enemy.id}
            onClick={() => startCombat(enemy)}
            className="w-full group p-4 bg-slate-800/40 hover:bg-slate-800 border border-white/5 hover:border-red-500/30 rounded-2xl transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-2xl border border-white/5 group-hover:scale-110 transition-transform overflow-hidden shadow-inner">
                {enemy.image ? (
                  <div
                    className="w-8 h-8 image-pixelated"
                    style={{
                      backgroundImage: `url(${enemy.image})`,
                      backgroundSize: 'auto 100%',
                      backgroundPosition: `-${(spriteFrame % enemy.frames) * 32}px 0`
                    }}
                  />
                ) : enemy.emoji}
              </div>
              <div className="text-left">
                <div className="font-black text-white uppercase tracking-tight">{enemy.name}</div>
                <div className="text-[9px] font-black text-amber-500/70 uppercase">รางวัล: {enemy.reward} ทอง</div>
              </div>
            </div>
            <div className="text-[10px] font-black text-red-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              {choicesLeft > 0 ? 'สู้ ⚔️' : 'แต้มหมด'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
