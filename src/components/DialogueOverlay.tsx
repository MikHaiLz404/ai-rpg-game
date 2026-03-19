'use client';
import { useGameStore } from '@/store/gameStore';

const FACIAL_EXPRESSIONS: Record<string, string> = {
  angry: '/images/characters/player/minju/facial/angry/angry.png',
  happy: '/images/characters/player/minju/facial/happy/happy.png',
  shock: '/images/characters/player/minju/facial/shock/shock.png',
  work: '/images/characters/player/minju/facial/work/work.png',
};

export default function DialogueOverlay() {
  const { dialogue, setDialogue } = useGameStore();

  if (!dialogue) return null;

  const isMinju = dialogue.speaker === 'Minju';
  const portrait = dialogue.portrait && FACIAL_EXPRESSIONS[dialogue.portrait] 
    ? FACIAL_EXPRESSIONS[dialogue.portrait] 
    : isMinju ? FACIAL_EXPRESSIONS.work : null;

  // Most dialogues should appear at the bottom, but some can be top-aligned
  const isTop = false; 

  return (
    <div className={`fixed left-4 right-4 md:left-8 md:right-8 z-[100] animate-in duration-300 ${
      isTop
        ? 'top-4 slide-in-from-top-4'
        : 'bottom-4 md:bottom-8 slide-in-from-bottom-4'
    }`}>
      <div className="max-w-4xl mx-auto flex items-end gap-4">
        {/* Portrait */}
        {portrait && (
          <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 bg-slate-900 border-2 border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl relative z-10 hidden sm:block">
            <img 
              src={portrait} 
              alt={dialogue.speaker} 
              className="w-full h-full object-contain image-pixelated scale-110 translate-y-2"
            />
          </div>
        )}

        {/* Dialogue Box */}
        <div className="flex-1 bg-slate-950/90 backdrop-blur-md border-2 border-amber-500/20 p-4 md:p-6 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rotate-45 translate-x-8 -translate-y-8 border border-amber-500/10" />
          
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-[10px] md:text-xs font-black text-amber-500 uppercase tracking-[0.3em] font-serif">
              {dialogue.speaker}
            </span>
            <button 
              onClick={() => setDialogue(null)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div className="text-slate-100 text-sm md:text-base leading-relaxed font-medium max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
            {dialogue.text}
          </div>
        </div>
      </div>
    </div>
  );
}
