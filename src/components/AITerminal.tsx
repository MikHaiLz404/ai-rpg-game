'use client';
import { useGameStore, AILog } from '@/store/gameStore';
import { useState, useRef, useEffect } from 'react';

export default function AITerminal() {
  const { aiLogs, clearAILogs, totalTokensInput, totalTokensOutput, showAITerminal, setShowAITerminal } = useGameStore();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && !selectedLogId) {
      scrollRef.current.scrollTop = 0;
    }
  }, [aiLogs, selectedLogId]);

  if (!showAITerminal) return null;

  const displayLogs = [...aiLogs].reverse();
  const selectedLog = aiLogs.find(l => l.id === selectedLogId);

  // If minimized, show a small floating badge
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col items-end gap-2 animate-in slide-in-from-bottom-4">
        <button 
          onClick={() => setIsMinimized(false)}
          className="bg-slate-900 border-2 border-amber-500/50 p-3 rounded-full shadow-2xl hover:bg-slate-800 transition-all group"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-widest hidden group-hover:block">Restore Link</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[200] w-[400px] h-[500px] md:w-[450px] md:h-[600px] flex flex-col animate-in slide-in-from-right-4">
      <div className="bg-slate-900 border-2 border-slate-700 w-full h-full rounded-xl shadow-2xl flex flex-col overflow-hidden font-mono">
        {/* Header */}
        <div className="bg-slate-800 px-3 py-2 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <div className="w-2 h-2 rounded-full bg-amber-500/50" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Neural Link</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMinimized(true)} className="p-1 text-slate-500 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <button onClick={() => setShowAITerminal(false)} className="p-1 text-slate-500 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        {/* Token Stats Bar */}
        <div className="bg-slate-950 px-3 py-1.5 flex justify-between items-center text-[8px] border-b border-slate-800">
          <div className="flex gap-3">
            <span className="text-slate-500">IN: <span className="text-emerald-400 font-bold">{totalTokensInput}</span></span>
            <span className="text-slate-500">OUT: <span className="text-sky-400 font-bold">{totalTokensOutput}</span></span>
          </div>
          <span className="text-amber-500/80 font-black">TOTAL: {totalTokensInput + totalTokensOutput} tk</span>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Log List (Narrower) */}
          <div className={`flex flex-col bg-slate-950/50 border-r border-slate-800 transition-all ${selectedLog ? 'w-24' : 'w-full'}`}>
            <div className="p-1.5 border-b border-slate-800 flex justify-between items-center">
              {!selectedLog && <span className="text-[8px] font-black text-slate-600 uppercase">Stream</span>}
              <button onClick={clearAILogs} className="text-[8px] text-red-400/60 hover:text-red-400 uppercase font-bold mx-auto">Clear</button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
              {displayLogs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelectedLogId(log.id)}
                  className={`w-full text-left p-2 border-b border-slate-900/50 transition-all hover:bg-slate-800/30 group ${selectedLogId === log.id ? 'bg-slate-800/50 border-l-2 border-l-amber-500' : ''}`}
                >
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={`text-[8px] font-black uppercase truncate ${
                      log.source === 'openclaw' ? 'text-emerald-400' : log.source === 'openrouter' ? 'text-sky-400' : 'text-rose-400'
                    }`}>{log.action.split('_')[0]}</span>
                  </div>
                  {!selectedLog && <div className="text-[9px] text-slate-400 line-clamp-1 group-hover:text-slate-200">{log.response}</div>}
                  <div className="text-[7px] text-slate-600 font-bold">{log.tokensInput + log.tokensOutput} tk</div>
                </button>
              )).reverse()}
            </div>
          </div>

          {/* Main - Details (Expands when log selected) */}
          {selectedLog && (
            <div className="flex-1 flex flex-col bg-black/20 overflow-hidden animate-in fade-in slide-in-from-left-2">
              <div className="p-3 bg-slate-800/20 border-b border-slate-800 flex justify-between items-start">
                <div className="min-w-0">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-wider truncate">{selectedLog.action}</h3>
                  <div className="text-[8px] text-slate-500 mt-0.5">{selectedLog.model}</div>
                </div>
                <button onClick={() => setSelectedLogId(null)} className="text-slate-500 hover:text-white p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
                <section>
                  <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-slate-600" /> Prompt
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 leading-relaxed whitespace-pre-wrap font-mono">
                    {selectedLog.prompt}
                  </div>
                </section>

                <section>
                  <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" /> Response
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-emerald-500/10 text-[11px] text-emerald-50/90 leading-relaxed whitespace-pre-wrap font-mono">
                    {selectedLog.response}
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
        
        {/* Status Bar */}
        <div className="bg-slate-800 px-2 py-1 text-[7px] text-slate-500 border-t border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex gap-2 items-center">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            <span className="uppercase">Link Active</span>
          </div>
          <span className="opacity-50">v1.0.2</span>
        </div>
      </div>
    </div>
  );
}
