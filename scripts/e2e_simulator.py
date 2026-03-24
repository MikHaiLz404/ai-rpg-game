#!/usr/bin/env python3
"""
Gods' Arena - End-to-End Gameplay Simulator (Balanced v1.4)
Validates the economy, combat scaling, and winnability of the game.
"""

import random
import math

# --- Constants ---
MAX_DAYS = 20
ACTIONS_PER_DAY = 3
INITIAL_GOLD = 500
INITIAL_IP = 20 # BUFFED: Starting IP
BOND_THRESHOLDS = [3, 5, 8, 12, 17]

# --- Item Data ---
ITEMS = [
    {"id": "potion_health", "price": 50},
    {"id": "soap", "price": 30},
    {"id": "perfume", "price": 120},
    {"id": "basket", "price": 80},
    {"id": "cloth", "price": 100},
    {"id": "flower", "price": 20},
    {"id": "mirror", "price": 150},
    {"id": "sword", "price": 200},
    {"id": "shield", "price": 150},
    {"id": "bow", "price": 180},
    {"id": "herbs", "price": 40},
    {"id": "ore", "price": 60},
    {"id": "wood", "price": 30},
    {"id": "olympian_coin", "price": 500},
]

# --- Enemy Data (Balanced v1.4) ---
BASE_ENEMIES = [
    {"id": "slime", "name": "Slime", "hp": 50, "atk": 8, "def": 1, "gold": 30},
    {"id": "skeleton", "name": "Skeleton", "hp": 80, "atk": 12, "def": 3, "gold": 60},
    {"id": "boss", "name": "Vampire Lord", "hp": 250, "atk": 35, "def": 8, "gold": 500},
]

class GameSim:
    def __init__(self):
        self.day = 1
        self.gold = INITIAL_GOLD
        self.ip = INITIAL_IP
        self.inventory = ["potion_health", "potion_health", "soap", "mirror", "flower", "flower"]
        self.bonds = {"leo": 5, "arena": 3, "draco": 2}
        self.kane = {"hp": 100, "max_hp": 100, "atk": 15, "def": 10}
        self.arena_wins = 0
        self.log = []
        self.vampire_defeated = False

    def get_bonuses(self):
        # BUFFED: Kane scaling
        atk_bonus = sum(math.floor(b * 1.5) for b in self.bonds.values())
        def_bonus = sum(math.floor(b * 1.0) for b in self.bonds.values())
        return atk_bonus, def_bonus

    def restock_item(self, item_id):
        item = next(i for i in ITEMS if i["id"] == item_id)
        multiplier = 1.0 + (self.day - 1) * 0.03
        cost = math.floor(item["price"] * 0.6 * multiplier)
        if self.gold >= cost:
            self.gold -= cost
            self.inventory.append(item_id)
            return True
        return False

    def simulate_shop(self):
        target = min(7, 3 + (self.day - 1) // 4)
        for _ in range(target):
            if len(self.inventory) < 3:
                for _ in range(3): self.restock_item(random.choice(ITEMS)["id"])

            is_god = random.random() < 0.2
            bundle_chance = 0.05 if self.day <= 5 else (0.15 if self.day <= 10 else 0.30)
            item_count = (3 if self.day >= 15 else 2) if random.random() < bundle_chance else 1
            
            wanted_ids = [random.choice(ITEMS)["id"] for _ in range(item_count)]
            total_value = sum(next(it for it in ITEMS if it["id"] == rid)["price"] for rid in wanted_ids)
            
            # Offered Gold Math (2.0x for Gods)
            mult_min, mult_max = (1.5, 2.0) if is_god else (0.6, 1.0)
            if self.day >= 15: mult_min += 0.2; mult_max += 0.3
            offered = math.floor(total_value * random.uniform(mult_min, mult_max))

            can_sell = True
            temp_inv = list(self.inventory)
            for wid in wanted_ids:
                if wid in temp_inv: temp_inv.remove(wid)
                else: can_sell = False; break
            
            if can_sell:
                self.inventory = temp_inv
                self.gold += offered
                if is_god:
                    god = random.choice(["leo", "arena", "draco"])
                    self.bonds[god] += 2
        return f"Shop: Gold: {self.gold}"

    def simulate_training(self):
        # BUFFED: Lower cost
        cost = 50 + (self.day - 1) * 10
        if self.gold >= cost:
            self.gold -= cost
            r = random.random()
            if r < 0.4:
                self.kane["max_hp"] += 15
                self.kane["hp"] = self.kane["max_hp"]
            elif r < 0.7:
                self.kane["atk"] += 4
            else:
                self.kane["def"] += 2
            return True
        return False

    def simulate_arena(self, enemy_id):
        num_waves = 3 if self.day >= 15 else (2 if self.day >= 8 else 1)
        base_enemy = next(e for e in BASE_ENEMIES if e["id"] == enemy_id)
        
        current_hp = self.kane["max_hp"]
        atk_bonus, def_bonus = self.get_bonuses()
        
        session_gold = 0
        for w in range(1, num_waves + 1):
            day_scale = 1 + (self.day - 1) * 0.03
            wave_scale = 1 + (w - 1) * 0.1
            scale = day_scale * wave_scale
            
            e_hp = math.floor(base_enemy["hp"] * scale)
            e_atk = math.floor(base_enemy["atk"] * scale)
            e_def = math.floor(base_enemy["def"] * scale)
            
            while e_hp > 0 and current_hp > 0:
                dmg = max(2, (self.kane["atk"] + atk_bonus) - e_def)
                if self.ip >= 2 and random.random() < 0.5:
                    self.ip -= 2
                    dmg = math.floor(((self.kane["atk"] + atk_bonus) * 2.0) - e_def)
                
                e_hp -= dmg
                if e_hp <= 0: break
                
                e_dmg = max(1, e_atk - (self.kane["def"] + def_bonus))
                current_hp -= e_dmg
            
            if current_hp <= 0: return False, "Kane defeated in wave"
            
            session_gold += base_enemy["gold"]
            heal = math.floor(self.kane["max_hp"] * 0.2)
            current_hp = min(self.kane["max_hp"], current_hp + heal)
        
        self.gold += session_gold
        self.ip += (3 * num_waves)
        self.arena_wins += 1
        if enemy_id == "boss": self.vampire_defeated = True
        return True, f"Victory! Gained {session_gold} Gold"

    def run_full_sim(self):
        for d in range(1, MAX_DAYS + 1):
            self.day = d
            self.simulate_shop()
            self.simulate_training()
            
            eid = "slime" if self.day < 5 else ("skeleton" if self.day < 15 else "boss")
            if self.day == 20: eid = "boss"
            
            win, msg = self.simulate_arena(eid)
            self.log.append(f"Day {self.day}: {msg}. Gold:{self.gold} ATK:{self.kane['atk']+self.get_bonuses()[0]} HP:{self.kane['max_hp']} IP:{self.ip}")
            if self.vampire_defeated: return True, f"WIN on Day {self.day}!"
            if self.gold <= 0 and len(self.inventory) == 0: return False, f"LOSE: Bankruptcy"
                
        return False, "LOSE: Time ran out"

def main():
    wins = 0
    total = 100
    for i in range(total):
        sim = GameSim()
        win, msg = sim.run_full_sim()
        if win: wins += 1
    print(f"Final Balanced Simulation Results (v1.4): Win Rate: {wins/total*100}%")
    sim = GameSim(); win, msg = sim.run_full_sim()
    for line in sim.log: print(line)
    print(f"\nFinal Result: {msg}")

if __name__ == "__main__":
    main()
