---
title: Claude
agent: aide
topic: ai-rpg-game
status: active
version: 1.0.0
updated: 2026-03-15
---

## CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is repository is

โปรเจคเกมตัวอย่างที่ทดลองการเอา ai agent มาช่วยในการสร้างเกมและระบบการโต้ตอบกับผู้เล่นในการพัฒนาความสัมพันธ์ของตัวละครและสุ่มสร้างสกิล

## 🌟 Project Overview
**Gods' Arena (วิหารแห่งเทพ)** is a multi-genre RPG that combines **Shop Management**, **Turn-Based Combat**, **Dating Sim**, and **Roguelite** elements. Built with **Next.js**, **Phaser 3**, and **TypeScript**, the game features an AI-driven narrative and mechanics where players act as a merchant/coach supporting divine entities (Gods) in an arena.

### 🔄 Core Gameplay Loop
1.  **Shop Phase 🏪**: Manage inventory, set prices, and sell items to Gods and mortals to earn gold and reputation.
2.  **Arena Phase ⚔️**: Select Gods to compete in turn-based tactical battles. Players use **Intervention Points (IP)** to manipulate turn order.
3.  **Exploration Phase 🗡️**: Travel through various locations to gather materials, fight monsters (auto/semi-auto), and encounter rival shops.
4.  **Relationship Phase 💕**: Interact with Gods to build **Bond Levels**, unlocking unique AI-generated skills and stat bonuses.

---

## 🛠️ Technical Stack
-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Game Engine**: [Phaser 3](https://phaser.io/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Asset Management**: Python-based utility scripts for optimization and extraction.

---

## 📂 Directory Structure Highlights
-   `src/app/`: Next.js pages and API routes (e.g., `/api/narrate` for AI dialogue).
-   `src/components/`: React components, including phase-specific UI (`Arena/`, `Shop/`, etc.).
-   `src/game/`: Phaser logic, scenes (`MainScene.ts`), and the `EventBus.ts` for React-Phaser communication.
-   `src/store/`: Zustand stores for game state (`gameStore.ts`), save data (`saveStore.ts`), and editor settings.
-   `src/types/`: Centralized TypeScript interfaces and types (`game.ts`).
-   `src/data/`: Game data in JSON format (gods, enemies, items, npcs).
-   `novel/`: Narrative content, lore, and Thai-language story chapters.
-   `game-design/`: Comprehensive design documents and mechanics specifications.
-   `scripts/`: Python and Shell scripts for testing, data generation, and asset processing.
-   `src/app/api/`: API routes for game logic (e.g., `/api/narrate` for AI dialogue).

---

## 🚀 Key Commands
-   `npm run dev`: Start the Next.js development server.
-   `npm run build`: Build the project for production.
-   `npm run start`: Start the production server.
-   `python scripts/test_runner.py`: Run automated tests for game logic (combat, shop, etc.).
-   `python scripts/combat_simulator.py`: Simulate and test combat balance.
-   `python scripts/data_generator.py`: Generate or update JSON data files in `src/data/`.

---

## 🧠 Development Conventions
-   **Type Safety**: Always use types from `src/types/game.ts` for game entities.
-   **State Management**: Use `useGameStore` (Zustand) for reactive UI state.
-   **Phaser Integration**: Game-specific rendering and physics happen in Phaser scenes, communicating with React via `EventBus.ts`.
-   **Localization**: The project includes Thai (`novel/`) and English content. Use `scripts/localizer.py` for managing translations.
-   **Testing**: Before making significant changes to combat or shop logic, run `python scripts/test_runner.py` to ensure no regressions in data integrity.

---

## 🎯 Current Focus
The project is in active development, focusing on the integration of the four main phases and the implementation of the AI-driven relationship system. Refer to `game-design/turn-based-rpg/GAME_DESIGN.md` for detailed mechanics.