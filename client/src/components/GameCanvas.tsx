import { useEffect, useRef, useState } from "react";
import { 
  TILE_SIZE, 
  PLAYER_SPEED, 
  PLAYER_RADIUS, 
  VISIBILITY_RADIUS,
  COLOR_BG,
  COLOR_WALL,
  COLOR_FLOOR,
  COLOR_PLAYER,
  COLOR_DOOR_LOCKED,
  COLOR_DOOR_OPEN,
  COLOR_GHOST,
  WAITING_THRESHOLD_MS,
  GHOST_SPAWN_CHANCE,
  GHOST_MIN_DIST,
  GHOST_MAX_DIST,
  GHOST_FADE_SPEED
} from "../game/constants";
import type { GameState, Point } from "../game/types";

interface GameCanvasProps {
  onGameComplete: (durationSeconds: number, waited: boolean) => void;
  onTensionChange: (tension: number) => void;
}

// Simple level map (1 = wall, 0 = floor, 2 = door, 9 = start)
// 20x15 grid (800x600 px)
const LEVEL_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,9,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,1,1,1,1,0,0,0,0,0,0,1],
  [1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,0,0,1,0,0,1,1,1,2,2,1,1,1,0,0,1,0,0,1], // Door at (9,12) and (10,12)
  [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

export function GameCanvas({ onGameComplete, onTensionChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game state stored in Ref to avoid re-renders during loop
  const stateRef = useRef<GameState>({
    player: { x: 80, y: 80, isMoving: false },
    ghost: { x: 0, y: 0, opacity: 0, targetOpacity: 0, visible: false },
    lastMoveTime: Date.now(),
    doorOpenProgress: 0,
    isDoorOpen: false,
    gameCompleted: false,
    startTime: Date.now()
  });

  // Input state
  const keysRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize player pos from map
    for(let y=0; y<LEVEL_MAP.length; y++) {
      for(let x=0; x<LEVEL_MAP[y].length; x++) {
        if (LEVEL_MAP[y][x] === 9) {
          stateRef.current.player.x = x * TILE_SIZE + TILE_SIZE/2;
          stateRef.current.player.y = y * TILE_SIZE + TILE_SIZE/2;
        }
      }
    }
    stateRef.current.startTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // --- GAME LOOP ---
    const update = () => {
      const state = stateRef.current;
      if (state.gameCompleted) return;

      const now = Date.now();

      // 1. Movement Logic
      let dx = 0;
      let dy = 0;
      if (keysRef.current["KeyW"] || keysRef.current["ArrowUp"]) dy -= PLAYER_SPEED;
      if (keysRef.current["KeyS"] || keysRef.current["ArrowDown"]) dy += PLAYER_SPEED;
      if (keysRef.current["KeyA"] || keysRef.current["ArrowLeft"]) dx -= PLAYER_SPEED;
      if (keysRef.current["KeyD"] || keysRef.current["ArrowRight"]) dx += PLAYER_SPEED;

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx*dx + dy*dy);
        dx = (dx/length) * PLAYER_SPEED;
        dy = (dy/length) * PLAYER_SPEED;
      }

      // Collision Detection (Circle vs AABB Tiles)
      const nextX = state.player.x + dx;
      const nextY = state.player.y + dy;
      
      let collidedX = false;
      let collidedY = false;

      // Check X collision
      const tileX = Math.floor(nextX / TILE_SIZE);
      const tileY_curr = Math.floor(state.player.y / TILE_SIZE);
      if (LEVEL_MAP[tileY_curr]?.[tileX] === 1) collidedX = true;
      
      // Check Y collision
      const tileX_curr = Math.floor(state.player.x / TILE_SIZE);
      const tileY = Math.floor(nextY / TILE_SIZE);
      if (LEVEL_MAP[tileY]?.[tileX_curr] === 1) collidedY = true;

      // Update position if no collision
      if (!collidedX) state.player.x += dx;
      if (!collidedY) state.player.y += dy;

      state.player.isMoving = (dx !== 0 || dy !== 0);

      // 2. Waiting Logic (The Puzzle)
      if (state.player.isMoving) {
        state.lastMoveTime = now;
        state.doorOpenProgress = 0;
        // Notify parent tension reset
        onTensionChange(0);
      } else {
        const timeStill = now - state.lastMoveTime;
        const progress = Math.min(timeStill / WAITING_THRESHOLD_MS, 1);
        state.doorOpenProgress = progress;
        onTensionChange(progress); // Update audio tension

        if (progress >= 1) {
          state.isDoorOpen = true;
        }
      }

      // 3. Ghost Logic (Atmosphere)
      if (!state.ghost.visible) {
        if (Math.random() < GHOST_SPAWN_CHANCE) {
          // Spawn ghost
          const angle = Math.random() * Math.PI * 2;
          const dist = GHOST_MIN_DIST + Math.random() * (GHOST_MAX_DIST - GHOST_MIN_DIST);
          state.ghost.x = state.player.x + Math.cos(angle) * dist;
          state.ghost.y = state.player.y + Math.sin(angle) * dist;
          state.ghost.visible = true;
          state.ghost.targetOpacity = 0.4 + Math.random() * 0.3;
        }
      } else {
        // Fade in
        if (state.ghost.opacity < state.ghost.targetOpacity) {
          state.ghost.opacity += GHOST_FADE_SPEED;
        }

        // Despawn if player gets too close
        const distToPlayer = Math.hypot(state.player.x - state.ghost.x, state.player.y - state.ghost.y);
        if (distToPlayer < VISIBILITY_RADIUS * 0.8) {
           state.ghost.visible = false;
           state.ghost.opacity = 0; // Immediate vanish or fast fade out
        }
        
        // Random drift
        state.ghost.x += (Math.random() - 0.5) * 0.5;
        state.ghost.y += (Math.random() - 0.5) * 0.5;
      }

      // 4. Check End Condition (Enter Door)
      const currentTileX = Math.floor(state.player.x / TILE_SIZE);
      const currentTileY = Math.floor(state.player.y / TILE_SIZE);
      if (LEVEL_MAP[currentTileY]?.[currentTileX] === 2 && state.isDoorOpen) {
        state.gameCompleted = true;
        const duration = (Date.now() - state.startTime) / 1000;
        onGameComplete(Math.round(duration), true);
      }

      draw();
      requestRef.current = requestAnimationFrame(update);
    };

    const draw = () => {
      const state = stateRef.current;
      
      // Clear
      ctx.fillStyle = COLOR_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save context for camera/translation if we wanted it, but map fits screen (800x600)
      // Map is 20 * 40 = 800 width, 15 * 40 = 600 height. Perfect fit.

      // Draw Map
      for(let y=0; y<LEVEL_MAP.length; y++) {
        for(let x=0; x<LEVEL_MAP[y].length; x++) {
          const tile = LEVEL_MAP[y][x];
          const px = x * TILE_SIZE;
          const py = y * TILE_SIZE;

          if (tile === 1) {
            ctx.fillStyle = COLOR_WALL;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          } else if (tile === 2) {
            // Door
            ctx.fillStyle = state.isDoorOpen ? COLOR_DOOR_OPEN : COLOR_DOOR_LOCKED;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            
            // Visual cue for waiting
            if (!state.isDoorOpen && state.doorOpenProgress > 0) {
              const glowAlpha = state.doorOpenProgress * 0.5;
              ctx.fillStyle = `rgba(255, 255, 255, ${glowAlpha})`;
              ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
              
              // Particle effect hint (dots rising from door)
              if (Math.random() < state.doorOpenProgress) {
                 ctx.fillStyle = "white";
                 ctx.fillRect(px + Math.random()*TILE_SIZE, py + Math.random()*TILE_SIZE, 2, 2);
              }
            }
          } else {
            ctx.fillStyle = COLOR_FLOOR;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          }
        }
      }

      // Draw Player
      ctx.fillStyle = COLOR_PLAYER;
      ctx.beginPath();
      ctx.arc(state.player.x, state.player.y, PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Draw Ghost (Under fog? No, ghostly things might shine through slightly, but let's keep it grounded)
      if (state.ghost.visible && state.ghost.opacity > 0) {
        ctx.fillStyle = `rgba(200, 220, 255, ${state.ghost.opacity})`;
        ctx.beginPath();
        // Ghost shape - slightly amorphous
        ctx.arc(state.ghost.x, state.ghost.y, PLAYER_RADIUS * 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = `rgba(0,0,0, ${state.ghost.opacity * 0.5})`;
        ctx.beginPath();
        ctx.arc(state.ghost.x - 4, state.ghost.y - 2, 2, 0, Math.PI*2);
        ctx.arc(state.ghost.x + 4, state.ghost.y - 2, 2, 0, Math.PI*2);
        ctx.fill();
      }

      // --- FOG OF WAR ---
      // We draw a giant black rectangle over everything, but cut out a hole using 'destination-out'
      // Or use a radial gradient on top.
      
      // Method: Radial Gradient Mask
      const gradient = ctx.createRadialGradient(
        state.player.x, state.player.y, 
        VISIBILITY_RADIUS * 0.4, // Inner radius (fully clear)
        state.player.x, state.player.y, 
        VISIBILITY_RADIUS        // Outer radius (fully black)
      );
      
      // In canvas gradients for masking:
      // We want to draw BLACK darkness.
      // So inner should be transparent, outer should be opaque black.
      gradient.addColorStop(0, 'rgba(9, 9, 11, 0)'); // Transparent at center
      gradient.addColorStop(0.6, 'rgba(9, 9, 11, 0.4)');
      gradient.addColorStop(1, 'rgba(9, 9, 11, 1)'); // Solid black at edge

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Fill everything outside radius with solid black to be safe (gradient handles it mostly but rectangular fill ensures corners)
      // Actually the fillRect covers the whole screen with the gradient, so if the gradient radius < screen size, we need to make sure the "1" stop continues.
      // Canvas gradients clamp the last color stop. So the edges will be black.
    };

    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="relative rounded-sm overflow-hidden border border-zinc-800 shadow-2xl shadow-black">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        className="block bg-black cursor-none"
      />
      {/* Scanline overlay for aesthetic */}
      <div className="absolute inset-0 pointer-events-none crt-overlay opacity-20 mix-blend-overlay"></div>
      <div className="absolute inset-0 pointer-events-none vignette"></div>
    </div>
  );
}
