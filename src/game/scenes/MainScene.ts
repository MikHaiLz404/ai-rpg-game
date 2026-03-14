import { EventBus } from '../EventBus';

interface RoomConfig {
  name: string;
  map: number[][];
  exits: Record<string, string>;
  phase?: string;
}

const WORLD: Record<string, RoomConfig> = {
  shop: {
    name: 'ร้านค้า',
    phase: 'shop',
    map: [
      [1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    exits: { right: 'arena', down: 'village', up: 'cave_entrance' }
  },
  arena: {
    name: 'สนามประลอง',
    phase: 'arena',
    map: [
      [1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    exits: { left: 'shop' }
  },
  village: {
    name: 'หมู่บ้าน',
    phase: 'relationship',
    map: [
      [1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    exits: { up: 'shop', right: 'cave_entrance' }
  },
  cave_entrance: {
    name: 'ปากถ้ำ',
    phase: 'exploration',
    map: [
      [1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,3,0,0,3,2,1],
      [1,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    exits: { down: 'shop', right: 'village', up: 'cave_inside' }
  },
  cave_inside: {
    name: 'ภายในถ้ำ',
    phase: 'exploration',
    map: [
      [1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    exits: { down: 'cave_entrance' }
  }
};

const WALL = 0x8B4513;
const FLOOR = 0xDEB887;
const FLOOR2 = 0xD2691E;
const VOID = 0x000000;

export class MainScene extends Phaser.Scene {
  player!: Phaser.GameObjects.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  currentRoom = 'shop';
  graphics!: Phaser.GameObjects.Graphics;
  roomText!: Phaser.GameObjects.Text;

  constructor() {
    super('MainScene');
  }

  preload() {
    // Load spritesheet for player
    this.load.spritesheet('player', '/images/characters/player/minju/character_26/character_26_frame32x32.png', {
      frameWidth: 32,
      frameHeight: 32
    });
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

    // Create graphics
    this.graphics = this.add.graphics();
    
    // Room text
    this.roomText = this.add.text(192, 20, '', {
      fontSize: '18px',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 3,
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Player
    this.player = this.add.sprite(192, 168, 'player');
    this.player.setScale(1.5);
    
    // Load first room
    this.loadRoom('shop');
    
    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    
    EventBus.emit('current-scene-ready', this);
  }

  loadRoom(roomName: string, entrySide?: 'left' | 'right' | 'up' | 'down') {
    const room = WORLD[roomName];
    if (!room) return;
    
    this.currentRoom = roomName;
    this.roomText.setText(room.name);
    
    // Emit phase change to React
    if (room.phase) {
      EventBus.emit('phase-change', room.phase);
    }
    
    this.graphics.clear();
    
    const TILE_SIZE = 48;
    const map = room.map;
    
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tile = map[y][x];
        
        if (tile === 1) {
          this.graphics.fillStyle(WALL, 1);
        } else if (tile === 2) {
          this.graphics.fillStyle(FLOOR, 1);
        } else if (tile === 3) {
          this.graphics.fillStyle(FLOOR2, 1);
        } else {
          this.graphics.fillStyle(VOID, 1);
        }
        
        this.graphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
    
    // Set position based on entry side
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
      // Set to idle frame (frame 1 of each direction)
      const currentAnim = this.player.anims.currentAnim;
      if (currentAnim) {
        if (currentAnim.key === 'down') this.player.setFrame(1);
        if (currentAnim.key === 'left') this.player.setFrame(4);
        if (currentAnim.key === 'right') this.player.setFrame(7);
        if (currentAnim.key === 'up') this.player.setFrame(10);
      } else {
        this.player.setFrame(1); // Default idle down
      }
    }
    
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
