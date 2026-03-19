'use client';
import { useGameStore, AILog } from '@/store/gameStore';
import { useState, useRef, useEffect } from 'react';

export default function AITerminal() {
  const { aiLogs, clearAILogs, totalTokensInput, totalTokensOutput, showAITerminal, setShowAITerminal } = useGameStore();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && !selectedLogId) {
      scrollRef.current.scrollTop = 0; // Latest logs are at the top in the store, but I'll display them in order?
      // Wait, store has [new, ...old]. Let's display them as [old, ...new] for terminal feel.
    }
  }, [aiLogs, selectedLogId]);

  if (!showAITerminal) return null;

  const displayLogs = [...aiLogs].reverse();
  const selectedLog = aiLogs.find(l => l.id === selectedLogId);

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
      <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-5xl h-full max-h-[800px] rounded-xl shadow-2xl flex flex-col overflow-hidden font-mono">
        {/* Header */}
        <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">AI Neural Link Terminal v1.0</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4 text-[10px] md:text-xs">
              <div className="text-slate-500 uppercase">Input: <span className="text-emerald-400 font-bold">{totalTokensInput.toLocaleString()}</span> tk</div>
              <div className="text-slate-500 uppercase">Output: <span className="text-sky-400 font-bold">{totalTokensOutput.toLocaleString()}</span> tk</div>
              <div className="text-slate-500 uppercase font-black">Total: <span className="text-amber-400">{(totalTokensInput + totalTokensOutput).toLocaleString()}</span></div>
            </div>
            <button onClick={() => setShowAITerminal(false)} className="text-slate-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Log List */}
          <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-950/50">
            <div className="p-2 border-b border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Process Stream</span>
              <button onClick={clearAILogs} className="text-[9px] text-red-400/60 hover:text-red-400 uppercase font-bold transition-colors">Clear All</button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
              {displayLogs.length === 0 && (
                <div className="p-8 text-center text-slate-700 italic text-xs">No active processes detected...</div>
              )}
              {displayLogs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelectedLogId(log.id)}
                  className={`w-full text-left p-3 border-b border-slate-900/50 transition-all hover:bg-slate-800/30 group ${selectedLogId === log.id ? 'bg-slate-800/50 border-l-2 border-l-amber-500' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-black uppercase ${
                      log.source === 'openclaw' ? 'text-emerald-400' : log.source === 'openrouter' ? 'text-sky-400' : 'text-rose-400'
                    }`}>{log.action}</span>
                    <span className="text-[8px] text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 group-hover:text-slate-200">{log.response}</div>
                  <div className="flex gap-2 mt-1.5 opacity-60">
                    <span className="text-[8px] bg-slate-800 px-1 rounded text-slate-500">{log.source}</span>
                    <span className="text-[8px] bg-slate-800 px-1 rounded text-slate-500">{log.tokensInput + log.tokensOutput} tk</span>
                  </div>
                </button>
              )).reverse()}
            </div>
          </div>

          {/* Main - Details */}
          <div className="flex-1 flex flex-col bg-black/20">
            {selectedLog ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 bg-slate-800/20 border-b border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">{selectedLog.action} Details</h3>
                    <div className="flex gap-3 items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Status: <span className="text-emerald-400">Success</span></span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Provider: <span className="text-amber-400">{selectedLog.source}</span></span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 bg-black/40 p-2 rounded border border-white/5 flex gap-4">
                    <div>Model: <span className="text-slate-300">{selectedLog.model}</span></div>
                    <div>Usage: <span className="text-emerald-400">{selectedLog.tokensInput} in</span> / <span className="text-sky-400">{selectedLog.tokensOutput} out</span></div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
                  <section>
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> System & User Prompt
                    </div>
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-[12px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {selectedLog.prompt}
                    </div>
                  </section>

                  <section>
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" /> Agent Response
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg border border-emerald-500/20 text-[13px] text-emerald-50 shadow-sm leading-relaxed whitespace-pre-wrap">
                      {selectedLog.response}
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-700">
                <div className="text-4xl mb-4 opacity-20">📡</div>
                <div className="text-xs uppercase font-black tracking-widest opacity-40">Select a process to inspect data packets</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="bg-slate-800 px-3 py-1.5 text-[9px] text-slate-500 border-t border-slate-700 flex justify-between items-center">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> GATEWAY_ONLINE
            </span>
            <span>Uptime: {Math.floor(performance.now()/1000)}s</span>
          </div>
          <div className="flex gap-3 uppercase font-bold">
            <span>Enc: RSA-2048</span>
            <span className="text-slate-400">Packets: {aiLogs.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
