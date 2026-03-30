'use client';

/**
 * GodIcon - Pixel art icon component for gods
 *
 * Replaces emoji in god-related UI with pixel art SVG icons.
 * Falls back to emoji if pixel art is not available.
 *
 * @example
 * // In components:
 * <GodIcon godId="leo" size={24} />
 * <GodIcon godId="arena" size={32} className="text-purple-500" />
 */

import React from 'react';
import { LeoIcon, ArenaIcon, DracoIcon } from './PixelArtIcons';

export interface GodIconProps {
  godId: string;
  size?: number;
  className?: string;
}

// Map god IDs to their pixel art icon components
const GOD_ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  leo: LeoIcon,
  arena: ArenaIcon,
  draco: DracoIcon,
};

export function GodIcon({ godId, size = 24, className = '' }: GodIconProps) {
  const IconComponent = GOD_ICON_MAP[godId];

  if (IconComponent) {
    return <IconComponent size={size} className={className} />;
  }

  // Fallback to emoji if god ID is unknown
  const emojiFallback: Record<string, string> = {
    leo: '⚔️',
    arena: '👑',
    draco: '🐉',
  };

  return (
    <span style={{ fontSize: size * 0.8 }} className={className}>
      {emojiFallback[godId] || '❓'}
    </span>
  );
}

/**
 * EnemyIcon - Pixel art icon component for enemies
 *
 * @example
 * <EnemyIcon enemyId="slime" size={24} />
 * <EnemyIcon enemyId="hydra" size={32} className="text-green-500" />
 */
import { SlimeIcon, SkeletonIcon, HydraIcon } from './PixelArtIcons';

export interface EnemyIconProps {
  enemyId: string;
  size?: number;
  className?: string;
}

const ENEMY_ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  slime: SlimeIcon,
  skeleton: SkeletonIcon,
  hydra: HydraIcon,
  minotaur: SkeletonIcon, // Reuse skeleton for minotaur
  demon: HydraIcon, // Reuse hydra for demon
};

export function EnemyIcon({ enemyId, size = 24, className = '' }: EnemyIconProps) {
  const IconComponent = ENEMY_ICON_MAP[enemyId];

  if (IconComponent) {
    return <IconComponent size={size} className={className} />;
  }

  // Fallback to emoji
  const emojiFallback: Record<string, string> = {
    slime: '💧',
    skeleton: '💀',
    hydra: '🐍',
    minotaur: '🐂',
    demon: '👹',
  };

  return (
    <span style={{ fontSize: size * 0.8 }} className={className}>
      {emojiFallback[enemyId] || '❓'}
    </span>
  );
}

/**
 * ActionIcon - Pixel art icon for game actions
 *
 * @example
 * <ActionIcon action="shop" size={24} />
 * <ActionIcon action="combat" size={24} className="text-red-500" />
 */
import { ShopIcon, CombatIcon, ExplorationIcon, VillageIcon } from './PixelArtIcons';

export interface ActionIconProps {
  action: 'shop' | 'combat' | 'exploration' | 'village';
  size?: number;
  className?: string;
}

const ACTION_ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  shop: ShopIcon,
  combat: CombatIcon,
  exploration: ExplorationIcon,
  village: VillageIcon,
};

export function ActionIcon({ action, size = 24, className = '' }: ActionIconProps) {
  const IconComponent = ACTION_ICON_MAP[action];

  if (IconComponent) {
    return <IconComponent size={size} className={className} />;
  }

  // Fallback to emoji
  const emojiFallback: Record<string, string> = {
    shop: '🛒',
    combat: '⚔️',
    exploration: '🗺️',
    village: '🏠',
  };

  return (
    <span style={{ fontSize: size * 0.8 }} className={className}>
      {emojiFallback[action] || '❓'}
    </span>
  );
}

export default GodIcon;
