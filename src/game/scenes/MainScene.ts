import { EventBus } from '../EventBus';

interface RoomConfig {
    name: string;
    map: number[][];
    exits: Record<string, string>;
    phase?: string;
    tileset: string;
}

const WORLD: Record<string, RoomConfig> = {
    shop: {
        name: 'Celestial Emporium',
        phase: 'shop',
        tileset: 'shop_tiles',
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 3, 3, 3, 3, 2, 1],
            [1, 2, 3, 3, 3, 3, 2, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
        ],
        exits: { right: 'arena', down: 'village', up: 'cave_entrance' }
    },
    arena: {
        name: 'The Grand Arena',
        phase: 'arena',
        tileset: 'cave_tiles', // Temporary reuse or specialized if available
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 3, 3, 3, 3, 2, 1],
            [1, 2, 3, 3, 3, 3, 2, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
        ],
        exits: { left: 'shop' }
    },
    village: {
        name: 'Divine Village',
        phase: 'relationship',
        tileset: 'shop_tiles',
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 3, 3, 3, 3, 2, 1],
            [1, 2, 3, 3, 3, 3, 2, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
        ],
        exits: { up: 'shop', right: 'cave_entrance' }
    },
    cave_entrance: {
        name: 'Cave Entrance',
        phase: 'exploration',
        tileset: 'cave_tiles',
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 3, 3, 3, 3, 2, 1],
            [1, 2, 3, 0, 0, 3, 2, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
        ],
        exits: { down: 'shop', right: 'village', up: 'cave_inside' }
    },
    cave_inside: {
        name: 'Inside Cave',
        phase: 'exploration',
        tileset: 'cave_tiles',
        map: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 3, 3, 3, 3, 2, 1],
            [1, 2, 3, 3, 3, 3, 2, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
        ],
        exits: { down: 'cave_entrance' }
    }
};

export class MainScene extends Phaser.Scene {
    player!: Phaser.GameObjects.Sprite;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    currentRoom = 'shop';
    mapLayer!: Phaser.Tilemaps.TilemapLayer;
    roomText!: Phaser.GameObjects.Text;

    constructor() {
        super('MainScene');
    }

    preload() {
        this.load.spritesheet('player', '/images/characters/player/minju/character_26/character_26_frame32x32.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        // Load the tileset images
        this.load.image('shop_tiles', '/images/backgrounds/shop/interior/tileset_B.png');
        this.load.image('cave_tiles', '/images/backgrounds/exploration/cave/_srw_tileset_0.png');
    }

    create() {
        // Create animations
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

        // Room text UI
        this.roomText = this.add.text(192, 20, '', {
            fontSize: '18px',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 3,
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(10);

        // Player sprite
        this.player = this.add.sprite(192, 168, 'player');
        this.player.setScale(1.5).setDepth(5);

        // Load initial room
        this.loadRoom('shop');

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();

        EventBus.emit('current-scene-ready', this);
    }

    loadRoom(roomName: string, entrySide?: 'left' | 'right' | 'up' | 'down') {
        const room = WORLD[roomName];
        if (!room) return;

        // Cleanup old map if it exists
        if (this.mapLayer) {
            this.mapLayer.destroy();
        }

        this.currentRoom = roomName;
        this.roomText.setText(room.name);

        if (room.phase) {
            EventBus.emit('phase-change', room.phase);
        }

        // Creating the Tilemap
        const map = this.make.tilemap({
            data: room.map,
            tileWidth: 48,
            tileHeight: 48
        });

        const tileset = map.addTilesetImage(room.tileset, room.tileset, 48, 48);
        if (tileset) {
            this.mapLayer = map.createLayer(0, tileset, 0, 0)!;
        }

        // Set player position based on entry side
        if (entrySide === 'right') {
            this.player.x = 40;
        } else if (entrySide === 'left') {
            this.player.x = 344;
        } else if (entrySide === 'down') {
            this.player.y = 40;
        } else if (entrySide === 'up') {
            this.player.y = 248;
        } else {
            this.player.setPosition(192, 168);
        }
    }

    update() {
        if (!this.cursors) return;

        let moving = false;
        const speed = 3;

        if (this.cursors.left?.isDown) {
            this.player.x -= speed;
            this.player.anims.play('left', true);
            moving = true;
        } else if (this.cursors.right?.isDown) {
            this.player.x += speed;
            this.player.anims.play('right', true);
            moving = true;
        } else if (this.cursors.up?.isDown) {
            this.player.y -= speed;
            this.player.anims.play('up', true);
            moving = true;
        } else if (this.cursors.down?.isDown) {
            this.player.y += speed;
            this.player.anims.play('down', true);
            moving = true;
        }

        if (!moving) {
            this.player.anims.stop();
            const currentAnim = this.player.anims.currentAnim;
            if (currentAnim) {
                if (currentAnim.key === 'down') this.player.setFrame(1);
                if (currentAnim.key === 'left') this.player.setFrame(4);
                if (currentAnim.key === 'right') this.player.setFrame(7);
                if (currentAnim.key === 'up') this.player.setFrame(10);
            } else {
                this.player.setFrame(1);
            }
        }

        // Handle room transitions
        const room = WORLD[this.currentRoom];
        if (room) {
            if (this.player.x > 375 && room.exits.right) {
                this.loadRoom(room.exits.right, 'right');
            } else if (this.player.x < 10 && room.exits.left) {
                this.loadRoom(room.exits.left, 'left');
            } else if (this.player.y > 278 && room.exits.down) {
                this.loadRoom(room.exits.down, 'down');
            } else if (this.player.y < 10 && room.exits.up) {
                this.loadRoom(room.exits.up, 'up');
            }
        }

        this.player.x = Phaser.Math.Clamp(this.player.x, 8, 376);
        this.player.y = Phaser.Math.Clamp(this.player.y, 8, 280);
    }
}
