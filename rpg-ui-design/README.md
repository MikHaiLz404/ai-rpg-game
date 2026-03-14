# 🎮 Gods' Arena - UI/UX Design

UI/UX Design สำหรับ Turn-based RPG Game "Gods' Arena" บน Next.js + Tailwind CSS

## 📱 Game Phases (4 Phases)

### 1. 🏪 Shop Phase (ร้านค้า)
- **หน้าขายของ** - แสดงสินค้าต่างๆ
- **จัดสต็อก** - จัดการจำนวนสินค้า (+/-)
- **ตั้งราคา** - ตั้งราคาสินค้า
- **Stats** - แสดงรายได้รวม และสินค้าคงคลัง
- **Filter** - กรองสินค้าตามสถานะ (ทั้งหมด/ใกล้หมด/หมดแล้ว)
- **Add Item Modal** - เพิ่มสินค้าใหม่

### 2. ⚔️ Arena Phase (อารีน่า)
- **เลือกเทพ** - เลือก 1 เทพจาก 4 ตัวละคร
- **God Stats** - แสดง HP, โจมตี, ป้องกัน, ความเร็ว
- **Buffs** - สกิลบัฟของแต่ละเทพ
- **Combat View** - หน้าต่อสู้แบบ real-time
- **HP Bar** - แสดงเลือดเทพและศัตรู
- **Combat Log** - บันทึกการต่อสู้

### 3. 🗡️ Exploration Phase (สำรวจ)
- **Map** - แผนที่โลกแบบ interactive
- **Map Nodes** - จุดต่างๆ บนแผนที่ (หมู่บ้าน, ป่า, ถ้ำ, ภูเขา, วัด)
- **Progress** - แสดง % การสำรวจ
- **Monster Encounter** - สุ่มเจอมอนสเตอร์
- **Location Info** - แสดงข้อมูลสถานที่ปัจจุบัน
- **Quick Actions** - ปุ่มลัด (สุ่มมอนสเตอร์, ค้นหาสมบัติ, เดินทาง, พัก)

### 4. 💕 Relationship Phase (ความสัมพันธ์)
- **God Profiles** - แสดงรายชื่อเทพที่รู้จัก
- **Bond Level** - แสดงระดับความผูกพัน (Progress bar)
- **Chat Interface** - หน้าสนทนากับเทพ
- **Chat Options** - ตัวเลือกการสนทนา (ทักทาย, ถาม, ให้ของ, ขอช่วย, บอกใจ)
- **Bond Events** - กิจกรรมเพิ่มความผูกพัน

## 🎨 Design System

### Colors
- **Primary**: Purple → Blue gradient (Navigation)
- **Shop**: Yellow → Amber (ร้านค้า)
- **Arena**: Red → Orange (อารีน่า)
- **Exploration**: Green → Emerald (สำรวจ)
- **Relationship**: Pink → Rose (ความสัมพันธ์)

### Components
- Glass morphism (backdrop-blur)
- Gradient backgrounds
- Animated hover states
- Responsive design (Mobile + Desktop)
- Custom scrollbars
- Toast notifications

## 📁 Project Structure

```
rpg-ui-design/
├── pages/
│   ├── _app.jsx          # App wrapper
│   └── index.jsx         # Main game UI (4 phases)
├── components/
│   ├── phases/
│   │   ├── ShopPhase.jsx         # 🏪 Shop
│   │   ├── ArenaPhase.jsx        # ⚔️ Arena
│   │   ├── ExplorationPhase.jsx  # 🗡️ Exploration
│   │   └── RelationshipPhase.jsx # 💕 Relationship
│   ├── BattleInterface.jsx      # Battle UI (existing)
│   ├── SkillTree.jsx            # Skill tree (existing)
│   └── Navigation.jsx            # Navigation (existing)
├── styles/
├── tailwind.config.js
└── package.json
```

## 🚀 วิธีใช้

```bash
# Install dependencies
cd rpg-ui-design
npm install

# Run development server
npm run dev
```

## 📱 Responsive Design

- **Mobile**: Bottom navigation (icon + label compact)
- **Desktop**: Full-width with better spacing

## ✨ Features

- Phase switching with animations
- Toast notifications
- Interactive maps
- Real-time combat simulation
- Chat system with เทพ
- Stock management
- Bond level progression
