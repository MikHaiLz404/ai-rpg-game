# Gods' Arena - Project Log

**Created:** 2026-03-14
**Status:** In Progress
**Last Updated:** 2026-03-14
**GitHub:** https://github.com/MikHaiLz404/ai-rpg-game

---

## Project Overview

**Game Title:** Gods' Arena - วิหารแห่งเทพ
**Genre:** Shop Management + Turn-Based RPG + Dating Sim
**Tech Stack:** Next.js, Tailwind CSS, React, Zustand

**Concept:** ผู้เล่นเป็นพ่อค้า/โค้ช ที่จัดการร้านและส่งเทพไปสู้ใน Arena

---

## MVP Scope (v1.0)

### 🎯 Core Loop
```
🏪 ขายของ → 💰 ได้เงิน → 🛒 ซื้อ Items → ⚔️ ส่งเทพสู้ → 🔄 วนลูป
```

### ✅ Characters (ตาม Novel)

| ID | ชื่อ | บทบาท |
|----|------|--------|
| minju | มินจู | ผู้เล่น (Player) |
| leo | เลโอ | เทพสงคราม |
| arena | อารีน่า | ราชินี |
| draco | ดราโก้ | มังกร |
| kane | เคน | นักฆ่า |

### ✅ Enemies (MVP)

| ID | ชื่อ |
|----|------|
| slime | สไลม์ |
| goblin | ก็อบลิน |
| skeleton | กระดูก |
| demon | ปีศาจ |
| dragon | มังกร |

### ✅ Items (MVP - 12 ชนิด)

- potion_health, potion_mana
- soap, perfume
- basket, cloth
- flower, mirror
- sword, shield, bow
- olympian_coin

---

## Asset Structure

```
public/
├── images/
│   ├── characters/
│   │   ├── player/minju/{idle, walk, work, happy, sad, shock}
│   │   └── npcs/{leo, arena, draco, kane}/{idle, talk, ...}
│   │
│   ├── enemies/
│   │   └── {slime, goblin, skeleton, demon, dragon}/{idle, attack, damaged}
│   │
│   ├── items/
│   │   └── {potion_health, potion_mana, soap, ...}/{icon, sprite}
│   │
│   ├── backgrounds/
│   │   ├── shop/{interior, exterior}
│   │   ├── arena/{interior, audience}
│   │   ├── exploration/{forest, mountain, cave, village, ruins}
│   │   └── menu/{main, settings, load}
│   │
│   ├── effects/
│   │   ├── combat/{attack, defend, heal, skill, buff, debuff}
│   │   └── ui/{hover, click, transition, notification}
│   │
│   └── ui/
│       ├── icons/{health, mana, attack, gold, ...}
│       ├── buttons/{normal, action}/{default, hover, active, disabled}
│       ├── bars/{health, mana, experience}/{full, half, low, empty}
│       └── badges/{rank, achievement}/...
│
└── audio/
    ├── bgm/{shop, arena, exploration, menu}
    ├── sfx/{combat, ui, items}
    └── ambient/
```

---

## Work Allocation

| Agent | Task | Status |
|-------|------|--------|
| Emily | Game Design | ✅ |
| Mochi | Novel | ✅ |
| Ember | UI/UX | ✅ |
| Clover | Coding MVP | ✅ |

---

## Current Status

### ✅ Done
- [x] Game Design v1.0
- [x] Coding MVP (Shop, Arena, Relationship)
- [x] Novel (25 chapters + Lore)
- [x] UI/UX Components
- [x] Data Structure (JSON, Types, Validation)
- [x] Save/Load System (including kaneStats persistence)
- [x] Editor Tools
- [x] Asset Folders (MVP)
- [x] Integration (Phaser + Next.js)
- [x] Deployment (Vercel)
- [x] Debug System (Toggle Grid/Coords via UI button)
- [x] Divine Orchestrator (Rule-based AI routing)
- [x] Council Simulation (Multi-agent AI interaction)

## Debug Controls
- **UI Button:** "Debug Grid" in top navigation toggles 48px Grid and Player X,Y coordinates.

### 🔄 In Progress
- [ ] Refined Asset Polish (Waiting for P'Jo)

### ⏳ Pending
- [ ] Final Testing

---

## Links

- **GitHub:** https://github.com/MikHaiLz404/ai-rpg-game
- **Novel:** /GitHub/ai-rpg-game/novel/
- **Design:** /GitHub/ai-rpg-game/game-design/
- **UI:** /GitHub/ai-rpg-game/rpg-ui-design/
