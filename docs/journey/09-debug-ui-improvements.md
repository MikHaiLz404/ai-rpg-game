# Dev Log: Debug & UI Improvements

## Overview
Developer experience and accessibility were improved by moving debug controls from "hidden" keyboard shortcuts to visible UI elements.

## Key Changes

### 🛠️ Debug Controls
- **UI Toggle**: Removed the legacy `G` key shortcut.
- **Header Button**: Added a dedicated **"Debug Grid"** button in the top navigation header.
- **Event-Based Toggling**: Used the `EventBus` to bridge the React button click to the Phaser engine, allowing real-time toggling of the 48px alignment grid and coordinate text.

### 🧹 Interface Cleanup
- **Placeholder Removal**: Deleted several empty "Coming Soon" component folders (`src/components/Arena/`, etc.) to reduce codebase clutter.
- **Pages Router Sanitization**: Removed leftover `_app.jsx` and `index.jsx` files from an old Pages Router configuration, ensuring the project strictly follows the Next.js **App Router** standard.

## Rationale
Hidden shortcuts are difficult for testers to remember. By adding a UI button, we make debugging accessible to non-technical team members. Cleaning up legacy files ensures the codebase remains maintainable and follows modern React standards.
