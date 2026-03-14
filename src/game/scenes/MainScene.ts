import { EventBus } from '../EventBus';
import { Game } from 'phaser';

export class MainScene extends Phaser.Scene {
  player: Phaser.GameObjects.Sprite;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  playerSpeed = 160;
  lastFacing = 'down';
  
  // Tile map
  map: Phaser.Tilemaps.Tilemap;
  tileset: Phaser.Tilemaps.Tileset;
  
  constructor() {
    super('MainScene');
  }

  preload() {
    // Load tileset
    this.load.image('tileset_B', '/images/backgrounds/shop/interior/tileset_B.png');
    
    // Load player sprites
    for (let i = 0; i < 3; i++) {
      this.load.image(`player_${i}`, `/images/characters/player/minju/idle/frame_0_${i}.png`);
    }
  }

  create() {
    // Create tilemap from tileset image (not JSON)
    // For RPG Maker style: 16x16 tiles in a 768x768 image = 16 columns
    const level = [
      [0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,0],
      [0,1,2,2,2,2,1,0],
      [0,1,2,2,2,2,1,0],
      [0,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0],
    ];
    
    // Create blank map
    this.map = this.make.tilemap({ tileWidth: 48, tileHeight: 48, width: 8, height: 6 });
    this.tileset = this.map.addTilesetImage('tileset_B', undefined, 48, 48, 0, 0, 0);
    
    if (this.tileset) {
      const layer = this.map.createBlankLayer('level', this.tileset);
      
      for (let y = 0; y < level.length; y++) {
        for (let x = 0; x < level[y].length; x++) {
          layer.putTileAt(level[y][x], x, y);
        }
      }
    }
    
    // Create player
    this.player = this.add.sprite(144, 144, 'player_0');
    this.player.setScale(1.5);
    this.player.setDepth(1);
    
    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // Emit ready event
    EventBus.emit('current-scene-ready', this);
  }

  update() {
    let moved = false;
    
    if (this.cursors.left?.isDown) {
      this.player.x -= 2;
      this.lastFacing = 'left';
      moved = true;
    } else if (this.cursors.right?.isDown) {
      this.player.x += 2;
      this.lastFacing = 'right';
      moved = true;
    }
    
    if (this.cursors.up?.isDown) {
      this.player.y -= 2;
      this.lastFacing = 'up';
      moved = true;
    } else if (this.cursors.down?.isDown) {
      this.player.y += 2;
      this.lastFacing = 'down';
      moved = true;
    }
    
    // Bounds
    this.player.x = Phaser.Math.Clamp(this.player.x, 24, 384 - 24);
    this.player.y = Phaser.Math.Clamp(this.player.y, 24, 288 - 24);
  }
}
