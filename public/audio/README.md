# Audio Assets

This folder contains all audio files for Gods' Arena.

## Folder Structure

```
audio/
├── bgm/                    # Background music (loop enabled)
│   ├── shop/               # Shop phase - merchant/haggle themes
│   ├── arena/              # Combat phase - epic battle music
│   ├── exploration/        # Cave exploration - mysterious/tense
│   ├── village/            # Village/relationship - calm/friendly
│   └── menu/               # Main menu - title theme
├── sfx/                    # Sound effects
│   ├── ui/                 # UI interactions
│   ├── combat/             # Combat actions
│   └── items/              # Item interactions
└── ambient/                # Ambient sounds (loop enabled)
```

## Required Audio Files

### BGM (Background Music)
| File | Description | Duration | Format |
|------|-------------|----------|--------|
| `bgm/shop/shop_theme.mp3` | Shop ambiance | Loop ~30-60s | MP3 128kbps |
| `bgm/arena/arena_theme.mp3` | Battle music | Loop ~60-120s | MP3 128kbps |
| `bgm/exploration/exploration_theme.mp3` | Cave/dungeon | Loop ~60-120s | MP3 128kbps |
| `bgm/village/village_theme.mp3` | Village calm | Loop ~60-120s | MP3 128kbps |
| `bgm/menu/menu_theme.mp3` | Title screen | Loop ~30-60s | MP3 128kbps |

### SFX (Sound Effects)
| File | Description |
|------|-------------|
| `sfx/ui/click.mp3` | Button click |
| `sfx/ui/hover.mp3` | Button hover (optional) |
| `sfx/ui/purchase.mp3` | Purchase success |
| `sfx/ui/success.mp3` | General success feedback |
| `sfx/ui/error.mp3` | Error feedback |
| `sfx/combat/attack.mp3` | Kane attacks |
| `sfx/combat/hit.mp3` | Enemy takes damage |
| `sfx/combat/divine_skill.mp3` | God skill activation |
| `sfx/combat/victory.mp3` | Battle won |
| `sfx/combat/defeat.mp3` | Battle lost |
| `sfx/items/loot.mp3` | Item acquired |
| `sfx/items/equip.mp3` | Item equipped |
| `sfx/items/use_item.mp3` | Item consumed |

### Ambient (Optional)
| File | Description |
|------|-------------|
| `ambient/cave.mp3` | Cave exploration ambiance |
| `ambient/village.mp3` | Village ambient sounds |

## Recommended Sources

### Free Music (CC0/Public Domain)
- **incompetech.com** - Kevin MacLeod's royalty-free music
- **freesound.org** - Community sounds (check license)
- **opengameart.org** - Game-specific assets

### Audio Editors
- **Audacity** (free) - For trimming/editing
- **bfxr.net** - Simple SFX generator

## Audio Specifications

### Music
- Format: MP3 (broad compatibility)
- Bitrate: 128kbps (good quality/size balance)
- Sample rate: 44.1kHz
- Loop: Audio should loop seamlessly (no fade)

### Sound Effects
- Format: MP3 or WAV
- Duration: < 5 seconds for UI, < 10 seconds for combat
- Bitrate: 192kbps for MP3
- No silence at start/end

## Adding Custom Audio

1. Place audio files in appropriate folders
2. Register in `src/game/AudioManager.ts` (AUDIO_CONFIG)
3. Register in `src/game/AudioController.ts` (preload)
4. Test in browser - audio requires user interaction to play

## Troubleshooting

**Audio not playing?**
- Check browser console for errors
- Ensure file path matches exactly
- Verify file is in `public/audio/` not `src/`

**Looping issues?**
- Remove metadata/album art from MP3
- Ensure no silence at start/end of loop points
