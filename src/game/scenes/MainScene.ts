import { EventBus } from '../EventBus';

interface RoomConfig {
  name: string;
  tileset: string;
  map: number[][];
  exits: Record<string, string>;
}

const ROOMS: Record<string, RoomConfig> = {
  shop: {
    name: 'shop',
    tileset: 'tileset_B',
    map: [
      [0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0],
      [0,1,2,2,2,2,1,0],
      [0,1,2,2,2,2,1,0],
      [0,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0],
    ],
    exits: { right: 'arena', down: 'storage' }
  },
  arena: {
    name: 'arena',
    tileset: 'tileset_B',
    map: [
      [0,0,0,0,0,0,0,0],
      [0,3,3,3,3,3,3,0],
      [0,3,4,4,4,4,3,0],
      [0,3,4,4,4,4,3,0],
      [0,3,3,3,3,3,3,0],
      [0,0,0,0,0,0,0,0],
    ],
    exits: { left: 'shop' }
  },
  storage: {
    name: 'storage',
    tileset: 'tileset_C',
    map: [
      [0,0,0,0,0,0,0,0],
      [0,5,5,5,5,5,5,0],
      [0,5,6,6,6,6,5,0],
      [0,5,6,6,6,6,5,0],
      [0,5,5,5,5,5,5,0],
      [0,0,0,0,0,0,0,0],
    ],
    exits: { up: 'shop' }
  },
  village: {
    name: 'village',
    tileset: 'tileset_D',
    map: [
      [0,0,0,0,0,0,0,0],
      [0,7,7,7,7,7,7,0],
      [0,7,8,8,8,8,7,0],
      [0,7,8,8,8,8,7,0],
      [0,7,7,7,7,7,7,0],
      [0,0,0,0,0,0,0,0],
    ],
    exits: { right: 'shop' }
  }
};

export class MainScene extends Phaser.Scene {
  player: Phaser.GameObjects.Sprite;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  playerSpeed = 160;
  lastFacing = 'down';
  currentRoom = 'shop';
  layer: Phaser.Tilemaps.TilemapLayer;
  map: Phaser.Tilemaps.Tilemap;
  tileset: Phaser.Tilemaps.Tileset;
  loadedTilesets: Set<string> = new Set();

  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.image('tileset_B', '/images/backgrounds/shop/interior/tileset_B.png');
    this.load.image('tileset_C', '/images/backgrounds/shop/interior/tileset_C.png');
    this.load.image('tileset_D', '/images/backgrounds/shop/interior/tileset_D.png');
    
    for (let i = 0; i < 3; i++) {
      this.load.image(`player_${i}`, `/images/characters/player/minju/idle/frame_0_${i}.png`);
    }
  }

  create() {
    this.map = this.make.tilemap({ tileWidth: 48, tileHeight: 48, width: 8, height: 6 });
    this.loadRoom('shop');
    
    this.player = this.add.sprite(144, 144, 'player_0');
    this.player.setScale(1.5);
    this.player.setDepth(1);
    
    this.cursors = this.input.keyboard.createCursorKeys();
    EventBus.emit('current-scene-ready', this);
  }

  loadRoom(roomName: string) {
    const room = ROOMS[roomName];
    if (!room) return;
    
    this.currentRoom = roomName;
    
    if (this.layer) {
      this.layer.destroy();
    }
    
    if (!this.loadedTilesets.has(room.tileset)) {
      this.tileset = this.map.addTilesetImage(room.tileset);
      this.loadedTilesets.add(room.tileset);
    } else {
      const ts = this.map.tilesets.find(t => t.name === room.tileset);
      if (ts) this.tileset = ts;
    }
    
    this.layer = this.map.createBlankLayer('level', this.tileset);
    
    for (let y = 0; y < room.map.length; y++) {
      for (let x = 0; x < room.map[y].length; x++) {
        this.layer.putTileAt(room.map[y][x], x, y);
      }
    }
    
    this.player.setPosition(144, 144);
  }

  update() {
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
        this.loadRoom(room.exits.right);
      }
      if (this.player.x < 50 && room.exits.left) {
        this.loadRoom(room.exits.left);
      }
      if (this.player.y > 230 && room.exits.down) {
        this.loadRoom(room.exits.down);
      }
      if (this.player.y < 50 && room.exits.up) {
        this.loadRoom(room.exits.up);
      }
    }
    
    this.player.x = Phaser.Math.Clamp(this.player.x, 24, 360);
    this.player.y = Phaser.Math.Clamp(this.player.y, 24, 264);
  }
}
