# Asset Polish Documentation

This document describes the pixel art icon system and guidelines for replacing emoji with pixel art assets.

## Overview

Gods' Arena uses a hybrid approach for icons:
1. **Pixel art SVG components** - For gods, enemies, actions (defined in code)
2. **Sprite sheets** - For shop items (image files)
3. **Character sprites** - For gods in scenes (animated)

## Emoji Usage Map

### Gods (in `npcConfig.ts`)
| God | Emoji | Pixel Art Icon | Status |
|-----|-------|----------------|--------|
| Leo | ⚔️ | `LeoIcon` | ✅ Created |
| Arena | 👑 | `ArenaIcon` | ✅ Created |
| Draco | 🐉 | `DracoIcon` | ✅ Created |

### Enemies (in `Arena.tsx`)
| Enemy | Emoji | Pixel Art Icon | Status |
|-------|-------|----------------|--------|
| Slime | 💧 | `SlimeIcon` | ✅ Created |
| Skeleton | 💀 | `SkeletonIcon` | ✅ Created |
| Hydra | 🐍 | `HydraIcon` | ✅ Created |

### Items (in `Shop.tsx`, `Relationship.tsx`)
| Item | Emoji | Sprite Sheet | Status |
|------|-------|--------------|--------|
| Health Potion | ❤️ | `/images/items/potion_health/` | ✅ Exists |
| Mana Potion | 💙 | `/images/items/potion_mana/` | ✅ Exists |
| Basket | 🧺 | `/images/items/basket/` | ✅ Exists |
| Cloth | 🧣 | `/images/items/cloth/` | ✅ Exists |
| Sword | ⚔️ | `/images/items/sword/` | ✅ Exists |
| Shield | 🛡️ | `/images/items/shield/` | ✅ Exists |
| Bow | 🏹 | `/images/items/bow/` | ⚠️ Missing sprite |
| Herbs | 🌿 | `/images/items/herbs/` | ⚠️ Missing sprite |
| Soap | 🧼 | N/A | ❌ No sprite |
| Perfume | ✨ | `/images/items/perfume/` | ⚠️ Missing sprite |
| Flower | 🌸 | `/images/items/flower/` | ⚠️ Missing sprite |
| Mirror | 🪞 | `/images/items/mirror/` | ⚠️ Missing sprite |
| Ore | 🪨 | N/A | ❌ No sprite |
| Wood | 🪵 | N/A | ❌ No sprite |
| Olympian Coin | 🪙 | `/images/items/olympian_coin/` | ⚠️ Missing sprite |

### Actions (UI Buttons)
| Action | Emoji | Pixel Art Icon | Status |
|--------|-------|----------------|--------|
| Shop | 🛒 | `ShopIcon` | ✅ Created |
| Combat | ⚔️ | `CombatIcon` | ✅ Created |
| Exploration | 🗺️ | `ExplorationIcon` | ✅ Created |
| Village | 🏠 | `VillageIcon` | ✅ Created |
| Gift | 🎁 | `GiftIcon` | ✅ Created |

### Status Icons
| Status | Emoji | Pixel Art Icon | Status |
|--------|-------|----------------|--------|
| Bond | 💗 | `BondIcon` | ✅ Created |
| Skill | 🌟 | `SkillIcon` | ✅ Created |
| Gold | (uses existing SVG) | `GoldIcon` | ✅ Exists |

## Using Pixel Art Icons

### Basic Usage

```tsx
import { LeoIcon, ArenaIcon, DracoIcon } from './PixelArtIcons';

// In your component:
<LeoIcon size={24} className="text-red-500" />
<ArenaIcon size={32} className="text-blue-400" />
<DracoIcon size={24} className="text-green-500" />
```

### Using the Icon Object

```tsx
import { PixelArtIcons } from './PixelArtIcons';

const iconName = 'Leo'; // from god data
const IconComponent = PixelArtIcons[iconName];

<IconComponent size={24} />
```

### With Tooltip

```tsx
import { LeoIcon } from './PixelArtIcons';

<button className="relative group">
  <LeoIcon size={24} />
  <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-xs px-2 py-1 rounded">
    Leo - God of War
  </span>
</button>
```

## Sprite Sheet Items

For items with sprite sheets (like potions), use the existing `ItemIcon` component:

```tsx
// From Shop.tsx
import ItemIcon from './Shop'; // ItemIcon is internal to Shop

// ITEMS array contains: id, name, emoji, price, desc
// ITEM_SPRITES contains sprite sheet info for some items

<ItemIcon item={ITEMS[0]} size="md" />
```

## Adding New Pixel Art Icons

### SVG Guidelines

1. **ViewBox**: Use 16x16 for small icons, 32x32 for larger detailed icons
2. **Pixelated rendering**: Set `style={{ imageRendering: 'pixelated' }}`
3. **Use `<rect>` elements**: Each pixel is a rect, don't use paths
4. **Limited palette**: 4-8 colors per icon for cohesion

### Template

```tsx
export const MyIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* Your pixel art here */}
    {/* Use rect elements for each pixel */}
    <rect x="0" y="0" width="1" height="1" fill="currentColor" />
    {/* ... */}
  </svg>
);
```

### Color Guidelines

| Color | Hex | Usage |
|-------|-----|-------|
| Red | #ef4444 | Health, damage, important |
| Blue | #3b82f6 | Mana, magic, water |
| Green | #22c55e | Nature, slime, health |
| Yellow/Gold | #fbbf24 | Gold, stars, highlights |
| Purple | #8b5cf6 | Magic, mystery |
| Pink | #f472b6 | Love, bond, hearts |
| Brown | #92400e | Wood, earth, buildings |
| Gray | #78716c | Stone, metal, neutral |
| White | #e5e7eb | Bones, light elements |

## Character Portraits

God character portraits exist as spritesheets:

```
public/images/characters/npcs/{god_id}/
├── character_{n}/           # Character sprite sheet
│   ├── character_{n}_frame16x20.png
│   └── character_{n}_frame32x32.png
├── facial/                  # Facial closeup
│   └── {god_id}.png
├── idle/                    # Idle animation frames
│   ├── frame_0_0.png
│   ├── frame_0_1.png
│   └── ...
├── talk/                    # Talking animation
├── smile/                   # Happy expression
└── roar/                    # Battle cry (Draco)
```

## UI Icons Framework

The UI icons folder is structured for expansion:

```
public/images/ui/
├── icons/           # Pixel art icons (currently empty)
│   ├── attack/
│   ├── bond/
│   ├── defense/
│   ├── gold/
│   ├── health/
│   ├── mana/
│   ├── reputation/
│   └── speed/
├── badges/          # Achievement/rank badges
├── bars/            # HP/MP/EXP bar frames
│   ├── health/
│   ├── mana/
│   └── experience/
└── buttons/         # Button sprites
    ├── normal/
    └── action/
```

## Recommended Free Pixel Art Sources

### Icon Packs
- **OpenGameArt.org** - Search "pixel icons", "16x16"
- **Kenney.nl** - CC0 assets including "Interface Elements"
- **itch.io** - Search "_UI_pack", "pixel icons"

### Character/Enemy Sprites
- **OpenGameArt.org** - Search "rpg characters", "slime", "skeleton"
- **Sprite Database** - Comprehensive sprite collection
- **GameDev Market** - Paid but high quality

### Item Sprites
- **Kenney.nl** - "RPG Pack", "KitBox"
- **OpenGameArt.org** - Search "items", "weapons", "potions"

## Implementation Priority

### Phase 1: High Impact (Do First)
1. ✅ Gods: Leo, Arena, Draco - in header, relationship UI
2. ✅ Enemies: Slime, Skeleton, Hydra - in arena UI
3. ✅ Actions: Shop, Combat, Exploration, Village - in main UI

### Phase 2: Medium Impact
4. ⚠️ Items: Potions, weapons - in shop UI (need sprites)
5. ⚠️ Status: Bond, Skill - in relationship UI

### Phase 3: Polish (Nice to Have)
6. ❌ Remaining items without sprites
7. ❌ UI bars and badges

## Migration Guide

### Before (with emoji)
```tsx
<span className="text-2xl">⚔️</span>
<div>{god.emoji} {god.name}</div>
```

### After (with pixel art)
```tsx
import { LeoIcon, ArenaIcon, DracoIcon } from './PixelArtIcons';

const godIcons = {
  leo: LeoIcon,
  arena: ArenaIcon,
  draco: DracoIcon,
};

const GodIcon = godIcons[god.id];
<GodIcon size={24} className="text-red-500" />
```
