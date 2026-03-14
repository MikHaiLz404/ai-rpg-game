# 🏪 Gods Arena - Game Design Document

**Version:** 1.0  
**Last Updated:** 2026-03-14  
**Writer:** Emily 🌸

---

## 1. Overview

### 1.1 Game Title & Genre

| Field | Details |
|-------|---------|
| **Title** | Gods Arena - วิหารแห่งเทพ |
| **Genre** | Shop Management + Turn-Based RPG + Dating Sim + Roguelite |
| **Platform** | Web (Next.js) |
| **Target Audience** | Casual gamers who enjoy management + RPG elements |

### 1.2 Core Concept

**Gods Arena** ผสมผสาน 3 แนวเกมเข้าด้วยกันอย่างลงตัว:

- 🏪 **Shop Management** - ผู้เล่นเป็นพ่อค้า/โค้ช จัดการร้านค้า ขายของให้เทพ
- ⚔️ **Turn-Based RPG** - ส่งเทพลงสู้ใน Arena แบบ Turn-Based
- 💕 **Dating Sim** - สร้างความสัมพันธ์กับเทพ ปลดล็อก AI Skills

**Unique Selling Point:** ผู้เล่นไม่ต้องสู้เองโดยตรง แต่ต้อง **สนับสนุนเทพให้ชนะ** ผ่านการจัดการร้าน การเลือกอุปกรณ์ และการสร้างความสัมพันธ์

---

## 2. Game Phases (Loop)

เกมจะวนลูปผ่าน 4 Phase หลัก:

[Shop Phase] → [Arena Phase] → [Exploration Phase] → [Relationship Phase] → [Loop]

### 2.1 Shop Phase 🏪

**ระยะเวลา:** 2-5 นาทีต่อรอบ

**การทำงาน:**
1. **รับของจากเทพ/ลูกค้า** - เทพที่มาซื้อของจะทิ้ง Material ไว้บ้าง
2. **จัดสต็อกสินค้า** - วางของในร้านให้เหมาะสม
3. **ตั้งราคาสินค้า** - สมดุลระหว่างกำไรกับความเร็วในการขาย
4. **ขายของ** - รอเทพและลูกค้ามาซื้อ
5. **ซื้อ buffs/potions** - เตรียมไว้สำหรับ Arena

**เงื่อนไขออกจาก Phase:** 
- กดปุ่ม เปิด Arena เมื่อพร้อม
- หรือรอจนครบเวลา Phase

### 2.2 Arena Phase ⚔️

**ระยะเวลา:** 5-10 นาทีต่อรอบ

**การทำงาน:**
1. **เลือกเทพ** - เลือก 1-3 เทพลงสู้
2. **เลือก Buffs/Items** - ติดตั้งอุปกรณ์ที่ซื้อจาก Shop
3. **ดู Combat** - Turn-Based มีการตัดสินใจระหว่างเทพ
4. **สนับสนุนระหว่าง Combat** - ใช้แต้มหรือ Items ช่วยเทพ
5. **รับรางวัล** - ชนะได้ Gold, Materials, XP

### 2.3 Exploration Phase 🗡️ (Optional)

**ระยะเวลา:** 3-8 นาทีต่อรอบ

**การทำงาน:**
1. **เลือกพื้นที่** - ป่า, ภูเขา, ถ้ำ, เมือง, etc.
2. **เดินทาง** - เจอ Event แบบสุ่ม
3. **ต่อสู้กับ Monster** - Auto-battle หรือ Semi-auto
4. **เจอ Rival Shop** - แข่งขายของ Mini-game
5. **กลับร้าน** - นำ Item ที่ได้มาขาย

### 2.4 Relationship Phase 💕

**ระยะเวลา:** 2-5 นาทีต่อรอบ (Auto + Manual)

**การทำงาน:**
1. **ดูความสัมพันธ์** - แสดง Bond Level ของแต่ละเทพ
2. **Conversation** - พูดคุยกับเทพ (Daily/Weekly)
3. **Gift** - ให้ของขวัญเพิ่ม Bond
4. **Quests** - ทำภารกิจให้เทพ
5. **AI Skills** - ปลดล็อก Skill ใหม่จาก Bond

---

## 3. Arena Combat System ⚔️

### 3.1 Combat Overview

ระบบ Combat เป็นแบบ **Turn-Based Tactical** ผู้เล่นไม่ได้ควบคุมเทพโดยตรง แต่ต้อง:
- เลือกเทพที่จะลงสู้
- ติดตั้ง Buffs/Items ก่อนเริ่ม
- สนับสนุนระหว่าง Combat ด้วย Point หรือ Special Actions

### 3.2 Turn Timeline

Turn Timeline ประกอบด้วยขั้นตอนดังนี้:

| Step | Description | Player Control |
|------|-------------|----------------|
| 1. Speed Check | คำนวณความเร็วของทุก Unit ใน Battle | ไม่มี |
| 2. Turn Order | จัดลำดับการเล่นตามความเร็ว | **Manipulate** (Cycle, Swap, etc.) |
| 3. Unit Action | Unit ปัจจุบันเลือก Action | เลือกให้ AI หรือ Manual |
| 4. Apply Effects | คำนวณ Damage/Heal/Status | ไม่มี |
| 5. Check Win/Lose | ถ้าฝ่ายใดพลาดหมด = แพ้/ชนะ | ไม่มี |

### 3.3 Combat Actions

**Actions ที่เทพสามารถทำได้:**

| Action | Icon | Effect | Cooldown |
|--------|------|--------|----------|
| Attack | 🗡️ | สร้าง Damage ตาม ATK | 0 |
| Defend | 🛡️ | ลด Damage 50% + Charge Energy | 0 |
| Skill | 🌟 | ใช้ Special Skill | 1-3 |
| Item | 🧪 | ใช้ Potion/Item | 0 |
| Swap | 🔄 | สลับเทพกับ Bench | 1 |
| Retreat | 🏃 | ถอยจาก Battle (Lose) | 0 |

### 3.4 Manipulation System

**Manipulations** คือทักษะพิเศษที่ผู้เล่นใช้ควบคุม Turn Order ระหว่าง Combat

| Manipulation | Icon | Effect | Cost (IP) |
|--------------|------|--------|----------|
| Cycle | 🔁 | หมุน Turn Order 1 รอบ | 1 IP |
| Swap | ⇄ | สลับตำแหน่ง 2 Unit | 1 IP |
| Skip | ⏭️ | ข้าม Turn ของ Unit นั้น | 2 IP |
| Delay | ⏱️ | ทำให้ Unit มาทีหลัง | 1 IP |
| Focus | 🎯 | เพิ่ม Critical Rate ของ Unit | 1 IP |
| Freeze | 🛑 | หยุด Unit 1 Turn | 3 IP |

**Intervention Points (IP):** 
- ได้มาจาก: Shop, Bond Level, Passive Skills
- ใช้ตอน: ก่อน Unit ทำ Action
- Limit: 3 IP ต่อ Battle

### 3.5 Damage Formula



### 3.6 Status Effects

| Status | Icon | Duration | Effect |
|--------|------|----------|--------|
| Burn | 🔥 | 3 Turns | -10% ATK, 5 Damage/turn |
| Freeze | ❄️ | 2 Turns | ไม่สามารถ Action ได้ |
| Shock | ⚡ | 2 Turns | -20% Speed |
| Poison | ☠️ | 4 Turns | -5% HP Max/turn |
| Sleep | 😴 | 2 Turns | ไม่สามารถ Action ได้ |
| Stun | 💫 | 1 Turn | ไม่สามารถ Action ได้ |

---

## 4. Shop System 🏪

### 4.1 Shop Overview

ร้านค้าเป็นแหล่งหลักของ Income, Items, และ Resources ผู้เล่นต้องจัดการร้านให้ดีเพื่อเตรียมตัวสำหรับ Arena

**Shop Stats:**
- 💰 Gold - เงินหลัก
- ⭐ Reputation - ความนิยมของร้าน
- 📦 Storage - พื้นที่เก็บของ (Upgrade ได้)

### 4.2 Item Categories

| Category | Icon | Examples | Usage |
|----------|------|----------|-------|
| Weapons | ⚔️ | ไม้กางสน, ดาบเหล็ก, กระบองเทพ | เพิ่ม ATK ให้เทพ |
| Armors | 🛡️ | เสื้อเกราะ, โล่, ถุงมือ | เพิ่ม DEF ให้เทพ |
| Potions | 🧪 | HP Potion, MP Potion, Antidote | ใช้ระหว่าง Combat |
| Materials | 🪵 | ไม้, เหล็ก, หนัง, ผงเวทย์ | Crafting, Selling |
| Rare Items | 💎 | อัญมณี, ขนนางฟ้า, น้ำตาเทพ | ขายได้แพง, Crafting |
| Gifts | 🎁 | ดอกไม้, ของวิเศษ, อาหาร | เพิ่ม Bond |
| Accessories | 📿 | แหวน, สร้อย, ต่างหู | Passive Skills |

### 4.3 Item Rarity

| Rarity | Color | Drop Rate | Sell Price |
|--------|-------|-----------|------------|
| Common | เทา | 50% | 1x |
| Uncommon | น้ำเงิน | 30% | 2x |
| Rare | ม่วง | 15% | 5x |
| Epic | ทอง | 4% | 15x |
| Legendary | แดง | 1% | 50x |

### 4.4 Pricing System

**การตั้งราคา:**



| Markup | Effect | Risk |
|--------|--------|------|
| 0-30% | ขายเร็ว, กำไรน้อย | ต่ำ |
| 31-60% | สมดุล | ปานกลาง |
| 61-100% | ขายช้า, กำไรสูง | สูง |
| 100%+ | ขายยากมาก | สูงมาก |

**Tips:**
- ตรวจสอบ Demand ของ Item แต่ละวัน
- Event พิเศษ (เทศกาล) ทำให้ Demand สูงขึ้น
- Rival Shop แข่งขันทำให้ต้องลดราคา

### 4.5 Customer System

**Customer Types:**

| Customer | Frequency | Buying Style | Tips |
|----------|-----------|---------------|------|
| Good Gods | บ่อย | ซื้อของดี, ไม่ต่อรอง | หา Item คุณภาพดี |
| Evil Gods | บางครั้ง | ต่อรอง, ซื้อเร็ว | ตั้งราคากลาง |
| Mortals | บ่อยมาก | ต่อรอง, ซื้อถูก | ของถูกขายเร็ว |
| Travelers | หายาก | ซื้อ Rare Item | เก็บ Rare ไว้ |

**Customer Satisfaction:**
- ราคาเหมาะสม → +Reputation
- มีของที่ต้องการ → +Reputation  
- ไม่มีของ → -Reputation
- Reputation สูง → ลูกค้ามาบ่อยขึ้น, ซื้อมากขึ้น

### 4.6 Shop Upgrades

| Upgrade | Cost | Effect |
|---------|------|--------|
| Storage +10 | 500 Gold | เก็บของได้มากขึ้น |
| Display Slots +5 | 800 Gold | วางของได้มากขึ้น |
| Auto-Buyer | 2000 Gold | ซื้อของอัตโนมัติ |
| Marketing | 1500 Gold | ลูกค้ามาบ่อยขึ้น |
| Appraisal | 1000 Gold | เห็น Item Value จริง |
| Showcase | 3000 Gold | ดึง Rare Customer |

### 4.7 Daily Shop Events

| Event | Description |
|-------|-------------|
| Festival | ลูกค้ามากขึ้น 2 เท่า |
| Shortage | บาง Item ขาดตลาด ราคาสูง |
| Rival Visit | Rival Shop มาแข่งขัน |
| Bulk Order | ต้องขาย Item จำนวนมาก |
| Rare Customer | มี Rare Customer มาซื้อ |
| Lucky Day | มีโอกาสได้ Rare Item ฟรี |

---

## 5. Relationship System 💕

### 5.1 Bond System

**Bond** คือค่าความสัมพันธ์ระหว่างผู้เล่นกับเทพแต่ละตัว

**Bond Level & Requirements:**

| Level | Name | Bond Points | Bonus |
|-------|------|-------------|-------|
| 1 | Stranger | 0 | - |
| 2 | Acquaintance | 50 | +5% Stats |
| 3 | Friend | 150 | +10% Stats |
| 4 | Close Friend | 300 | +15% Stats + Skill 1 |
| 5 | Ally | 500 | +20% Stats |
| 6 | Trusted | 750 | +25% Stats + Skill 2 |
| 7 | Confidant | 1050 | +30% Stats |
| 8 | Soulmate | 1400 | +35% Stats + Skill 3 |
| 9 | Divine Bond | 1800 | +40% Stats |
| 10 | Mythic | 2200 | +50% Stats + Ultimate Skill |

### 5.2 Increasing Bond

| Action | Bond Points | Cooldown |
|--------|-------------|----------|
| Conversation | +10~30 | Daily |
| Gift (Common) | +5~10 | Daily |
| Gift (Rare) | +20~40 | Weekly |
| Date (Restaurant) | +30~50 | Weekly |
| Win Arena Together | +20 | Each Battle |
| Complete Quest | +15~50 | Per Quest |
| Reject/Fight | -10~-30 | - |

### 5.3 Bond Skills (AI-Generated)

เมื่อถึง Bond Level ที่กำหนด เทพจะสร้าง **Bond Skill** ใหม่ๆ ผ่าน AI

**Skill Generation:**



**Example Bond Skills:**

| Level | Skill Name | Effect |
|-------|------------|--------|
| 4 | Divine Blessing | เมื่อ HP ต่ำกว่า 30% เพิ่ม ATK 20% |
| 6 | Heart Shield | ดูด HP จาก Damage 10% |
| 8 | Cosmic Strike | Ultimate ที่รวม Power ของทุกเทพ |
| 10 | Ultimate Bond | เรียกเทพตัวอื่นมาช่วย 1 ครั้ง |

### 5.4 God Personalities

เทพแต่ละตัวมี Personality ที่ต่างกัน ส่งผลต่อ:
- Dialogue ที่พูด
- ของขวัญที่ชอบ
- พฤติกรรมใน Arena
- Skill ที่สร้าง

| Personality | Likes | Dislikes | Behavior |
|-------------|-------|----------|----------|
| Pure | ความซื่อสัตย์, ของดี | การโกง, ของถูก | สู้อย่างยุติธรรม |
| Chaotic | ความสนุก, ความเสี่ยง | กฎ, ความจำเจ | โจมตีกะทันหัน |
| Smart | กลยุทธ์, ของหายาก | ความโง่, ของธรรมดา | วางแผนรอบคอบ |
| Cool | เกียรติยศ, ความเคารพ | การดูถูก, ของมูลค่าต่ำ | สู้อย่างภาคภูมิใจ |
| Sweet | ความเอาใจใส่, ของน่ารัก | การทิ้ง, ความเหงา | ช่วยเหลือเสมอ |

### 5.5 Rival Relationships

| NPC | Type | Effect |
|-----|------|--------|
| Rival Shop Owner | แข่งขัน | -Reputation ถ้าแข่งแพ้ |
| Mentor | พี่เลี้ยง | +Stats ถ้าทำ Mission |
| Arena Master | ผู้จัด | ให้โบนัสถ้าชนะติดต่อกัน |
| Lore Keeper | เพื่อน | เล่าเรื่อง + ให้ Quest |

---

## 6. Exploration System 🗡️

### 6.1 Exploration Overview

Exploration เป็นทางเลือกในการหา Item, Gold, และ Materials ผ่านการเดินทางในโลกเกม

**แตกต่างจาก Arena:**
- Arena = 1v1/Team Battle
- Exploration = Monster Hunting + Event Discovery

### 6.2 Map & Locations

| Location | Difficulty | Enemies | Resources |
|----------|------------|---------|-----------|
| Dark Forest | ⭐ | Wolf, Slime, Goblin | 🪵 Wood, 🧪 Herb |
| Misty Mountain | ⭐⭐ | Orc, Bear, Eagle | 🪨 Stone, 💎 Crystal |
| Lava Cave | ⭐⭐⭐ | Fire Elemental, Golem | 🔥 Ember, ⚔️ Ore |
| Ancient Ruins | ⭐⭐⭐⭐ | Skeleton, Ghost, Lich | 📜 Ancient Scroll, 💎 Gem |
| Abyssal Sea | ⭐⭐⭐⭐⭐ | Sea Monster, Kraken | 🔮 Pearl, 🗝️ Rare Key |

### 6.3 Monster System

**Monster Types:**

| Monster | Element | HP | ATK | DEF | Drops |
|---------|---------|-----|-----|-----|-------|
| 🐺 Wolf | Physical | 50 | 15 | 5 | 🪵 Wood, 🦴 Bone |
| 🦠 Slime | Water | 30 | 8 | 10 | 🧪 Gel, 💧 Water |
| 👺 Goblin | Physical | 45 | 12 | 3 | 🪙 Coin, 🍖 Meat |
| 🐻 Bear | Physical | 100 | 20 | 15 | 🦴 Bone, 🧸 Fur |
| 🔥 Fire Elemental | Fire | 80 | 25 | 8 | 🔥 Ember, 💎 Fire Gem |
| 💀 Skeleton | Dark | 60 | 18 | 5 | 🦴 Bone, ⚔️ Skull |
| 👻 Ghost | Dark | 40 | 22 | 2 | 🌙 Essence, 📜 Scroll |
| 🐙 Kraken | Water | 200 | 35 | 20 | 🔮 Pearl, 🕸️ Tentacle |

**Monster Behavior:**
- **Aggressive** - โจมตีทันทีเมื่อเห็น
- **Passive** - หนีเมื่อถูกโจมตี
- **Sneaky** - ซุ่มโจมตีจากหลัง
- **Boss** - มี HP เยอะ, Skill พิเศษ

### 6.4 Combat in Exploration

**ระบบ Combat แบบ Auto/Semi-Auto:**

| Mode | Control | Description |
|------|---------|-------------|
| 🤖 Auto | None | เทพสู้เองอัตโนมัติ |
| 👆 Semi-Auto | Skills Only | เลือก Skill ที่จะใช้ |
| 🎮 Manual | Full | ควบคุมเองทุกอย่าง |

**ความแตกต่างจาก Arena:**
- ไม่มี Manipulation
- ใช้ Team อัตโนมัติ
- ได้ Item จากการฆ่า Monster
- ใช้ Stamina ต่อ Battle

### 6.5 Rival Shops

Rival Shops เป็นร้านค้าแข่งที่ผู้เล่นต้องแข่งขัน

**Rival Shop Types:**

| Rival | Specialty | Difficulty |
|-------|-----------|------------|
| 🏪 Merchant Joe | ของถูก, ขายเร็ว | ง่าย |
| 💎 Gem Lord | ของหายาก, ราคาสูง | ปานกลาง |
| 🧪 Alchemist | Potions, Buffs | ยาก |
| ⚔️ Weapon Master | อาวุธ, ของแรง | ยากมาก |

**Rival Competition:**
1. ทั้งคู่ตั้งราคาของชุดเดียวกัน
2. ลูกค้าเลือกซื้อจากร้านที่ราคาดีกว่า/มีชื่อเสียงกว่า
3. ชนะ = Reputation +, Item, Gold
4. แพ้ = Reputation -, ลูกค้าหาย

**Tips:**
- สำรวจ Rival ก่อนแข่ง
- หา Item หายากที่ Rival ไม่มี
- ใช้ Marketing เพิ่มชื่อเสียง

### 6.6 Exploration Events

| Event | Description | Reward |
|-------|-------------|--------|
| 🗝️ Hidden Chest | หา宝箱ซ่อน | Random Item |
| 📜 Ancient Scroll | อ่านคัมภีร์ | Skill, Lore |
| 🏛️ Ruins Discovery | ค้นพบซากปรักหักพัง | Rare Item, Gold |
| 🌧️ Weather Effect | อิทธิพลของอากาศ | Buff/Debuff |
| 👤 Stranger Encounter | เจอ NPC พิเศษ | Quest, Gift |
| ⚡ Treasure Room | ห้องสมบัติ | Boss Battle → Rare |

---

## 7. Roguelite Progression 🔄

### 7.1 Run-Based Structure

**แต่ละ Run = 1 Season**

| Phase | Duration | Description |
|-------|----------|-------------|
| 🏪 Shop Phase | หลายรอบ | จัดการร้าน |
| ⚔️ Arena Season | 5-10 Matches | แข่งชนะเทพ |
| 🏆 Final Battle | 1 Match | vs Boss |
| 📊 Season End | - | สรุปผล, เริ่มใหม่ |

### 7.2 Permadeath & Reset

**เมื่อ Season จบ (ชนะ/แพ้):**

| Condition | What Happens |
|-----------|--------------|
| 🏆 Win Season | เริ่ม Season ใหม่, เก็บ Unlocks |
| 💀 Lose (All Gods Die) | Hard Reset, เก็บบาง Unlocks |
| 🏳️ Surrender | Soft Reset, เก็บมากกว่า Lose |

### 7.3 Permanent Unlocks

| Category | Unlock Method | Effect |
|----------|---------------|--------|
| 🗡️ New Gods | Win Season | เล่นได้เพิ่ม |
| 📜 Skills | Bond Level 10 | Skill ใหม่ |
| 🏪 Items | Find in Exploration | ขาย/ใช้ได้ |
| 🎁 Gifts | Complete Quest | ให้เทพได้ |
| 🏆 Titles | Win Season | +Permanent Buffs |
| 💰 Starting Gold | Win more | เริ่มต้นมากขึ้น |

### 7.4 Meta-Progression

| Progression | Description |
|-------------|-------------|
| 🏆 Win Streak | ชนะติดต่อกัน = โบนัส |
| 📜 Goddex | สะสมเทพ = เปิดทางเลือก |
| 💎 Collection | สะสม Item = Passive Buffs |
| 🎖️ Achievements | ทำ Mission = Permanent Rewards |

### 7.5 Difficulty Scaling

| Season | Enemy Stats | Unlocks | Challenge |
|--------|-------------|---------|-----------|
| 1 | 100% | Basic | Tutorial |
| 2 | 115% | +1 God | Easy |
| 3 | 130% | +Items | Normal |
| 4 | 150% | +Skills | Hard |
| 5+ | 175%+ | All | Very Hard |

---

## 8. Enemies & Factions 👹

### 8.1 Enemy Factions

| Faction | Symbol | Arena? | Exploration? |
|---------|--------|--------|--------------|
| 😈 Evil Gods | 🔥 | ✅ ใช่ | ❌ ไม่ |
| 👹 Monsters | 🌲 | ❌ ไม่ | ✅ ใช่ |
| 🏪 Rival Shops | 💰 | ❌ ไม่ | ✅ ใช่ |

### 8.2 Evil Gods (Arena Bosses)

| God | Element | Arena Role | Difficulty |
|-----|---------|------------|------------|
| 😈 Malos | Dark | Attacker | ⭐⭐ |
| ❄️ Cryos | Ice | Controller | ⭐⭐⭐ |
| ⚡ Zeus | Lightning | Balancer | ⭐⭐⭐⭐ |
| 🌑 Nyx | Shadow | Assassin | ⭐⭐⭐⭐⭐ |
| 👿 Hades | Death | Boss | ⭐⭐⭐⭐⭐⭐ |

### 8.3 Monster Types

- **Beast** - Wolf, Bear, Lion
- **Undead** - Skeleton, Zombie, Ghost
- **Elemental** - Fire, Water, Earth, Wind
- **Demon** - Imp, Succubus, Demon Lord
- **Dragon** - Wyvern, Dragon, Elder Dragon

---

## 9. UI/UX Design 🎨

### 9.1 Overall Visual Style

**Art Style:** Pixel Art + Modern UI Elements

**Theme:** 
- ผสมผสานความเป็นไทย (วัด, วรรณกรรม) กับ Fantasy
- สีสันสดใสแต่ไม่เหมือนเด็ก
- มี Animation นุ่มๆ ให้รู้สึกมีชีวิต

### 9.2 Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Primary | ฟ้าอมม่วง | #6B5B95 |
| Secondary | ทองอ่อน | #F7CAC9 |
| Accent | ส้ม | #FF6F61 |
| Background | เทาเข้ม | #2C3E50 |
| Text | ขาว/เทา | #ECF0F1 |
| Success | เขียว | #2ECC71 |
| Warning | เหลือง | #F1C40F |
| Danger | แดง | #E74C3C |

### 9.3 Screen Layouts

#### 9.3.1 Main Menu
- Logo + Title ตรงกลาง
- ปุ่มเมนูหลัก (Continue, New Game, Settings)
- เมนูรอง (Goddex, Collection, Credits)
- Background: Animated Scene ของ Arena

#### 9.3.2 Shop Screen
- **Header:** Gold 💰, Reputation ⭐, Storage 📦, [Upgrades]
- **Main Area:** Grid ของ Items พร้อมราคา, Icon, จำนวน
- **Sidebar:** Customer Queue แสดงลูกค้าที่รอ
- **Footer:** Actions [Buy] [Set Price] [Customers] [Inventory]

#### 9.3.3 Arena Screen
- **Top Bar:** Turn Counter, Intervention Points (IP), Pause/Settings
- **Center:** Battle Field แบ่งฝ่าย Player (ซ้าย) vs Enemy (ขวา)
- **Character Display:** God Sprite, HP Bar, MP Bar, Status Icons
- **Turn Order Bar:** แสดงลำดับการเล่น
- **Bottom:** Action Buttons [Attack] [Skill] [Item] [Manipulate]
- **Manipulation Panel:** [Cycle] [Swap] [Skip] [Delay] [Focus] [Freeze]

#### 9.3.4 Relationship Screen
- **Center:** God Sprite + Animation
- **Dialog Box:** Conversation
- **Stats:** Bond Level, Personality
- **Actions:** Talk, Gift, Quest, Skills

#### 9.3.5 Exploration Map
- Interactive Map ที่เลือกได้
- Locations แสดง Difficulty
- Current Position Indicator
- Resources/Enemies Preview

### 9.4 UI Components

| Component | Description |
|-----------|-------------|
| 💰 Gold Display | แสดงเงินปัจจุบัน |
| ⭐ Reputation | ความนิยมของร้าน |
| 📦 Storage | พื้นที่เก็บของ |
| ❤️ HP Bar | เลือดเทพ |
| 💎 MP Bar | มานาเทพ |
| ⚡ Energy | พลังงานสำหรับ Skills |
| 🔄 Turn Order | ลำดับการเล่น |
| 🎯 Intervention Points | คะแนน Manipulate |

### 9.5 Animations

- **Attack:** การโจมตีมี Effect และเสียง
- **Skill:** Animation พิเศษตามธาตุ
- **Damage:** ตัวเลขลอยขึ้น + Shake
- **Heal:** แสงสีเขียวล้อมรอบ
- **Bond:** หัวใจลอยขึ้นเมื่อเพิ่ม Bond
- **Level Up:** สว่างจ้า + เสียงตื่นเต้น

---

## 10. Win Conditions

- 🏪 สร้างร้านให้ดังที่สุด
- ⚔️ เอาชนะทุก Evil God
- 💕 Max Bond กับเทพทุกตัว
- 🏆 ชนะ Season ทั้งหมด
- 📜 ปลดล็อกทุกอย่างใน Goddex

---

*Document created by Emily 🌸*
*Game: Gods Arena - วิหารแห่งเทพ*
