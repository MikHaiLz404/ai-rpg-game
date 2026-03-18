# Core Features

**Gods' Arena (วิหารแห่งเทพ)** — Feature Reference

---

## 1. Shop System

### Customer Generation
- Customers arrive with a random wanted item and offered gold price
- Item selection weighted by game day (cheap items early, expensive items late)
- God customers identified by `isGod: true` — pay 1.5x price
- 3 customers per shift, 1 shift = 1 action point

### Inventory Management
- Start with: 2x Health Potion, 1x Soap, 1x Mirror, 2x Flower
- 15 total item types across price tiers (20g - 500g)
- Restock between customers at any time (cost scales by day)
- Items used across Shop (sell), Relationship (gift), and earned from Exploration

### Item Catalog

| Item | Price | Category |
|------|-------|----------|
| Flower | 20g | Gift |
| Wood | 30g | Material |
| Soap | 30g | Consumable |
| Herbs | 40g | Material |
| Health Potion | 50g | Consumable |
| Mana Potion | 50g | Consumable |
| Ore | 60g | Material |
| Basket | 80g | Gift |
| Cloth | 100g | Material |
| Perfume | 120g | Gift |
| Shield | 150g | Weapon |
| Mirror | 150g | Gift |
| Bow | 180g | Weapon |
| Sword | 200g | Weapon |
| Olympian Coin | 500g | Rare |

### Item Sprites
Animated sprite sheets exist for: Health Potion, Mana Potion, Basket, Cloth, Sword, Shield. Others use emoji fallback.

---

## 2. Arena Combat

### Turn-Based System
- Player selects action each turn: Attack, Skill, or Retreat
- Base ATK = 15 (Kane's archer power)
- Bond bonuses from all companions stack additively
- Enemy counter-attacks after every player action
- AI narrates combat actions via `/api/narrate`

### Skills
- Unlocked through Relationship bond thresholds
- Each skill has: name, description, multiplier (1.5x-3.0x), type (physical/magical)
- AI-generated with validation + deterministic fallback per god per level
- 5 fallback skills per god (Leo=physical, Arena=magical, Draco=mixed)

### Enemy Scaling
- HP and ATK scale +5% per day
- Rewards scale +3% per day
- Formula: `stat * (1 + (day-1) * 0.05)`

### Victory Rewards
- Gold from defeated enemy
- +2 IP on any enemy kill
- Defeating Vampire Lord = game win

---

## 3. Exploration System

### Location Unlocking
Locations gate by day number. Each has unique loot tables, monsters, encounter rates, and random events.

### Outcome Resolution (per expedition)
1. Roll for monster encounter (location's encounterRate)
2. If monster: auto-combat using Kane's power (15 + bond ATK bonuses)
   - Monster stats scale like Arena enemies: HP * (1 + (day-1)*0.05)
   - Win: +gold reward, +1 IP, +random item from loot table, 50% chance +1 bond to random god
   - Lose: no penalty, expedition ends
3. If no monster: trigger random event
   - Gold find, item discovery, IP gain, trap (lose gold), or heal
   - Events selected by weighted random from location's event pool
4. Always: +1 random loot item from location table

### Exploration Log
- Last 20 entries persisted in gameStore
- Displays in real-time during expedition
- Preserved across tab navigation

---

## 4. Relationship & Bond System

### Bond Mechanics
- Each god starts with different bond levels (Leo: 5, Arena: 3, Draco: 2)
- Bond level = floor(bond / 10) + 1
- Bond increases from: gifts, exploration kills, events

### Conversation
- Free text chat with gods via AI (`/api/narrate` action: `talk`)
- Bond-level-aware prompts (4 tiers adjust NPC tone from formal to intimate)
- Per-god personality and speech style defined in `npcConfig.ts`

### Gift System
- Player gives items from inventory to a god
- Base bond: +3 for potions, +5 for other items
- Favorite gift bonus: +3 additional
- Favorites per god: Leo=weapons, Arena=elegant items, Draco=rare/natural items
- AI generates thank-you dialogue (`/api/narrate` action: `gift`)

### Skill Threshold System
- Thresholds: [3, 5, 8, 12, 17]
- When bond crosses a threshold, triggers AI skill generation
- Response validated: strip markdown fences, check JSON structure, clamp multiplier 1.5-3.0
- On parse failure or API failure: deterministic fallback skill granted
- Skills added to Kane, usable in Arena combat

---

## 5. Prophecy System

### Daily Prophecy
- Triggers at start of each new day (`showProphecy` flag)
- Calls `/api/prophecy` with full game state (day, gold, bonds, skills, turnsLeft)
- All 3 gods respond in parallel with strategic advice
- Game-state-aware: adjusts urgency language based on remaining days

### Prophecy Sources
- **OpenClaw Gateway**: Multi-agent orchestration (Leo→emily, Arena→ember, Draco→mochi)
- **OpenRouter**: Fallback to Gemini Flash when Gateway unavailable
- **Hardcoded**: Per-god, bond-aware fallback text when both AI providers fail

---

## 6. AI Integration

### Architecture
```
Component → /api/narrate or /api/prophecy
    → Try OpenClaw Gateway (WebSocket, multi-agent)
    → Fallback to OpenRouter (Gemini Flash REST API)
    → Fallback to hardcoded Thai responses
```

### Narrate Actions
| Action | Used By | Purpose |
|--------|---------|---------|
| `generate_skill` | Relationship | Create combat skill on bond threshold |
| `shop_talk` | Shop | Customer greeting dialogue |
| `talk` | Relationship | Free conversation with god |
| `gift` | Relationship | Thank-you reaction to gift |
| combat (attack/defend/heal/fireball) | Arena | Combat narration |
| `exploration_event` | Exploration | Event narration |

### Fallback Coverage
All 6 actions have Thai-language hardcoded fallbacks. Skill generation has 5 unique deterministic skills per god indexed by level.

### Connection Status
`AIStatusBadge` component in header shows current AI source:
- Green (OpenClaw) — multi-agent orchestration active
- Blue (OpenRouter) — REST API fallback active
- Gray (Offline) — using hardcoded responses only

---

## 7. Day Cycle & Win/Lose

### Day Progression
- Max 20 days (configurable via `MAX_TURNS`)
- 3 action points per day (configurable via `MAX_CHOICES_PER_DAY`)
- End-of-day triggers: reset choices, increment day, check win/lose, show prophecy

### Win Condition
- Defeat the Vampire Lord in Arena → `vampireDefeated: true` → game over screen (victory)

### Lose Conditions
- **Time**: Day exceeds 20 without defeating Vampire Lord
- **Bankruptcy**: 0 gold AND 0 items at end of day (unrecoverable state)

### Urgency System
- Warning banner appears when turnsLeft <= 5
- Critical pulsing red when turnsLeft <= 3
- Day counter changes from amber to red
- Prophecy prompts include urgency tier (ยังมีเวลา / เร่งด่วน / วิกฤต)

---

## 8. Save/Load System

### Auto-Save
- Every 30 seconds to localStorage key `gods_arena_autosave`
- Loads automatically on game start

### Manual Save
- 3 save slots in ChampionStatus tab
- localStorage keys: `gods_arena_save_slot_1`, `_2`, `_3`
- Each slot shows: timestamp, day, gold

### Export/Import
- Export: downloads full save data as JSON file
- Import: reads JSON file and loads into game state
- Version: `1.0.0`

### Save Data Structure
Includes: player gold, inventory, companion bonds, unlocked skills, claimed thresholds, day, choicesLeft, interventionPoints, vampireDefeated, gameOver, explorationLog.

### Reset
- Full game reset: clears all saves, resets to initial state
- Tutorial reset: clears tutorial dismissed flag

---

## 9. UI/UX

### Layout
- **Desktop**: Sticky header (title, nav tabs, status bar) + 2-column layout (Phaser game left, side panel right) + bottom save/reset buttons
- **Mobile**: Compact header + single column + fixed bottom tab bar (5 tabs)

### Navigation Tabs
| Tab | Phase | Room Change |
|-----|-------|-------------|
| ร้านค้า | shop | Phaser: shop room |
| อารีน่า | arena | Phaser: arena room |
| สำรวจ | exploration | React only |
| หมู่บ้าน | relationship | Phaser: village room |
| สถานะ | status | React only |

### Phaser Integration
- 384x288px pixel art canvas, arcade physics
- Rooms: shop, arena, village, cave_entrance, cave_inside
- NPC positions mapped to actual background art paths
- Communication via EventBus (EventEmitter)
- React↔Phaser: `phase-change` and `change-room` events

### Tutorial
- First-day overlay explaining all 4 phases and the objective
- Dismissable, persists via localStorage flag
- Can be re-triggered from ChampionStatus tab
