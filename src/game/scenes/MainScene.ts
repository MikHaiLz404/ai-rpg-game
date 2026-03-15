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
        bgImage: 'bg_village', 
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
    player!: Phaser.Physics.Arcade.Sprite;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    wasdKeys!: any;
    currentRoom = 'shop';
    bgSprite: Phaser.GameObjects.Image | null = null;
    roomText!: Phaser.GameObjects.Text;
    
    customerNPC: Phaser.GameObjects.Sprite | null = null;
    
    // Arena Fighters
    kaneFighter: Phaser.GameObjects.Sprite | null = null;
    arenaEnemy: Phaser.GameObjects.Sprite | null = null;
    currentEnemyType: string = 'slime';
    kaneBobTween: Phaser.Tweens.Tween | null = null;
    enemyBobTween: Phaser.Tweens.Tween | null = null;

    // Village NPCs
    villageNPCs: Phaser.GameObjects.Sprite[] = [];
    walkTween: Phaser.Tweens.Tween | null = null;

    // Debug
    debugMode = false;
    debugGraphics!: Phaser.GameObjects.Graphics;
    debugTexts: Phaser.GameObjects.Text[] = [];
    coordText!: Phaser.GameObjects.Text;

    constructor() {
        super('MainScene');
    }

    preload() {
        // Log loading errors to console
        this.load.on('loaderror', (file: Phaser.Loader.File) => {
            console.error(`[MainScene] Failed to load: ${file.key} (${file.url})`);
        });

        // Player (Minju)
        this.load.spritesheet('player', '/images/characters/player/minju/minju_frame32x32.png', {
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

        // Kane sprites
        this.load.image('kane_idle', '/images/characters/npcs/kane/idle/hero_idle_RIGHT.png');
        this.load.spritesheet('kane_attack', '/images/characters/npcs/kane/attack/hero_bow_RIGHT.png', {
            frameWidth: 32, frameHeight: 32
        });

        // Enemy sprites - Slime
        this.load.spritesheet('slime_idle', '/images/enemies/slime/idle/enemies-slime1_idle.png', {
            frameWidth: 32, frameHeight: 32
        });
        this.load.spritesheet('slime_attack', '/images/enemies/slime/attack/enemies-slime1_attack.png', {
            frameWidth: 32, frameHeight: 32
        });
        this.load.spritesheet('slime_damage', '/images/enemies/slime/damaged/enemies-slime1_take_damage.png', {
            frameWidth: 32, frameHeight: 32
        });
        this.load.spritesheet('slime_death', '/images/enemies/slime/death/enemies-slime1_death.png', {
            frameWidth: 32, frameHeight: 32
        });

        // Enemy sprites - Skeleton
        this.load.spritesheet('skeleton_idle', '/images/enemies/skeleton/idle/enemies-skeleton2_idle.png', {
            frameWidth: 32, frameHeight: 32
        });
        this.load.spritesheet('skeleton_attack', '/images/enemies/skeleton/attack/enemies-skeleton2_attack.png', {
            frameWidth: 32, frameHeight: 32
        });
        this.load.spritesheet('skeleton_damage', '/images/enemies/skeleton/damaged/enemies-skeleton2_take_damage.png', {
            frameWidth: 32, frameHeight: 32
        });
        this.load.spritesheet('skeleton_death', '/images/enemies/skeleton/death/enemies-skeleton2_death.png', {
            frameWidth: 32, frameHeight: 32
        });

        // Enemy sprites - Demon
        this.load.spritesheet('demon_idle', '/images/enemies/demon/idle/enemies-vampire_idle.png', {
            frameWidth: 32, frameHeight: 32
        });
        this.load.spritesheet('demon_attack', '/images/enemies/demon/attack/enemies-vampire_attack.png', {
            frameWidth: 32, frameHeight: 32
        });
        this.load.spritesheet('demon_damage', '/images/enemies/demon/damaged/enemies-vampire_take_damage.png', {
            frameWidth: 32, frameHeight: 32
        });
        this.load.spritesheet('demon_death', '/images/enemies/demon/death/enemies-vamenemies-skeleton2_death.png', {
            frameWidth: 32, frameHeight: 32
        });

        // Combat Effects
        this.load.spritesheet('attack_effect', '/images/effects/combat/attack/effect_kane_attack.png', {
            frameWidth: 32, frameHeight: 32
        });
        this.load.spritesheet('enemy_attack_effect', '/images/effects/combat/attack/effect_enemy_attack.png', {
            frameWidth: 64, frameHeight: 64
        });
        
        // Backgrounds
        this.load.image('bg_shop', '/images/backgrounds/shop/interior/bg_shop_interior.png');
        this.load.image('bg_arena', '/images/backgrounds/arena/interior/bg_arena_interior.png');
        this.load.image('bg_cave', '/images/backgrounds/exploration/cave/bg_cave_interior.png');
        this.load.image('bg_village', '/images/backgrounds/village/exterior/bg_village_exterior.png');
    }

    createCharAnims(key: string, texture: string) {
        if (!this.anims.exists(`${key}-down`)) {
            this.anims.create({
                key: `${key}-down`,
                frames: this.anims.generateFrameNumbers(texture, { start: 0, end: 2 }),
                frameRate: 10,
                repeat: -1
            });
        }
        if (!this.anims.exists(`${key}-left`)) {
            this.anims.create({
                key: `${key}-left`,
                frames: this.anims.generateFrameNumbers(texture, { start: 3, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }
        if (!this.anims.exists(`${key}-right`)) {
            this.anims.create({
                key: `${key}-right`,
                frames: this.anims.generateFrameNumbers(texture, { start: 6, end: 8 }),
                frameRate: 10,
                repeat: -1
            });
        }
        if (!this.anims.exists(`${key}-up`)) {
            this.anims.create({
                key: `${key}-up`,
                frames: this.anims.generateFrameNumbers(texture, { start: 9, end: 11 }),
                frameRate: 10,
                repeat: -1
            });
        }
    }

    createAnimIfNeeded(key: string, texture: string, start: number, end: number, frameRate: number, repeat: number, hideOnComplete = false) {
        if (!this.anims.exists(key)) {
            this.anims.create({ key, frames: this.anims.generateFrameNumbers(texture, { start, end }), frameRate, repeat, hideOnComplete });
        }
    }

    create() {
        // Create animations
        this.createCharAnims('player', 'player');
        this.createCharAnims('leo', 'npc_leo');
        this.createCharAnims('arena', 'npc_arena');
        this.createCharAnims('draco', 'npc_draco');

        // Kane animations
        this.createAnimIfNeeded('kane-attack', 'kane_attack', 0, 6, 12, 0);

        // Enemy animations - Slime
        this.createAnimIfNeeded('slime-idle', 'slime_idle', 0, 2, 6, -1);
        this.createAnimIfNeeded('slime-attack', 'slime_attack', 0, 2, 10, 0);
        this.createAnimIfNeeded('slime-damage', 'slime_damage', 0, 2, 10, 0);
        this.createAnimIfNeeded('slime-death', 'slime_death', 0, 9, 10, 0);

        // Enemy animations - Skeleton
        this.createAnimIfNeeded('skeleton-idle', 'skeleton_idle', 0, 5, 6, -1);
        this.createAnimIfNeeded('skeleton-attack', 'skeleton_attack', 0, 14, 15, 0);
        this.createAnimIfNeeded('skeleton-damage', 'skeleton_damage', 0, 4, 10, 0);
        this.createAnimIfNeeded('skeleton-death', 'skeleton_death', 0, 14, 10, 0);

        // Enemy animations - Demon
        this.createAnimIfNeeded('demon-idle', 'demon_idle', 0, 5, 6, -1);
        this.createAnimIfNeeded('demon-attack', 'demon_attack', 0, 15, 15, 0);
        this.createAnimIfNeeded('demon-damage', 'demon_damage', 0, 4, 10, 0);
        this.createAnimIfNeeded('demon-death', 'demon_death', 0, 14, 10, 0);

        // Hit effect animations
        this.createAnimIfNeeded('hit_effect', 'attack_effect', 0, 14, 30, 0, true);
        this.createAnimIfNeeded('enemy_hit_effect', 'enemy_attack_effect', 0, 10, 20, 0, true);

        this.roomText = this.add.text(192, 20, '', {
            fontSize: '18px',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 3,
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(100);

        this.player = this.physics.add.sprite(195, 143, 'player');
        this.player.setScale(1.5).setDepth(50);
        this.player.anims.play('player-down', true);

        // Initialize keyboard controls
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasdKeys = this.input.keyboard!.addKeys('W,A,S,D') as any;

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

        // Listen for combat events
        EventBus.on('arena-attack', (data: { target: 'player' | 'enemy' }) => {
            this.playAttackEffect(data.target);
        });

        EventBus.on('arena-enemy-change', (data: { enemyType: string }) => {
            this.spawnArenaEnemy(data.enemyType);
        });

        EventBus.on('arena-enemy-death', () => {
            this.playEnemyDeath();
        });

        EventBus.on('arena-combat-end', () => {
            this.resetArenaIdle();
        });

        // Village: walk player to NPC
        EventBus.on('village-walk-to-npc', (data: { npcId: string }) => {
            this.walkToVillageNPC(data.npcId);
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
        const enemySprite = this.arenaEnemy;
        const targetSprite = target === 'enemy' ? enemySprite : this.kaneFighter;
        const x = targetSprite?.x || 192;
        const y = targetSprite?.y || 154;

        // Attacker plays attack animation
        if (target === 'enemy' && this.kaneFighter) {
            // Kane attacks enemy
            this.kaneFighter.setTexture('kane_attack');
            this.kaneFighter.play('kane-attack');
            this.kaneFighter.once('animationcomplete', () => {
                this.kaneFighter?.setTexture('kane_idle');
            });
            // Enemy takes damage
            if (enemySprite) {
                this.time.delayedCall(300, () => {
                    enemySprite.play(`${this.currentEnemyType}-damage`);
                    enemySprite.once('animationcomplete', () => {
                        enemySprite.play(`${this.currentEnemyType}-idle`);
                    });
                });
            }
        } else if (target === 'player') {
            // Enemy attacks Kane
            if (enemySprite) {
                enemySprite.play(`${this.currentEnemyType}-attack`);
                enemySprite.once('animationcomplete', () => {
                    enemySprite.play(`${this.currentEnemyType}-idle`);
                });
            }
        }

        // Hit effect on target — Kane uses kane effect, enemy uses enemy effect
        if (target === 'enemy') {
            this.time.delayedCall(300, () => {
                const effect = this.add.sprite(x, y, 'attack_effect').setDepth(100);
                effect.play('hit_effect');
                effect.on('animationcomplete', () => effect.destroy());
            });
        } else {
            const effect = this.add.sprite(x, y, 'enemy_attack_effect').setScale(0.8).setDepth(100);
            effect.play('enemy_hit_effect');
            effect.on('animationcomplete', () => effect.destroy());
        }

        // Shake effect on target
        if (targetSprite) {
            const shakeDelay = target === 'enemy' ? 300 : 0;
            this.time.delayedCall(shakeDelay, () => {
                this.tweens.add({
                    targets: targetSprite,
                    x: targetSprite.x + (target === 'enemy' ? 5 : -5),
                    duration: 50,
                    yoyo: true,
                    repeat: 3
                });
            });
        }
    }

    spawnArenaEnemy(enemyType: string) {
        if (this.currentRoom !== 'arena') return;
        this.currentEnemyType = enemyType;

        if (this.arenaEnemy) {
            if (this.enemyBobTween) this.enemyBobTween.stop();
            this.arenaEnemy.destroy();
        }

        this.arenaEnemy = this.add.sprite(200, 154, `${enemyType}_idle`).setScale(1.5).setDepth(40);
        this.arenaEnemy.play(`${enemyType}-idle`);

        this.enemyBobTween = this.tweens.add({
            targets: this.arenaEnemy,
            y: 152,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Reset Kane to idle
        if (this.kaneFighter) {
            this.kaneFighter.setTexture('kane_idle');
        }
    }

    playEnemyDeath() {
        if (!this.arenaEnemy) return;
        if (this.enemyBobTween) this.enemyBobTween.stop();
        this.arenaEnemy.play(`${this.currentEnemyType}-death`);
    }

    walkToVillageNPC(npcId: string) {
        if (this.currentRoom !== 'village') return;
        const target = this.villageNPCs.find(n => n.getData('npcId') === npcId);
        if (!target) return;

        if (this.walkTween) this.walkTween.stop();

        const dx = target.x - this.player.x;
        const dy = (target.y + 30) - this.player.y; // stop slightly below NPC
        const dist = Math.sqrt(dx * dx + dy * dy);
        const duration = Math.max(400, dist * 8);

        // Pick walk direction
        const anim = Math.abs(dx) > Math.abs(dy)
            ? (dx > 0 ? 'player-right' : 'player-left')
            : (dy > 0 ? 'player-down' : 'player-up');
        this.player.anims.play(anim, true);

        this.walkTween = this.tweens.add({
            targets: this.player,
            x: target.x,
            y: target.y + 30,
            duration,
            onComplete: () => {
                this.player.anims.play('player-up', true);
                this.player.anims.stop();
                this.player.setFrame(9); // face up toward NPC
            }
        });
    }

    resetArenaIdle() {
        if (this.currentRoom !== 'arena') return;
        // Reset enemy to default slime
        this.spawnArenaEnemy('slime');
        if (this.kaneFighter) {
            this.kaneFighter.setTexture('kane_idle');
        }
    }

    trySpawnCustomer() {
        const { isShiftActive } = (this.game as any).store?.getState() || { isShiftActive: true };
        if (this.currentRoom !== 'shop' || !isShiftActive || this.customerNPC) return;

        const npcList = [
            { id: 'leo', name: 'เลโอ', texture: 'npc_leo', anim: 'leo' },
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
        if (this.arenaEnemy) this.arenaEnemy.destroy();
        if (this.kaneBobTween) this.kaneBobTween.stop();
        if (this.enemyBobTween) this.enemyBobTween.stop();
        if (this.walkTween) this.walkTween.stop();
        this.villageNPCs.forEach(n => n.destroy());
        this.villageNPCs = [];

        this.currentRoom = roomName;
        this.roomText.setText(room.name);
        if (room.phase) EventBus.emit('phase-change', room.phase);

        if (room.bgImage && this.textures.exists(room.bgImage)) {
            this.bgSprite = this.add.image(192, 144, room.bgImage);

            const scaleX = 384 / this.bgSprite.width;
            const scaleY = 288 / this.bgSprite.height;
            this.bgSprite.setScale(Math.max(scaleX, scaleY)).setDepth(-1);
        } else if (room.bgImage) {
            console.warn(`[MainScene] Texture not found: ${room.bgImage}`);
        }

        if (roomName === 'arena') {
            this.player.setPosition(120, 240);
            this.player.anims.play('player-down', true);

            // Kane facing right (toward enemy)
            this.kaneFighter = this.add.sprite(165, 154, 'kane_idle').setScale(1.5).setDepth(40);

            // Enemy facing Kane
            this.currentEnemyType = 'slime';
            this.arenaEnemy = this.add.sprite(200, 154, 'slime_idle').setScale(1.5).setDepth(40);
            this.arenaEnemy.play('slime-idle', true);

            // Subtle idle bob
            this.kaneBobTween = this.tweens.add({
                targets: this.kaneFighter,
                y: 152,
                duration: 1000,
                yoyo: true,
                repeat: -1
            });
            this.enemyBobTween = this.tweens.add({
                targets: this.arenaEnemy,
                y: 152,
                duration: 800,
                yoyo: true,
                repeat: -1
            });

        } else if (roomName === 'village') {
            this.player.setPosition(192, 220);
            this.player.anims.play('player-down', true);

            // Spawn NPCs scattered around the village
            const villageNPCList = [
                { id: 'leo', texture: 'npc_leo', anim: 'leo', x: 80, y: 160 },
                { id: 'arena', texture: 'npc_arena', anim: 'arena', x: 192, y: 120 },
                { id: 'draco', texture: 'npc_draco', anim: 'draco', x: 310, y: 170 },
            ];
            for (const npc of villageNPCList) {
                const sprite = this.add.sprite(npc.x, npc.y, npc.texture).setScale(1.5).setDepth(40);
                sprite.anims.play(`${npc.anim}-down`, true);
                sprite.setData('npcId', npc.id);
                sprite.setInteractive({ useHandCursor: true });
                sprite.on('pointerdown', () => {
                    EventBus.emit('village-npc-clicked', { npcId: npc.id });
                    this.walkToVillageNPC(npc.id);
                });
                this.villageNPCs.push(sprite);
            }
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
        // Character movement disabled as requested. 
        // Logic remains declared for system use but interaction is removed.

        if (this.debugMode) {
            this.coordText.setText(`X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`);
        }
    }
}
