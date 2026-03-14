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
    tilesets: string[]; // List of tileset keys to use
}

const WORLD: Record<string, RoomConfig> = {
    shop: {
        name: 'Celestial Emporium',
        phase: 'shop',
        tilesets: ['shop_atlas'],
        layers: {
            base: [
                [17, 18, 18, 18, 18, 18, 18, 19],
                [65, 25, 25, 25, 25, 25, 25, 67],
                [65, 26, 26, 26, 26, 26, 26, 67],
                [65, 26, 26, 26, 26, 26, 26, 67],
                [65, 25, 25, 25, 25, 25, 25, 67],
                [113, 114, 114, 114, 114, 114, 114, 115],
            ],
            decor: [
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 150, 151, 152, 0, 210, 211, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 300, 301, 0, 0, 350, 351, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
            ]
        },
        exits: { right: 'arena', down: 'village', up: 'cave_entrance' }
    },
    arena: {
        name: 'The Grand Arena',
        phase: 'arena',
        tilesets: ['cave_atlas'],
        layers: {
            base: [
                [1, 1, 1, 1, 1, 1, 1, 1],
                [1, 12, 12, 12, 12, 12, 12, 1],
                [1, 13, 13, 13, 13, 13, 13, 1],
                [1, 13, 13, 13, 13, 13, 13, 1],
                [1, 12, 12, 12, 12, 12, 12, 1],
                [1, 1, 1, 1, 1, 1, 1, 1],
            ],
            decor: [
                [0, 5, 6, 0, 0, 5, 6, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 20, 0, 0, 0, 0, 22, 0],
                [0, 21, 0, 0, 0, 0, 23, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
            ]
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
            decor: [
                [400, 401, 0, 405, 406, 0, 410, 411],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 500, 501, 502, 0, 0, 0],
                [0, 0, 510, 511, 512, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
            ]
        },
        exits: { up: 'shop', right: 'cave_entrance' }
    },
    cave_entrance: {
        name: 'Cave Entrance',
        phase: 'exploration',
        tilesets: ['cave_atlas'],
        layers: {
            base: [
                [2, 2, 2, 2, 2, 2, 2, 2],
                [2, 10, 10, 10, 10, 10, 10, 2],
                [2, 11, 11, 11, 11, 11, 11, 2],
                [2, 11, 11, 11, 11, 11, 11, 2],
                [2, 10, 10, 10, 10, 10, 10, 2],
                [2, 2, 2, 2, 2, 2, 2, 2],
            ],
            decor: [
                [0, 0, 80, 81, 82, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 120, 0, 0, 0, 0, 125, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 150, 151, 152, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
            ]
        },
        exits: { down: 'shop', right: 'village', up: 'cave_inside' }
    },
    cave_inside: {
        name: 'Inside Cave',
        phase: 'exploration',
        tilesets: ['cave_atlas'],
        layers: {
            base: [
                [3, 3, 3, 3, 3, 3, 3, 3],
                [3, 10, 10, 10, 10, 10, 10, 3],
                [3, 11, 11, 11, 11, 11, 11, 3],
                [3, 11, 11, 11, 11, 11, 11, 3],
                [3, 10, 10, 10, 10, 10, 10, 3],
                [3, 3, 3, 3, 3, 3, 3, 3],
            ],
            decor: [
                [0, 200, 201, 202, 203, 204, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 250, 0, 0, 0, 0, 255, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 300, 301, 302, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
            ]
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
    roomText!: Phaser.GameObjects.Text;

    constructor() {
        super('MainScene');
    }

    preload() {
        this.load.spritesheet('player', '/images/characters/player/minju/character_26/character_26_frame32x32.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        // Load upscaled 48x48 textures
        this.load.image('shop_atlas', '/images/backgrounds/shop/interior/atlas_48x.png');
        this.load.image('cave_atlas', '/images/backgrounds/exploration/cave/cave_48x.png');
        this.load.image('tileset_B', '/images/backgrounds/shop/interior/tileset_B_48x.png');
        this.load.image('tileset_C', '/images/backgrounds/shop/interior/tileset_C_48x.png');
        this.load.image('tileset_D', '/images/backgrounds/shop/interior/tileset_D_48x.png');
    }

    create() {
        // Animations
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
            frameRate: 10,
            repeat: -1
        });

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

        EventBus.emit('current-scene-ready', this);
    }

    loadRoom(roomName: string, entrySide?: 'left' | 'right' | 'up' | 'down') {
        const room = WORLD[roomName];
        if (!room) return;

        // Cleanup
        if (this.baseLayer) this.baseLayer.destroy();
        if (this.decorLayer) this.decorLayer.destroy();

        this.currentRoom = roomName;
        this.roomText.setText(room.name);
        if (room.phase) EventBus.emit('phase-change', room.phase);

        // Create base layer
        const map = this.make.tilemap({
            data: room.layers.base,
            tileWidth: 48,
            tileHeight: 48
        });

        const tileset = map.addTilesetImage(room.tilesets[0], room.tilesets[0], 48, 48);
        if (tileset) {
            this.baseLayer = map.createLayer(0, tileset, 0, 0)!;
            this.baseLayer.setDepth(0);
        }

        // Create decoration layer
        if (room.layers.decor) {
            const decorMap = this.make.tilemap({
                data: room.layers.decor,
                tileWidth: 48,
                tileHeight: 48
            });
            const decorTileset = decorMap.addTilesetImage(room.tilesets[0], room.tilesets[0], 48, 48);
            if (decorTileset) {
                this.decorLayer = decorMap.createLayer(0, decorTileset, 0, 0)!;
                this.decorLayer.setDepth(10);
            }
        }

        // Positioning
        if (entrySide === 'right') this.player.x = 40;
        else if (entrySide === 'left') this.player.x = 344;
        else if (entrySide === 'down') this.player.y = 40;
        else if (entrySide === 'up') this.player.y = 248;
        else this.player.setPosition(192, 168);
    }

    update() {
        if (!this.cursors || !this.wasdKeys) return;

        let moving = false;
        const speed = 3;

        if (this.cursors.left?.isDown || this.wasdKeys.A.isDown) {
            this.player.x -= speed;
            this.player.anims.play('left', true);
            moving = true;
        } else if (this.cursors.right?.isDown || this.wasdKeys.D.isDown) {
            this.player.x += speed;
            this.player.anims.play('right', true);
            moving = true;
        } else if (this.cursors.up?.isDown || this.wasdKeys.W.isDown) {
            this.player.y -= speed;
            this.player.anims.play('up', true);
            moving = true;
        } else if (this.cursors.down?.isDown || this.wasdKeys.S.isDown) {
            this.player.y += speed;
            this.player.anims.play('down', true);
            moving = true;
        }

        if (!moving) {
            const currentAnim = this.player.anims.currentAnim;
            if (currentAnim) {
                this.player.anims.stop();
                if (currentAnim.key === 'down') this.player.setFrame(1);
                else if (currentAnim.key === 'left') this.player.setFrame(4);
                else if (currentAnim.key === 'right') this.player.setFrame(7);
                else if (currentAnim.key === 'up') this.player.setFrame(10);
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
