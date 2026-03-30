'use client';

import React, { useState, useCallback } from 'react';
import { useAudio, initAudioSettings, BGM_KEYS } from '@/game/AudioManager';

/**
 * AudioControls - Sound on/off toggle button for the UI header
 *
 * Positioned in the header next to other status indicators.
 * Uses the mute toggle to control all game audio.
 *
 * @example
 * // Add to your header/nav component:
 * <AudioControls />
 */
export function AudioControls() {
  const { isMuted, toggleMute, playSFX } = useAudio();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => {
    toggleMute();
    playSFX('ui_click');
  }, [toggleMute, playSFX]);

  const handleOpenClose = useCallback(() => {
    setIsOpen(!isOpen);
    playSFX('ui_click');
  }, [setIsOpen, playSFX]);

  return (
    <div className="relative">
      {/* Sound Toggle Button */}
      <button
        onClick={handleOpenClose}
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 transition-all"
        aria-label={isMuted() ? 'Unmute sound' : 'Mute sound'}
        title={isMuted() ? 'Unmute' : 'Mute'}
      >
        {isMuted() ? (
          // Muted icon
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          // Sound on icon
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>

      {/* Volume Slider Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 p-3 bg-slate-900/95 border border-white/10 rounded-xl shadow-lg z-50 min-w-[180px]">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Sound</div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            </svg>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue={100}
              onChange={(e) => {
                const { setVolume, getVolume } = useAudio();
                setVolume(parseInt(e.target.value) / 100);
              }}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </div>

          {/* Quick Mute Toggle */}
          <button
            onClick={handleToggle}
            className="mt-3 w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors"
          >
            {isMuted() ? '🔇 Unmute' : '🔊 Mute All'}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Initialize audio on app mount
 * Call this once in your root layout or page component
 */
export function AudioInitializer() {
  React.useEffect(() => {
    initAudioSettings();
  }, []);

  return null;
}

export default AudioControls;
