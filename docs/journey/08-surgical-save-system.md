# Dev Log: Surgical Save System

## Overview
Performance was improved by replacing the "constant" auto-save loop with a "surgical" system that only triggers on meaningful state changes.

## Key Changes

### 💾 Efficient Persistence
- **Debounced Saving**: Implemented `requestAutoSave` in `saveStore.ts`. It uses a **2-second debounce** timer to ensure that rapid changes (like buying 5 items in a row) only result in a single write operation.
- **Global Watcher**: Added a `useEffect` in `page.tsx` that monitors specific critical variables: `gold`, `items`, `companions`, `arenaWins`, `kaneStats`, and `day`.
- **Intelligent Triggers**: The game no longer saves while the player is idling. It only triggers when the player actually *does* something that changes the game state.

## Rationale
Writing to IndexedDB and LocalStorage can be expensive, especially on mobile devices. By moving to a surgical, debounced system, we reduce CPU usage and disk I/O, ensuring the game runs smoothly even as the save file grows in size.
