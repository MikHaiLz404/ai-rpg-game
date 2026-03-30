/**
 * AudioManager.ts - React-compatible audio management
 *
 * Provides hooks and utilities for playing audio in React components.
 * For Phaser audio, use AudioController in the game scene.
 *
 * Audio file locations:
 * - BGM: /public/audio/bgm/{phase}/ - looped background music
 *   - shop/   -> shop_theme.mp3
 *   - arena/  -> arena_theme.mp3
 *   - exploration/ -> exploration_theme.mp3
 *   - menu/   -> menu_theme.mp3
 * - SFX: /public/audio/sfx/
 *   - ui/     -> click.mp3, purchase.mp3, hover.mp3
 *   - combat/ -> attack.mp3, hit.mp3, divine_skill.mp3, victory.mp3, defeat.mp3
 *   - items/  -> loot.mp3, equip.mp3, use_item.mp3
 * - Ambient: /public/audio/ambient/ -> cave.mp3, village.mp3
 *
 * To add new audio:
 * 1. Place audio file in appropriate folder under /public/audio/
 * 2. Add the sound key to the AUDIO_CONFIG below
 * 3. Use useAudio() hook in React components or EventBus in Phaser
 */

import { useEffect, useCallback, useRef } from 'react';
import { EventBus } from './EventBus';

// Audio configuration - keys map to file paths
export const AUDIO_CONFIG = {
  bgm: {
    shop: '/audio/bgm/shop/shop_theme.mp3',
    arena: '/audio/bgm/arena/arena_theme.mp3',
    exploration: '/audio/bgm/exploration/exploration_theme.mp3',
    menu: '/audio/bgm/menu/menu_theme.mp3',
    village: '/audio/bgm/village/village_theme.mp3',
  },
  sfx: {
    ui_click: '/audio/sfx/ui/click.mp3',
    ui_hover: '/audio/sfx/ui/hover.mp3',
    ui_purchase: '/audio/sfx/ui/purchase.mp3',
    ui_success: '/audio/sfx/ui/success.mp3',
    ui_error: '/audio/sfx/ui/error.mp3',
    combat_attack: '/audio/sfx/combat/attack.mp3',
    combat_hit: '/audio/sfx/combat/hit.mp3',
    combat_divine_skill: '/audio/sfx/combat/divine_skill.mp3',
    combat_victory: '/audio/sfx/combat/victory.mp3',
    combat_defeat: '/audio/sfx/combat/defeat.mp3',
    combat_loot: '/audio/sfx/items/loot.mp3',
    combat_equip: '/audio/sfx/items/equip.mp3',
  },
  ambient: {
    cave: '/audio/ambient/cave.mp3',
    village: '/audio/ambient/village.mp3',
  }
} as const;

export type BGMKey = keyof typeof AUDIO_CONFIG.bgm;
export type SFXKey = keyof typeof AUDIO_CONFIG.sfx;
export type AmbientKey = keyof typeof AUDIO_CONFIG.ambient;

// HTML5 Audio element cache for React components
const audioCache: Map<string, HTMLAudioElement> = new Map();

function getAudioElement(src: string, loop: boolean = false): HTMLAudioElement {
  if (!audioCache.has(src)) {
    const audio = new Audio(src);
    audio.loop = loop;
    audioCache.set(src, audio);
  }
  return audioCache.get(src)!;
}

// Global audio state
let globalMuted = false;
let globalVolume = 1.0;
let currentBGM: HTMLAudioElement | null = null;

// Event listeners for Phaser <-> React communication
const sfxListeners = new Set<(key: SFXKey) => void>();
const bgmListeners = new Set<(key: BGMKey | null) => void>();
const muteListeners = new Set<(muted: boolean) => void>();
const volumeListeners = new Set<(volume: number) => void>();

EventBus.on('play-sfx' as any, ((key: string) => {
  sfxListeners.forEach(listener => listener(key as SFXKey));
}) as any);

EventBus.on('play-bgm' as any, ((key: string) => {
  bgmListeners.forEach(listener => listener(key as BGMKey | null));
}) as any);

EventBus.on('stop-bgm' as any, (() => {
  bgmListeners.forEach(listener => listener(null));
}) as any);

/**
 * Hook for playing audio in React components
 *
 * @example
 * const { playSFX, playBGM, setVolume, isMuted } = useAudio();
 *
 * // Play a sound effect
 * playSFX('ui_click');
 *
 * // Play background music
 * playBGM('shop');
 *
 * // Mute/unmute
 * setVolume(0); // mute
 * setVolume(1); // full volume
 */
export function useAudio() {
  const isMutedRef = useRef(globalMuted);
  const volumeRef = useRef(globalVolume);

  useEffect(() => {
    const handleMuteChange = (muted: boolean) => {
      isMutedRef.current = muted;
      muteListeners.forEach(l => l(muted));
    };

    const handleVolumeChange = (volume: number) => {
      volumeRef.current = volume;
      volumeListeners.forEach(l => l(volume));
    };

    muteListeners.add(handleMuteChange);
    volumeListeners.add(handleVolumeChange);

    return () => {
      muteListeners.delete(handleMuteChange);
      volumeListeners.delete(handleVolumeChange);
    };
  }, []);

  /**
   * Play a sound effect
   */
  const playSFX = useCallback((key: SFXKey) => {
    if (isMutedRef.current) return;

    const src = AUDIO_CONFIG.sfx[key];
    if (!src) {
      console.warn(`AudioManager: Unknown SFX key "${key}"`);
      return;
    }

    try {
      const audio = getAudioElement(src, false);
      audio.volume = globalVolume * 0.5; // SFX at 50% of music volume
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Audio play failed - likely due to user interaction requirement
        console.warn(`AudioManager: Could not play SFX ${key}`);
      });
    } catch (e) {
      console.warn(`AudioManager: Error playing SFX ${key}`, e);
    }
  }, []);

  /**
   * Play background music, stops any currently playing BGM
   */
  const playBGM = useCallback((key: BGMKey) => {
    const src = AUDIO_CONFIG.bgm[key];
    if (!src) {
      console.warn(`AudioManager: Unknown BGM key "${key}"`);
      return;
    }

    try {
      // Stop current BGM
      if (currentBGM) {
        currentBGM.pause();
        currentBGM.currentTime = 0;
      }

      currentBGM = getAudioElement(src, true);
      currentBGM.volume = globalVolume * 0.3; // BGM at 30% volume
      currentBGM.play().catch(() => {
        console.warn(`AudioManager: Could not play BGM ${key}`);
      });

      // Notify listeners
      bgmListeners.forEach(l => l(key));

      // Notify Phaser
      EventBus.emit('play-bgm', key);
    } catch (e) {
      console.warn(`AudioManager: Error playing BGM ${key}`, e);
    }
  }, []);

  /**
   * Stop currently playing background music
   */
  const stopBGM = useCallback(() => {
    if (currentBGM) {
      currentBGM.pause();
      currentBGM.currentTime = 0;
      currentBGM = null;
    }
    bgmListeners.forEach(l => l(null));
    EventBus.emit('stop-bgm');
  }, []);

  /**
   * Set global volume (0-1)
   */
  const setVolume = useCallback((volume: number) => {
    globalVolume = Math.max(0, Math.min(1, volume));
    globalMuted = globalVolume === 0;

    if (currentBGM) {
      currentBGM.volume = globalVolume * 0.3;
    }

    volumeListeners.forEach(l => l(globalVolume));
    muteListeners.forEach(l => l(globalMuted));

    // Persist to localStorage
    try {
      localStorage.setItem('audio_volume', String(globalVolume));
    } catch (e) {
      // localStorage not available
    }
  }, []);

  /**
   * Toggle mute state
   */
  const toggleMute = useCallback(() => {
    setVolume(globalMuted ? 1.0 : 0.0);
  }, [setVolume]);

  /**
   * Get current mute state
   */
  const isMuted = useCallback(() => globalMuted, []);

  /**
   * Get current volume (0-1)
   */
  const getVolume = useCallback(() => globalVolume, []);

  return {
    playSFX,
    playBGM,
    stopBGM,
    setVolume,
    toggleMute,
    isMuted,
    getVolume,
    // Expose config for reference
    config: AUDIO_CONFIG,
  };
}

/**
 * Initialize audio settings from localStorage
 * Call this once at app startup
 */
export function initAudioSettings() {
  try {
    const savedVolume = localStorage.getItem('audio_volume');
    if (savedVolume !== null) {
      globalVolume = Math.max(0, Math.min(1, parseFloat(savedVolume)));
      globalMuted = globalVolume === 0;
    }
  } catch (e) {
    // localStorage not available
  }
}

/**
 * Preload an audio file
 * Call this during loading screens to cache audio
 */
export function preloadAudio(key: BGMKey | SFXKey | AmbientKey) {
  const paths = [
    ...Object.values(AUDIO_CONFIG.bgm),
    ...Object.values(AUDIO_CONFIG.sfx),
    ...Object.values(AUDIO_CONFIG.ambient),
  ];

  const src = paths.find(p => p.includes(key));
  if (src) {
    getAudioElement(src, false);
  }
}
