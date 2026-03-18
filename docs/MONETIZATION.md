# Monetization Strategy

**Gods' Arena (วิหารแห่งเทพ)** — Monetization Design

---

## Current State

Gods' Arena is currently a **free web game** with no monetization. All features are accessible without payment. This document outlines potential monetization paths for future releases.

---

## Recommended Model: Free-to-Play + Cosmetic IAP

Given the game's genre mix (Shop Management + RPG + Dating Sim) and web platform, the best fit is **free core gameplay with optional cosmetic/convenience purchases**.

### Why This Model
- Target audience (casual RPG fans) expects free access
- Shop management + dating sim genres have proven IAP models
- AI-generated content is a unique selling point worth monetizing
- Web platform supports microtransactions easily

---

## Tier 1: Cosmetic Purchases (Low Risk, High Margin)

### God Skins
- Alternative character sprites for Leo, Arena, Draco, and Kane
- Includes: idle animation, combat animation, portrait art
- Pricing: $1.99 - $4.99 per skin
- Example themes: Summer, Dark, Celestial, Chibi

### Shop Themes
- Custom backgrounds and UI themes for the shop phase
- Seasonal themes (New Year, Songkran, Halloween)
- Pricing: $0.99 - $2.99

### Portrait Packs
- HD character portraits for dialogue scenes
- Each pack includes multiple expressions per god
- Pricing: $1.99 per god pack

---

## Tier 2: Convenience / Quality-of-Life (Moderate Risk)

### Extended Run
- Purchase additional days beyond the 20-day limit
- +5 days for $0.99 (one-time per run)
- Does not affect difficulty scaling

### Extra Save Slots
- Base game: 3 manual save slots
- Unlock 3 additional slots: $0.99 (permanent)

### AI Dialogue Credits
- Base game includes fallback dialogue (hardcoded Thai text)
- Premium: enhanced AI-generated dialogue with richer personality
- Monthly subscription: $2.99/month for unlimited AI calls
- Or pay-per-use: $0.99 for 100 AI dialogue credits

### Rewind Day
- Undo the last day and replay it
- $0.49 per use, max 3 per run
- Does not affect achievements

---

## Tier 3: Content Packs (Higher Value)

### New God Pack
- Additional companion gods beyond Leo, Arena, Draco
- Each includes: full personality, dialogue, 5 unique skills, favorite gifts, prophecy lines
- Pricing: $3.99 per god

### New Location Pack
- Additional exploration locations with unique loot, monsters, events
- Example: Abyssal Sea, Sky Temple, Underworld
- Pricing: $1.99 per location

### Story Chapter
- Extended narrative chapters (novel-style) unlocked after game completion
- Thai-language lore content from the `novel/` directory
- Pricing: $0.99 per chapter or $4.99 bundle

### Boss Rush Mode
- Endless arena mode with escalating difficulty
- Leaderboard support
- Pricing: $1.99 (permanent unlock)

---

## Tier 4: Season Pass / Battle Pass

### Monthly Season
- 30-day progression track with free and premium tiers
- Free tier: basic rewards (gold, common items)
- Premium tier ($4.99/month): exclusive skins, extra save slots, bonus AI credits, unique skills

### Season Rewards Example
| Level | Free | Premium |
|-------|------|---------|
| 5 | 100 gold | Exclusive portrait |
| 10 | Health Potion x3 | God skin (Leo Summer) |
| 15 | 200 gold | +5 day extension token |
| 20 | Mana Potion x3 | Unique combat skill |
| 25 | 300 gold | Shop theme (Celestial) |
| 30 | Achievement badge | All above + AI credit pack |

---

## Anti-Pay-to-Win Principles

1. **No stat purchases** — Cannot buy ATK, DEF, HP, or bond points
2. **No exclusive items with gameplay impact** — All items in the shop are earnable through gameplay
3. **No energy/stamina system** — 3 actions per day is a design choice, not a monetization gate
4. **AI is a bonus, not a requirement** — Hardcoded fallbacks ensure full gameplay without AI credits
5. **No loot boxes** — All purchases are transparent (know exactly what you get)

---

## Revenue Projections (Hypothetical)

Assuming 10,000 monthly active players:

| Metric | Conservative | Optimistic |
|--------|-------------|------------|
| Conversion rate | 2% | 5% |
| ARPU (paying users) | $3/month | $8/month |
| Monthly revenue | $600 | $4,000 |
| Primary revenue source | Cosmetics | Season Pass |

---

## Implementation Priority

| Priority | Feature | Effort | Revenue Potential |
|----------|---------|--------|-------------------|
| 1 | God skins (sprite packs) | Medium | High |
| 2 | AI dialogue subscription | Low | Medium |
| 3 | Extra save slots | Low | Low |
| 4 | New god packs | High | High |
| 5 | Season pass | High | High |
| 6 | New location packs | Medium | Medium |
| 7 | Story chapters | Low | Low |

---

## Technical Requirements

### Payment Integration
- Stripe or Paddle for web payments
- Need: user accounts (currently none — game is client-side only)
- Save data would need server-side persistence for IAP validation

### AI Credit System
- Track usage per user (requires backend)
- Rate limiting on `/api/narrate` and `/api/prophecy`
- Fallback behavior already built (graceful degradation)

### Content Delivery
- Skin/theme assets served from CDN
- Content packs as downloadable asset bundles
- Feature flags to gate premium content

---

## Notes

- Current MVP has no user accounts or backend database — monetization requires adding auth + server-side save
- The OpenClaw Gateway integration already supports multi-agent AI, which could power premium AI features
- Thai-language content is a differentiator in the SEA market
- Consider soft launch on itch.io (free) before adding monetization
