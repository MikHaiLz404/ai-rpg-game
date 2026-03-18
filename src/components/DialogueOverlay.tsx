'use client';
import { useGameStore } from '@/store/gameStore';

const FACIAL_EXPRESSIONS: Record<string, string> = {
  angry: '/images/characters/player/minju/facial/angry/angry.png',
  happy: '/images/characters/player/minju/facial/happy/happy.png',
  work: '/images/characters/player/minju/facial/work/work.png',
  shock: '/images/characters/player/minju/facial/shock/shock.png',
  default: '/images/characters/player/minju/facial/work/work.png',
};

const NPC_PORTRAITS: Record<string, string> = {
  'เลโอ': '/images/characters/npcs/facial/leo.png',
  'อารีน่า': '/images/characters/npcs/arena/facial/arena.png',
  'ดราโก้': '/images/characters/npcs/draco/facial/draco.png',
};

export default function DialogueOverlay() {
  const { dialogue, setDialogue, phase } = useGameStore();

  if (!dialogue) return null;

  const isTop = phase === 'shop';

  // Determine portrait
  let portraitSrc: string | undefined;
  if (dialogue.speaker.toLowerCase() === 'minju' || dialogue.speaker === 'เคน' || dialogue.speaker === 'Kane') {
     portraitSrc = FACIAL_EXPRESSIONS[dialogue.portrait || 'default'] || FACIAL_EXPRESSIONS.default;
  } else if (NPC_PORTRAITS[dialogue.speaker]) {
     portraitSrc = NPC_PORTRAITS[dialogue.speaker];
  }

  return (
    <div className={`absolute left-2 right-2 z-[100] animate-in duration-300 ${
      isTop
        ? 'top-2 slide-in-from-top-4'
        : 'bottom-2 slide-in-from-bottom-4'
    }`}>
      <div className="bg-slate-900/95 border border-amber-500/50 md:border-2 rounded-lg md:rounded-xl p-2 md:p-3 shadow-2xl flex gap-2 md:gap-3 items-end">
        {/* Portrait Slot */}
        <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-800 rounded-md md:rounded-lg border border-amber-500/30 flex-shrink-0 overflow-hidden relative">
          {portraitSrc && (
            <img
              src={portraitSrc}
              alt={dialogue.speaker}
              className="w-full h-full object-contain image-pixelated scale-110 translate-y-1"
            />
          )}
        </div>

        {/* Text Area */}
        <div className="flex-1 min-w-0 pb-1 md:pb-2">
          <div className="text-amber-500 font-black uppercase text-[10px] md:text-xs tracking-widest mb-0.5 md:mb-1 flex justify-between items-center">
            <span>{dialogue.speaker}</span>
            <button
              onClick={() => setDialogue(null)}
              className="text-slate-500 hover:text-white transition-colors text-[10px] md:text-xs"
            >
              ✕
            </button>
          </div>
          <div className="text-slate-100 text-xs md:text-sm leading-relaxed font-medium line-clamp-3">
            {dialogue.text}
          </div>
        </div>
      </div>
    </div>
  );
}
