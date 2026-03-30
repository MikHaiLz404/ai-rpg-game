# Audio System Documentation

This document describes the audio integration for Gods' Arena (วิหารแห่งเทพ).

## Architecture Overview

The audio system is split between two layers:

1. **Phaser Layer** (`AudioController.ts`) - Game engine audio
2. **React Layer** (`AudioManager.ts`) - UI audio hooks

Both layers communicate through the `EventBus` for synchronized audio playback.

## File Structure

```
public/audio/
├── bgm/                    # Background music (loop)
│   ├── shop/               # Shop phase music
│   │   └── shop_theme.mp3
│   ├── arena/              # Combat phase music
│   │   └── arena_theme.mp3
│   ├── exploration/        # Cave exploration music
│   │   └── exploration_theme.mp3
│   ├── village/            # Village/relationship music
│   │   └── village_theme.mp3
│   └── menu/               # Main menu music
│       └── menu_theme.mp3
├── sfx/                    # Sound effects
│   ├── ui/                 # UI interaction sounds
│   │   ├── click.mp3       # Button click
│   │   ├── hover.mp3       # Button hover
│   │   ├── purchase.mp3    # Purchase success
│   │   ├── success.mp3     # General success
│   │   └── error.mp3       # Error feedback
│   ├── combat/             # Combat sounds
│   │   ├── attack.mp3      # Kane attack
│   │   ├── hit.mp3         # Enemy hit
│   │   ├── divine_skill.mp3 # God skill activation
│   │   ├── victory.mp3     # Battle won
│   │   └── defeat.mp3      # Battle lost
│   └── items/              # Item interaction sounds
│       ├── loot.mp3        # Item acquired
│       ├── equip.mp3       # Item equipped
│       └── use_item.mp3    # Item used
└── ambient/                # Ambient sounds (loop)
    ├── cave.mp3            # Cave ambient
    └── village.mp3         # Village ambient
```

## Usage in React Components

```tsx
import { useAudio } from '@/game/AudioManager';

function MyComponent() {
  const { playSFX, playBGM, stopBGM, setVolume, toggleMute } = useAudio();

  // Play a sound effect
  const handleClick = () => {
    playSFX('ui_click');
  };

  // Play background music
  const enterShop = () => {
    playBGM('shop');
  };

  // Adjust volume
  const handleVolumeChange = (value: number) => {
    setVolume(value); // 0.0 to 1.0
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

## Usage in Phaser/Game Code

```typescript
import { EventBus } from './EventBus';
import { AUDIO_EVENTS, SFX_KEYS, BGM_KEYS } from './AudioController';

// Play sound effect
EventBus.emit(AUDIO_EVENTS.PLAY_SFX, SFX_KEYS.COMBAT_ATTACK);

// Play background music
EventBus.emit(AUDIO_EVENTS.PLAY_BGM, BGM_KEYS.SHOP);

// Stop music
EventBus.emit(AUDIO_EVENTS.STOP_BGM);
```

## Audio Keys

### BGM Keys
- `shop` - Shop phase background music
- `arena` - Arena/combat background music
- `exploration` - Cave exploration background music
- `village` - Village/relationship background music
- `menu` - Main menu background music

### SFX Keys
- `ui_click` - General UI click
- `ui_hover` - Button hover
- `ui_purchase` - Purchase confirmation
- `ui_success` - Success feedback
- `ui_error` - Error feedback
- `combat_attack` - Kane's attack
- `combat_hit` - Enemy taking damage
- `combat_divine_skill` - God skill activation
- `combat_victory` - Battle won
- `combat_defeat` - Battle lost
- `items_loot` - Item acquired
- `items_equip` - Item equipped
- `items_use` - Item used

## Adding New Audio Files

1. **Place the audio file** in the appropriate folder under `public/audio/`

2. **Register in AudioController.ts** (for Phaser):
   ```typescript
   // In preload():
   this.scene.load.audio('sfx_my_sound', '/audio/sfx/my_sound.mp3');
   ```

3. **Add to AUDIO_CONFIG** (for React):
   ```typescript
   // In AudioManager.ts
   sfx: {
     // ... existing keys
     my_sound: '/audio/sfx/my_sound.mp3',
   }
   ```

4. **Add type definitions**:
   ```typescript
   // Extend SFXKey type
   export type SFXKey = 'ui_click' | ... | 'my_sound';
   ```

## Recommended Audio Sources

### Free Sound Libraries
- **Freesound.org** - CC-licensed sounds (requires attribution)
- **OpenGameArt.org** - Public domain game assets
- **Kenney.nl** - CC0 game assets including audio
- **BBC Sound Effects** - Personal/educational use

### Audio Format Recommendations
- **BGM**: MP3 @ 128kbps, loop-friendly (no fade in/out at start/end)
- **SFX**: WAV for short sounds (instant play), MP3 @ 192kbps for longer ones
- **Ambient**: OGG for looping, MP3 as fallback

### Volume Guidelines
- **BGM**: 20-30% volume (0.2-0.3 in code)
- **SFX**: 40-60% volume (0.4-0.6 in code)
- **Ambient**: 15-25% volume (0.15-0.25 in code)

## Technical Notes

### Browser Autoplay Policy
Browsers block audio playback until user interaction. The `useAudio()` hook handles this by:
1. Delaying audio start until user clicks
2. Catching and ignoring autoplay errors
3. Providing visual mute controls

### Performance Considerations
- Audio files are cached after first load
- Only load audio in scenes that need it
- Use `preloadAudio()` for loading screens

### Persistence
Volume settings are saved to localStorage and restored on app load.

## Troubleshooting

**Audio not playing?**
1. Check file path is correct (case-sensitive on some systems)
2. Ensure audio file is in `public/audio/` not `src/`
3. Verify file format is supported (MP3, WAV, OGG)
4. Check browser console for load errors

**Music cuts out?**
1. Ensure loop flag is set for BGM
2. Check if scene transition is calling `stopBGM()` unexpectedly

**Volume too loud/quiet?**
1. Adjust global volume in `AudioManager.ts`
2. Individual volume parameters in `playSFX()` and `playBGM()`
