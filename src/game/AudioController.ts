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
        // Placeholder for future assets
        // this.scene.load.audio('click', 'audio/sfx/ui/click.mp3');
        // this.scene.load.audio('hit', 'audio/sfx/combat/hit.mp3');
        // this.scene.load.audio('shop_bgm', 'audio/bgm/shop/shop_theme.mp3');
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
