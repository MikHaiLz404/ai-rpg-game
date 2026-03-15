#!/usr/bin/env python3
"""
Gods' Arena - Data Generator using Gemini
Usage: python scripts/data_generator.py --type item --name "Healing Potion"
"""

import json
import argparse
import os
import re

# Gemini API configuration
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '') # Enter your API key here or use environment variable
GEMINI_MODEL = 'gemini-2.0-flash'

def generate_with_gemini(prompt: str) -> str:
    """Call Gemini API to generate content"""
    import urllib.request
    import urllib.parse
    
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}'
    
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 2048,
        }
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
        return f"Error: {e}"

def generate_item(item_name: str, item_type: str = "potion") -> dict:
    """Generate item data using Gemini"""
    prompt = f"""Create a game item in JSON format for a Greek mythology shopkeeper game.

Item Name: {item_name}
Type: {item_type}

Output ONLY valid JSON (no markdown), example:
{{
  "id": "potion_health_small",
  "name": "Small Health Potion",
  "nameTH": "ยาพยุงพลังชีวิตขวดเล็ก",
  "description": "Restores 30 HP",
  "descriptionTH": "ฟื้นฟูพลังชีวิต 30 หน่วย",
  "type": "potion",
  "rarity": "common",
  "price": 50,
  "effect": {{"hp": 30}},
  "icon": "🧪"
}}

Generate for: {item_name}"""
    
    result = generate_with_gemini(prompt)
    
    # Extract JSON from response
    try:
        # Find JSON in response
        json_match = re.search(r'\{[\s\S]*\}', result)
        if json_match:
            return json.loads(json_match.group())
    except:
        pass
    
    return {"error": "Could not generate item", "raw": result}

def generate_enemy(enemy_name: str, difficulty: int = 1) -> dict:
    """Generate enemy data using Gemini"""
    prompt = f"""Create a game enemy in JSON format for a Greek mythology RPG.

Enemy Name: {enemy_name}
Difficulty Level: {difficulty} (1-5)

Output ONLY valid JSON (no markdown), example:
{{
  "id": "slime_green",
  "name": "Green Slime",
  "nameTH": "สไลม์เขียว",
  "description": "A weak but numerous enemy",
  "descriptionTH": "ศัตรูที่อ่อนแอแต่มีจำนวนมาก",
  "type": "basic",
  "difficulty": 1,
  "hp": 50,
  "atk": 10,
  "def": 2,
  "speed": 5,
  "exp": 10,
  "drops": ["slime_gel"],
  "icon": "🟢"
}}

Generate for: {enemy_name}"""
    
    result = generate_with_gemini(prompt)
    
    try:
        json_match = re.search(r'\{[\s\S]*\}', result)
        if json_match:
            return json.loads(json_match.group())
    except:
        pass
    
    return {"error": "Could not generate enemy", "raw": result}

def generate_dialogue(character: str, personality: str, num_nodes: int = 5) -> list:
    """Generate dialogue tree using Gemini"""
    prompt = f"""Create {num_nodes} dialogue nodes for a game character.

Character: {character}
Personality: {personality}

Output ONLY valid JSON array (no markdown), example:
[
  {{
    "id": "intro",
    "textTH": "สวัสดีค่ะ!",
    "textEN": "Hello!",
    "choices": [
      {{"textTH": "ทักทาย", "textEN": "Greet", "nextId": "greeting", "bondChange": 3}}
    ]
  }}
]

Make it natural conversation for a shopkeeper game with Greek mythology theme.
Character: {character} ({personality})"""
    
    result = generate_with_gemini(prompt)
    
    try:
        json_match = re.search(r'\[[\s\S]*\]', result)
        if json_match:
            return json.loads(json_match.group())
    except:
        pass
    
    return [{"error": "Could not generate dialogue", "raw": result}]

def main():
    parser = argparse.ArgumentParser(description='Gods\' Arena Data Generator')
    parser.add_argument('--type', choices=['item', 'enemy', 'dialogue'], required=True)
    parser.add_argument('--name', help='Name of item/enemy/character')
    parser.add_argument('--subtype', help='Type of item (potion/weapon/armor)')
    parser.add_argument('--difficulty', type=int, default=1, help='Enemy difficulty')
    parser.add_argument('--personality', default='friendly', help='Character personality')
    parser.add_argument('--nodes', type=int, default=5, help='Number of dialogue nodes')
    parser.add_argument('--output', help='Output file path')
    
    args = parser.parse_args()
    
    print(f"🎮 Gods' Arena - Data Generator")
    print(f"================================\n")
    
    if args.type == 'item':
        name = args.name or input("Item name: ")
        subtype = args.subtype or input("Item type (potion/weapon/armor): ")
        result = generate_item(name, subtype)
        
    elif args.type == 'enemy':
        name = args.name or input("Enemy name: ")
        result = generate_enemy(name, args.difficulty)
        
    elif args.type == 'dialogue':
        char = args.name or input("Character name: ")
        result = generate_dialogue(char, args.personality, args.nodes)
    
    print("\n📦 Generated Data:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print(f"\n✅ Saved to {args.output}")

if __name__ == '__main__':
    main()
