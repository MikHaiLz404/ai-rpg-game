/**
 * AudioController.ts - Phaser 3 Audio Integration
 *
 * Handles all audio playback within the Phaser 3 game engine.
 * For React components, use useAudio() from AudioManager.ts instead.
 *
 * Audio file locations:
 * - BGM: /audio/bgm/{phase}/ - looped background music per game phase
 * - SFX: /audio/sfx/ - sound effects
 *
 * Usage in Phaser:
 *   EventBus.emit('play-sfx', 'combat_attack');
 *   EventBus.emit('play-bgm', 'shop');
 *   EventBus.emit('stop-bgm');
 */

import * as Phaser from 'phaser';
import { EventBus } from './EventBus';

export class AudioController {
    private scene: Phaser.Scene;
    private bgm: Phaser.Sound.BaseSound | null = null;
    private sfxVolume = 0.5;
    private bgmVolume = 0.3;

    private sfxListener = (key: string) => this.playSFX(key as any);
    private bgmListener = (key: string) => this.playBGM(key as any);
    private stopBgmListener = () => this.stopBGM();

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        EventBus.on('play-sfx', this.sfxListener);
        EventBus.on('play-bgm', this.bgmListener);
        EventBus.on('stop-bgm', this.stopBgmListener);
    }

    /**
     * Call this in the scene's preload() to register audio files
     */
    public preload() {
        // UI SFX
        this.scene.load.audio('sfx_ui_click', '/audio/sfx/ui/click.mp3');
        this.scene.load.audio('sfx_ui_hover', '/audio/sfx/ui/hover.mp3');
        this.scene.load.audio('sfx_ui_purchase', '/audio/sfx/ui/purchase.mp3');
        this.scene.load.audio('sfx_ui_success', '/audio/sfx/ui/success.mp3');
        this.scene.load.audio('sfx_ui_error', '/audio/sfx/ui/error.mp3');

        // Combat SFX
        this.scene.load.audio('sfx_combat_attack', '/audio/sfx/combat/attack.mp3');
        this.scene.load.audio('sfx_combat_hit', '/audio/sfx/combat/hit.mp3');
        this.scene.load.audio('sfx_combat_divine_skill', '/audio/sfx/combat/divine_skill.mp3');
        this.scene.load.audio('sfx_combat_victory', '/audio/sfx/combat/victory.mp3');
        this.scene.load.audio('sfx_combat_defeat', '/audio/sfx/combat/defeat.mp3');

        // Item SFX
        this.scene.load.audio('sfx_items_loot', '/audio/sfx/items/loot.mp3');
        this.scene.load.audio('sfx_items_equip', '/audio/sfx/items/equip.mp3');
        this.scene.load.audio('sfx_items_use', '/audio/sfx/items/use_item.mp3');

        // BGM per phase
        this.scene.load.audio('bgm_shop', '/audio/bgm/shop/shop_theme.mp3');
        this.scene.load.audio('bgm_arena', '/audio/bgm/arena/arena_theme.mp3');
        this.scene.load.audio('bgm_exploration', '/audio/bgm/exploration/exploration_theme.mp3');
        this.scene.load.audio('bgm_menu', '/audio/bgm/menu/menu_theme.mp3');
        this.scene.load.audio('bgm_village', '/audio/bgm/village/village_theme.mp3');

        // Ambient sounds
        this.scene.load.audio('ambient_cave', '/audio/ambient/cave.mp3');
        this.scene.load.audio('ambient_village', '/audio/ambient/village.mp3');
    }

    /**
     * Play a sound effect by key
     * @param key Sound effect key (e.g., 'combat_attack', 'ui_click')
     * @param volume Volume multiplier (0-1)
     */
    public playSFX(key: string, volume: number = this.sfxVolume) {
        try {
            const soundKey = `sfx_${key.replace('_', '_')}`;
            if (this.scene.cache.audio.exists(soundKey)) {
                const sfx = this.scene.sound.add(soundKey, { volume });
                sfx.play();
                // Clean up after playing
                sfx.once('complete', () => {
                    sfx.destroy();
                });
            }
        } catch (e) {
            console.warn(`AudioController: Could not play SFX ${key}`);
        }
    }

    /**
     * Play background music by phase key
     * @param key BGM key (e.g., 'shop', 'arena', 'exploration')
     * @param volume Volume multiplier (0-1)
     */
    public playBGM(key: string, volume: number = this.bgmVolume) {
        try {
            const soundKey = `bgm_${key}`;

            // Skip if same BGM is already playing
            if (this.bgm && this.bgm.isPlaying && this.bgm.key === soundKey) {
                return;
            }

            // Stop current BGM if different
            if (this.bgm && this.bgm.isPlaying) {
                this.bgm.stop();
                this.bgm.destroy();
            }

            if (this.scene.cache.audio.exists(soundKey)) {
                this.bgm = this.scene.sound.add(soundKey, { loop: true, volume });
                this.bgm.play();
            }
        } catch (e) {
            console.warn(`AudioController: Could not play BGM ${key}`);
        }
    }

    /**
     * Stop currently playing background music
     */
    public stopBGM() {
        if (this.bgm) {
            this.bgm.stop();
            this.bgm.destroy();
            this.bgm = null;
        }
    }

    /**
     * Set SFX volume
     */
    public setSFXVolume(volume: number) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Set BGM volume
     */
    public setBGMVolume(volume: number) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgm && this.bgm.isPlaying) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.bgm as any).setVolume(this.bgmVolume);
        }
    }

    /**
     * Clean up event listeners - call in scene's shutdown
     */
    public cleanup() {
        EventBus.off('play-sfx', this.sfxListener);
        EventBus.off('play-bgm', this.bgmListener);
        EventBus.off('stop-bgm', this.stopBgmListener);
        this.stopBGM();
    }
}

// Export audio event names for convenience
export const AUDIO_EVENTS = {
    PLAY_SFX: 'play-sfx',
    PLAY_BGM: 'play-bgm',
    STOP_BGM: 'stop-bgm',
} as const;

// Export sound effect keys
export const SFX_KEYS = {
    UI_CLICK: 'ui_click',
    UI_HOVER: 'ui_hover',
    UI_PURCHASE: 'ui_purchase',
    UI_SUCCESS: 'ui_success',
    UI_ERROR: 'ui_error',
    COMBAT_ATTACK: 'combat_attack',
    COMBAT_HIT: 'combat_hit',
    COMBAT_DIVINE_SKILL: 'combat_divine_skill',
    COMBAT_VICTORY: 'combat_victory',
    COMBAT_DEFEAT: 'combat_defeat',
    ITEMS_LOOT: 'items_loot',
    ITEMS_EQUIP: 'items_equip',
    ITEMS_USE: 'items_use',
} as const;

// Export BGM keys
export const BGM_KEYS = {
    SHOP: 'shop',
    ARENA: 'arena',
    EXPLORATION: 'exploration',
    MENU: 'menu',
    VILLAGE: 'village',
} as const;
