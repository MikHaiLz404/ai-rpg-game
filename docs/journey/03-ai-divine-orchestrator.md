# Dev Log: The Divine Orchestrator (AI Architecture)

## Overview
This phase introduced the most advanced AI features of the project. A centralized "Brain" was built to handle complex routing, multi-agent simulations, and resilient fallbacks, circumventing OpenClaw gateway issues while preserving the vision of an intelligent divine world.

## Key Changes

### 🧠 Divine Orchestrator
- **Centralized Logic**: Created `src/lib/ai/orchestrator.ts` to manage all AI requests. The API route now simply delegates to this service.
- **Rule-Based Switching**: Implemented logic to choose models based on context:
    - **Speed**: Gemini 2.0 Flash for standard interactions.
    - **Intelligence**: GPT-4o mini for Prophecies and late-game urgency.
    - **Quality**: Claude 3.5 Sonnet for players with high Bond levels (>= 12).

### 🤝 Multi-Agent Simulations
- **Council Chat**: Simulated agent-to-agent communication by chaining API calls (e.g., Leo speaks, then Arena responds to Leo's words).
- **Autonomous Triggers**: The Divine Council now automatically triggers every 5 days after the Prophecy to judge the player's progress.

### 🎭 Dynamic Heralds
- **Sub-Agent Persona**: If a God's bond is low (< 5), the Orchestrator automatically switches the NPC to a "Herald" (Messenger). The system prompt shifts to a haughty, professional tone, reflecting the God's lack of interest in the player.

### 🛡️ Resilient Fallbacks
- **OpenRouter Priority**: Configured the system to prioritize OpenRouter for gods to avoid the 20s connection timeouts of the current OpenClaw version.
- **Offline Variety**: Expanded the pool of randomized Thai fallback dialogues so the game remains atmospheric even without internet or API access.

## Rationale
The goal was to make the Gods feel alive and distinct. By using different models for different bond levels, the AI becomes a reward for progression. The Herald system and Divine Council add narrative depth that moves the game beyond simple "chat with NPC" mechanics.
