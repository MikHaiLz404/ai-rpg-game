# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Gods' Arena (วิหารแห่งเทพ)** — a multi-genre RPG (Shop Management + Turn-Based Combat + Dating Sim + Roguelite) built with Next.js 14, Phaser 3, TypeScript, and Zustand. Players act as a merchant/coach supporting Gods in a 20-day campaign to defeat the Vampire Lord. AI agents generate NPC dialogue and skills dynamically.

Bilingual project: Thai for narrative content (`novel/`), English for code and technical specs.

## Project Status

| Aspect | Status | Notes |
|--------|--------|-------|
| **Overall** | Active Development | 20-day roguelite campaign with AI-driven content |
| **UX** | ✅ Improved | Fixed language consistency, accessibility, error feedback |
| **Architecture** | ✅ Improved | Added validation, error boundaries, type unification |
| **Game Design** | ✅ Synced | GAME_DESIGN.md rewritten to match actual codebase |

**Recent Activity:**
- 2026-03-30: WebSocket singleton fix - exponential backoff reconnection with jitter, max 10 retries
- 2026-03-30: Request deduplication - 5s window for /api/narrate, 10s for /api/prophecy
- 2026-03-25: Priority fixes completed - Herald, Bond math, Economy, Vampire Lord removed
- 2026-03-25: Shop customer wait time reduced (3-4.5s early, 2-3.5s mid, 1.5-3s late) + visible countdown + shift progress bar
- 2026-03-25: Per-god difficulty fully implemented (thresholds, bond rates, chat limits)

---

## Review Findings (2026-03-25)

### ✅ Addressed in Quick Wins

**UX Fixes (2026-03-25):**
- ✅ Language consistency: All UI labels standardized to English; Thai only for narrative
- ✅ Accessibility: ARIA labels, keyboard navigation, visible focus indicators added
- ✅ Error feedback: Empty catch blocks now log errors; loading states added to async buttons
- ✅ Action economy: Action costs shown before entering phases via tooltips

**Architecture Fixes (2026-03-25):**
- ✅ Data validation: `loadSaveData` now typed and validated; SaveData unified across files
- ✅ Error boundaries: `ErrorBoundary.tsx` created with `GameOverlayErrorBoundary` and `PhaserErrorBoundary`
- ✅ API validation: `/api/narrate` and `/api/prophecy` now validate requests
- ✅ Module state: `autoSaveTimeout` moved into Zustand store state

**Design Sync (2026-03-25):**
- ✅ GAME_DESIGN.md rewritten to accurately describe actual codebase (5 items, 2 enemies, 3 gods)

### ⚠️ Remaining Issues (Lower Priority)

**Devil's Advocate Root Causes (Addressed or Mitigated):**
- ✅ **Bond math**: Rates doubled (draco 2.0, leo 1.5, arena 1.2), thresholds lowered
- ✅ **Herald system**: First meeting conversation skips herald prefix
- ✅ **Vampire Lord**: Removed - Hydra is now final boss
- ✅ **Economy death spiral**: Restock capped at 1.3x, gold debt system, passive +10/day

**Architecture (Lower Priority - Addressed):**
- ✅ **WebSocket singleton fix**: Implemented exponential backoff reconnection (1s, 2s, 4s, 8s, max 30s) with jitter, automatic reconnection on disconnect, proper cleanup of pending requests, max 10 retry attempts. See `src/lib/openclaw/client.ts` for details.
- ✅ **Request deduplication**: Implemented `RequestDeduplicator` class with configurable cache window and size. `/api/narrate` uses 5s window, `/api/prophecy` uses 10s window. Duplicate requests within window return cached results. See `src/lib/utils/deduplication.ts`.
- OpenRouter API key check trivially bypassed (security through obscurity) - not addressed

---

## Review Team

3 independent reviewers completed comprehensive codebase analysis:
- **UX Review**: UI patterns, accessibility, bilingual issues, friction points
- **Architecture Review**: State management, React/Phaser bridge, AI integration, security
- **Devil's Advocate**: Game balance, AI reliability, failure modes, design/code mismatches

## Commands

```bash
npm run dev      # Start Next.js dev server (port 3000)
npm run build    # Production build
npm run start    # Start production server
```

Python utility scripts in `scripts/`:
```bash
python scripts/test_runner.py       # Test game logic (combat, shop)
python scripts/combat_simulator.py  # Balance testing
python scripts/data_generator.py    # Generate/update JSON data in src/data/
python scripts/localizer.py         # Translation management
```

No JS test framework is configured (no Jest/Vitest).

## Architecture

```
React UI (Next.js App Router)
    ↕ EventBus (EventEmitter)
Phaser 3 Game Engine (MainScene)

React UI → Zustand stores (gameStore, saveStore, editorStore)

Next.js API Routes (/api/narrate, /api/prophecy)
    ↕ WebSocket (challenge-response auth)
OpenClaw Gateway (AI agents) → fallback: OpenRouter API
```

### React ↔ Phaser Bridge

`PhaserGame.tsx` wraps Phaser as a dynamically imported React component (`ssr: false`). Communication happens through `EventBus.ts` (an EventEmitter). Phaser emits events like `phase-change` and `change-room`; React listens and updates Zustand state. Game rendering config: 384x288px, pixel art mode, arcade physics.

### State Management (Zustand)

- **`gameStore.ts`** — Primary store: game phase, gold, items, companions/bonds, intervention points, dialogue, day counter (1-20), win/lose state. All game mutations go through this store.
- **`saveStore.ts`** — Save/load system: auto-save to localStorage (30s interval), 3 manual save slots, JSON export/import. Save version: `1.0.0`.
- **`editorStore.ts`** — Runtime CRUD editor for game data (items, gods, enemies, NPCs).

### API Routes

- **`/api/narrate`** — AI dialogue generation. Maps gods to OpenClaw agents (emily, ember, mochi). Supports prompt types: `generate_skill`, `shop_talk`, `talk`. Falls back to OpenRouter if Gateway unavailable.
- **`/api/prophecy`** — Daily prophecy from all 3 gods in parallel. Includes hardcoded fallback prophecies.

### OpenClaw Gateway Integration

`src/lib/openclaw/client.ts` implements a WebSocket client with device-keypair authentication (challenge-response). Session keys follow format: `agent:main:mission-control-{agentName}`. Device identity (RSA keypair) is stored in localStorage.

### Game Loop

Each day: Prophecy → 3 actions (Shop/Arena/Exploration/Relationship) → End Day. Win by defeating Hydra within 20 days.

**Per-god difficulty:** Each god has unique bond rates, skill thresholds, and chat limits:
- **Draco** (🐉): Bond rate 2.0x, Thresholds [2,3,5,8,12], Chat limit 4 turns — wise elder, quick to bond
- **Leo** (⚔️): Bond rate 1.5x, Thresholds [3,5,8,12,16], Chat limit 3 turns — direct warrior
- **Arena** (👑): Bond rate 1.2x, Thresholds [4,7,11,15,20], Chat limit 2 turns — queen, earns trust slowly

### World Structure (MainScene)

Rooms: `shop`, `arena`, `village`, `cave_entrance`, `cave_inside` — each with background image, NPC placements, and exit connections. Room transitions handled in Phaser scene.

## Types & Data

- **Types**: `src/types/index.ts` is the comprehensive type file (God, Enemy, Item, NPC, Companion, SaveData, GameData).
- **Game data**: `src/data/` — TypeScript files exporting gods (Zeus, Athena, Ares), enemies, items, NPCs, and NPC personality configs (`npcConfig.ts`).
- **Path alias**: `@/*` maps to `./src/*`

## Environment Variables

Required in `.env.local`:

| Variable | Description |
|---|---|
| `OPENCLAW_GATEWAY_URL` | WebSocket URL for AI Gateway |
| `OPENCLAW_GATEWAY_TOKEN` | Auth token for Gateway |
| `OPENROUTER_API_KEY` | Fallback LLM provider |

## AI Integration Notes

Full documentation of AI agent architecture, personalities, and integration logic can be found in **AGENTS.md**.

- **Skill generation** (`generate_skill` action) responses are sanitized (markdown fences stripped) and validated (name, description, multiplier 1.5-3.0, type physical/magical). Invalid responses fall back to deterministic per-god per-level skills in `Relationship.tsx`.
- **Deterministic fallback skills** in `/api/narrate` — 5 unique skills per god (Leo=physical, Arena=magical, Draco=mixed), indexed by bond level.
- **Fallback coverage**: all 6 narrate actions (`shop_talk`, `talk`, `generate_skill`, `gift`, `exploration_event`, combat) have Thai-language hardcoded fallbacks.
- **AI status badge** (`AIStatusBadge.tsx`) shows current AI source (OpenClaw/OpenRouter/Offline) in header. Probes `/api/narrate` on mount and listens for `ai-source-update` custom events. `broadcastAISource()` exported for components to update the badge after API calls.
- **Divine Council** (`ProphecyOverlay.tsx`) — fullscreen council scene with bg_council background. Gods speak sequentially; each sees what previous gods said, creating conversational flow. Prophecy API chains sequential OpenRouter calls, passing prior god statements as context.
- **Dynamic exploration narration** — exploration events are narrated by the companion god with highest bond, using their personality and speech style from `npcConfig.ts`. The `exploration_event` action in `/api/narrate` supports god-specific prompts.
- **Adaptive difficulty advice** — council dialogue prompts include tactical analysis: weakest/strongest god bonds, average bond, next skill threshold, vampire readiness check, gold status. Gods give specific strategic recommendations based on actual game state patterns.
- **AI-driven daily events** — each day's council includes a contextual event (gold, IP, item, bond, or discount) generated by AI based on game state. Context-aware: low gold triggers gift events, urgent days give IP boosts, low bonds trigger god blessings. Player claims the reward in the council overlay before starting the day.

## Game Design

Design docs in `game-design/turn-based-rpg/GAME_DESIGN.md`. Narrative lore and Thai-language novel chapters in `novel/`.

## Roadmap (Remaining Work)

### High Priority
- **Full 20-day balance test** — calibrate gold economy, enemy scaling, and win rate
- **Surgical Save stress test** — verify save integrity under rapid state changes

### Medium Priority
- **Audio integration** — BGM per phase (Shop, Arena, Exploration, Village) + SFX for UI clicks, combat hits, loot reveals
- **Asset polish** — Replace remaining emoji icons with pixel art; finalize character portraits

### Lower Priority (Completed)
- ✅ **WebSocket singleton fix** — exponential backoff reconnection with jitter, auto-reconnect, proper cleanup (2026-03-30)
- ✅ **Request deduplication** — 5s window for /api/narrate, 10s for /api/prophecy (2026-03-30)
- **Multi-target combat** — expand from 1v1 waves to multi-enemy selection
