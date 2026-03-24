'use client';
import { useGameStore, AILog } from '@/store/gameStore';
import { useState, useRef, useEffect } from 'react';

export default function AITerminal() {
  const { aiLogs, clearAILogs, totalTokensInput, totalTokensOutput, showAITerminal, setShowAITerminal } = useGameStore();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 0 }); // Initial bottom-left
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && !selectedLogId) {
      scrollRef.current.scrollTop = 0;
    }
  }, [aiLogs, selectedLogId]);

  // Initial vertical position (bottom) after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition(prev => ({ ...prev, y: window.innerHeight - 550 }));
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from the header
    const target = e.target as HTMLElement;
    if (target.closest('.drag-handle')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!showAITerminal) return null;

  const displayLogs = [...aiLogs].reverse();
  const selectedLog = aiLogs.find(l => l.id === selectedLogId);

  // If minimized, show a small floating badge
  if (isMinimized) {
    return (
      <div 
        className="fixed z-[200] flex flex-col items-end gap-2 animate-in slide-in-from-bottom-4"
        style={{ left: `${position.x}px`, top: `${position.y + 450}px` }}
      >
        <button 
          onClick={() => setIsMinimized(false)}
          onMouseDown={handleMouseDown}
          className="drag-handle bg-slate-900 border-2 border-amber-500/50 p-3 rounded-full shadow-2xl hover:bg-slate-800 transition-all group cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-black text-amber-500 uppercase tracking-widest hidden group-hover:block">Restore Link</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 font-serif"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={terminalRef}
      className="fixed z-[200] w-[450px] h-[550px] md:w-[550px] md:h-[650px] flex flex-col animate-in fade-in transition-shadow duration-200 font-sans"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        boxShadow: isDragging ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' : '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
      }}
    >
      <div className="bg-slate-900 border-2 border-slate-700 w-full h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden font-mono">
        {/* Header (Drag Handle) */}
        <div 
          onMouseDown={handleMouseDown}
          className="drag-handle bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing hover:bg-slate-750 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-serif">AI Neural Link Terminal</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMinimized(true)} className="p-1.5 text-slate-500 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <button onClick={() => setShowAITerminal(false)} className="p-1.5 text-slate-500 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        {/* Token Stats Bar (Bigger Font) */}
        <div className="bg-slate-950 px-5 py-2.5 flex justify-between items-center text-xs border-b border-slate-800">
          <div className="flex gap-6">
            <span className="text-slate-500 uppercase font-black tracking-tighter">In: <span className="text-emerald-400">{totalTokensInput.toLocaleString()}</span></span>
            <span className="text-slate-500 uppercase font-black tracking-tighter">Out: <span className="text-sky-400">{totalTokensOutput.toLocaleString()}</span></span>
          </div>
          <span className="text-amber-500/80 font-black tracking-[0.2em] uppercase text-[10px]">Session: {(totalTokensInput + totalTokensOutput).toLocaleString()} tk</span>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Log List */}
          <div className={`flex flex-col bg-slate-950/50 border-r border-slate-800 transition-all ${selectedLog ? 'w-32' : 'w-full'}`}>
            <div className="p-2.5 border-b border-slate-800 flex justify-between items-center">
              {!selectedLog && <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Process Stream</span>}
              <button onClick={clearAILogs} className="text-[10px] text-red-400/60 hover:text-red-400 uppercase font-black mx-auto">Purge</button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
              {displayLogs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelectedLogId(log.id)}
                  className={`w-full text-left p-4 border-b border-slate-900/50 transition-all hover:bg-slate-800/30 group ${selectedLogId === log.id ? 'bg-slate-800/50 border-l-2 border-l-amber-500' : ''}`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-[11px] font-black uppercase truncate ${
                      log.source === 'openclaw' ? 'text-emerald-400' : log.source === 'openrouter' ? 'text-sky-400' : 'text-rose-400'
                    }`}>{log.action.split('_')[0]}</span>
                    {!selectedLog && <span className="text-[9px] text-slate-600 font-bold">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                  </div>
                  {!selectedLog && <div className="text-sm text-slate-400 line-clamp-1 group-hover:text-slate-200 leading-tight mb-2 italic">"{log.response}"</div>}
                  <div className="text-[10px] text-slate-600 font-black opacity-60 uppercase">{log.tokensInput + log.tokensOutput} tk · {log.source}</div>
                </button>
              )).reverse()}
            </div>
          </div>

          {/* Main - Details */}
          {selectedLog && (
            <div className="flex-1 flex flex-col bg-black/20 overflow-hidden animate-in fade-in slide-in-from-left-2">
              <div className="p-5 bg-slate-800/20 border-b border-slate-800 flex justify-between items-start">
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest truncate font-serif">{selectedLog.action} Output</h3>
                  <div className="text-xs text-slate-500 mt-1.5 font-bold uppercase tracking-tighter">{selectedLog.model}</div>
                </div>
                <button onClick={() => setSelectedLogId(null)} className="text-slate-500 hover:text-white p-1.5 ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
                <section>
                  <div className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-600" /> Input Payload
                  </div>
                  <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 text-[14px] text-slate-400 leading-relaxed whitespace-pre-wrap font-mono shadow-inner">
                    {selectedLog.prompt}
                  </div>
                </section>

                {selectedLog.gatewayLogs && selectedLog.gatewayLogs.length > 0 && (
                  <section>
                    <div className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" /> Gateway Logs
                    </div>
                    <div className="bg-slate-950/80 p-4.5 rounded-xl border border-emerald-500/20 text-[12px] text-emerald-400/80 leading-relaxed whitespace-pre-wrap font-mono shadow-inner max-h-48 overflow-y-auto">
                      {selectedLog.gatewayLogs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <div className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" /> Agent Response
                  </div>
                  <div className="bg-slate-900 p-4.5 rounded-xl border border-emerald-500/10 text-[15px] text-emerald-50/90 leading-relaxed whitespace-pre-wrap font-mono shadow-md">
                    {selectedLog.response}
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
        
        {/* Status Bar */}
        <div className="bg-slate-800 px-4 py-2 text-[10px] text-slate-500 border-t border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex gap-4 items-center font-black">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="uppercase tracking-widest">Link Active</span>
            </span>
            <span className="opacity-40 uppercase">RSA-2048 Secure</span>
          </div>
          <span className="opacity-30 uppercase font-black tracking-tighter">Neural Link v1.0.5</span>
        </div>
      </div>
    </div>
  );
}
