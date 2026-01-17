# The Waiting Door 🚪

A psychological horror game where patience is your only weapon. Navigate through dark corridors, collect relics, and face the watching ghost. But remember - sometimes the best action is to wait.

### **The door opened not because you pushed, but because you stopped pushing.**

![Game Preview](https://img.shields.io/badge/Status-Playable-success)
![License](https://img.shields.io/badge/License-MIT-blue)

##  About The Game

**The Waiting Door** is a 2D psychological horror game built with React and TypeScript. Unlike traditional horror games that rely on jump scares, this game creates tension through atmosphere, limited visibility, and the constant feeling of being watched.

### Core Mechanics
- **Limited Visibility**: Navigate through darkness with only a small circle of light around you
- **Ghost AI**: An intelligent ghost that predicts your movements and hunts you down
- **Collection System**: Find keys and relics to unlock the exit door
- **Multiple Levels**: 6 progressively challenging levels with unique layouts
- **Fog of War**: Experience true darkness with radial gradient visibility

##  Features

- ✨ **6 Unique Levels** - Each with increasing difficulty and complexity
- 👻 **Smart Ghost AI** - Predicts player movement and adapts to your playstyle
- 🔑 **Collection Mechanics** - Keys and relics to find in each level
- 🌑 **Atmospheric Darkness** - Limited visibility creates genuine tension
- 📊 **Live Scoreboard** - Track your progress in real-time
- 🎨 **Retro Aesthetic** - CRT scanline effects and vignette overlay
- 🔄 **Respawn System** - Ghost catches you? Start again, but keep your relics!

##  Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/Guptaharshal1515/The_Waiting_Door.git
cd The_Waiting_Door
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎮 How to Play

### Controls
- **W / ↑** - Move Up
- **S / ↓** - Move Down
- **A / ←** - Move Left
- **D / →** - Move Right

### Objective
1. Collect the **key** (yellow circle) in each level
2. Find all **relics** (purple triangles) scattered throughout the map
3. Once you have all items, the **door** (red/green blocks) will open
4. Enter the door to complete the level
5. Avoid the **ghost** - if it catches you, you respawn but keep your relics!

### Tips
- The ghost cannot enter the door area - use it as a safe zone
- Relics persist even if you die, so don't worry about losing progress
- The ghost gets smarter and faster in higher levels
- Sometimes standing still is the best strategy

## 🏗️ Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3 with custom properties
- **Canvas Rendering**: HTML5 Canvas API
- **State Management**: React Hooks (useState, useRef, useEffect)

## 📁 Project Structure

```
The_Waiting_Door/
├── client/
│   ├── public/
│   │   └── favicon.png
│   ├── src/
│   │   ├── components/
│   │   │   └── GameCanvas.tsx    # Main game logic
│   │   ├── game/
│   │   │   ├── constants.ts      # Game constants
│   │   │   └── types.ts          # TypeScript types
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🎨 Game Design Philosophy

This game is built around the concept of **psychological horror** rather than jump scares:

1. **Atmosphere over Action**: The constant feeling of being watched creates more tension than any monster
2. **Limited Information**: You can only see a small area around you, making every corner dangerous
3. **Intelligent Enemies**: The ghost learns and predicts your movements
4. **Risk vs Reward**: Do you rush to collect items or take your time to avoid the ghost?

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check without emitting files

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation


## 👨‍💻 Author

**Harshal Gupta**
- GitHub: [@Guptaharshal1515](https://github.com/Guptaharshal1515)

**Amarendra Pratap Singh**
- Github: [@orbaps](https://github.com/orbaps)
## 🙏 Acknowledgments

- Inspired by classic psychological horror games
- Built as a learning project for game development with React
- Special thanks to the open-source community

---

**Enjoy the game, and remember - sometimes the door is waiting for you.** 🚪👻
