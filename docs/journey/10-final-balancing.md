# Dev Log: Final Testing & Balancing (v1.4)

## Overview
Initial testing revealed that the game was mathematically unwinnable by Day 20 due to aggressive enemy scaling. This phase focused on running end-to-end simulations to calibrate the economy and character progression.

## Key Changes

### ⚖️ Balancing Adjustments
- **Enemy Scaling**: Reduced daily stat growth from **5% to 3%** and per-wave power increase from **20% to 10%**.
- **Vampire Lord Nerf**: Reduced base stats of the final boss to make it a realistic goal for a 20-day run.
- **God Economy**: Increased God payment multipliers to **2.0x** to provide more gold for mid-game upgrades.

### ⚔️ Kane's Progression (Divine Training)
- **New Mechanic**: Implemented "Divine Training" in the Relationship phase. Players can now spend gold to permanently increase Kane's base stats (Max HP, ATK, DEF).
- **Bond Buffs**: Massively increased the impact of god bonds on combat power (ATK bonus increased from 0.5x to 1.5x of bond level).

### 🧪 Simulation Results
- **E2E Simulator**: Created `scripts/e2e_simulator.py` to run 100-game "speedruns".
- **Outcome**: The win rate improved from **0% to 32%** for a balanced playstyle, establishing a "challenging but fair" difficulty curve.

## Rationale
An RPG is only fun if the player feels their choices matter. By adding the Training mechanic and smoothing the scaling, we ensured that the player's economic success in the Shop directly translates to victory in the Arena.
