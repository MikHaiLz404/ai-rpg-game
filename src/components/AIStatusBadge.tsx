'use client';
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

type AISource = 'openclaw' | 'openrouter' | 'fallback' | 'checking';

const SOURCE_CONFIG: Record<AISource, { label: string; color: string; dot: string }> = {
  openclaw:   { label: 'OpenClaw',   color: 'text-emerald-400', dot: 'bg-emerald-400' },
  openrouter: { label: 'OpenRouter', color: 'text-sky-400',     dot: 'bg-sky-400' },
  fallback:   { label: 'Offline',    color: 'text-slate-500',   dot: 'bg-slate-500' },
  checking:   { label: 'Checking...', color: 'text-slate-600',  dot: 'bg-slate-600' },
};

export default function AIStatusBadge({ compact }: { compact?: boolean }) {
  const [source, setSource] = useState<AISource>('checking');
  const { setShowAITerminal, showAITerminal } = useGameStore();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/narrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'exploration_event', playerName: 'probe', npcName: 'เลโอ' }),
        });
        const data = await res.json();
        if (data.source === 'openclaw' || data.source === 'openrouter' || data.source === 'fallback') setSource(data.source);
        else setSource('fallback');
      } catch { setSource('fallback'); }
    };
    checkStatus();
    const handler = (e: CustomEvent) => { if (e.detail?.source) setSource(e.detail.source); };
    window.addEventListener('ai-source-update' as any, handler);
    return () => window.removeEventListener('ai-source-update' as any, handler);
  }, []);

  const config = SOURCE_CONFIG[source];

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50 ${config.color} ${compact ? 'px-1.5' : ''}`}>
        <span className={`rounded-full ${source === 'openclaw' ? 'animate-pulse' : ''} ${config.dot} ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
        <span className={`font-bold uppercase ${compact ? 'text-[8px] md:text-[10px]' : 'text-[9px] md:text-[11px] tracking-widest'}`}>{compact ? '' : 'AI: '}{config.label}</span>
      </div>
      <button 
        onClick={() => setShowAITerminal(!showAITerminal)}
        className={`p-1.5 rounded-lg border transition-all ${showAITerminal ? 'bg-amber-500 border-amber-400 text-slate-900 shadow-lg shadow-amber-500/20' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'}`}
        title="AI Neural Link Terminal"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
      </button>
    </div>
  );
}

export function broadcastAISource(source: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ai-source-update', { detail: { source } }));
  }
}
