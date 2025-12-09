# Jetpack Ascent

A vertical traversal platformer built with KAPLAY. Navigate a multi-theme tower using a jetpack, landing on platforms, avoiding robotic hazards, collecting power-ups, and advancing through three distinct levels.

## Game Overview

**Jetpack Ascent** features:
- 🚀 Jetpack-powered vertical platforming
- 🎮 Three themed levels: Space Tower, Gothic Tower, and Modern Business Tower
- 🤖 Multiple enemy types with unique AI patterns
- ⚡ Power-ups and platform variations
- 💀 Fall damage system with velocity tracking
- 🎯 Three difficulty modes (Easy, Medium, Hard)

## Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The game will open at `http://localhost:5173` (or similar port shown in terminal).

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
jetpack-ascent/
├── src/
│   ├── main.js           # Game entry point
│   ├── config.js         # Difficulty settings and constants
│   ├── scenes/           # Game scenes (menu, levels, etc.)
│   ├── entities/         # Player, enemies, platforms
│   └── utils/            # Helper functions
├── assets/
│   ├── sprites/          # Character and environment sprites
│   ├── audio/            # Sound effects and music
│   └── data/             # Level layouts and configurations
├── public/               # Static files
├── index.html            # HTML entry point
├── package.json          # Dependencies
├── jetpackgame.prd       # Product requirements document
├── graphics.doc          # Graphics and sprite specifications
└── README.md             # This file
```

## Controls

| Input | Action |
|-------|--------|
| Left Arrow / Right Arrow | Move horizontally |
| Space (hold) | Jetpack thrust upward |
| Down Arrow | Slight downward adjustment (optional) |
| R | Restart after death |
| Esc | Pause menu |

## Development

### Current Status

See `IMPLEMENTATION_PLAN.md` for current development stage and progress.

### Contributing

1. Check GitHub Issues for available tasks
2. Create a feature branch from `main`
3. Follow the coding guidelines in `CLAUDE.md`
4. Test your changes thoroughly
5. Submit a pull request

### Placeholder Graphics

During initial development, the game uses colored rectangles and simple shapes as placeholders. These will be replaced with proper pixel art sprites per `graphics.doc` specifications.

## Deployment

### GitHub Pages

```bash
npm run build
# Deploy dist/ folder to gh-pages branch
```

### Firebase Hosting (Future)

Firebase hosting will be configured in a future update for more advanced features and analytics.

## Documentation

- **PRD**: See `jetpackgame.prd` for complete game specification
- **Graphics Spec**: See `graphics.doc` for sprite and visual design details
- **Development Guidelines**: See `CLAUDE.md` for development philosophy and process

## License

TBD

## Credits

Game design and development by John Little
Built with [KAPLAY](https://kaplayjs.com/)
