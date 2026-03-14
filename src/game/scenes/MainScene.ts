import { EventBus } from '../EventBus';

interface RoomConfig {
  name: string;
  map: number[][];
  exits: Record<string, string>;
}

const WORLD: Record<string, RoomConfig> = {
  shop: {
    name: 'ร้านค้า',
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
    this.load.image('player', '/images/characters/player/minju/idle/frame_0_0.png');
  }

  create() {
    // Create graphics
    this.graphics = this.add.graphics();
    
    // Room text
    this.roomText = this.add.text(192, 20, '', {
      fontSize: '18px',
      color: '#fff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Load first room
    this.loadRoom('shop');
    
    // Player
    this.player = this.add.sprite(144, 180, 'player');
    this.player.setScale(1.5);
    
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
    
    this.player.setPosition(144, 180);
  }

  update() {
    if (!this.cursors) return;
    
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
    
    const room = WORLD[this.currentRoom];
    if (room) {
      if (this.player.x > 370 && room.exits.right) this.loadRoom(room.exits.right);
      if (this.player.x < 24 && room.exits.left) this.loadRoom(room.exits.left);
      if (this.player.y > 260 && room.exits.down) this.loadRoom(room.exits.down);
      if (this.player.y < 24 && room.exits.up) this.loadRoom(room.exits.up);
    }
    
    this.player.x = Phaser.Math.Clamp(this.player.x, 24, 360);
    this.player.y = Phaser.Math.Clamp(this.player.y, 24, 260);
  }
}
