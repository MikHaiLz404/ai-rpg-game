'use client';
import { useGameStore } from '@/store/gameStore';

const FACIAL_EXPRESSIONS: Record<string, string> = {
  angry: '/images/characters/player/minju/facial/angry/angry.png',
  happy: '/images/characters/player/minju/facial/happy/happy.png',
  work: '/images/characters/player/minju/facial/work/work.png',
  shock: '/images/characters/player/minju/facial/shock/shock.png',
  default: '/images/characters/player/minju/facial/work/work.png',
};

export default function DialogueOverlay() {
  const { dialogue, setDialogue } = useGameStore();

  if (!dialogue) return null;

  // Determine portrait - only Minju has facial expressions for now
  let portraitSrc = dialogue.portrait;
  if (dialogue.speaker.toLowerCase() === 'minju' || dialogue.speaker === 'เคน' || dialogue.speaker === 'Kane') {
     // If it's Minju/Player, map the expression key to the URL
     portraitSrc = FACIAL_EXPRESSIONS[dialogue.portrait || 'default'] || FACIAL_EXPRESSIONS.default;
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 z-[100] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900/95 border-2 border-amber-500/50 rounded-xl p-4 shadow-2xl flex gap-4 items-end">
        {/* Portrait Slot */}
        <div className="w-24 h-24 bg-slate-800 rounded-lg border border-amber-500/30 flex-shrink-0 overflow-hidden relative">
          {portraitSrc && (
            <img 
              src={portraitSrc} 
              alt={dialogue.speaker} 
              className="w-full h-full object-contain image-pixelated scale-110 translate-y-1" 
            />
          )}
        </div>

        {/* Text Area */}
        <div className="flex-1 min-w-0 pb-2">
          <div className="text-amber-500 font-black uppercase text-xs tracking-widest mb-1 flex justify-between items-center">
            <span>{dialogue.speaker}</span>
            <button 
              onClick={() => setDialogue(null)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              [ESC]
            </button>
          </div>
          <div className="text-slate-100 text-sm leading-relaxed font-medium">
            {dialogue.text}
          </div>
        </div>

        {/* Enter Prompt */}
        <div className="absolute bottom-3 right-6 flex items-center gap-2">
           <span className="text-[8px] font-bold text-slate-500 animate-pulse uppercase tracking-tighter">Press Enter to continue</span>
           <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
