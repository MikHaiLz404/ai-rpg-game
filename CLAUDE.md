# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Gods' Arena (วิหารแห่งเทพ)** — a multi-genre RPG (Shop Management + Turn-Based Combat + Dating Sim + Roguelite) built with Next.js 14, Phaser 3, TypeScript, and Zustand. Players act as a merchant/coach supporting Gods in a 20-day campaign to defeat the Vampire Lord. AI agents generate NPC dialogue and skills dynamically.

Bilingual project: Thai for narrative content (`novel/`), English for code and technical specs.

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

Each day: Prophecy → 3 actions (Shop/Arena/Exploration/Relationship) → End Day. Win by defeating vampire within 20 days. Bond thresholds at `[3, 5, 8, 12, 17]` unlock AI-generated skills.

### World Structure (MainScene)

Rooms: `shop`, `arena`, `village`, `cave_entrance`, `cave_inside` — each with background image, NPC placements, and exit connections. Room transitions handled in Phaser scene.

## Types & Data

- **Types**: `src/types/index.ts` is the comprehensive type file (God, Enemy, Item, NPC, Companion, SaveData, GameData). `src/types/game.ts` has legacy types with partial overlap — prefer `index.ts`.
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

- **Skill generation** (`generate_skill` action) responses are sanitized (markdown fences stripped) and validated (name, description, multiplier 1.5-3.0, type physical/magical). Invalid responses fall back to deterministic per-god per-level skills in `Relationship.tsx`.
- **Deterministic fallback skills** in `/api/narrate` — 5 unique skills per god (Leo=physical, Arena=magical, Draco=mixed), indexed by bond level.
- **Fallback coverage**: all 6 narrate actions (`shop_talk`, `talk`, `generate_skill`, `gift`, `exploration_event`, combat) have Thai-language hardcoded fallbacks.
- **AI status badge** (`AIStatusBadge.tsx`) shows current AI source (OpenClaw/OpenRouter/Offline) in header. Probes `/api/narrate` on mount and listens for `ai-source-update` custom events. `broadcastAISource()` exported for components to update the badge after API calls.
- **Divine Council** (`ProphecyOverlay.tsx`) — fullscreen council scene with bg_council background. Gods speak sequentially; each sees what previous gods said, creating conversational flow. Prophecy API chains sequential OpenRouter calls, passing prior god statements as context.
- **Dynamic exploration narration** — exploration events are narrated by the companion god with highest bond, using their personality and speech style from `npcConfig.ts`. The `exploration_event` action in `/api/narrate` supports god-specific prompts.

## Game Design

Design docs in `game-design/turn-based-rpg/GAME_DESIGN.md`. Narrative lore and Thai-language novel chapters in `novel/`.
