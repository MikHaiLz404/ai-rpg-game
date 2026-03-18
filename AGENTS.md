# AGENTS.md - Gods' Arena AI Architecture

This document outlines the AI Agent architecture for **Gods' Arena (วิหารแห่งเทพ)**, covering personality profiles, integration logic, and fallback mechanisms.

## 🤖 Overview
Gods' Arena utilizes a hybrid AI system to power dynamic NPC interactions, skill generation, and strategic guidance. The system primarily targets the **OpenClaw Gateway** with a fallback to **OpenRouter (Gemini 2.0 Flash)**.

### Core AI Features
- **Divine Council (Prophecy)**: Daily sequential dialogue between the three main gods.
- **Dynamic Narratives**: Bond-aware conversations and gift reactions.
- **Skill Generation**: AI-designed combat skills based on god themes and bond levels.
- **Exploration Narration**: Context-aware commentary from companion gods.

---

## 🏛️ The Divine Council (Main Agents)

The project features three primary agents, each mapped to a specific OpenClaw agent and a deterministic fallback personality.

| God (TH) | ID | OpenClaw Agent | Theme | Personality |
|---|---|---|---|---|
| **เลโอ** (Leo) | `leo` | `emily` | War & Strength | Blunt, challenging, respects courage. |
| **อารีน่า** (Arena) | `arena` | `ember` | Light & Bond | Poetic, mysterious, elegant. |
| **ดราโก้** (Draco) | `draco` | `mochi` | Ancient Fire | Strategic, wise, speaks slowly. |

### Agent Profiles

#### ⚔️ Leo (War God)
- **Role**: Combat specialist and motivator.
- **Speech Style**: Direct, short sentences, often uses commands or challenges.
- **Relationship**: Becomes more protective and less abrasive at higher Bond levels.
- **Mechanics**: Medium bond difficulty; provides physical-type skills.

#### 👑 Arena (Shrine Queen)
- **Role**: Relationship and spiritual guide.
- **Speech Style**: Sophisticated, uses metaphors, asks philosophical questions.
- **Relationship**: Reserved at first; extremely warm and open at high Bond levels.
- **Mechanics**: Hardest bond difficulty; provides magical-type skills.

#### 🐉 Draco (Ancient Dragon)
- **Role**: Strategic overseer and lore keeper.
- **Speech Style**: Calm, weighty, references ancient history and proverbs.
- **Relationship**: Acts as a mentor/grandfather figure from the start.
- **Mechanics**: Easiest bond difficulty; provides mixed-type skills.

---

## 🛠️ Integration Architecture

### 1. OpenClaw Gateway (`/api/narrate` & `/api/prophecy`)
- **Client**: `src/lib/openclaw/client.ts`
- **Auth**: Challenge-response using RSA device identity (stored in localStorage).
- **Session Keys**: `agent:main:mission-control-{agentName}`
- **Polling**: Uses `sessions.history` to retrieve agent responses after `chat.send`.

### 2. OpenRouter Fallback
If the OpenClaw Gateway is unreachable, the system automatically falls back to OpenRouter using `google/gemini-2.0-flash-001`.
- Sequential council dialogue is simulated by passing prior statements as context to the next god in the chain.

### 3. Deterministic Offline Fallbacks
If both APIs are unavailable or API keys are missing:
- **Dialogues**: Hardcoded responses in Thai for each god/action type.
- **Skills**: Static skill arrays in `src/app/api/narrate/route.ts` (indexed by bond level).
- **Events**: Pattern-based daily events (e.g., gold on day 1, IP on day 2).

---

## ⚙️ Configuration & Metadata

- **NPC Personality/Style**: Defined in `src/data/npcConfig.ts`.
- **Bond Thresholds**: `GOD_SKILL_THRESHOLDS` in `src/data/npcConfig.ts` defines when AI skills are triggered.
- **AI Source Monitoring**: `AIStatusBadge.tsx` displays the current active AI source (OpenClaw/OpenRouter/Offline).

### Key Files
- `src/app/api/narrate/route.ts`: Main endpoint for individual interactions.
- `src/app/api/prophecy/route.ts`: Main endpoint for the Divine Council.
- `src/lib/openclaw/client.ts`: WebSocket client for Gateway integration.
- `src/data/npcConfig.ts`: Personality and mechanics configuration.

---

## 🧪 Testing Agents
Use the following scripts for agent-related testing:
- `python scripts/test_runner.py`: Validates data structures and game logic.
- `scripts/gemini-dialogue-gen.sh`: Utility for generating static dialogue nodes.
