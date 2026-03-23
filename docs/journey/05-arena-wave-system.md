# Dev Log: Arena Wave System

## Overview
Combat was enhanced by moving from simple 1v1 encounters to a wave-based system, requiring players to manage Kane's HP and Intervention Points (IP) across multiple sequential fights.

## Key Changes

### ⚔️ Wave Mechanics
- **Sequential Spawns**: Defeating an enemy no longer ends the battle immediately. Up to **3 waves** of enemies can spawn in a single Arena session.
- **Difficulty Scaling**: The number of waves scales with the game day (Day 1-7: 1 wave, Day 8-14: 2 waves, Day 15+: 3 waves).
- **Power Increase**: Each subsequent wave is **20% stronger** (HP/ATK) than the previous one.

### 💰 Rewards & UI
- **Accumulated Gold**: Gold is collected from each wave but only granted to the player after the final victory.
- **UI Indicator**: Added a "Wave X/Y" badge to the top of the Arena interface so players can track their progress.

## Rationale
The previous combat system was too easy to "solve" once players unlocked a few skills. Waves add tactical depth—if you use all your IP on Wave 1, you might be too weak to survive the tougher enemies in Wave 3. It makes character progression (Kane's HP/DEF) much more critical.
