import { EventBus } from '../EventBus';

interface RoomConfig {
  name: string;
  bgType: 'shop' | 'arena' | 'cave' | 'village';
  map: number[][];
  exits: Record<string, string>;
  palette: number[];
}

// Full game map - different areas connected
const WORLD: Record<string, RoomConfig> = {
  shop: {
    name: 'ร้านค้า',
    bgType: 'shop',
    map: [
      [1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,3,4,4,3,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    exits: { right: 'arena', down: 'village', up: 'cave_entrance' },
    palette: [0, 0x8B4513, 0xDEB887, 0xD2691E, 0xCD853F] // wall, floor, counter
  },
  arena: {
    name: 'สนามประลอง',
    bgType: 'arena',
    map: [
      [1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,3,4,4,3,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    exits: { left: 'shop' },
    palette: [0, 0x8B0000, 0xF4A460, 0xCD5C5C, 0xB22222]
  },
  village: {
    name: 'หมู่บ้าน',
    bgType: 'village',
    map: [
      [1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,3,4,4,3,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    exits: { up: 'shop', right: 'cave_entrance' },
    palette: [0, 0x2F4F4F, 0x90EE90, 0x228B22, 0x32CD32]
  },
  cave_entrance: {
    name: 'ปากถ้ำ',
    bgType: 'cave',
    map: [
      [1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,3,0,0,3,2,1],
      [1,2,3,0,0,3,2,1],
      [1,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    exits: { down: 'shop', right: 'village', up: 'cave_inside' },
    palette: [0, 0x4A4A4A, 0x696969, 0x2F2F2F, 0x1A1A1A]
  },
  cave_inside: {
    name: 'ภายในถ้ำ',
    bgType: 'cave',
    map: [
      [1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,3,4,4,3,2,1],
      [1,2,3,3,3,3,2,1],
      [1,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    exits: { down: 'cave_entrance' },
    palette: [0, 0x3D3D3D, 0x505050, 0x282828, 0x1A1A1A]
  }
};

export class MainScene extends Phaser.Scene {
  player: Phaser.GameObjects.Sprite;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  currentRoom = 'shop';
  graphics: Phaser.GameObjects.Graphics;
  playerLabel: Phaser.GameObjects.Text;
  roomLabel: Phaser.GameObjects.Text;

  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.image('player', '/images/characters/player/minju/idle/frame_0_0.png');
  }

  create() {
    this.graphics = this.add.graphics();
    
    // Room label at top
    this.roomLabel = this.add.text(192, 12, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#00000080'
    }).setOrigin(0.5).setDepth(10);
    
    // Player label
    this.playerLabel = this.add.text(144, 130, '', {
      fontSize: '10px',
      color: '#ffffff',
      backgroundColor: '#00000080'
    }).setOrigin(0.5).setDepth(10);
    
    this.loadRoom('shop');
    
    this.player = this.add.sprite(144, 168, 'player');
    this.player.setScale(1.5);
    this.player.setDepth(1);
    
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', () => this.interact());
    
    EventBus.emit('current-scene-ready', this);
  }

  loadRoom(roomName: string) {
    const room = WORLD[roomName];
    if (!room) return;
    
    this.currentRoom = roomName;
    this.roomLabel.setText(room.name);
    this.graphics.clear();
    
    const TILE_SIZE = 48;
    
    for (let y = 0; y < room.map.length; y++) {
      for (let x = 0; x < room.map[y].length; x++) {
        const tileId = room.map[y][x];
        const color = room.palette[tileId] || 0x000000;
        
        this.graphics.fillStyle(color, 1);
        this.graphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        
        // Add texture detail
        if (tileId === 1) { // wall
          this.graphics.lineStyle(1, 0x000000, 0.2);
          this.graphics.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        } else if (tileId >= 2) { // floor
          this.graphics.fillStyle(0x000000, 0.1);
          this.graphics.fillRect(x * TILE_SIZE + 4, y * TILE_SIZE + 44, 40, 2);
        }
      }
    }
    
    // Reset player position to center-ish
    this.player.setPosition(144, 192);
  }

  interact() {
    const room = WORLD[this.currentRoom];
    if (!room) return;
    
    // Show interaction hint based on location
    let hint = '';
    if (this.currentRoom === 'shop') hint = '🏪 กด W/A/S/D เดิน | ปุ่ม Space เปิดร้าน';
    else if (this.currentRoom === 'arena') hint = '⚔️ กด W/A/S/D เดิน | ปุ่ม Space เข้า Arena';
    else if (this.currentRoom === 'village') hint = '🏘️ กด W/A/S/D เดิน';
    else if (this.currentRoom.includes('cave')) hint = '🦇 ถ้ำมืด...';
    
    this.playerLabel.setText(hint);
    this.playerLabel.setVisible(true);
    
    // Auto hide after 2s
    this.time.delayedCall(2000, () => {
      this.playerLabel.setVisible(false);
    });
  }

  update() {
    let moved = false;
    
    if (this.cursors.left?.isDown) {
      this.player.x -= 3;
      moved = true;
    } else if (this.cursors.right?.isDown) {
      this.player.x += 3;
      moved = true;
    }
    
    if (this.cursors.up?.isDown) {
      this.player.y -= 3;
      moved = true;
    } else if (this.cursors.down?.isDown) {
      this.player.y += 3;
      moved = true;
    }
    
    const room = WORLD[this.currentRoom];
    if (room) {
      // Check room exits
      if (this.player.x > 360 && room.exits.right) this.loadRoom(room.exits.right);
      if (this.player.x < 24 && room.exits.left) this.loadRoom(room.exits.left);
      if (this.player.y > 288 && room.exits.down) this.loadRoom(room.exits.down);
      if (this.player.y < 24 && room.exits.up) this.loadRoom(room.exits.up);
    }
    
    // Bounds
    this.player.x = Phaser.Math.Clamp(this.player.x, 24, 360);
    this.player.y = Phaser.Math.Clamp(this.player.y, 24, 288);
  }
}
