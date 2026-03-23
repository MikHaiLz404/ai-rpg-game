# Gods' Arena - Complete Game Guide

**Gods' Arena (วิหารแห่งเทพ)** — Official MVP Documentation

---

## 🎮 Overview
Players act as **Minju**, a merchant and coach supporting **Kane** (an archer champion) and three companion gods in a **20-day campaign** to defeat the Vampire Lord.

---

## 🔄 The Core Game Loop

### Day Structure
Each day follows a fixed cycle:
1. **Morning Prophecy**: All 3 gods deliver AI strategic advice. Every 5 days, this triggers an autonomous **Divine Council** meeting.
2. **3 Action Points**: Spend actions across the four phases below in any order.
3. **End Day**: Triggers automatically when all actions are spent.
4. **Victory**: Defeat the Vampire Lord in the Arena before Day 20 ends.

---

## 🏪 Phase 1: Shop (ร้านค้าสวรรค์)
**Goal**: Earn gold to restock and grow your treasury.

- **Bundle Requests**: Customers (Mortals or Gods) ask for **1-3 items** at once.
- **Selling**: Check status indicators (**In Stock** vs **Missing**) before completing a sale.
- **Gods**: Celestial customers pay 1.5x prices and grant **Bond bonuses**.
- **Restocking**: Purchase items between customers. Costs scale by **+3% per day**.

| Key Items | Category | Base Price |
|-----------|----------|------------|
| Flower/Mirror | Gift | 20g - 150g |
| Potions | Consumable | 50g |
| Sword/Bow | Weapon | 180g - 200g |
| Olympian Coin | Rare | 500g |

---

## ⚔️ Phase 2: Arena (มหาอารีน่า)
**Goal**: Defeat enemies to earn Gold, IP, and eventual victory.

- **Wave Combat**: Battles feature **1-3 sequential waves** of enemies.
- **Scaling**: Enemies gain **+5% power per day** and **+20% power per wave**.
- **Divine Manifestation**: Using skills summons visual manifestations of Leo, Arena, or Draco.
- **Intervention Points (IP)**: Spend 2 IP for powerful skills or 3 IP for Divine Intervention (Double Damage).

---

## 🗡️ Phase 3: Exploration (ป่าเถื่อน)
**Goal**: Gather rare materials and IP through interactive discovery.

- **Interactive World**: Physically walk Kane through Phaser scenes (Forest, Cave, Ruins).
- **Proximity Nodes**: Walk up to glowing markers to trigger resource gathering or auto-combat.
- **Room Transitions**: Seamlessly move between connected maps (e.g., Forest → Cave Entrance).

---

## 💕 Phase 4: Relationship (หมู่บ้านเทพ)
**Goal**: Build bonds to unlock powerful AI-generated combat skills.

- **Dynamic Personas**: Interaction changes based on **Bond Level**.
    - **Bond < 5**: You speak with a **Herald** (Messenger).
    - **Bond >= 12**: Unlocks high-reasoning AI models (Claude 3.5 Sonnet).
- **Skill Unlocks**: AI generates unique skills at bond thresholds [3, 5, 8, 12, 17].
- **Gifts**: Give items to gods to boost bond. Each god has favorites (e.g., Leo likes Weapons).

---

## 💾 Technical Systems

### Surgical Save System
- **Persistence**: Dual-writes to IndexedDB and LocalStorage.
- **Efficiency**: Debounced saving only triggers when meaningful data (Gold, Stats, Bonds) changes.
- **Reliability**: Kane's HP and character progression are preserved between sessions.

### Divine AI Orchestrator
- **Routing**: Automatically switches between Gemini (Speed), GPT-4o (Intelligence), and Claude (Quality) based on game context.
- **Offline Fallbacks**: Large pool of randomized Thai dialogues if APIs are unreachable.

### Debug Controls
- **Debug Grid**: Toggle via the header button to see coordinate text and the 48px alignment grid.
- **AI Terminal**: Collapsible overlay showing real-time AI logic and token costs.
