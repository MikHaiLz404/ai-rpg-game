# Core Features

**Gods' Arena (วิหารแห่งเทพ)** — Feature Reference

---

## 1. Shop System

### Customer Generation & Bundle Requests
- Customers arrive with specific item requests and offered gold.
- **Bundle Requests**: Customers can ask for **1-3 items** in a single visit.
- Item selection and bundle size weighted by game day (larger bundles and rarer items appear later).
- God customers identified by `isGod: true` — pay premium prices and grant bond bonuses on successful sales.
- 3 customers per shift (standard), 1 shift = 1 action point.

### Inventory Management
- **Starting Stock**: 2x Health Potion, 1x Soap, 1x Mirror, 2x Flower.
- **Item Tiers**: 15 total item types across price tiers (20g - 500g).
- **Restocking**: Purchase items between customers (cost scales by day).
- **Global Utility**: Items are sold for gold, gifted for bond, or discovered during exploration.

### UI Status Indicators
- The Shop interface shows real-time inventory status for requests:
    - **In Stock** (Green): Item is available to sell.
    - **Missing** (Red): Item must be restocked before selling the bundle.

---

## 2. Arena Combat

### Wave-Based Turn System
- **Sequential Waves**: Combat now features **1-3 waves** of enemies per action.
- Wave count scales with game progression:
    - Days 1-7: 1 wave
    - Days 8-14: 2 waves
    - Days 15+: 3 waves
- **Escalating Power**: Each subsequent wave is **20% stronger** (HP/ATK) than the previous one.
- AI narrates combat actions and divine interventions via the Orchestrator.

### Divine Manifestation
- When a Divine Skill is used, the respective God (Leo, Arena, Draco) physically appears in the Arena.
- Visual effects include Magic Circles, screen flashes, and camera shakes to convey power.

### Character Progression (Kane)
- **Base Stats**: ATK = 15, DEF = 10, HP = 100.
- **Bond Bonuses**: All active companions grant additive bonuses to Kane's ATK and DEF.
- **Stat Persistence**: Kane's current HP and stats are saved across sessions.

---

## 3. Exploration System

### Interactive Phaser World
- **Free Movement**: Players control Kane using WASD/Arrows within exploration scenes.
- **Seamless Transitions**: Directional room entry (e.g., exiting right enters left of the next room).
- **Proximity Triggers**: Nodes (Resources/Enemies) are triggered by physically walking up to them.

### Outcome Resolution
1. **Nodes**: 6 interactive nodes spawn per expedition.
2. **Encounters**: Walking to a node triggers either auto-combat or a gathering event.
3. **Loot**: High-tier locations (Ruins, Cave) yield rarer items like Olympian Coins.

---

## 4. Relationship & Bond System

### Bond Mechanics
- **Tiers**: Bond Level = floor(bond / 10) + 1.
- **Leveling**: Gains from gifts, exploration kills, and successful shop sales to gods.

### Advanced AI Interactions
- **Dynamic Heralds**: If Bond Level is low (< 5), gods send a "Herald" sub-agent to handle interactions.
- **Quality Scaling**: Dialogue quality switches to high-reasoning models (Claude 3.5 Sonnet) at high bond levels (>= 12).
- **Autonomous Council**: Every 5 days, the "Divine Council" triggers a multi-agent dialogue to judge player progress.

---

## 5. AI Integration (Divine Orchestrator)

### Architecture
The game uses a centralized **Divine Orchestrator** to handle all requests with rule-based routing:
- **Rule A (Speed)**: Gemini 2.0 Flash for standard chatter.
- **Rule B (Quality)**: Claude 3.5 Sonnet for high bond levels.
- **Rule C (Intelligence)**: GPT-4o mini for late-game urgency and prophecies.
- **Rule D (Simulation)**: Multi-agent chaining for Council meetings.

### Fallback Resilience
- **OpenRouter Priority**: Bypasses gateway connection issues for god dialogues.
- **Offline Mode**: A pool of randomized Thai fallback dialogues ensures atmosphere without API access.

---

## 6. Save/Load System (Surgical)

### Efficient Auto-Save
- **Surgical Triggers**: Saves only occur when meaningful state changes (gold, items, bonds, day).
- **Debounced Writes**: A 2-second debounce timer prevents redundant disk operations during rapid changes.
- **Primary Storage**: IndexedDB (Primary) + LocalStorage (Fallback).

### Save Data Structure
Includes: player gold, inventory, companion bonds, unlocked skills, day, choicesLeft, interventionPoints, vampireDefeated, gameOver, explorationLog, and **kaneStats**.

---

## 7. UI/UX & Debug

### Layout & Navigation
- **Hybrid UI**: React manages management menus; Phaser manages visual movement and combat.
- **Header Status**: Displays Day, Gold, Actions, and AI Connectivity.

### Debug Controls
- **Debug Grid**: Visible UI button in header to toggle alignment grid and coordinate text (replaces legacy shortcuts).
- **AITerminal**: Collapsible overlay to view real-time AI prompts, responses, and token usage.
