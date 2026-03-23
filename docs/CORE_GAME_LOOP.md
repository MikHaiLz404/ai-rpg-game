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

- **Morning Prophecy**: All 3 gods deliver AI-generated strategic advice based on current game state.
- **3 Action Points**: The player spends actions across 4 phases (any order, any mix).
- **End Day**: Triggers automatically when all 3 actions are spent.
- **Milestones**: Every 5 days, the **Divine Council** automatically triggers after the prophecy.

---

## The Four Phases

### 1. Shop Phase (ร้านค้าสวรรค์)

**Cost**: 1 action per shift

**Flow**:
1. Player starts a shift (เปิดร้าน).
2. Random customers arrive — each requests a **Bundle** (1-3 items) and offers gold.
3. **UI Check**: Items in inventory show "In Stock"; missing items show "Missing".
4. Player can sell the full bundle, or decline the customer.
5. Gods appear as premium customers (1.5x price + Bond bonus).
6. Shift ends after 3 customers are served.

**Economy**:
- Bundle size and item rarity scale with the current game day.
- Restock costs scale +3% per day.

### 2. Arena Phase (มหาอารีน่า)

**Cost**: 1 action per battle

**Flow**:
1. Player selects an enemy difficulty.
2. **Wave Combat**: 1-3 waves of enemies spawn sequentially.
3. Turn-based combat: Attack, Skill, or Retreat.
4. **God Manifestation**: Using skills triggers visual summoning of gods in the arena.
5. Win = Gold + IP reward (accumulated and granted after the final wave).
6. Defeating the Vampire Lord (Day 20 Boss) triggers victory.

**Math**:
- Wave Difficulty: Each wave is +20% stronger than the previous one.
- Enemy Scaling: Base stats increase +5% per day.

### 3. Exploration Phase (ป่าเถื่อน)

**Cost**: 1 action per expedition

**Flow**:
1. Player selects a location (Dark Forest, Misty Mountain, Lava Cave, Ancient Ruins).
2. **Interactive World**: Use WASD/Arrows to walk through the Phaser scene.
3. **Trigger Nodes**: Walk Kane physically into glowing nodes to reveal loot or monsters.
4. **Proximity Action**: Revealed items/enemies are triggered by Kane's presence.
5. Rewards: items, gold, IP, bond points.

### 4. Relationship Phase (หมู่บ้านเทพ)

**Cost**: 1 action per interaction

**Flow**:
1. Visit a god in the Village Phaser scene.
2. **Dynamic Personas**: If bond is < 5, you interact with a **Herald** sub-agent.
3. **Talk**: High-bond levels unlock higher-tier AI models (Claude 3.5 Sonnet).
4. **Gift**: Favorite gifts give +3 bonus bond.
5. **Skill Unlock**: AI generates unique combat skills at bond thresholds [3, 5, 8, 12, 17].

---

## Resource Flow

```
Shop (sell bundles) ──→ Gold ──→ Restock (buy items)
                       │
Exploration ──→ Items + Gold + IP + Bond
                       │
Relationship ──→ Bond ──→ Divine Skills (for Arena)
                       │
Arena ──→ Gold + IP ──→ Victory (defeat Boss)
```

## State Persistence (Surgical)

- **Auto-save**: Debounced saving triggers on gold/item/stat changes.
- **Manual save**: 3 slots available in the Status tab.
- **Data Persistence**: Kane's HP and stats are preserved between fights and sessions.
- **Multi-Storage**: Primary data in IndexedDB with LocalStorage as a fallback.
