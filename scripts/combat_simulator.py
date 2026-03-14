#!/usr/bin/env python3
"""
Gods' Arena - Combat Simulator
Test combat balance by simulating battles
Usage: python scripts/combat_simulator.py --god leo --enemy slime --iterations 1000
"""

import json
import random
import argparse
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class Unit:
    name: str
    hp: int
    max_hp: int
    atk: int
    defense: int
    speed: int
    
    def is_alive(self) -> bool:
        return self.hp > 0
    
    def take_damage(self, damage: int) -> int:
        actual = max(1, damage - self.defense)
        self.hp = max(0, self.hp - actual)
        return actual

class CombatSimulator:
    def __init__(self, god_data: dict, enemy_data: dict):
        self.god = Unit(
            name=god_data.get('name', 'God'),
            hp=god_data.get('hp', 100),
            max_hp=god_data.get('hp', 100),
            atk=god_data.get('atk', 20),
            defense=god_data.get('def', 5),
            speed=god_data.get('speed', 10)
        )
        self.enemy = Unit(
            name=enemy_data.get('name', 'Enemy'),
            hp=enemy_data.get('hp', 50),
            max_hp=enemy_data.get('hp', 50),
            atk=enemy_data.get('atk', 10),
            defense=enemy_data.get('def', 2),
            speed=enemy_data.get('speed', 5)
        )
        self.log = []
    
    def calculate_damage(self, attacker: Unit, defender: Unit) -> int:
        base = attacker.atk
        # Random variance ±20%
        variance = random.uniform(0.8, 1.2)
        # Critical hit 10%
        is_crit = random.random() < 0.1
        crit_mult = 1.5 if is_crit else 1.0
        
        damage = int(base * variance * crit_mult)
        return damage
    
    def simulate_turn(self) -> str:
        # Determine who goes first
        if self.god.speed >= self.enemy.speed:
            first, second = self.god, self.enemy
        else:
            first, second = self.enemy, self.god
        
        # First attacks
        damage = self.calculate_damage(first, second)
        actual = second.take_damage(damage)
        self.log.append(f"{first.name} attacks {second.name} for {actual} damage!")
        
        if not second.is_alive():
            return f"{second.name} fainted!"
        
        # Second attacks
        damage = self.calculate_damage(second, first)
        actual = first.take_damage(damage)
        self.log.append(f"{second.name} attacks {first.name} for {actual} damage!")
        
        if not first.is_alive():
            return f"{first.name} fainted!"
        
        return "Turn complete"
    
    def simulate_battle(self) -> dict:
        turn = 0
        max_turns = 50
        
        while self.god.is_alive() and self.enemy.is_alive() and turn < max_turns:
            turn += 1
            result = self.simulate_turn()
            
            if "fainted" in result:
                break
        
        winner = "god" if self.god.is_alive() else "enemy"
        
        return {
            'winner': winner,
            'turns': turn,
            'god_hp_remaining': self.god.hp,
            'enemy_hp_remaining': self.enemy.hp,
            'log': self.log
        }

def load_json(filepath: str) -> dict:
    """Load data from JSON file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return {}

def main():
    parser = argparse.ArgumentParser(description='Gods\' Arena Combat Simulator')
    parser.add_argument('--god', default='leo', help='God ID')
    parser.add_argument('--enemy', default='slime', help='Enemy ID')
    parser.add_argument('--iterations', type=int, default=100, help='Number of simulations')
    parser.add_argument('--data-dir', default='src/data', help='Data directory')
    
    args = parser.parse_args()
    
    print("⚔️  Gods' Arena - Combat Simulator")
    print("====================================\n")
    
    # Load data
    gods = load_json(f'{args.data_dir}/gods.json')
    enemies = load_json(f'{args.data_dir}/enemies.json')
    
    god_data = next((g for g in gods if g.get('id') == args.god), {})
    enemy_data = next((e for e in enemies if e.get('id') == args.enemy), {})
    
    if not god_data:
        print(f"❌ God '{args.god}' not found")
        return
    
    if not enemy_data:
        print(f"❌ Enemy '{args.enemy}' not found")
        return
    
    print(f"God: {god_data.get('name', args.god)} (HP:{god_data.get('hp')}, ATK:{god_data.get('atk')}, DEF:{god_data.get('def')}, SPD:{god_data.get('speed')})")
    print(f"Enemy: {enemy_data.get('name', args.enemy)} (HP:{enemy_data.get('hp')}, ATK:{enemy_data.get('atk')}, DEF:{enemy_data.get('def')}, SPD:{enemy_data.get('speed')})")
    print(f"\nSimulating {args.iterations} battles...\n")
    
    # Run simulations
    results = {'god_wins': 0, 'enemy_wins': 0, 'draws': 0}
    total_turns = 0
    
    for i in range(args.iterations):
        sim = CombatSimulator(god_data, enemy_data)
        result = sim.simulate_battle()
        
        if result['winner'] == 'god':
            results['god_wins'] += 1
        elif result['winner'] == 'enemy':
            results['enemy_wins'] += 1
        else:
            results['draws'] += 1
        
        total_turns += result['turns']
    
    # Display results
    print(f"📊 Results ({args.iterations} battles):")
    print(f"   God Win Rate:    {results['god_wins']/args.iterations*100:.1f}%")
    print(f"   Enemy Win Rate:  {results['enemy_wins']/args.iterations*100:.1f}%")
    print(f"   Draw Rate:       {results['draws']/args.iterations*100:.1f}%")
    print(f"   Avg Turns:       {total_turns/args.iterations:.1f}")
    
    # Balance assessment
    win_rate = results['god_wins']/args.iterations*100
    if win_rate >= 70:
        print(f"\n⚠️  Battle is too easy for god!")
    elif win_rate <= 30:
        print(f"\n⚠️  Battle is too hard for god!")
    else:
        print(f"\n✅ Battle is balanced!")

if __name__ == '__main__':
    main()
