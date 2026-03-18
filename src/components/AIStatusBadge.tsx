'use client';
import { useState, useEffect } from 'react';

type AISource = 'openclaw' | 'openrouter' | 'fallback' | 'checking';

const SOURCE_CONFIG: Record<AISource, { label: string; color: string; dot: string }> = {
  openclaw:   { label: 'OpenClaw',   color: 'text-emerald-400', dot: 'bg-emerald-400' },
  openrouter: { label: 'OpenRouter', color: 'text-sky-400',     dot: 'bg-sky-400' },
  fallback:   { label: 'Offline',    color: 'text-slate-500',   dot: 'bg-slate-500' },
  checking:   { label: 'Checking...', color: 'text-slate-600',  dot: 'bg-slate-600' },
};

export default function AIStatusBadge({ compact }: { compact?: boolean }) {
  const [source, setSource] = useState<AISource>('checking');

  useEffect(() => {
    // Probe the narrate API with a minimal request to detect which source responds
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/narrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'exploration_event',
            playerName: 'probe',
            npcName: 'เลโอ',
          }),
        });
        const data = await res.json();
        if (data.source === 'openclaw' || data.source === 'openrouter' || data.source === 'fallback') {
          setSource(data.source);
        } else {
          setSource('fallback');
        }
      } catch {
        setSource('fallback');
      }
    };

    checkStatus();

    // Listen for AI source updates from any narrate/prophecy call
    const handler = (e: CustomEvent) => {
      if (e.detail?.source) setSource(e.detail.source);
    };
    window.addEventListener('ai-source-update' as any, handler);
    return () => window.removeEventListener('ai-source-update' as any, handler);
  }, []);

  const config = SOURCE_CONFIG[source];

  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${config.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${source === 'openclaw' ? 'animate-pulse' : ''}`} />
        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider">{source === 'checking' ? '...' : config.label}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50 ${config.color}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} ${source === 'openclaw' ? 'animate-pulse' : ''}`} />
      <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest">AI: {config.label}</span>
    </div>
  );
}

// Helper to broadcast source updates from any component
export function broadcastAISource(source: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ai-source-update', { detail: { source } }));
  }
}
