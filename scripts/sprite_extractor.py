#!/usr/bin/env python3
"""
Gods' Arena - Sprite Sheet Extractor
Extract individual frames from RPG Maker spritesheets
"""

import os
from PIL import Image
import json

# RPG Maker sprite sheet config (32x32 frames)
SPRITE_SIZE = 32  # pixels per frame

def extract_spritesheet(image_path: str, output_dir: str, rows: int = 4, cols: int = 4):
    """Extract frames from a spritesheet"""
    img = Image.open(image_path)
    width, height = img.size
    
    frames_per_row = width // SPRITE_SIZE
    frames_per_col = height // SPRITE_SIZE
    
    os.makedirs(output_dir, exist_ok=True)
    
    frames = []
    for row in range(frames_per_col):
        for col in range(frames_per_row):
            left = col * SPRITE_SIZE
            top = row * SPRITE_SIZE
            right = left + SPRITE_SIZE
            bottom = top + SPRITE_SIZE
            
            frame = img.crop((left, top, right, bottom))
            frame_path = f"{output_dir}/frame_{row}_{col}.png"
            frame.save(frame_path)
            frames.append(f"frame_{row}_{col}.png")
    
    return frames

def process_character_folder(input_dir: str, output_base: str):
    """Process all images in a character folder"""
    results = {}
    
    for root, dirs, files in os.walk(input_dir):
        for file in files:
            if file.endswith('.png'):
                input_path = os.path.join(root, file)
                rel_path = os.path.relpath(input_path, input_dir)
                output_dir = os.path.join(output_base, rel_path.replace('.png', ''))
                
                try:
                    frames = extract_spritesheet(input_path, output_dir)
                    results[file] = len(frames)
                    print(f"✓ {file} -> {len(frames)} frames")
                except Exception as e:
                    print(f"✗ {file}: {e}")
    
    return results

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Extract sprite frames')
    parser.add_argument('--input', required=True, help='Input spritesheet')
    parser.add_argument('--output', required=True, help='Output folder')
    parser.add_argument('--size', type=int, default=32, help='Frame size (default: 32)')
    
    args = parser.parse_args()
    
    SPRITE_SIZE = args.size
    extract_spritesheet(args.input, args.output)
    print(f"Done! Frames saved to {args.output}")
