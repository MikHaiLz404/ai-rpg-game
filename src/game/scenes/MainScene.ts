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

    // Exploration
    explorationTiles!: Phaser.GameObjects.Group;

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
            frameWidth: 32,
            frameHeight: 32
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
        this.createCharAnims('player', 'player');
        this.createCharAnims('leo', 'npc_leo');
        this.createCharAnims('arena', 'npc_arena');
        this.createCharAnims('draco', 'npc_draco');
        this.createAnimIfNeeded('kane-attack', 'kane_attack', 0, 6, 12, 0);
        this.createAnimIfNeeded('slime-idle', 'slime_idle', 0, 2, 6, -1);
        this.createAnimIfNeeded('slime-attack', 'slime_attack', 0, 2, 10, 0);
        this.createAnimIfNeeded('slime-damage', 'slime_damage', 0, 2, 10, 0);
        this.createAnimIfNeeded('slime-death', 'slime_death', 0, 9, 10, 0);
        this.createAnimIfNeeded('skeleton-idle', 'skeleton_idle', 0, 5, 6, -1);
        this.createAnimIfNeeded('skeleton-attack', 'skeleton_attack', 0, 14, 15, 0);
        this.createAnimIfNeeded('skeleton-damage', 'skeleton_damage', 0, 4, 10, 0);
        this.createAnimIfNeeded('skeleton-death', 'skeleton_death', 0, 14, 10, 0);
        this.createAnimIfNeeded('demon-idle', 'demon_idle', 0, 5, 6, -1);
        this.createAnimIfNeeded('demon-attack', 'demon_attack', 0, 15, 15, 0);
        this.createAnimIfNeeded('demon-damage', 'demon_damage', 0, 4, 10, 0);
        this.createAnimIfNeeded('demon-death', 'demon_death', 0, 14, 10, 0);
        this.createAnimIfNeeded('hit_effect', 'attack_effect', 0, 14, 30, 0, true);
        this.createAnimIfNeeded('enemy_hit_effect', 'enemy_attack_effect', 0, 10, 20, 0, true);

        this.roomText = this.add.text(192, 20, '', { fontSize: '18px', color: '#fff', stroke: '#000', strokeThickness: 3, fontFamily: 'Arial' }).setOrigin(0.5).setDepth(100);
        this.player = this.physics.add.sprite(195, 143, 'player');
        this.player.setScale(1.5).setDepth(50);
        this.player.anims.play('player-down', true);
        this.input.keyboard!.disableGlobalCapture();

        this.loadRoom('shop');

        this.input.keyboard?.on('keydown-G', () => {
            this.debugMode = !this.debugMode;
            this.debugGraphics.setVisible(this.debugMode);
            this.coordText.setVisible(this.debugMode);
        });

        this.scheduleNextCustomer();

        // ---------------------------------------------------------
        // EventBus Listeners with Cleanup
        // ---------------------------------------------------------
        const clearCustomerListener = () => this.clearCustomer();
        const changeRoomListener = (roomName: string) => this.loadRoom(roomName);
        const floatingTextListener = (data: { x?: number, y?: number, text: string, color?: string }) => {
            const x = data.x || this.player.x;
            const y = data.y || (this.player.y - 20);
            this.spawnFloatingText(x, y, data.text, data.color);
        };
        const arenaAttackListener = (data: { target: 'player' | 'enemy' }) => this.playAttackEffect(data.target);
        const enemyChangeListener = (data: { enemyType: string }) => this.spawnArenaEnemy(data.enemyType);
        const enemyDeathListener = () => this.playEnemyDeath();
        const combatEndListener = () => this.resetArenaIdle();
        const walkNPCListener = (data: { npcId: string }) => this.walkToVillageNPC(data.npcId);

        EventBus.on('clear-customer', clearCustomerListener);
        EventBus.on('change-room', changeRoomListener);
        EventBus.on('spawn-floating-text', floatingTextListener);
        EventBus.on('arena-attack', arenaAttackListener);
        EventBus.on('arena-enemy-change', enemyChangeListener);
        EventBus.on('arena-enemy-death', enemyDeathListener);
        EventBus.on('arena-combat-end', combatEndListener);
        EventBus.on('village-walk-to-npc', walkNPCListener);

        // Cleanup on Shutdown
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EventBus.off('clear-customer', clearCustomerListener);
            EventBus.off('change-room', changeRoomListener);
            EventBus.off('spawn-floating-text', floatingTextListener);
            EventBus.off('arena-attack', arenaAttackListener);
            EventBus.off('arena-enemy-change', enemyChangeListener);
            EventBus.off('arena-enemy-death', enemyDeathListener);
            EventBus.off('arena-combat-end', combatEndListener);
            EventBus.off('village-walk-to-npc', walkNPCListener);
        });

        this.debugGraphics = this.add.graphics();
        this.debugGraphics.lineStyle(1, 0x00ff00, 0.2);
        this.debugGraphics.setDepth(1000);
        for (let x = 0; x <= 384; x += 48) this.debugGraphics.lineBetween(x, 0, x, 288);
        for (let y = 0; y <= 288; y += 48) this.debugGraphics.lineBetween(0, y, 384, y);
        this.coordText = this.add.text(380, 280, '', { fontSize: '10px', color: '#00ff00', backgroundColor: '#000000cc', padding: { x: 4, y: 2 } }).setOrigin(1, 1).setDepth(2000);
        this.debugGraphics.setVisible(false);
        this.coordText.setVisible(false);

        this.explorationTiles = this.add.group();
        EventBus.emit('current-scene-ready', this);
    }

    playAttackEffect(target: 'player' | 'enemy') {
        const enemySprite = this.arenaEnemy;
        const targetSprite = target === 'enemy' ? enemySprite : this.kaneFighter;
        const x = targetSprite?.x || 192;
        const y = targetSprite?.y || 154;

        if (target === 'enemy' && this.kaneFighter) {
            this.kaneFighter.setTexture('kane_attack');
            this.kaneFighter.play('kane-attack');
            this.kaneFighter.once('animationcomplete', () => this.kaneFighter?.setTexture('kane_idle'));
            if (enemySprite) {
                this.time.delayedCall(300, () => {
                    enemySprite.play(`${this.currentEnemyType}-damage`);
                    enemySprite.once('animationcomplete', () => enemySprite.play(`${this.currentEnemyType}-idle`));
                });
            }
        } else if (target === 'player' && enemySprite) {
            enemySprite.play(`${this.currentEnemyType}-attack`);
            enemySprite.once('animationcomplete', () => enemySprite.play(`${this.currentEnemyType}-idle`));
        }

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

        if (targetSprite) {
            const shakeDelay = target === 'enemy' ? 300 : 0;
            this.time.delayedCall(shakeDelay, () => {
                this.tweens.add({ targets: targetSprite, x: targetSprite.x + (target === 'enemy' ? 5 : -5), duration: 50, yoyo: true, repeat: 3 });
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
        this.enemyBobTween = this.tweens.add({ targets: this.arenaEnemy, y: 152, duration: 800, yoyo: true, repeat: -1 });
        if (this.kaneFighter) this.kaneFighter.setTexture('kane_idle');
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
        const ROAD_X = 200; const ROAD_TOP_Y = 90; const ROAD_MID_Y = 175; 
        const waypoints: { x: number; y: number }[] = [];
        const playerNearTop = this.player.y < ROAD_TOP_Y + 30;
        if (npcId === 'leo' || npcId === 'draco') {
            if (!playerNearTop) waypoints.push({ x: ROAD_X, y: ROAD_MID_Y }, { x: ROAD_X, y: ROAD_TOP_Y });
            waypoints.push({ x: target.x, y: target.y + 25 });
        } else if (npcId === 'arena') {
            waypoints.push({ x: ROAD_X, y: ROAD_MID_Y }, { x: target.x, y: ROAD_MID_Y }, { x: target.x, y: target.y + 25 });
        } else {
            waypoints.push({ x: target.x, y: target.y + 25 });
        }
        this.walkWaypoints(waypoints, 0);
    }

    walkWaypoints(waypoints: { x: number; y: number }[], index: number) {
        if (index >= waypoints.length) {
            this.player.anims.play('player-up', true); this.player.anims.stop(); this.player.setFrame(9); 
            EventBus.emit('village-walk-complete'); return;
        }
        const wp = waypoints[index];
        const dx = wp.x - this.player.x; const dy = wp.y - this.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const duration = Math.max(200, dist * 6);
        const anim = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'player-right' : 'player-left') : (dy > 0 ? 'player-down' : 'player-up');
        this.player.anims.play(anim, true);
        this.walkTween = this.tweens.add({ targets: this.player, x: wp.x, y: wp.y, duration, onComplete: () => this.walkWaypoints(waypoints, index + 1) });
    }

    spawnExplorationTiles() {
        this.explorationTiles.clear(true, true);
        for (let i = 0; i < 6; i++) {
            const x = 40 + Math.random() * 300;
            const y = 60 + Math.random() * 180;
            const isEnemy = Math.random() < 0.3;
            const type = isEnemy ? 'enemy' : 'gathering';
            const container = this.add.container(x, y);
            container.setSize(32, 32); container.setInteractive({ useHandCursor: true });
            const color = isEnemy ? 0xff4444 : 0x44ff44;
            const glow = this.add.graphics();
            glow.fillStyle(color, 0.3); glow.fillCircle(0, 0, 12);
            glow.fillStyle(color, 1); glow.fillCircle(0, 0, 6);
            container.add(glow); container.setDepth(100); 
            container.on('pointerdown', () => { container.destroy(); EventBus.emit('exploration-tile-clicked', { type, x, y }); });
            this.explorationTiles.add(container);
            this.tweens.add({ targets: container, y: y - 8, alpha: 0.7, duration: 1000 + Math.random() * 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
    }

    spawnFloatingText(x: number, y: number, text: string, color: string = '#fff') {
        const floatingText = this.add.text(x, y, text, { fontSize: '16px', fontFamily: 'Arial', color: color, stroke: '#000', strokeThickness: 3, fontStyle: 'bold' }).setOrigin(0.5).setDepth(200);
        this.tweens.add({ targets: floatingText, y: y - 50, alpha: 0, duration: 1500, ease: 'Cubic.easeOut', onComplete: () => floatingText.destroy() });
    }

    resetArenaIdle() { if (this.currentRoom === 'arena') { this.spawnArenaEnemy('slime'); if (this.kaneFighter) this.kaneFighter.setTexture('kane_idle'); } }

    scheduleNextCustomer() {
        const { day } = (this.game as any).store?.getState() || { day: 1 };
        const delay = (day <= 5 ? 6000 : day <= 14 ? 4000 : 3000) + Math.random() * 4000;
        EventBus.emit('customer-incoming', { delay });
        this.time.delayedCall(delay, () => { this.trySpawnCustomer(); this.scheduleNextCustomer(); });
    }

    trySpawnCustomer() {
        const { isShiftActive } = (this.game as any).store?.getState() || { isShiftActive: true };
        if (this.currentRoom !== 'shop' || !isShiftActive || this.customerNPC) return;
        const pool = Math.random() < 0.5 ? [{ id: 'leo', name: 'เลโอ', texture: 'npc_leo', anim: 'leo' }, { id: 'arena', name: 'อารีน่า', texture: 'npc_arena', anim: 'arena' }, { id: 'draco', name: 'ดราโก้', texture: 'npc_draco', anim: 'draco' }] : [{ id: 'mortal_farmer', name: 'ชาวนาฟลอร่า', texture: 'npc_leo', anim: 'leo' }, { id: 'mortal_merchant', name: 'พ่อค้าเดินทาง', texture: 'npc_arena', anim: 'arena' }, { id: 'mortal_soldier', name: 'ทหารรับจ้าง', texture: 'npc_draco', anim: 'draco' }];
        const selected = pool[Math.floor(Math.random() * pool.length)];
        this.customerNPC = this.add.sprite(180, 263, selected.texture).setScale(1.5).setDepth(45);
        this.customerNPC.anims.play(`${selected.anim}-up`, true);
        this.tweens.add({ targets: this.customerNPC, y: 200, duration: 3000, onComplete: () => { this.customerNPC?.anims.stop(); this.customerNPC?.setFrame(1); EventBus.emit('customer-arrival', { id: selected.id, name: selected.name }); } });
    }

    clearCustomer() {
        if (!this.customerNPC) return;
        const textureKey = this.customerNPC.texture.key;
        const animPrefix = textureKey === 'npc_leo' ? 'leo' : textureKey === 'npc_arena' ? 'arena' : textureKey === 'npc_draco' ? 'draco' : 'player';
        this.customerNPC.anims.play(`${animPrefix}-down`, true);
        this.tweens.add({ targets: this.customerNPC, y: 280, duration: 2000, onComplete: () => { this.customerNPC?.destroy(); this.customerNPC = null; } });
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
            const scaleX = 384 / this.bgSprite.width; const scaleY = 288 / this.bgSprite.height;
            this.bgSprite.setScale(Math.max(scaleX, scaleY)).setDepth(-1);
        }
        if (room.phase === 'exploration') this.spawnExplorationTiles();
        if (roomName === 'arena') {
            this.player.setPosition(120, 240); this.player.anims.play('player-down', true);
            this.kaneFighter = this.add.sprite(165, 154, 'kane_idle').setScale(1.5).setDepth(40);
            this.currentEnemyType = 'slime';
            this.arenaEnemy = this.add.sprite(200, 154, 'slime_idle').setScale(1.5).setDepth(40); this.arenaEnemy.play('slime-idle', true);
            this.kaneBobTween = this.tweens.add({ targets: this.kaneFighter, y: 152, duration: 1000, yoyo: true, repeat: -1 });
            this.enemyBobTween = this.tweens.add({ targets: this.arenaEnemy, y: 152, duration: 800, yoyo: true, repeat: -1 });
        } else if (roomName === 'village') {
            this.player.setPosition(205, 240); this.player.anims.play('player-down', true);
            const villageNPCList = [{ id: 'draco', texture: 'npc_draco', anim: 'draco', x: 134, y: 75 }, { id: 'leo', texture: 'npc_leo', anim: 'leo', x: 177, y: 75 }, { id: 'arena', texture: 'npc_arena', anim: 'arena', x: 336, y: 183 }];
            for (const npc of villageNPCList) {
                const sprite = this.add.sprite(npc.x, npc.y, npc.texture).setScale(1.5).setDepth(40);
                sprite.anims.play(`${npc.anim}-down`, true); sprite.setData('npcId', npc.id); sprite.setInteractive({ useHandCursor: true });
                sprite.on('pointerdown', () => { EventBus.emit('village-npc-clicked', { npcId: npc.id }); this.walkToVillageNPC(npc.id); });
                this.villageNPCs.push(sprite);
            }
        } else { this.player.setPosition(195, 143); this.player.anims.play('player-down', true); }
        if (roomName !== 'shop' && this.customerNPC) { this.customerNPC.destroy(); this.customerNPC = null; }
    }

    update() { if (this.debugMode) this.coordText.setText(`X: ${Math.round(this.player.x)} Y: ${Math.round(this.player.y)}`); }
}
