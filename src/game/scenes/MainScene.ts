import { EventBus } from '../EventBus';

interface RoomConfig {
  name: string;
  tileset: string;
  map: number[][];
  exits: Record<string, string>;
}

// Full game map - 7x7 grid
const WORLD: Record<string, RoomConfig> = {
  shop: {
    name: '🏪 ร้านค้า',
    tileset: 'shop',
    map: [
      [1,1,1,1,1,1,1],
      [1,2,2,2,2,2,1],
      [1,2,3,3,3,2,1],
      [1,2,3,4,3,2,1],
      [1,2,3,3,3,2,1],
      [1,2,2,2,2,2,1],
      [1,1,1,1,1,1,1],
    ],
    exits: { right: 'arena', down: 'village', up: 'cave_entrance' }
  },
  arena: {
    name: '⚔️ สนามประลอง',
    tileset: 'shop',
    map: [
      [1,1,1,1,1,1,1],
      [1,2,2,2,2,2,1],
      [1,2,3,3,3,2,1],
      [1,2,3,4,3,2,1],
      [1,2,3,3,3,2,1],
      [1,2,2,2,2,2,1],
      [1,1,1,1,1,1,1],
    ],
    exits: { left: 'shop' }
  },
  village: {
    name: '🏘️ หมู่บ้าน',
    tileset: 'shop',
    map: [
      [1,1,1,1,1,1,1],
      [1,2,2,2,2,2,1],
      [1,2,3,3,3,2,1],
      [1,2,3,4,3,2,1],
      [1,2,3,3,3,2,1],
      [1,2,2,2,2,2,1],
      [1,1,1,1,1,1,1],
    ],
    exits: { up: 'shop', right: 'cave_entrance' }
  },
  cave_entrance: {
    name: '🦇 ปากถ้ำ',
    tileset: 'cave',
    map: [
      [1,1,1,1,1,1,1],
      [1,2,2,2,2,2,1],
      [1,2,3,3,3,2,1],
      [1,2,3,0,0,3,1],
      [1,2,3,0,0,3,1],
      [1,2,2,2,2,2,1],
      [1,1,1,1,1,1,1],
    ],
    exits: { down: 'shop', right: 'village', up: 'cave_inside' }
  },
  cave_inside: {
    name: '⛏️ ภายในถ้ำ',
    tileset: 'cave',
    map: [
      [1,1,1,1,1,1,1],
      [1,2,2,2,2,2,1],
      [1,2,3,3,3,2,1],
      [1,2,3,4,3,2,1],
      [1,2,3,3,3,2,1],
      [1,2,2,2,2,2,1],
      [1,1,1,1,1,1,1],
    ],
    exits: { down: 'cave_entrance' }
  }
};

// Color palettes for each area
const PALETTES: Record<string, number[]> = {
  shop: [0, 0x8B4513, 0xDEB887, 0xD2691E, 0xCD853F],
  arena: [0, 0x8B0000, 0xF4A460, 0xCD5C5C, 0xB22222],
  village: [0, 0x2F4F4F, 0x90EE90, 0x228B22, 0x32CD32],
  cave: [0, 0x2F2F2F, 0x4A4A4A, 0x1A1A1A, 0x333333]
};

export class MainScene extends Phaser.Scene {
  player: Phaser.GameObjects.Sprite;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  currentRoom = 'shop';
  graphics: Phaser.GameObjects.Graphics;
  roomText: Phaser.GameObjects.Text;
  helpText: Phaser.GameObjects.Text;

  constructor() {
    super('MainScene');
  }

  preload() {
    // Load player sprite
    this.load.image('player', '/images/characters/player/minju/idle/frame_0_0.png');
  }

  create() {
    this.graphics = this.add.graphics();
    
    // Room name at top
    this.roomText = this.add.text(192, 16, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Tahoma, sans-serif'
    }).setOrigin(0.5).setDepth(10);
    
    // Help text at bottom
    this.helpText = this.add.text(192, 310, 'W/A/S/D เดิน | ขอบห้อง = ทางออก', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'Tahoma, sans-serif'
    }).setOrigin(0.5).setDepth(10);
    
    this.loadRoom('shop');
    
    // Create player
    this.player = this.add.sprite(144, 192, 'player');
    this.player.setScale(1.5);
    this.player.setDepth(1);
    
    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    
    EventBus.emit('current-scene-ready', this);
  }

  loadRoom(roomName: string) {
    const room = WORLD[roomName];
    if (!room) return;
    
    this.currentRoom = roomName;
    this.roomText.setText(room.name);
    
    this.graphics.clear();
    
    const TILE_SIZE = 48;
    const palette = PALETTES[room.tileset] || PALETTES.shop;
    
    // Draw tiles based on room type
    for (let y = 0; y < room.map.length; y++) {
      for (let x = 0; x < room.map[y].length; x++) {
        const tileId = room.map[y][x];
        
        if (room.tileset === 'cave') {
          // Cave tiles - darker, rocky
          if (tileId === 1) { // wall
            this.graphics.fillStyle(0x1a1a1a, 1);
            this.graphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            // Rock texture
            this.graphics.fillStyle(0x2d2d2d, 0.5);
            this.graphics.fillRect(x * TILE_SIZE + 4, y * TILE_SIZE + 4, 20, 15);
            this.graphics.fillRect(x * TILE_SIZE + 24, y * TILE_SIZE + 20, 15, 20);
          } else if (tileId === 2) { // floor
            this.graphics.fillStyle(0x3d3d3d, 1);
            this.graphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            // Stone texture
            this.graphics.fillStyle(0x4a4a4a, 0.3);
            this.graphics.fillRect(x * TILE_SIZE + 8, y * TILE_SIZE + 8, 15, 15);
          } else if (tileId === 3) { // inner wall
            this.graphics.fillStyle(0x252525, 1);
            this.graphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          } else if (tileId === 4) { // center decoration
            this.graphics.fillStyle(0x1f1f1f, 1);
            this.graphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            // Crystal/gem
            this.graphics.fillStyle(0x6b3fa0, 0.8);
            this.graphics.fillTriangle(
              x * TILE_SIZE + 24, y * TILE_SIZE + 12,
              x * TILE_SIZE + 36, y * TILE_SIZE + 36,
              x * TILE_SIZE + 12, y * TILE_SIZE + 36
            );
          } else if (tileId === 0) { // void/passage
            this.graphics.fillStyle(0x0a0a0a, 1);
            this.graphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        } else {
          // Non-cave rooms (shop, arena, village)
          const color = palette[tileId] || 0x000000;
          this.graphics.fillStyle(color, 1);
          this.graphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          
          // Add detail for walls
          if (tileId === 1) {
            this.graphics.lineStyle(1, 0x000000, 0.3);
            this.graphics.strokeRect(x * TILE_SIZE + 0.5, y * TILE_SIZE + 0.5, 47, 47);
          }
        }
      }
    }
    
    // Reset player to center-ish
    this.player.setPosition(144, 192);
  }

  update() {
    if (this.cursors.left?.isDown) {
      this.player.x -= 3;
    } else if (this.cursors.right?.isDown) {
      this.player.x += 3;
    }
    
    if (this.cursors.up?.isDown) {
      this.player.y -= 3;
    } else if (this.cursors.down?.isDown) {
      this.player.y += 3;
    }
    
    // Check room exits
    const room = WORLD[this.currentRoom];
    if (room) {
      const BOUNDARY = 48;
      if (this.player.x > 336 && room.exits.right) this.loadRoom(room.exits.right);
      if (this.player.x < BOUNDARY && room.exits.left) this.loadRoom(room.exits.left);
      if (this.player.y > 288 && room.exits.down) this.loadRoom(room.exits.down);
      if (this.player.y < BOUNDARY && room.exits.up) this.loadRoom(room.exits.up);
    }
    
    // Bounds
    this.player.x = Phaser.Math.Clamp(this.player.x, 48, 336);
    this.player.y = Phaser.Math.Clamp(this.player.y, 48, 264);
  }
}
