import { EventBus } from '../EventBus';

interface RoomConfig {
  name: string;
  tileset: string;
  map: number[][];
  exits: Record<string, string>;
  palette: number[];
}

const ROOMS: Record<string, RoomConfig> = {
  shop: {
    name: 'shop',
    tileset: 'tileset_B',
    // Shop: wood floor, walls, shelves
    map: [
      [0,0,0,0,0,0,0,0],  // 0 = void
      [1,1,1,1,1,1,1,1],  // 1 = wall
      [2,2,2,2,2,2,2,2],  // 2 = floor
      [2,3,3,3,3,3,3,2],  // 3 = counter/shelf
      [2,3,3,3,3,3,3,2],  // 3 = items
      [1,1,1,1,1,1,1,1],  // wall
    ],
    exits: { right: 'arena', down: 'storage' },
    // Colors matching RPG Maker tileset_B style
    palette: [
      0x1a1a2e,  // 0 void
      0x8B4513,  // 1 wall - saddle brown
      0xDEB887,  // 2 floor - burlywood  
      0xD2691E,  // 3 counter - chocolate
    ]
  },
  arena: {
    name: 'arena',
    tileset: 'tileset_B',
    map: [
      [0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1],
      [2,2,2,2,2,2,2,2],
      [2,3,3,3,3,3,3,2],
      [2,2,2,2,2,2,2,2],
      [1,1,1,1,1,1,1,1],
    ],
    exits: { left: 'shop' },
    palette: [
      0x1a1a2e,
      0x8B0000,  // dark red wall
      0xF4A460,  // sandy brown floor
      0xCD5C5C,  // indian red arena floor
    ]
  },
  storage: {
    name: 'storage',
    tileset: 'tileset_C',
    map: [
      [0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1],
      [2,2,2,2,2,2,2,2],
      [2,3,3,3,3,3,3,2],
      [2,2,2,2,2,2,2,2],
      [1,1,1,1,1,1,1,1],
    ],
    exits: { up: 'shop' },
    palette: [
      0x1a1a2e,
      0x4A4A4A,  // dark gray wall
      0x808080,  // gray floor
      0x696969,  // dim gray boxes
    ]
  },
  village: {
    name: 'village',
    tileset: 'tileset_D',
    map: [
      [0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1],
      [2,2,2,2,2,2,2,2],
      [2,3,3,3,3,3,3,2],
      [2,2,2,2,2,2,2,2],
      [1,1,1,1,1,1,1,1],
    ],
    exits: { right: 'shop' },
    palette: [
      0x1a1a2e,
      0x2F4F4F,  // dark slate gray
      0x90EE90,  // light green grass
      0x228B22,  // forest green
    ]
  }
};

export class MainScene extends Phaser.Scene {
  player: Phaser.GameObjects.Sprite;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  currentRoom = 'shop';
  graphics: Phaser.GameObjects.Graphics;

  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.image('player', '/images/characters/player/minju/idle/frame_0_0.png');
  }

  create() {
    this.graphics = this.add.graphics();
    this.loadRoom('shop');
    
    this.player = this.add.sprite(144, 144, 'player');
    this.player.setScale(1.5);
    this.player.setDepth(1);
    
    this.cursors = this.input.keyboard.createCursorKeys();
    EventBus.emit('current-scene-ready', this);
  }

  loadRoom(roomName: string) {
    const room = ROOMS[roomName];
    if (!room) return;
    
    this.currentRoom = roomName;
    this.graphics.clear();
    
    const TILE_SIZE = 48;
    
    for (let y = 0; y < room.map.length; y++) {
      for (let x = 0; x < room.map[y].length; x++) {
        const tileId = room.map[y][x];
        const color = room.palette[tileId] || 0x000000;
        
        this.graphics.fillStyle(color, 1);
        this.graphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        
        // Add border for walls
        if (tileId === 1) {
          this.graphics.lineStyle(2, 0x000000, 0.3);
          this.graphics.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
    
    this.player.setPosition(144, 168);
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
    
    const room = ROOMS[this.currentRoom];
    if (room) {
      if (this.player.x > 360 && room.exits.right) this.loadRoom(room.exits.right);
      if (this.player.x < 24 && room.exits.left) this.loadRoom(room.exits.left);
      if (this.player.y > 240 && room.exits.down) this.loadRoom(room.exits.down);
      if (this.player.y < 24 && room.exits.up) this.loadRoom(room.exits.up);
    }
    
    this.player.x = Phaser.Math.Clamp(this.player.x, 24, 360);
    this.player.y = Phaser.Math.Clamp(this.player.y, 24, 240);
  }
}
