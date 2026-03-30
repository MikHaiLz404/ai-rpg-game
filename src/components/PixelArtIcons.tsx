'use client';

/**
 * PixelArtIcons.tsx - Pixel art SVG icons for UI elements
 *
 * These are hand-crafted SVG icons designed to replace emoji in the UI.
 * Each icon is 16x16 or 32x32 pixels, styled for the game's pixel art aesthetic.
 *
 * Usage:
 *   import { LeoIcon, ArenaIcon, DracoIcon, SwordIcon } from './PixelArtIcons';
 *
 *   // In your component:
 *   <LeoIcon size={24} className="text-red-500" />
 *
 * For items that have sprite sheets (like Shop items), use those instead.
 * These icons are for: gods, enemies, action buttons, status indicators.
 */

import React from 'react';

// Base interface for icon props
interface PixelIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

// ============================================
// GOD ICONS - Leo (Warrior)
// ============================================

/**
 * Leo - God of War (Sword Warrior)
 * Pixel art sword icon representing the warrior god
 */
export const LeoIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* Sword blade */}
    <rect x="7" y="1" width="2" height="2" fill="currentColor" />
    <rect x="7" y="3" width="2" height="2" fill="currentColor" />
    <rect x="7" y="5" width="2" height="2" fill="currentColor" />
    <rect x="7" y="7" width="2" height="2" fill="currentColor" />
    {/* Crossguard */}
    <rect x="4" y="7" width="8" height="2" fill="#a78bbd" />
    {/* Handle */}
    <rect x="6" y="9" width="4" height="2" fill="#8b6914" />
    {/* Pommel */}
    <rect x="6" y="11" width="4" height="2" fill="#fbbf24" />
  </svg>
);

// ============================================
// GOD ICONS - Arena (Queen/Light)
// ============================================

/**
 * Arena - Goddess of Light and Royalty
 * Pixel art crown icon representing the queen
 */
export const ArenaIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* Crown base */}
    <rect x="2" y="10" width="12" height="3" fill="#fbbf24" />
    {/* Crown points */}
    <rect x="2" y="8" width="2" height="2" fill="#fbbf24" />
    <rect x="5" y="6" width="2" height="4" fill="#fbbf24" />
    <rect x="7" y="4" width="2" height="6" fill="#fbbf24" />
    <rect x="9" y="6" width="2" height="4" fill="#fbbf24" />
    <rect x="12" y="8" width="2" height="2" fill="#fbbf24" />
    {/* Jewels */}
    <rect x="3" y="10" width="2" height="2" fill="#ef4444" />
    <rect x="7" y="10" width="2" height="2" fill="#3b82f6" />
    <rect x="11" y="10" width="2" height="2" fill="#22c55e" />
  </svg>
);

// ============================================
// GOD ICONS - Draco (Ancient Dragon)
// ============================================

/**
 * Draco - Ancient Dragon God
 * Pixel art dragon/serpent icon
 */
export const DracoIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* Dragon head */}
    <rect x="10" y="2" width="3" height="2" fill="#22c55e" />
    <rect x="9" y="4" width="2" height="2" fill="#22c55e" />
    <rect x="11" y="4" width="2" height="2" fill="#22c55e" />
    {/* Eyes */}
    <rect x="9" y="4" width="1" height="1" fill="#fbbf24" />
    <rect x="12" y="4" width="1" height="1" fill="#fbbf24" />
    {/* Body */}
    <rect x="7" y="6" width="4" height="2" fill="#22c55e" />
    <rect x="5" y="8" width="4" height="2" fill="#22c55e" />
    <rect x="3" y="10" width="4" height="2" fill="#22c55e" />
    {/* Tail tip */}
    <rect x="1" y="10" width="2" height="2" fill="#22c55e" />
    {/* Scales/details */}
    <rect x="8" y="7" width="1" height="1" fill="#16a34a" />
    <rect x="6" y="9" width="1" height="1" fill="#16a34a" />
    <rect x="4" y="11" width="1" height="1" fill="#16a34a" />
  </svg>
);

// ============================================
// ACTION ICONS
// ============================================

/**
 * Shop/Merchant Icon - Storefront
 */
export const ShopIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* Roof */}
    <rect x="1" y="4" width="14" height="2" fill="#92400e" />
    <rect x="2" y="2" width="12" height="2" fill="#b45309" />
    <rect x="3" y="1" width="10" height="1" fill="#d97706" />
    {/* Building */}
    <rect x="2" y="6" width="12" height="8" fill="#78350f" />
    {/* Door */}
    <rect x="6" y="10" width="4" height="4" fill="#451a03" />
    {/* Windows */}
    <rect x="3" y="8" width="2" height="2" fill="#fef3c7" />
    <rect x="11" y="8" width="2" height="2" fill="#fef3c7" />
  </svg>
);

/**
 * Arena/Combat Icon - Crossed swords
 */
export const CombatIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* Sword 1 */}
    <rect x="2" y="10" width="2" height="2" fill="#a78bbd" />
    <rect x="3" y="8" width="2" height="2" fill="#a78bbd" />
    <rect x="4" y="6" width="2" height="2" fill="#e5e7eb" />
    <rect x="5" y="4" width="2" height="2" fill="#e5e7eb" />
    <rect x="6" y="2" width="2" height="2" fill="#e5e7eb" />
    {/* Sword 2 */}
    <rect x="10" y="10" width="2" height="2" fill="#a78bbd" />
    <rect x="11" y="8" width="2" height="2" fill="#a78bbd" />
    <rect x="10" y="6" width="2" height="2" fill="#e5e7eb" />
    <rect x="9" y="4" width="2" height="2" fill="#e5e7eb" />
    <rect x="8" y="2" width="2" height="2" fill="#e5e7eb" />
    {/* Center */}
    <rect x="7" y="7" width="2" height="2" fill="#fbbf24" />
  </svg>
);

/**
 * Exploration/Map Icon - Compass
 */
export const ExplorationIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* Outer circle */}
    <rect x="6" y="1" width="4" height="2" fill="#78716c" />
    <rect x="2" y="6" width="2" height="4" fill="#78716c" />
    <rect x="12" y="6" width="2" height="4" fill="#78716c" />
    <rect x="6" y="13" width="4" height="2" fill="#78716c" />
    {/* Inner circle */}
    <rect x="6" y="6" width="4" height="4" fill="#57534e" />
    {/* Compass needle - North */}
    <rect x="7" y="5" width="2" height="3" fill="#ef4444" />
    {/* Compass needle - South */}
    <rect x="7" y="8" width="2" height="3" fill="#e5e7eb" />
    {/* Center dot */}
    <rect x="7" y="7" width="2" height="2" fill="#fbbf24" />
  </svg>
);

/**
 * Village/Relationship Icon - Heart with bond symbol
 */
export const VillageIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* House base */}
    <rect x="4" y="8" width="8" height="6" fill="#a8a29e" />
    {/* Roof */}
    <rect x="3" y="6" width="10" height="2" fill="#92400e" />
    <rect x="2" y="5" width="12" height="1" fill="#b45309" />
    {/* Door */}
    <rect x="7" y="10" width="2" height="4" fill="#78350f" />
    {/* Window */}
    <rect x="5" y="9" width="2" height="2" fill="#fef3c7" />
    <rect x="9" y="9" width="2" height="2" fill="#fef3c7" />
    {/* Heart above */}
    <rect x="7" y="2" width="2" height="2" fill="#f472b6" />
  </svg>
);

// ============================================
// ITEM ICONS
// ============================================

/**
 * Health Potion Icon
 */
export const HealthPotionIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* Bottle */}
    <rect x="5" y="4" width="6" height="10" fill="#7c3aed" />
    <rect x="4" y="5" width="1" height="8" fill="#6d28d9" />
    <rect x="11" y="5" width="1" height="8" fill="#6d28d9" />
    {/* Liquid */}
    <rect x="5" y="7" width="6" height="7" fill="#ef4444" />
    <rect x="6" y="8" width="4" height="5" fill="#dc2626" />
    {/* Cork */}
    <rect x="6" y="2" width="4" height="2" fill="#a16207" />
    {/* Shine */}
    <rect x="6" y="8" width="1" height="2" fill="#fca5a5" />
  </svg>
);

/**
 * Mana Potion Icon
 */
export const ManaPotionIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* Bottle */}
    <rect x="5" y="4" width="6" height="10" fill="#7c3aed" />
    <rect x="4" y="5" width="1" height="8" fill="#6d28d9" />
    <rect x="11" y="5" width="1" height="8" fill="#6d28d9" />
    {/* Liquid */}
    <rect x="5" y="7" width="6" height="7" fill="#3b82f6" />
    <rect x="6" y="8" width="4" height="5" fill="#2563eb" />
    {/* Cork */}
    <rect x="6" y="2" width="4" height="2" fill="#a16207" />
    {/* Shine */}
    <rect x="6" y="8" width="1" height="2" fill="#93c5fd" />
  </svg>
);

/**
 * Gold/Coins Icon
 */
export const GoldIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* Coin stack */}
    <rect x="4" y="10" width="8" height="3" fill="#d97706" />
    <rect x="4" y="7" width="8" height="3" fill="#f59e0b" />
    <rect x="4" y="4" width="8" height="3" fill="#fbbf24" />
    {/* Coin details */}
    <rect x="6" y="5" width="4" height="1" fill="#f59e0b" />
    <rect x="6" y="8" width="4" height="1" fill="#d97706" />
    {/* Shine */}
    <rect x="5" y="5" width="1" height="1" fill="#fef3c7" />
  </svg>
);

// ============================================
// ENEMY ICONS
// ============================================

/**
 * Slime Enemy Icon
 */
export const SlimeIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* Body */}
    <rect x="4" y="8" width="8" height="6" fill="#22c55e" />
    <rect x="3" y="9" width="1" height="4" fill="#22c55e" />
    <rect x="12" y="9" width="1" height="4" fill="#22c55e" />
    <rect x="5" y="6" width="6" height="2" fill="#22c55e" />
    {/* Highlight */}
    <rect x="5" y="7" width="3" height="2" fill="#4ade80" />
    {/* Eyes */}
    <rect x="5" y="9" width="2" height="2" fill="#fef3c7" />
    <rect x="9" y="9" width="2" height="2" fill="#fef3c7" />
    <rect x="6" y="10" width="1" height="1" fill="#1e293b" />
    <rect x="10" y="10" width="1" height="1" fill="#1e293b" />
  </svg>
);

/**
 * Skeleton Enemy Icon
 */
export const SkeletonIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* Skull */}
    <rect x="5" y="2" width="6" height="5" fill="#e5e7eb" />
    <rect x="4" y="3" width="1" height="3" fill="#e5e7eb" />
    <rect x="11" y="3" width="1" height="3" fill="#e5e7eb" />
    {/* Eyes */}
    <rect x="6" y="4" width="2" height="2" fill="#1e293b" />
    <rect x="9" y="4" width="2" height="2" fill="#1e293b" />
    {/* Jaw */}
    <rect x="6" y="7" width="4" height="1" fill="#e5e7eb" />
    {/* Spine */}
    <rect x="7" y="8" width="2" height="4" fill="#e5e7eb" />
    {/* Ribs */}
    <rect x="5" y="9" width="6" height="1" fill="#e5e7eb" />
    <rect x="6" y="11" width="4" height="1" fill="#e5e7eb" />
  </svg>
);

/**
 * Hydra/Boss Enemy Icon
 */
export const HydraIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* Center head */}
    <rect x="7" y="1" width="2" height="2" fill="#22c55e" />
    <rect x="6" y="3" width="4" height="3" fill="#22c55e" />
    {/* Left head */}
    <rect x="3" y="2" width="2" height="2" fill="#22c55e" />
    <rect x="2" y="4" width="3" height="2" fill="#22c55e" />
    {/* Right head */}
    <rect x="11" y="2" width="2" height="2" fill="#22c55e" />
    <rect x="11" y="4" width="3" height="2" fill="#22c55e" />
    {/* Body */}
    <rect x="5" y="6" width="6" height="6" fill="#22c55e" />
    <rect x="4" y="7" width="1" height="4" fill="#22c55e" />
    <rect x="11" y="7" width="1" height="4" fill="#22c55e" />
    {/* Eyes - center */}
    <rect x="7" y="3" width="1" height="1" fill="#ef4444" />
    {/* Eyes - left */}
    <rect x="4" y="4" width="1" height="1" fill="#ef4444" />
    {/* Eyes - right */}
    <rect x="12" y="4" width="1" height="1" fill="#ef4444" />
    {/* Scales */}
    <rect x="6" y="8" width="1" height="1" fill="#16a34a" />
    <rect x="9" y="9" width="1" height="1" fill="#16a34a" />
  </svg>
);

// ============================================
// STATUS ICONS
// ============================================

/**
 * Bond/Relationship Icon - Heart with star
 */
export const BondIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* Heart */}
    <rect x="3" y="4" width="4" height="4" fill="#f472b6" />
    <rect x="7" y="4" width="4" height="4" fill="#f472b6" />
    <rect x="2" y="5" width="1" height="3" fill="#f472b6" />
    <rect x="11" y="5" width="1" height="3" fill="#f472b6" />
    <rect x="4" y="8" width="6" height="2" fill="#f472b6" />
    <rect x="5" y="10" width="4" height="1" fill="#f472b6" />
    <rect x="6" y="11" width="2" height="1" fill="#f472b6" />
    {/* Star */}
    <rect x="12" y="2" width="2" height="2" fill="#fbbf24" />
    <rect x="13" y="1" width="1" height="1" fill="#fbbf24" />
    <rect x="14" y="2" width="1" height="1" fill="#fbbf24" />
  </svg>
);

/**
 * Skill/Power Icon - Sparkle star
 */
export const SkillIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* Star center */}
    <rect x="7" y="7" width="2" height="2" fill="#fbbf24" />
    {/* Star points */}
    <rect x="7" y="3" width="2" height="2" fill="#fbbf24" />
    <rect x="7" y="11" width="2" height="2" fill="#fbbf24" />
    <rect x="3" y="7" width="2" height="2" fill="#fbbf24" />
    <rect x="11" y="7" width="2" height="2" fill="#fbbf24" />
    {/* Diagonal points */}
    <rect x="5" y="5" width="1" height="1" fill="#fbbf24" />
    <rect x="10" y="5" width="1" height="1" fill="#fbbf24" />
    <rect x="5" y="10" width="1" height="1" fill="#fbbf24" />
    <rect x="10" y="10" width="1" height="1" fill="#fbbf24" />
    {/* Sparkles */}
    <rect x="2" y="2" width="1" height="1" fill="#fef3c7" />
    <rect x="13" y="2" width="1" height="1" fill="#fef3c7" />
    <rect x="2" y="13" width="1" height="1" fill="#fef3c7" />
    <rect x="13" y="13" width="1" height="1" fill="#fef3c7" />
  </svg>
);

/**
 * Gift/Present Icon
 */
export const GiftIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* Box */}
    <rect x="3" y="8" width="10" height="6" fill="#8b5cf6" />
    <rect x="2" y="9" width="1" height="4" fill="#7c3aed" />
    <rect x="13" y="9" width="1" height="4" fill="#7c3aed" />
    {/* Ribbon vertical */}
    <rect x="7" y="8" width="2" height="6" fill="#fbbf24" />
    <rect x="8" y="7" width="1" height="1" fill="#fbbf24" />
    {/* Ribbon horizontal */}
    <rect x="3" y="10" width="10" height="2" fill="#fbbf24" />
    {/* Bow */}
    <rect x="6" y="5" width="4" height="3" fill="#fbbf24" />
    <rect x="5" y="6" width="1" height="1" fill="#f59e0b" />
    <rect x="10" y="6" width="1" height="1" fill="#f59e0b" />
  </svg>
);

/**
 * Arrow/Projectile Icon
 */
export const ArrowIcon = ({ size = 24, className = '', ...props }: PixelIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={className}
    style={{ imageRendering: 'pixelated' }}
    {...props}
  >
    {/* Arrow shaft */}
    <rect x="2" y="7" width="10" height="2" fill="#a16207" />
    {/* Arrow head */}
    <rect x="12" y="5" width="2" height="2" fill="#78716c" />
    <rect x="13" y="4" width="2" height="2" fill="#78716c" />
    <rect x="13" y="8" width="2" height="2" fill="#78716c" />
    {/* Fletching */}
    <rect x="1" y="6" width="2" height="1" fill="#dc2626" />
    <rect x="1" y="9" width="2" height="1" fill="#dc2626" />
    <rect x="2" y="7" width="1" height="2" fill="#dc2626" />
  </svg>
);

// ============================================
// EXPORT ALL ICONS AS OBJECT
// ============================================

export const PixelArtIcons = {
  // Gods
  Leo: LeoIcon,
  Arena: ArenaIcon,
  Draco: DracoIcon,

  // Actions
  Shop: ShopIcon,
  Combat: CombatIcon,
  Exploration: ExplorationIcon,
  Village: VillageIcon,

  // Items
  HealthPotion: HealthPotionIcon,
  ManaPotion: ManaPotionIcon,
  Gold: GoldIcon,

  // Enemies
  Slime: SlimeIcon,
  Skeleton: SkeletonIcon,
  Hydra: HydraIcon,

  // Status
  Bond: BondIcon,
  Skill: SkillIcon,
  Gift: GiftIcon,
  Arrow: ArrowIcon,
} as const;

export type PixelArtIconName = keyof typeof PixelArtIcons;
