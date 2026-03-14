import { EventBus } from '../EventBus';

interface RoomLayers {
    base: number[][];
    decor?: number[][];
}

interface RoomConfig {
    name: string;
    layers: RoomLayers;
    exits: Record<string, string>;
    phase?: string;
    tilesets: string[]; 
    bgImage?: string; 
}

const WORLD: Record<string, RoomConfig> = {
    shop: {
        name: 'Celestial Emporium',
        phase: 'shop',
        tilesets: ['shop_atlas'],
        bgImage: 'bg_shop',
        layers: {
            base: [
                [17, 18, 18, 18, 18, 18, 18, 19],
                [65, 25, 25, 25, 25, 25, 25, 67],
                [65, 26, 26, 26, 26, 26, 26, 67],
                [65, 26, 26, 26, 26, 26, 26, 67],
                [65, 25, 25, 25, 25, 25, 25, 67],
                [113, 114, 114, 114, 114, 114, 114, 115],
            ],
            decor: []
        },
        exits: { right: 'arena', down: 'village', up: 'cave_entrance' }
    },
    arena: {
        name: 'The Grand Arena',
        phase: 'arena',
        tilesets: ['cave_atlas'],
        bgImage: 'bg_cave',
        layers: {
            base: [
                [1, 1, 1, 1, 1, 1, 1, 1],
                [1, 12, 12, 12, 12, 12, 12, 1],
                [1, 13, 13, 13, 13, 13, 13, 1],
                [1, 13, 13, 13, 13, 13, 13, 1],
                [1, 12, 12, 12, 12, 12, 12, 1],
                [1, 1, 1, 1, 1, 1, 1, 1],
            ],
            decor: []
        },
        exits: { left: 'shop' }
    },
    village: {
        name: 'Divine Village',
        phase: 'relationship',
        tilesets: ['shop_atlas'],
        layers: {
            base: [
                [5, 5, 5, 5, 5, 5, 5, 5],
                [5, 25, 25, 25, 25, 25, 25, 5],
                [5, 26, 26, 26, 26, 26, 26, 5],
                [5, 26, 26, 26, 26, 26, 26, 5],
                [5, 25, 25, 25, 25, 25, 25, 5],
                [5, 5, 5, 5, 5, 5, 5, 5],
            ],
            decor: []
        },
        exits: { up: 'shop', right: 'cave_entrance' }
    },
    cave_entrance: {
        name: 'Cave Entrance',
        phase: 'exploration',
        tilesets: ['cave_atlas'],
        bgImage: 'bg_cave',
        layers: {
            base: [
                [2, 2, 2, 2, 2, 2, 2, 2],
                [2, 10, 10, 10, 10, 10, 10, 2],
                [2, 11, 11, 11, 11, 11, 11, 2],
                [2, 11, 11, 11, 11, 11, 11, 2],
                [2, 10, 10, 10, 10, 10, 10, 2],
                [2, 2, 2, 2, 2, 2, 2, 2],
            ],
            decor: []
        },
        exits: { down: 'shop', right: 'village', up: 'cave_inside' }
    },
    cave_inside: {
        name: 'Inside Cave',
        phase: 'exploration',
        tilesets: ['cave_atlas'],
        bgImage: 'bg_cave',
        layers: {
            base: [
                [3, 3, 3, 3, 3, 3, 3, 3],
                [3, 10, 10, 10, 10, 10, 10, 3],
                [3, 11, 11, 11, 11, 11, 11, 3],
                [3, 11, 11, 11, 11, 11, 11, 3],
                [3, 10, 10, 10, 10, 10, 10, 3],
                [3, 3, 3, 3, 3, 3, 3, 3],
            ],
            decor: []
        },
        exits: { down: 'cave_entrance' }
    }
};

export class MainScene extends Phaser.Scene {
    player!: Phaser.GameObjects.Sprite;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    wasdKeys!: any;
    currentRoom = 'shop';
    baseLayer!: Phaser.Tilemaps.TilemapLayer;
    decorLayer!: Phaser.Tilemaps.TilemapLayer;
    bgSprite: Phaser.GameObjects.Image | null = null;
    roomText!: Phaser.GameObjects.Text;
    
    customerNPC: Phaser.GameObjects.Sprite | null = null;
    
    // Mobile Movement
    mobileDirection: string | null = null;

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
        
        // Tilesets
        this.load.image('shop_atlas', '/images/backgrounds/shop/interior/atlas_48x.png');
        this.load.image('cave_atlas', '/images/backgrounds/exploration/cave/cave_48x.png');
        this.load.image('tileset_B', '/images/backgrounds/shop/interior/tileset_B_48x.png');
        this.load.image('bg_shop', 'public/images/backgrounds/shop/interior/screenshot (2).png');
        this.load.image('bg_cave', 'public/images/backgrounds/exploration/cave/_srw_tileset_0.png');
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
        // Create animations for player and npcs
        this.createCharAnims('player', 'player');
        this.createCharAnims('leo', 'npc_leo');
        this.createCharAnims('arena', 'npc_arena');
        this.createCharAnims('draco', 'npc_draco');

        this.roomText = this.add.text(192, 20, '', {
            fontSize: '18px',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 3,
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(100);

        this.player = this.add.sprite(192, 168, 'player');
        this.player.setScale(1.5).setDepth(50);

        this.loadRoom('shop');

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D');

        this.time.addEvent({
            delay: 15000,
            callback: this.trySpawnCustomer,
            callbackScope: this,
            loop: true
        });

        EventBus.on('clear-customer', () => this.clearCustomer());
        
        EventBus.on('mobile-move', (dir: string) => {
            this.mobileDirection = dir;
        });
        EventBus.on('mobile-stop', () => {
            this.mobileDirection = null;
        });

        EventBus.emit('current-scene-ready', this);
    }

    trySpawnCustomer() {
        // Use Zustand state to check if shop is open
        const { isShiftActive, currentRoom } = (this.game as any).store?.getState() || { isShiftActive: true, currentRoom: this.currentRoom };
        
        if (this.currentRoom !== 'shop' || !isShiftActive || this.customerNPC) return;

        const npcList = [
            { id: 'leo', name: 'เลโอ้', texture: 'npc_leo', anim: 'leo' },
            { id: 'arena', name: 'อารีน่า', texture: 'npc_arena', anim: 'arena' },
            { id: 'draco', name: 'ดราโก้', texture: 'npc_draco', anim: 'draco' },
        ];
        const selected = npcList[Math.floor(Math.random() * npcList.length)];

        this.customerNPC = this.add.sprite(192, 280, selected.texture);
        this.customerNPC.setScale(1.5).setDepth(45);
        this.customerNPC.anims.play(`${selected.anim}-up`, true);

        this.tweens.add({
            targets: this.customerNPC,
            y: 120,
            duration: 3000,
            onComplete: () => {
                this.customerNPC?.anims.stop();
                this.customerNPC?.setFrame(1);
                EventBus.emit('customer-arrival', {
                    id: selected.id,
                    name: selected.name
                });
            }
        });
    }

    clearCustomer() {
        if (!this.customerNPC) return;
        
        // Find which anim to play (down)
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

    loadRoom(roomName: string, entrySide?: 'left' | 'right' | 'up' | 'down') {
        const room = WORLD[roomName];
        if (!room) return;

        if (this.baseLayer) this.baseLayer.destroy();
        if (this.decorLayer) this.decorLayer.destroy();
        if (this.bgSprite) this.bgSprite.destroy();

        this.currentRoom = roomName;
        this.roomText.setText(room.name);
        if (room.phase) EventBus.emit('phase-change', room.phase);

        if (room.bgImage) {
            this.bgSprite = this.add.image(192, 144, room.bgImage);
            const scaleX = 384 / this.bgSprite.width;
            const scaleY = 288 / this.bgSprite.height;
            this.bgSprite.setScale(Math.max(scaleX, scaleY)).setDepth(-1);
        }

        const map = this.make.tilemap({
            data: room.layers.base,
            tileWidth: 48,
            tileHeight: 48
        });

        const baseTileset = map.addTilesetImage(room.tilesets[0], room.tilesets[0], 48, 48);
        if (baseTileset) {
            this.baseLayer = map.createLayer(0, baseTileset, 0, 0)!;
            this.baseLayer.setDepth(0);
            if (room.bgImage) this.baseLayer.setVisible(false);
        }

        if (entrySide === 'right') this.player.x = 40;
        else if (entrySide === 'left') this.player.x = 344;
        else if (entrySide === 'down') this.player.y = 40;
        else if (entrySide === 'up') this.player.y = 248;
        else this.player.setPosition(192, 168);

        if (roomName !== 'shop' && this.customerNPC) {
            this.customerNPC.destroy();
            this.customerNPC = null;
        }
    }

    update() {
        if (!this.cursors || !this.wasdKeys) return;

        let moving = false;
        const speed = 3;

        const goLeft = this.cursors.left?.isDown || this.wasdKeys.A.isDown || this.mobileDirection === 'left';
        const goRight = this.cursors.right?.isDown || this.wasdKeys.D.isDown || this.mobileDirection === 'right';
        const goUp = this.cursors.up?.isDown || this.wasdKeys.W.isDown || this.mobileDirection === 'up';
        const goDown = this.cursors.down?.isDown || this.wasdKeys.S.isDown || this.mobileDirection === 'down';

        if (goLeft) {
            this.player.x -= speed;
            this.player.anims.play('player-left', true);
            moving = true;
        } else if (goRight) {
            this.player.x += speed;
            this.player.anims.play('player-right', true);
            moving = true;
        } else if (goUp) {
            this.player.y -= speed;
            this.player.anims.play('player-up', true);
            moving = true;
        } else if (goDown) {
            this.player.y += speed;
            this.player.anims.play('player-down', true);
            moving = true;
        }

        if (!moving) {
            const currentAnim = this.player.anims.currentAnim;
            if (currentAnim) {
                this.player.anims.stop();
                if (currentAnim.key === 'player-down') this.player.setFrame(1);
                else if (currentAnim.key === 'player-left') this.player.setFrame(4);
                else if (currentAnim.key === 'player-right') this.player.setFrame(7);
                else if (currentAnim.key === 'player-up') this.player.setFrame(10);
            } else {
                this.player.setFrame(1);
            }
        }

        const room = WORLD[this.currentRoom];
        if (room) {
            if (this.player.x > 375 && room.exits.right) this.loadRoom(room.exits.right, 'right');
            else if (this.player.x < 10 && room.exits.left) this.loadRoom(room.exits.left, 'left');
            else if (this.player.y > 278 && room.exits.down) this.loadRoom(room.exits.down, 'down');
            else if (this.player.y < 10 && room.exits.up) this.loadRoom(room.exits.up, 'up');
        }

        this.player.x = Phaser.Math.Clamp(this.player.x, 8, 376);
        this.player.y = Phaser.Math.Clamp(this.player.y, 8, 280);
    }
}
