#!/usr/bin/env python3
"""
Gods' Arena - Asset Optimizer
Compress and resize images for the game
Usage: python scripts/asset_optimizer.py --input public/images/items --output public/build/images
"""

import os
import argparse
from PIL import Image
import json

# Supported formats
SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg', '.gif', '.webp']

def optimize_image(input_path: str, output_path: str, quality: int = 80, max_size: int = 1024):
    """Compress and resize a single image"""
    try:
        with Image.open(input_path) as img:
            # Convert to RGBA if needed
            if img.mode not in ('RGBA', 'RGB'):
                img = img.convert('RGBA')
            
            # Resize if larger than max_size
            if max(img.size) > max_size:
                ratio = max_size / max(img.size)
                new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            
            # Save with compression
            img.save(output_path, quality=quality, optimize=True)
            return True
    except Exception as e:
        print(f"Error processing {input_path}: {e}")
        return False

def process_directory(input_dir: str, output_dir: str, quality: int = 80, max_size: int = 1024):
    """Process all images in a directory"""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    stats = {'success': 0, 'failed': 0, 'skipped': 0}
    
    for root, dirs, files in os.walk(input_dir):
        # Create corresponding output directory
        rel_path = os.path.relpath(root, input_dir)
        out_path = os.path.join(output_dir, rel_path)
        
        if rel_path != '.':
            os.makedirs(out_path, exist_ok=True)
        
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            
            if ext not in SUPPORTED_FORMATS:
                stats['skipped'] += 1
                continue
            
            input_file = os.path.join(root, file)
            output_file = os.path.join(out_path, file)
            
            if optimize_image(input_file, output_file, quality, max_size):
                stats['success'] += 1
            else:
                stats['failed'] += 1
    
    return stats

def generate_asset_manifest(input_dir: str, output_dir: str) -> dict:
    """Generate manifest of all assets"""
    manifest = {
        'version': '1.0',
        'total_images': 0,
        'total_size': 0,
        'categories': {}
    }
    
    for root, dirs, files in os.walk(input_dir):
        rel_path = os.path.relpath(root, input_dir)
        
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in SUPPORTED_FORMATS:
                file_path = os.path.join(root, file)
                file_size = os.path.getsize(file_path)
                
                manifest['total_images'] += 1
                manifest['total_size'] += file_size
                
                category = rel_path.split(os.sep)[0] if os.sep in rel_path else rel_path
                if category not in manifest['categories']:
                    manifest['categories'][category] = {'count': 0, 'size': 0}
                
                manifest['categories'][category]['count'] += 1
                manifest['categories'][category]['size'] += file_size
    
    # Save manifest
    manifest_path = os.path.join(output_dir, 'manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)
    
    return manifest

def main():
    parser = argparse.ArgumentParser(description='Gods\' Arena Asset Optimizer')
    parser.add_argument('--input', default='public/images', help='Input directory')
    parser.add_argument('--output', default='public/build', help='Output directory')
    parser.add_argument('--quality', type=int, default=80, help='JPEG quality (1-100)')
    parser.add_argument('--max-size', type=int, default=1024, help='Max dimension in pixels')
    parser.add_argument('--manifest', action='store_true', help='Generate manifest')
    
    args = parser.parse_args()
    
    print("🖼️  Gods' Arena - Asset Optimizer")
    print("==================================\n")
    
    print(f"Input:  {args.input}")
    print(f"Output: {args.output}")
    print(f"Quality: {args.quality}")
    print(f"Max Size: {args.max_size}px")
    print()
    
    stats = process_directory(args.input, args.output, args.quality, args.max_size)
    
    print(f"\n✅ Complete!")
    print(f"   Success: {stats['success']}")
    print(f"   Failed:  {stats['failed']}")
    print(f"   Skipped: {stats['skipped']}")
    
    if args.manifest:
        manifest = generate_asset_manifest(args.output, args.output)
        print(f"\n📋 Manifest generated: {manifest['total_images']} images, {manifest['total_size']/1024:.1f}KB")

if __name__ == '__main__':
    main()
