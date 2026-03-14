#!/usr/bin/env python3
"""
Gods' Arena - Test Runner
Run automated tests for game logic
Usage: python scripts/test_runner.py [--type combat|shop|all]
"""

import json
import os
import sys
import unittest
from typing import Any, List, Dict

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

# Test results
TEST_RESULTS = {'passed': 0, 'failed': 0, 'errors': 0}

class TestCombat(unittest.TestCase):
    """Test combat system"""
    
    def setUp(self):
        """Load test data"""
        self.data_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')
        
        with open(f'{self.data_dir}/gods.json', 'r') as f:
            self.gods = json.load(f)
        
        with open(f'{self.data_dir}/enemies.json', 'r') as f:
            self.enemies = json.load(f)
    
    def test_gods_have_required_fields(self):
        """All gods should have required fields"""
        required = ['id', 'name', 'hp', 'atk', 'def', 'speed']
        
        for god in self.gods:
            for field in required:
                self.assertIn(field, god, f"God {god.get('id')} missing {field}")
    
    def test_enemies_have_required_fields(self):
        """All enemies should have required fields"""
        required = ['id', 'name', 'hp', 'atk', 'def', 'speed']
        
        for enemy in self.enemies:
            for field in required:
                self.assertIn(field, enemy, f"Enemy {enemy.get('id')} missing {field}")
    
    def test_god_stats_in_range(self):
        """God stats should be within valid ranges"""
        for god in self.gods:
            self.assertGreater(god.get('hp', 0), 0, "HP must be positive")
            self.assertGreaterEqual(god.get('atk', 0), 0, "ATK must be non-negative")
            self.assertGreaterEqual(god.get('def', 0), 0, "DEF must be non-negative")
            self.assertGreater(god.get('speed', 0), 0, "Speed must be positive")
    
    def test_enemy_stats_in_range(self):
        """Enemy stats should be within valid ranges"""
        for enemy in self.enemies:
            self.assertGreater(enemy.get('hp', 0), 0, "HP must be positive")
            self.assertGreaterEqual(enemy.get('atk', 0), 0, "ATK must be non-negative")

class TestShop(unittest.TestCase):
    """Test shop system"""
    
    def setUp(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')
        
        with open(f'{self.data_dir}/items.json', 'r') as f:
            self.items = json.load(f)
    
    def test_items_have_required_fields(self):
        """All items should have required fields"""
        required = ['id', 'name', 'type', 'price']
        
        for item in self.items:
            for field in required:
                self.assertIn(field, item, f"Item {item.get('id')} missing {field}")
    
    def test_item_prices_valid(self):
        """Item prices should be positive"""
        for item in self.items:
            self.assertGreater(item.get('price', 0), 0, f"Item {item.get('id')} has invalid price")
    
    def test_item_types_valid(self):
        """Item types should be valid"""
        valid_types = ['weapon', 'armor', 'potion', 'material', 'accessory']
        
        for item in self.items:
            self.assertIn(item.get('type'), valid_types, f"Item {item.get('id')} has invalid type")

class TestRelationships(unittest.TestCase):
    """Test relationship system"""
    
    def setUp(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')
        
        with open(f'{self.data_dir}/npcs.json', 'r') as f:
            self.npcs = json.load(f)
    
    def test_npcs_have_required_fields(self):
        """All NPCs should have required fields"""
        required = ['id', 'name']
        
        for npc in self.npcs:
            for field in required:
                self.assertIn(field, npc, f"NPC {npc.get('id')} missing {field}")

def run_tests(test_class):
    """Run a test class and return results"""
    suite = unittest.TestLoader().loadTestsFromTestCase(test_class)
    runner = unittest.TextTestRunner(verbosity=0)
    result = runner.run(suite)
    
    return {
        'tests': result.testsRun,
        'passed': result.testsRun - len(result.failures) - len(result.errors),
        'failed': len(result.failures),
        'errors': len(result.errors)
    }

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Gods\' Arena Test Runner')
    parser.add_argument('--type', choices=['combat', 'shop', 'relationships', 'all'], default='all')
    parser.add_argument('--verbose', '-v', action='store_true')
    
    args = parser.parse_args()
    
    print("🧪 Gods' Arena - Test Runner")
    print("============================\n")
    
    results = {'passed': 0, 'failed': 0, 'errors': 0, 'total': 0}
    
    test_classes = []
    
    if args.type in ['combat', 'all']:
        test_classes.append(TestCombat)
    if args.type in ['shop', 'all']:
        test_classes.append(TestShop)
    if args.type in ['relationships', 'all']:
        test_classes.append(TestRelationships)
    
    for test_class in test_classes:
        print(f"Running {test_class.__name__}...")
        result = run_tests(test_class)
        
        results['passed'] += result['passed']
        results['failed'] += result['failed']
        results['errors'] += result['errors']
        results['total'] += result['tests']
        
        if result['failed'] > 0:
            print(f"   ❌ {result['failed']} failed")
        if result['errors'] > 0:
            print(f"   ⚠️  {result['errors']} errors")
        if result['failed'] == 0 and result['errors'] == 0:
            print(f"   ✅ All passed")
    
    print(f"\n📊 Summary:")
    print(f"   Total:  {results['total']}")
    print(f"   Passed: {results['passed']}")
    print(f"   Failed: {results['failed']}")
    print(f"   Errors: {results['errors']}")
    
    if results['failed'] > 0 or results['errors'] > 0:
        sys.exit(1)
    else:
        print(f"\n✅ All tests passed!")
        sys.exit(0)

if __name__ == '__main__':
    main()
