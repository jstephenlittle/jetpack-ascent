# Level Data

This folder contains level layout definitions and configuration data for Jetpack Ascent.

## Organization

### Level Layouts
- `level1_space.json` - Space Tower layout (platform positions, enemy spawns, doorway)
- `level2_gothic.json` - Gothic Tower layout
- `level3_business.json` - Business Tower layout

## Level Data Structure

Each level JSON file contains:

```json
{
  "name": "Space Tower",
  "theme": "space",
  "height": 5000,
  "startPosition": [400, 500],
  "platforms": [
    {
      "type": "static|breakaway|bounce|recharge",
      "x": 200,
      "y": 400,
      "width": 128
    }
  ],
  "enemies": [
    {
      "type": "rollerBot|hoverDrone|dropBot",
      "x": 300,
      "y": 300
    }
  ],
  "powerups": [
    {
      "type": "fuel|shield|megaBoost|extraLife",
      "x": 350,
      "y": 250
    }
  ],
  "doorway": {
    "x": 400,
    "y": 100
  }
}
```

## Difficulty Modifiers

Level data will be adjusted at runtime based on difficulty settings from `src/config.js`:
- Platform density multiplier
- Enemy spawn rate multiplier
- Power-up frequency multiplier

## Status
Level data files will be created during Stage 5-7 (Issues #18-29) when implementing each level.
