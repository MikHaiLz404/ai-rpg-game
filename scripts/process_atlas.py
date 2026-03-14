#!/usr/bin/env python3
"""
Gods' Arena - Atlas Processor
Upscale 16x16 pixel art to 48x48 for Phaser 3
And generate Texture Atlas JSON (optional)
"""

import os
import argparse
from PIL import Image
import json

def upscale_atlas(input_path: str, output_path: str, scale: int = 3):
    """Upscale an image using nearest-neighbor to preserve pixel art"""
    try:
        with Image.open(input_path) as img:
            width, height = img.size
            new_size = (width * scale, height * scale)
            
            # Use Resampling.NEAREST for pixel art
            upscaled = img.resize(new_size, Image.Resampling.NEAREST)
            upscaled.save(output_path)
            return True
    except Exception as e:
        print(f"Error upscaling {input_path}: {e}")
        return False

def generate_atlas_json(image_path: str, output_path: str, tile_size: int = 16):
    """Generate a Phaser 3 compatible JSON hash for a tileset atlas"""
    try:
        with Image.open(image_path) as img:
            width, height = img.size
            cols = width // tile_size
            rows = height // tile_size
            
            atlas = {
                "frames": {},
                "meta": {
                    "app": "Gods' Arena Atlas Processor",
                    "version": "1.0",
                    "image": os.path.basename(image_path),
                    "format": "RGBA8888",
                    "size": {"w": width, "h": height},
                    "scale": "1"
                }
            }
            
            for row in range(rows):
                for col in range(cols):
                    frame_name = f"tile_{row}_{col}"
                    atlas["frames"][frame_name] = {
                        "frame": {"x": col * tile_size, "y": row * tile_size, "w": tile_size, "h": tile_size},
                        "rotated": False,
                        "trimmed": False,
                        "spriteSourceSize": {"x": 0, "y": 0, "w": tile_size, "h": tile_size},
                        "sourceSize": {"w": tile_size, "h": tile_size}
                    }
            
            with open(output_path, 'w') as f:
                json.dump(atlas, f, indent=2)
            return True
    except Exception as e:
        print(f"Error generating JSON for {image_path}: {e}")
        return False

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Process atlas files for Phaser')
    parser.add_argument('--input', required=True, help='Input atlas image')
    parser.add_argument('--output', help='Output image (optional, for upscaling)')
    parser.add_argument('--json', help='Output JSON file (optional)')
    parser.add_argument('--scale', type=int, default=3, help='Upscale factor (default: 3)')
    parser.add_argument('--tile-size', type=int, default=16, help='Source tile size (default: 16)')
    
    args = parser.parse_args()
    
    if args.output:
        if upscale_atlas(args.input, args.output, args.scale):
            print(f"✓ Upscaled {args.input} -> {args.output} (scale: {args.scale}x)")
    
    if args.json:
        if generate_atlas_json(args.input, args.json, args.tile_size):
            print(f"✓ Generated JSON for {args.input} -> {args.json} (tile-size: {args.tile_size})")
