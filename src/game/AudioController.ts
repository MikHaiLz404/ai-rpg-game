/**
 * AudioController.ts - Centralized Audio Management for Gods' Arena
 */

import * as Phaser from 'phaser';
import { EventBus } from './EventBus';

export class AudioController {
    private scene: Phaser.Scene;
    private bgm: Phaser.Sound.BaseSound | null = null;
    
    private sfxListener = (key: string) => this.playSFX(key);
    private bgmListener = (key: string) => this.playBGM(key);
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

    public preload() {
        // UI SFX
        // this.scene.load.audio('click', 'audio/sfx/ui/click.mp3');
        // this.scene.load.audio('purchase', 'audio/sfx/ui/purchase.mp3');

        // Combat SFX
        // this.scene.load.audio('attack', 'audio/sfx/combat/attack.mp3');
        // this.scene.load.audio('hit', 'audio/sfx/combat/hit.mp3');
        // this.scene.load.audio('divine_skill', 'audio/sfx/combat/divine_skill.mp3');
        // this.scene.load.audio('victory', 'audio/sfx/combat/victory.mp3');
        // this.scene.load.audio('defeat', 'audio/sfx/combat/defeat.mp3');

        // BGM per phase
        // this.scene.load.audio('shop_bgm', 'audio/bgm/shop/shop_theme.mp3');
        // this.scene.load.audio('arena_bgm', 'audio/bgm/arena/arena_theme.mp3');
        // this.scene.load.audio('exploration_bgm', 'audio/bgm/exploration/exploration_theme.mp3');
        // this.scene.load.audio('menu_bgm', 'audio/bgm/menu/menu_theme.mp3');
    }

    public playSFX(key: string, volume: number = 0.5) {
        try {
            if (this.scene.cache.audio.exists(key)) {
                this.scene.sound.play(key, { volume });
            }
        } catch (e) {
            console.warn(`AudioController: Could not play SFX ${key}`);
        }
    }

    public playBGM(key: string, volume: number = 0.3) {
        try {
            if (this.bgm && this.bgm.isPlaying) {
                if (this.bgm.key === key) return;
                this.bgm.stop();
            }

            if (this.scene.cache.audio.exists(key)) {
                this.bgm = this.scene.sound.add(key, { loop: true, volume });
                this.bgm.play();
            }
        } catch (e) {
            console.warn(`AudioController: Could not play BGM ${key}`);
        }
    }

    public stopBGM() {
        if (this.bgm) {
            this.bgm.stop();
        }
    }

    public cleanup() {
        EventBus.off('play-sfx', this.sfxListener);
        EventBus.off('play-bgm', this.bgmListener);
        EventBus.off('stop-bgm', this.stopBgmListener);
    }
}
