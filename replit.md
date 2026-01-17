# The Waiting Door

## Overview

A 2D psychological horror web game built with React and Canvas. The game emphasizes observation, waiting, and uncertainty rather than combat or jumpscares. Players navigate a dark, tile-based environment with limited visibility (fog of war), where the core mechanic involves standing still to unlock the exit door. The horror comes from the sense of being watched and the tension of inaction.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for UI components and game state management
- **HTML5 Canvas** for game rendering (independent of React render cycle for performance)
- **Vite** as the build tool with hot module replacement
- **Wouter** for lightweight client-side routing
- **TanStack React Query** for server state management and API calls
- **Framer Motion** for smooth UI transitions (start/end screens)
- **Tailwind CSS** with shadcn/ui component library for styling

### Game Systems (Modular Architecture)
1. **Rendering System** - Canvas-based with layered drawing (floor → walls → entities → fog → UI)
2. **Input System** - Keyboard capture (WASD/Arrows) with movement state tracking
3. **Visibility/Lighting** - Fog of war with limited player visibility radius
4. **Player System** - Position, movement state, stillness timer tracking
5. **Ghost System** - Ambient entity that appears based on player behavior
6. **Audio System** - Web Audio API for procedural ambient drone sounds

### Backend Architecture
- **Express 5** REST API server
- **TypeScript** throughout with shared types between client and server
- **Drizzle ORM** for database operations with Zod schema validation
- Session persistence for tracking game completion stats

### Data Flow
- Client renders game independently via requestAnimationFrame loop
- Game completion triggers API call to persist session data
- Shared schema definitions in `/shared/` directory for type safety

## External Dependencies

### Database
- **PostgreSQL** - Primary data store
- **Drizzle ORM** - Database operations and migrations
- **drizzle-zod** - Schema validation integration

### Third-Party Libraries
- **@radix-ui** - Accessible UI primitives for shadcn components
- **class-variance-authority** - Component variant styling
- **framer-motion** - Animation library for UI transitions
- **Web Audio API** (native) - Procedural audio generation for ambient sounds

### Development Tools
- **Vite** with React plugin for development server
- **esbuild** for production server bundling
- **drizzle-kit** for database schema management (`npm run db:push`)

### API Structure
Routes defined in `/shared/routes.ts` with Zod validation:
- `POST /api/sessions` - Record game session completion data