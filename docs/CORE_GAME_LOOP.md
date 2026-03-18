# Core Game Loop

**Gods' Arena (วิหารแห่งเทพ)** — MVP Game Loop Documentation

---

## Overview

Players act as **Minju**, a merchant/coach supporting **Kane** (an archer champion) and three companion gods in a **20-day campaign** to defeat the Vampire Lord. The game loop centers on resource management, combat, exploration, and relationship building.

## Day Structure

Each day follows this cycle:

```
Morning Prophecy → 3 Actions → End Day → Next Day
```

- **Morning Prophecy**: All 3 gods deliver AI-generated strategic advice based on current game state (day, gold, bonds, skills, urgency).
- **3 Action Points**: The player spends actions across 4 phases (any order, any mix).
- **End Day**: Triggers automatically when all 3 actions are spent, or manually.
- **Win Condition**: Defeat the Vampire Lord (Arena boss) within 20 days.
- **Lose Conditions**: Day 20 passes without defeating the Vampire Lord, OR bankruptcy (0 gold + 0 items).

## The Four Phases

### 1. Shop Phase (ร้านค้าสวรรค์)

**Cost**: 1 action per shift

**Flow**:
1. Player starts a shift (เปิดร้าน)
2. Random customers arrive — each wants a specific item and offers gold
3. Player can sell matching item from inventory, or skip
4. Gods appear as customers and pay premium prices
5. Player can restock inventory between customers (costs gold, prices scale +3%/day)
6. Shift ends after 3 customers served

**Economy**:
- 15 item types (potions, weapons, gifts, materials, accessories)
- Customer item selection uses weighted random based on game day
- Early days: cheap items (herbs, flowers, soap) — Late days: expensive items (swords, mirrors, coins)
- Gods pay 1.5x the offered price
- Restock cost = base price * restockCostMultiplier (1.0 + (day-1) * 0.03)

### 2. Arena Phase (มหาอารีน่า)

**Cost**: 1 action per battle

**Flow**:
1. Player selects an enemy to fight (selection screen shows HP, ATK, reward)
2. Turn-based combat: player picks Attack, Skill, or Retreat each turn
3. Kane's base ATK = 15, modified by companion bond bonuses
4. Enemy counter-attacks after each player turn, reduced by DEF bonus
5. Win = gold reward + IP reward. Lose = no penalty (can retry)
6. Defeating the Vampire Lord triggers the win condition

**Enemies** (stats scale +5% HP/ATK per day, +3% reward per day):

| Enemy | Base HP | Base ATK | Base Reward |
|-------|---------|----------|-------------|
| Slime | 30 | 5 | 20g |
| Skeleton | 70 | 15 | 60g |
| Vampire Lord (Boss) | 250 | 45 | 500g |

**Combat Math**:
- Player damage = base ATK (15) + sum of bond ATK bonuses + skill multiplier
- Bond ATK bonus per god = floor(bond / 2)
- Bond DEF bonus per god = floor(bond / 3)
- Enemy damage = max(1, enemy ATK - total DEF bonus)
- Skills multiply base damage by 1.5x - 3.0x

**Intervention Points (IP)**:
- Spend 3 IP to use Divine Intervention during combat (doubles next attack)
- Earned from: exploration, combat wins, random events

### 3. Exploration Phase (ป่าเถื่อน)

**Cost**: 1 action per expedition

**Flow**:
1. Player selects a location (day-gated unlock)
2. Random outcome: monster encounter OR random event OR loot
3. Monster encounters are auto-combat (Kane vs. monster)
4. Rewards: items, gold, IP, bond points
5. On monster kill: +1 IP, 50% chance +1 bond with random god

**Locations**:

| Location | Unlock | Difficulty | Encounter Rate |
|----------|--------|-----------|----------------|
| ป่ามืด (Dark Forest) | Day 1 | 1 star | 35% |
| ภูเขาหมอก (Misty Mountain) | Day 5 | 2 stars | 45% |
| ถ้ำลาวา (Lava Cave) | Day 10 | 3 stars | 55% |
| ซากปรักหักพัง (Ancient Ruins) | Day 15 | 4 stars | 65% |

**Event Types**:
- Gold find (30-150g depending on location)
- Item discovery (weighted random from location loot table)
- IP gain (3-8 depending on location)
- Trap (lose 10-30 gold)
- Heal (recover 20-30 HP, thematic only)

**Loot**: Uses weighted random selection. Each location has a unique loot table. Higher-tier locations drop more valuable items (swords, shields, Olympian Coins).

### 4. Relationship Phase (หมู่บ้านเทพ)

**Cost**: 1 action per conversation

**Flow**:
1. Player selects a companion god to visit in the village
2. Talk (free chat via AI) or give a gift from inventory
3. Bond increases based on interaction
4. At bond thresholds [3, 5, 8, 12, 17], a new combat skill is unlocked via AI generation
5. Favorite gifts give +3 bonus bond

**Companions**:

| God | Starting Bond | Theme | Favorite Gifts |
|-----|--------------|-------|----------------|
| เลโอ (Leo) | 5 | War & Physical Strength | sword, shield, bow |
| อารีน่า (Arena) | 3 | Royal Protection & Light | perfume, flower, mirror |
| ดราโก้ (Draco) | 2 | Ancient Fire & Magic | herbs, ore, olympian_coin |

**Gift Bond Values**:
- Potions: +3 base
- Other items: +5 base
- Favorite item bonus: +3 additional

**Bond Bonuses** (applied in Arena combat):
- ATK bonus = floor(bond / 2)
- DEF bonus = floor(bond / 3)

**Skill Unlocks**:
- Bond thresholds: 3, 5, 8, 12, 17
- Each threshold triggers AI skill generation (or deterministic fallback)
- Skills are assigned to Kane and usable in Arena combat
- Skill types: physical or magical, multiplier range 1.5x - 3.0x

---

## Day Progression & Scaling

| Day Range | Difficulty | What Changes |
|-----------|-----------|-------------|
| 1-4 | Easy | Low enemy stats, basic customers, only Forest available |
| 5-9 | Normal | Mountain unlocks, stronger enemies, better customers |
| 10-14 | Hard | Cave unlocks, enemy stats ~1.5x base, restock costs rise |
| 15-19 | Very Hard | Ruins unlocks, enemy stats ~1.7-1.9x, high urgency |
| 20 | Final | Last chance to defeat the Vampire Lord |

## Resource Flow

```
Shop (sell items) ──→ Gold ──→ Restock (buy items)
                       │
Exploration ──→ Items + Gold + IP + Bond
                       │
Relationship ──→ Bond ──→ Skills (for Arena)
                       │
Arena ──→ Gold + IP ──→ Victory (defeat Vampire Lord)
```

## State Persistence

- **Auto-save**: Every 30 seconds to localStorage
- **Manual save**: 3 slots in ChampionStatus tab
- **Export/Import**: JSON file download/upload
- **Save data includes**: gold, items, bonds, skills, day, choices, IP, vampireDefeated, explorationLog
