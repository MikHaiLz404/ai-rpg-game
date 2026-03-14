import { EventBus } from '../EventBus';

interface RoomConfig {
  name: string;
  tileset: string;
  map: number[][];
  exits: Record<string, string>;
  colors: number[];
}

const ROOMS: Record<string, RoomConfig> = {
  shop: {
    name: 'shop',
    tileset: 'shop_tiles',
    map: [
      [0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0],
      [0,1,2,2,2,2,1,0],
      [0,1,2,2,2,2,1,0],
      [0,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0],
    ],
    exits: { right: 'arena', down: 'storage' },
    colors: [0x000000, 0x8B4513, 0x654321] // 0=empty, 1=wall, 2=floor
  },
  arena: {
    name: 'arena',
    tileset: 'arena_tiles',
    map: [
      [0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0],
      [0,1,2,2,2,2,1,0],
      [0,1,2,2,2,2,1,0],
      [0,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0],
    ],
    exits: { left: 'shop' },
    colors: [0x000000, 0x8B0000, 0xDC143C]
  },
  storage: {
    name: 'storage',
    tileset: 'storage_tiles',
    map: [
      [0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0],
      [0,1,2,2,2,2,1,0],
      [0,1,2,2,2,2,1,0],
      [0,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0],
    ],
    exits: { up: 'shop' },
    colors: [0x000000, 0x4B0082, 0x9370DB]
  },
  village: {
    name: 'village',
    tileset: 'village_tiles',
    map: [
      [0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0],
      [0,1,2,2,2,2,1,0],
      [0,1,2,2,2,2,1,0],
      [0,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0],
    ],
    exits: { right: 'shop' },
    colors: [0x000000, 0x228B22, 0x90EE90]
  }
};

export class MainScene extends Phaser.Scene {
  player: Phaser.GameObjects.Rectangle;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  lastFacing = 'down';
  currentRoom = 'shop';
  tiles: Phaser.GameObjects.Rectangle[][] = [];

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // ไม่ต้องโหลด tileset images
  }

  create() {
    console.log('🎮 MainScene create()');
    
    // วาด room แรก
    this.drawRoom('shop');
    
    // สร้าง player
    this.player = this.add.rectangle(144, 144, 32, 32, 0xFFFFFF);
    this.player.setDepth(1);
    
    this.cursors = this.input.keyboard.createCursorKeys();
    EventBus.emit('current-scene-ready', this);
    console.log('✅ Scene ready!');
  }

  drawRoom(roomName: string) {
    const room = ROOMS[roomName];
    if (!room) return;
    
    console.log('Drawing room:', roomName);
    
    // ล้าง tiles เก่า
    this.tiles.forEach(row => {
      row.forEach(tile => tile.destroy());
    });
    this.tiles = [];
    
    // วาด tiles ใหม่
    for (let y = 0; y < room.map.length; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < room.map[y].length; x++) {
        const tileVal = room.map[y][x];
        if (tileVal > 0 && tileVal < room.colors.length) {
          const tile = this.add.rectangle(
            x * 48 + 24,  // center x
            y * 48 + 24,  // center y
            48, 48,
            room.colors[tileVal]
          );
          tile.setDepth(0);
          this.tiles[y][x] = tile;
        } else {
          this.tiles[y][x] = null;
        }
      }
    }
    
    this.currentRoom = roomName;
  }

  update() {
    if (!this.player || !this.cursors) return;
    
    if (this.cursors.left?.isDown) {
      this.player.x -= 3;
      this.lastFacing = 'left';
    } else if (this.cursors.right?.isDown) {
      this.player.x += 3;
      this.lastFacing = 'right';
    }
    
    if (this.cursors.up?.isDown) {
      this.player.y -= 3;
      this.lastFacing = 'up';
    } else if (this.cursors.down?.isDown) {
      this.player.y += 3;
      this.lastFacing = 'down';
    }
    
    const room = ROOMS[this.currentRoom];
    if (room) {
      if (this.player.x > 350 && room.exits.right) {
        this.drawRoom(room.exits.right);
        this.player.setPosition(144, 144);
      }
      if (this.player.x < 50 && room.exits.left) {
        this.drawRoom(room.exits.left);
        this.player.setPosition(144, 144);
      }
      if (this.player.y > 230 && room.exits.down) {
        this.drawRoom(room.exits.down);
        this.player.setPosition(144, 144);
      }
      if (this.player.y < 50 && room.exits.up) {
        this.drawRoom(room.exits.up);
        this.player.setPosition(144, 144);
      }
    }
    
    this.player.x = Phaser.Math.Clamp(this.player.x, 24, 360);
    this.player.y = Phaser.Math.Clamp(this.player.y, 24, 264);
  }
}
