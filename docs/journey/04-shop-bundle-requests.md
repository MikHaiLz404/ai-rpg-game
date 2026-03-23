# Dev Log: Shop Complexity (Bundle Requests)

## Overview
To improve the depth of the Shop phase and create a more challenging economy, the simple "one customer, one item" loop was expanded into a dynamic bundle system.

## Key Changes

### 🛒 Bundle Generation
- **Multi-Item Requests**: Customers can now request between **1 and 3 items** in a single visit.
- **Dynamic Scaling**: The chance of a "Bundle" increases as the game progresses (Day 1-5: 5%, Day 11+: 30%).
- **Economic Impact**: Bundles offer significantly higher gold rewards, making them high-priority targets for the player.

### 🖥️ UI Enhancements
- **Status Indicators**: The Shop UI now displays each item in the request with a real-time status: **"In Stock"** (Green) or **"Missing"** (Red).
- **Validation**: The "Sell" button is automatically disabled unless the player possesses every item required for the bundle.

## Rationale
In the late game, players often have excess gold and items. Bundle requests force the player to manage their inventory more carefully and make the Restock mechanic more strategic. It transitions the shop from a "wait and click" phase into a meaningful management challenge.
