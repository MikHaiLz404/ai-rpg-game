# Gods' Arena (วิหารแห่งเทพ) - Game Design Document

**Version:** 2.0
**Last Updated:** 2026-03-25
**Writer:** Team Documentation

---

## 1. Overview

### 1.1 Game Title & Genre

| Field | Details |
|-------|---------|
| **Title** | Gods' Arena (วิหารแห่งเทพ) |
| **Genre** | Shop Management + Turn-Based Combat + Relationship Sim |
| **Platform** | Web (Next.js 14 + Phaser 3) |
| **Target Audience** | Casual gamers who enjoy RPG management and relationship building |

### 1.2 Core Concept

**Gods' Arena** ผสมผสาน 3 แนวเกมเข้าด้วยกัน:

- **Shop Management** — ผู้เล่นเป็นพ่อค้า/โค้ช จัดการร้านค้า ซื้อขายอุปกรณ์ให้เทพ
- **Turn-Based Combat** — ส่งเทพลงสู้ใน Arena แบบ Turn-Based
- **Relationship Sim** — สร้างความสัมพันธ์กับเทพ ปลดล็อก AI-Generated Skills

**Unique Selling Point:** ผู้เล่นไม่ต้องสู้เองโดยตรง แต่ต้อง **สนับสนุนเทพให้ชนะ** ผ่านการจัดการร้าน การเลือกอุปกรณ์ และการสร้างความสัมพันธ์

### 1.3 Win Condition

**ชนะ:** ปราบ Hydra (🐍) ให้ได้ภายใน **20 วัน**

**แพ้:**
- วันที่ 20 ผ่านไปโดยยังไม่ปราบ Hydra → Game Over (darkness wins)
- พ่อค้าล้มละลาย (gold เป็น 0 และต้องจ่ายค่าสต็อก)

---

## 2. Game Loop

### 2.1 Daily Structure

เกมจบลงใน **20 วัน** โดยแต่ละวันประกอบด้วย:

1. **Divine Council (Prophecy)** — เทพทั้ง 3 มาประชุม ให้คำทำนายประจำวัน และอาจมีเหตุการณ์พิเศษ
2. **3 Actions** — ผู้เล่นเลือก 1 ใน 4 Phase ต่อครั้ง (ได้ 3 ครั้งต่อวัน)
3. **End Day** — วันจบ เริ่มวันใหม่

### 2.2 Four Phases

```
[Shop] → [Arena] → [Exploration] → [Relationship] → (loop)
```

แต่ละ Phase ใช้ 1 Action:

| Phase | Icon | Description |
|-------|------|-------------|
| **Shop** | 🏪 | ซื้อ/ขายอุปกรณ์ให้เทพ จัดสต็อกร้าน |
| **Arena** | ⚔️ | เลือกเทพสู้กับศัตรู (Slime, Skeleton, Hydra) |
| **Exploration** | 🗡️ | ส่งเทพออกสำรวจ เจอเหตุการณ์แบบสุ่ม |
| **Relationship** | 💕 | พูดคุย/ให้ของขวัญกับเทพ เพิ่ม Bond |

### 2.3 Rest Day Mechanic

เมื่อใช้ Action ครบ 3 ครั้งแล้ว → วันจบโดยอัตโนมัติ ยังไม่ต้องจ่ายค่าสต็อก

---

## 3. Shop System 🏪

### 3.1 Shop Overview

ร้านค้าเป็นแหล่งหลักของ Gold และ Items ผู้เล่นซื้ออุปกรณ์มาขายให้เทพหรือใช้เองใน Arena

**Shop Stats:**
- 💰 Gold — เงินหลัก
- 📦 Items — อุปกรณ์ที่ซื้อมาขาย

### 3.2 Item Catalog (5 Items Total)

| ID | Name | NameTH | Price | Effect | Type |
|----|------|--------|-------|--------|------|
| weapon_1 | Bronze Sword | ดาบสำริด | 100g | +5 ATK | weapon |
| weapon_2 | Silver Spear | หอกเงิน | 250g | +12 ATK | weapon |
| armor_1 | Leather Armor | เกราะหนัง | 80g | +3 DEF | armor |
| armor_2 | Golden Shield | โล่ทอง | 200g | +8 DEF | armor |
| potion_1 | Health Potion | ยาน้ำแดง | 50g | +30 HP | consumable |

**Notes:**
- ทุก Item ในเกมมีแค่ 5 ชิ้นนี้ — ไม่มี rarity, crafting materials, หรือ accessory
- Items ซื้อได้ไม่จำกัด แต่ค่าสต็อก (restock cost) เพิ่มขึ้นทุกวัน
- ค่าสต็อกคิดจาก: `1.0 + (day - 1) * 0.03` (วัน 1 = 1.0x, วัน 20 = 1.57x)

### 3.3 Shop Flow

1. ดูสินค้าในร้าน
2. ซื้อ Item (จ่าย gold × restock multiplier)
3. ขาย Item ให้เทพระหว่างเล่น
4. End Shift → ใช้ 1 Action

**ไม่มี:** ตั้งราคาเอง, ลูกค้าเลือกซื้อ, reputation, ร้านค้าแข่ง, การ upgrade ร้าน

---

## 4. Arena Combat System ⚔️

### 4.1 Combat Overview

เลือกเทพ 1 ตัวสู้กับศัตรูแบบ Turn-Based ผู้เล่นไม่ได้ควบคุมโดยตรง แต่สามารถใช้ **Intervention Points (IP)** ช่วยได้

### 4.2 Enemies

| ID | Name | NameTH | HP | ATK | DEF |
|----|------|--------|-----|-----|-----|
| minotaur | Minotaur | ไมโนเทาร์ | 80 | 15 | 5 |
| hydra | Hydra | ไฮดรา | 100 | 20 | 3 |
| boss | Hydra | ไฮดรา | 250 | 35 | 8 |

**Hydra** เป็น Final Boss — เจอได้เมื่อพร้อม (ไม่ได้บังคับต้องเจอวันที่ 20)

### 4.3 Arena Enemies Pool

นอกจาก Minotaur/Hydra ยังมี:

| Name | Emoji | Base HP | Base ATK | Base DEF | Gold | XP |
|------|-------|---------|----------|----------|------|-----|
| Slime | 💧 | 50 | 8 | 1 | 30 | 5 |
| Skeleton | 💀 | 80 | 12 | 3 | 60 | 12 |
| Hydra | 🐍 | 250 | 35 | 8 | 500 | 100 |

### 4.4 Turn-Based Flow

1. **Select God** — เลือกเทพ 1 ตัวจาก 3 ตัว (Leo, Arena, Draco)
2. **Select Enemy** — เลือกศัตรู
3. **Combat** — Turn-Based สลับกันโจมตี
4. **Use IP** — ใช้ Intervention Points ช่วยได้ทุกเทิร์น
5. **Victory/Defeat** — ชนะได้ Gold + XP

### 4.5 Damage Formula

```
damage = max(1, attacker.ATK - defender.DEF / 2)
```

### 4.6 Intervention Points (IP)

- **Starting IP:** 10 คะแนน (เริ่มต้นเกม), 20 คะแนน (หลัง load)
- **ได้มาจาก:** Daily events, Bond Level
- **ใช้งาน:** ช่วยเทพระหว่าง Combat

**ไม่มี:** MP/Energy, Status Effects (Burn, Freeze, Poison, Sleep, Stun), Turn Order Manipulation (Cycle, Swap, Skip, Delay, Freeze)

---

## 5. Companions (เทพ) 💕

### 5.1 Three Gods

| God | Emoji | Theme | Bond Rate | Skill Thresholds |
|-----|-------|-------|-----------|-----------------|
| **Leo** | ⚔️ | War God — ดุดัน ตรงไปตรงมา | 1.5 (medium) | [3, 5, 8, 12, 16] |
| **Arena** | 👑 | Queen — สง่างาม อ่อนโยน | 1.2 (hard) | [4, 7, 11, 15, 20] |
| **Draco** | 🐉 | Ancient Dragon — เฒ่าแก่ ปราดเปรื่อง | 2.0 (easy) | [2, 3, 5, 8, 12] |

### 5.2 Bond System

**Bond** คือค่าความสัมพันธ์กับเทพแต่ละตัว

| Action | Effect |
|--------|--------|
| Conversation (Talk) | เพิ่ม Bond ตาม Bond Rate |
| Gift | เพิ่ม Bond ตาม Bond Rate |
| Win Arena together | เพิ่ม Bond |
| Lose Arena | ลด Bond |

**Bond Thresholds** ปลดล็อก AI-Generated Skills (ดูด้านล่าง)

### 5.3 AI-Generated Skills (Bond Skills)

เมื่อ Bond ถึง Threshold เทพจะสร้าง Skill ใหม่ผ่าน AI

**Skill Generation:**
- AI prompt ส่งไปที่ `/api/narrate` (action: `generate_skill`)
- รองรับ 5 thresholds ต่อเทพ → 5 skills ต่อเทพ
- มี **Deterministic Fallback Skills** หาก AI ไม่ตอบ (ภาษาไทย)

**Fallback Skills per God:**

| Level | Leo (Physical) | Arena (Magical) | Draco (Mixed) |
|-------|---------------|-----------------|---------------|
| 1 | Divine Strike | Holy Light | Dragon Claw |
| 2 | Battle Cry | Royal Decree | Ancient Wisdom |
| 3 | War God Blessing | Queen's Shield | Flame Breath |
| 4 | Berserker Rage | Divine Judgment | Time Slow |
| 5 | Ultimate War | Final Crown | Ragnarok |

### 5.4 God Personalities

| God | Personality | Speech Style |
|-----|-------------|--------------|
| **Leo** | ดุดัน ท้าทาย เคารพคนกล้า | พูดสั้น ห้วน ใช้คำสั่ง |
| **Arena** | สง่างาม ลึกลับ พูดเป็นกวี | อ่อนโยน มีอุปมาอุปไมย |
| **Draco** | เฒ่าแก่ ปราดเปรื่อง พูดน้อย | ช้า สงบ อ้างอิงอดีต |

### 5.5 Chat Limits

แต่ละเทพมีจำนวน conversation turn ต่อครั้งที่มาหา:
- **Leo:** 3 turns (direct, gets to the point)
- **Arena:** 2 turns (busy queen, every word must count)
- **Draco:** 4 turns (patient elder, enjoys conversation)

---

## 6. Exploration System 🗡️

### 6.1 Exploration Flow

1. เลือก Exploration → ส่งเทพออกไป
2. เจอเหตุการณ์แบบสุ่ม (enemy, treasure, mystery, rest, boss)
3. จัดการเหตุการณ์ → ได้รางวัล (gold, item, IP boost)

**ไม่มี:** หลายโซน (Dark Forest, Lava Cave, etc.), Monster types หลายแบบ, Rival Shops, Stamina/Energy system

### 6.2 Exploration Events

Event สุ่มที่อาจเจอ:
- เจอศัตรู (combat)
- หาเจอสมบัติ (gold/IP boost)
- เจอเหตุการณ์ลึกลับ
- พักผ่อน (ฟื้น HP)

---

## 7. Relationship (Divine Council) 💕

### 7.1 Daily Council

ทุกวันเริ่มต้นด้วย Divine Council — เทพทั้ง 3 มาประชุม:

1. แต่ละเทพให้คำทำนาย (Prophecy) ตามลำดับ
2. เทพแต่ละตัวเห็นสิ่งที่เทพก่อนหน้าพูด → สร้างบทสนทนา
3. มีเหตุการณ์ประจำวัน (daily event) — gold, IP, item, หรือ bond boost
4. ผู้เล่น claim รางวัล event

### 7.2 Relationship Actions

| Action | Description |
|--------|-------------|
| **Talk** | พูดคุยกับเทพ (ใช้ chat limit ต่อครั้ง) |
| **Gift** | ให้ของขวัญเพิ่ม Bond |

### 7.3 Daily Events

Event ที่ AI สร้างตามสถานะเกม:
- Low gold → gift event
- Urgent day → IP boost
- Low bonds → god blessing

---

## 8. AI Integration 🤖

### 8.1 AI Providers

1. **OpenClaw Gateway** (primary) — WebSocket connection, device-keypair auth
2. **OpenRouter** (fallback) — REST API fallback

### 8.2 AI Actions

| Action | Endpoint | Description |
|--------|----------|-------------|
| `generate_skill` | `/api/narrate` | AI สร้าง Bond Skill ใหม่ |
| `shop_talk` | `/api/narrate` | บทสนทนาในร้าน |
| `talk` | `/api/narrate` | บทสนทนาทั่วไป |
| `gift` | `/api/narrate` | บทสนทนามอบของขวัญ |
| `exploration_event` | `/api/narrate` | เล่าเหตุการณ์สำรวจ |
| Prophecy | `/api/prophecy` | คำทำนายประจำวัน |

### 8.3 AI Status Badge

UI แสดงแหล่ง AI ปัจจุบัน: **OpenClaw / OpenRouter / Offline**

---

## 9. Save System 💾

- **Auto-save:** ทุก 30 วินาทีไป localStorage
- **Manual saves:** 3 slots
- **Export/Import:** JSON format
- **Save version:** 1.0.0

---

## 10. UI/UX

### 10.1 Visual Style

- **Art:** Pixel art + modern UI (Phaser 3 + React)
- **Game render:** 384x288px, pixel art mode, arcade physics
- **Theme:** ไทย (วัด, วรรณกรรม) + Fantasy
- **Color:** Purple-blue primary (#6B5B95), coral accent (#FF6F61)

### 10.2 Screens

| Screen | Description |
|--------|-------------|
| **Main Menu** | Continue / New Game / Settings |
| **Divine Council** | Fullscreen วงเทพประชุม, ให้คำทำนาย |
| **Shop** | Grid สินค้า, ซื้อ/ขาย items |
| **Arena** | Turn-based combat, IP usage |
| **Exploration** | Event discovery |
| **Relationship** | บทสนทนากับเทพ |

---

## 11. What Was Removed ❌

This document reflects the **actual implemented** game. The following features exist in older designs but are NOT in the codebase:

- **7 item categories with rarity tiers** — only 5 items exist
- **Shop upgrades** (Storage, Display, Auto-Buyer, Marketing, etc.)
- **Customer types** (Good Gods, Evil Gods, Mortals, Travelers)
- **Rival shops and competition**
- **Multiple exploration zones** (Dark Forest, Lava Cave, etc.)
- **Monster types beyond Minotaur/Hydra**
- **Status effects** (Burn, Freeze, Poison, Sleep, Stun)
- **Meta-progression / seasons / permadeath**
- **Greek gods** (Zeus, Athena, Ares) — unused code
- **Turn order manipulation** (Cycle, Swap, Skip, Delay, Focus, Freeze)
- **MP/Energy system**
- **Reputation system**
- **Quest system**
- **Pricing system** (player doesn't set prices)
- **Auto-save to cloud / multiplayer**

---

*Game: Gods' Arena - วิหารแห่งเทพ*
*Implementation as of 2026-03-25*
