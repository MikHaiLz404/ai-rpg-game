import { EventBus } from '../EventBus';

interface RoomConfig {
    name: string;
    exits: Record<string, string>;
    phase?: string;
    bgImage?: string; 
}

const WORLD: Record<string, RoomConfig> = {
    shop: {
        name: 'Celestial Emporium',
        phase: 'shop',
        bgImage: 'bg_shop',
        exits: { right: 'arena', down: 'village', up: 'cave_entrance' }
    },
    arena: {
        name: 'The Grand Arena',
        phase: 'arena',
        bgImage: 'bg_arena',
        exits: { left: 'shop' }
    },
    village: {
        name: 'Divine Village',
        phase: 'relationship',
        bgImage: 'bg_shop', 
        exits: { up: 'shop', right: 'cave_entrance' }
    },
    cave_entrance: {
        name: 'Cave Entrance',
        phase: 'exploration',
        bgImage: 'bg_cave',
        exits: { down: 'shop', right: 'village', up: 'cave_inside' }
    },
    cave_inside: {
        name: 'Inside Cave',
        phase: 'exploration',
        bgImage: 'bg_cave',
        exits: { down: 'cave_entrance' }
    }
};

export class MainScene extends Phaser.Scene {
    player!: Phaser.GameObjects.Sprite;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    wasdKeys!: any;
    currentRoom = 'shop';
    bgSprite: Phaser.GameObjects.Image | null = null;
    roomText!: Phaser.GameObjects.Text;
    
    customerNPC: Phaser.GameObjects.Sprite | null = null;
    
    // Arena Fighters
    kaneFighter: Phaser.GameObjects.Sprite | null = null;
    slimeEnemy: Phaser.GameObjects.Sprite | null = null;

    // Debug
    debugMode = false;
    debugGraphics!: Phaser.GameObjects.Graphics;
    debugTexts: Phaser.GameObjects.Text[] = [];
    coordText!: Phaser.GameObjects.Text;

    constructor() {
        super('MainScene');
    }

    preload() {
        // Player
        this.load.spritesheet('player', '/images/characters/player/minju/character_26/character_26_frame32x32.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // NPCs
        this.load.spritesheet('npc_leo', '/images/characters/npcs/leo/character_2/character_2_frame32x32.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('npc_arena', '/images/characters/npcs/arena/character_10/character_10_frame32x32.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('npc_draco', '/images/characters/npcs/draco/character_24/character_24_frame32x32.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // Fighters
        this.load.image('kane_idle', '/images/characters/npcs/kane/hero-pack-free_version/hero/color_1/idle/hero_idle_DOWN.png');
        this.load.image('slime_idle', '/images/enemies/slime/idle/frame_1_0.png');

        // Combat Effects
        this.load.spritesheet('attack_effect', '/images/effects/combat/attack/attack_sprite.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        
        // Backgrounds
        this.load.image('bg_shop', '/images/backgrounds/shop/interior/bg_shop_interior.png');
        this.load.image('bg_arena', '/images/backgrounds/arena/interior/bg_arena_interior.png');
        this.load.image('bg_cave', '/images/backgrounds/exploration/cave/bg_cave_interior.png');
    }

    createCharAnims(key: string, texture: string) {
        this.anims.create({
            key: `${key}-down`,
            frames: this.anims.generateFrameNumbers(texture, { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: `${key}-left`,
            frames: this.anims.generateFrameNumbers(texture, { start: 3, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: `${key}-right`,
            frames: this.anims.generateFrameNumbers(texture, { start: 6, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: `${key}-up`,
            frames: this.anims.generateFrameNumbers(texture, { start: 9, end: 11 }),
            frameRate: 10,
            repeat: -1
        });
    }

    create() {
        // Create animations
        this.createCharAnims('player', 'player');
        this.createCharAnims('leo', 'npc_leo');
        this.createCharAnims('arena', 'npc_arena');
        this.createCharAnims('draco', 'npc_draco');

        // Attack Animation (11 columns x 9 rows = 99 frames)
        this.anims.create({
            key: 'hit_effect',
            frames: this.anims.generateFrameNumbers('attack_effect', { start: 0, end: 98 }),
            frameRate: 30,
            repeat: 0,
            hideOnComplete: true
        });

        this.roomText = this.add.text(192, 20, '', {
            fontSize: '18px',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 3,
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(100);

        this.player = this.add.sprite(195, 143, 'player');
        this.player.setScale(1.5).setDepth(50);
        this.player.anims.play('player-down', true);

        this.loadRoom('shop');

        // Toggle Debug Mode
        this.input.keyboard?.on('keydown-G', () => {
            this.debugMode = !this.debugMode;
            this.debugGraphics.setVisible(this.debugMode);
            this.debugTexts.forEach(t => t.setVisible(this.debugMode));
            this.coordText.setVisible(this.debugMode);
        });

        this.time.addEvent({
            delay: 15000,
            callback: this.trySpawnCustomer,
            callbackScope: this,
            loop: true
        });

        EventBus.on('clear-customer', () => this.clearCustomer());
        
        EventBus.on('change-room', (roomName: string) => {
            this.loadRoom(roomName);
        });

        // Listen for combat attacks
        EventBus.on('arena-attack', (data: { target: 'player' | 'enemy' }) => {
            this.playAttackEffect(data.target);
        });

        // Debug Grid
        this.debugGraphics = this.add.graphics();
        this.debugGraphics.lineStyle(1, 0x00ff00, 0.2);
        this.debugGraphics.setDepth(1000);

        for (let x = 0; x <= 384; x += 48) {
            this.debugGraphics.lineBetween(x, 0, x, 288);
            if (x < 384) {
                const t = this.add.text(x + 2, 2, x.toString(), { fontSize: '8px', color: '#00ff00' }).setAlpha(0.5).setDepth(1001);
                this.debugTexts.push(t);
            }
        }
        for (let y = 0; y <= 288; y += 48) {
            this.debugGraphics.lineBetween(0, y, 384, y);
            if (y < 288) {
                const t = this.add.text(2, y + 2, y.toString(), { fontSize: '8px', color: '#00ff00' }).setAlpha(0.5).setDepth(1001);
                this.debugTexts.push(t);
            }
        }

        this.coordText = this.add.text(380, 280, '', {
            fontSize: '10px', color: '#00ff00', backgroundColor: '#000000cc', padding: { x: 4, y: 2 }
        }).setOrigin(1, 1).setDepth(2000);

        this.debugGraphics.setVisible(false);
        this.debugTexts.forEach(t => t.setVisible(false));
        this.coordText.setVisible(false);

        EventBus.emit('current-scene-ready', this);
    }

    playAttackEffect(target: 'player' | 'enemy') {
        const x = target === 'enemy' ? (this.slimeEnemy?.x || 150) : (this.kaneFighter?.x || 130);
        const y = target === 'enemy' ? (this.slimeEnemy?.y || 120) : (this.kaneFighter?.y || 120);
        
        const effect = this.add.sprite(x, y, 'attack_effect').setDepth(100);
        effect.play('hit_effect');
        effect.on('animationcomplete', () => {
            effect.destroy();
        });

        // Add a small shake effect
        const targetSprite = target === 'enemy' ? this.slimeEnemy : this.kaneFighter;
        if (targetSprite) {
            this.tweens.add({
                targets: targetSprite,
                x: targetSprite.x + (target === 'enemy' ? 5 : -5),
                duration: 50,
                yoyo: true,
                repeat: 3
            });
        }
    }

    trySpawnCustomer() {
        const { isShiftActive } = (this.game as any).store?.getState() || { isShiftActive: true };
        if (this.currentRoom !== 'shop' || !isShiftActive || this.customerNPC) return;

        const npcList = [
            { id: 'leo', name: 'เลโอ้', texture: 'npc_leo', anim: 'leo' },
            { id: 'arena', name: 'อารีน่า', texture: 'npc_arena', anim: 'arena' },
            { id: 'draco', name: 'ดราโก้', texture: 'npc_draco', anim: 'draco' },
        ];
        const selected = npcList[Math.floor(Math.random() * npcList.length)];

        this.customerNPC = this.add.sprite(180, 263, selected.texture);
        this.customerNPC.setScale(1.5).setDepth(45);
        this.customerNPC.anims.play(`${selected.anim}-up`, true);

        this.tweens.add({
            targets: this.customerNPC,
            y: 200,
            duration: 3000,
            onComplete: () => {
                this.customerNPC?.anims.stop();
                this.customerNPC?.setFrame(1);
                EventBus.emit('customer-arrival', { id: selected.id, name: selected.name });
            }
        });
    }

    clearCustomer() {
        if (!this.customerNPC) return;
        const textureKey = this.customerNPC.texture.key;
        let animPrefix = 'player';
        if (textureKey === 'npc_leo') animPrefix = 'leo';
        if (textureKey === 'npc_arena') animPrefix = 'arena';
        if (textureKey === 'npc_draco') animPrefix = 'draco';

        this.customerNPC.anims.play(`${animPrefix}-down`, true);
        this.tweens.add({
            targets: this.customerNPC,
            y: 280,
            duration: 2000,
            onComplete: () => {
                this.customerNPC?.destroy();
                this.customerNPC = null;
            }
        });
    }

    loadRoom(roomName: string) {
        const room = WORLD[roomName];
        if (!room) return;

        if (this.bgSprite) this.bgSprite.destroy();
        
        if (this.kaneFighter) this.kaneFighter.destroy();
        if (this.slimeEnemy) this.slimeEnemy.destroy();

        this.currentRoom = roomName;
        this.roomText.setText(room.name);
        if (room.phase) EventBus.emit('phase-change', room.phase);

        if (room.bgImage) {
            this.bgSprite = this.add.image(192, 144, room.bgImage);
            const scaleX = 384 / this.bgSprite.width;
            const scaleY = 288 / this.bgSprite.height;
            this.bgSprite.setScale(Math.max(scaleX, scaleY)).setDepth(-1);
        }

        if (roomName === 'arena') {
            this.player.setPosition(120, 240);
            this.player.anims.play('player-down', true);
            
            // Adjusted positions and half-scales
            this.kaneFighter = this.add.sprite(130, 120, 'kane_idle').setScale(0.6).setDepth(40);
            this.slimeEnemy = this.add.sprite(150, 120, 'slime_idle').setScale(0.75).setDepth(40);
            
            this.tweens.add({
                targets: this.kaneFighter,
                y: 118,
                duration: 1000,
                yoyo: true,
                repeat: -1
            });
            this.tweens.add({
                targets: this.slimeEnemy,
                scale: 0.8,
                duration: 800,
                yoyo: true,
                repeat: -1
            });

        } else {
            this.player.setPosition(195, 143);
            this.player.anims.play('player-down', true);
        }

        if (roomName !== 'shop' && this.customerNPC) {
            this.customerNPC.destroy();
            this.customerNPC = null;
        }
    }

    update() {
        if (this.debugMode) {
            this.coordText.setText(`X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`);
        }
    }
}
