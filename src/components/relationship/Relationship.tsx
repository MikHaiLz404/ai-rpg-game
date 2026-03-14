import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const Relationship: React.FC = () => {
  const { npcs, player, selectNpc, currentNpc, currentDialogue, chooseDialogue, closeDialogue } = useGameStore();
  
  // ถ้ากำลังคุยกับ NPC แสดงหน้าตอบโต้
  if (currentNpc && currentDialogue) {
    return (
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">{currentNpc.image}</div>
              <div>
                <h2 className="text-2xl font-bold text-pink-300">{currentNpc.nameTH}</h2>
                <p className="text-gray-400">{currentNpc.description}</p>
              </div>
              <button onClick={closeDialogue} className="ml-auto text-gray-400 hover:text-white text-2xl">✕</button>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
              <p className="text-lg text-white">{currentDialogue.textTH}</p>
            </div>
            
            <div className="space-y-2">
              {currentDialogue.choices.map((choice, i) => (
                <Button 
                  key={i}
                  variant="secondary"
                  className="w-full text-left"
                  onClick={() => chooseDialogue(i)}
                >
                  {choice.textTH}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-pink-400 mb-4">💕 ความสัมพันธ์</h1>
      <p className="text-gray-300 mb-6">พบปะกับเทพเจ้าเพื่อสร้างสายสัมพันธ์:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {npcs.map(npc => {
          const bond = player.relationships[npc.id] || 0;
          return (
            <Card key={npc.id} onClick={() => selectNpc(npc)}>
              <div className="flex items-center gap-4">
                <div className="text-5xl">{npc.image}</div>
                <div>
                  <h3 className="font-bold text-xl text-pink-300">{npc.nameTH}</h3>
                  <p className="text-sm text-gray-400">{npc.description}</p>
                  <p className="text-amber-400 mt-2">💕 Bond: {bond}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
