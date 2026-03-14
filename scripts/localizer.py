#!/usr/bin/env python3
"""
Gods' Arena - Localizer
Generate Thai translations for game content
Usage: python scripts/localizer.py --input src/data/items.json --output src/data/items.th.json
"""

import json
import argparse
import os
import re

# Gemini API
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'AIzaSyClIC6QlULh39G1Zpceeq8e2ZEPeCGAAaY')

def translate_with_gemini(text: str, target_lang: str = "Thai") -> str:
    """Translate text using Gemini API"""
    import urllib.request
    import urllib.parse
    
    url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}'
    
    prompt = f"Translate the following to {target_lang}. Keep it natural and game-appropriate:\n\n{text}"
    
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3}
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        return f"[Error: {e}]"

def localize_file(input_path: str, output_path: str, source_lang: str = "en", target_lang: str = "th"):
    """Localize a JSON file"""
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    localized = []
    
    for item in data:
        new_item = item.copy()
        
        # Translate name
        if 'name' in item:
            new_item['nameTH'] = translate_with_gemini(item['name'], target_lang)
        
        # Translate description
        if 'description' in item:
            new_item['descriptionTH'] = translate_with_gemini(item['description'], target_lang)
        
        localized.append(new_item)
        print(f"✅ {item.get('name', item.get('id', '?'))}")
    
    # Save
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(localized, f, indent=2, ensure_ascii=False)
    
    return len(localized)

def generate_translation_keys(data: dict, prefix: str = "") -> dict:
    """Generate translation keys for all text fields"""
    keys = {}
    
    for key, value in data.items():
        if isinstance(value, str) and len(value) < 500:
            full_key = f"{prefix}.{key}" if prefix else key
            keys[full_key] = value
        elif isinstance(value, dict):
            keys.update(generate_translation_keys(value, f"{prefix}.{key}" if prefix else key))
        elif isinstance(value, list) and len(value) > 0 and isinstance(value[0], dict):
            for i, item in enumerate(value):
                keys.update(generate_translation_keys(item, f"{prefix}.{key}.{i}"))
    
    return keys

def main():
    parser = argparse.ArgumentParser(description='Gods\' Arena Localizer')
    parser.add_argument('--input', required=True, help='Input JSON file')
    parser.add_argument('--output', help='Output file (default: input.lang.json)')
    parser.add_argument('--source', default='en', help='Source language')
    parser.add_argument('--target', default='th', help='Target language')
    parser.add_argument('--keys', action='store_true', help='Generate translation keys only')
    
    args = parser.parse_args()
    
    print("🌐 Gods' Arena - Localizer")
    print("============================\n")
    
    # Generate output path
    if not args.output:
        ext = os.path.splitext(args.input)[1]
        args.output = args.input.replace(ext, f".{args.target}.json")
    
    if args.keys:
        # Generate translation keys
        with open(args.input, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        keys = generate_translation_keys(data)
        
        output_keys = {v: f"[{k}]" for k, v in keys.items()}
        
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(output_keys, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Generated {len(output_keys)} translation keys -> {args.output}")
    else:
        # Translate
        count = localize_file(args.input, args.output, args.source, args.target)
        print(f"\n✅ Translated {count} items -> {args.output}")

if __name__ == '__main__':
    main()
