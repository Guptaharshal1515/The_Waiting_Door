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
  initialLevel?: number;
}

// Simple level map (1 = wall, 0 = floor, 2 = door, 3 = key, 4 = relic, 9 = start)
const LEVEL_MAPS = [
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 9, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 3, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 4, 1, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 1, 1, 2, 2, 1, 1, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 9, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 2, 2, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 3, 0, 0, 0, 0, 4, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 4, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  // Level 3: The Crossroads
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 9, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 3, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 4, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  // Level 4: The Spiral
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 0, 2, 2, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 4, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  // Level 5: The Chambers
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 9, 0, 0, 1, 4, 0, 0, 1, 0, 0, 0, 1, 4, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1],
    [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 4, 1],
    [1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 2, 2, 1, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 3, 0, 1, 0, 0, 0, 1, 0, 3, 0, 1, 0, 0, 1],
    [1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1],
    [1, 4, 0, 0, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 4, 0, 0, 4, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  // Level 6: The Final Observation
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 1],
    [1, 0, 0, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1, 0, 0, 1],
    [1, 0, 0, 1, 4, 0, 1, 1, 1, 2, 2, 1, 1, 1, 0, 4, 1, 0, 0, 1],
    [1, 0, 0, 1, 4, 0, 1, 3, 0, 0, 0, 0, 0, 1, 0, 4, 1, 0, 0, 1],
    [1, 0, 0, 1, 4, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 4, 1, 0, 0, 1],
    [1, 0, 0, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1, 0, 0, 1],
    [1, 0, 0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ]
];

export function GameCanvas({ onGameComplete, onTensionChange, initialLevel = 0 }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  const [level, setLevel] = useState(initialLevel);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [gameKey, setGameKey] = useState(0); // Used to force useEffect re-run
  const [scoreboardUpdate, setScoreboardUpdate] = useState(0); // Force scoreboard re-renders

  // Game state stored in Ref to avoid re-renders during loop
  const stateRef = useRef<GameState & { currentLevel: number; hasKey: boolean; ghostVelocity: Point; totalRelics: number; collectedRelics: number }>({
    player: { x: 80, y: 80, isMoving: false },
    ghost: { x: 0, y: 0, opacity: 0, targetOpacity: 0, visible: false },
    lastMoveTime: Date.now(),
    doorOpenProgress: 0,
    isDoorOpen: false,
    gameCompleted: false,
    startTime: Date.now(),
    currentLevel: initialLevel,
    hasKey: false,
    ghostVelocity: { x: 0, y: 0 },
    totalRelics: 0,
    collectedRelics: 0
  });

  // Input state
  const keysRef = useRef<Record<string, boolean>>({});
  const keyPositionRef = useRef<{ x: number; y: number } | null>(null);
  const currentMapRef = useRef<number[][]>([]);

  const initLevel = (lvlIndex: number) => {
    // Create a DEEP COPY of the map to avoid mutating the original
    currentMapRef.current = LEVEL_MAPS[lvlIndex].map(row => [...row]);
    const map = currentMapRef.current;

    let relicCount = 0;
    keyPositionRef.current = null;

    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === 9) {
          stateRef.current.player.x = x * TILE_SIZE + TILE_SIZE / 2;
          stateRef.current.player.y = y * TILE_SIZE + TILE_SIZE / 2;
        }
        if (map[y][x] === 3) {
          // Store key position for respawning
          keyPositionRef.current = { x, y };
        }
        if (map[y][x] === 4) relicCount++;
      }
    }
    stateRef.current.totalRelics = relicCount;
    stateRef.current.collectedRelics = 0;
    stateRef.current.isDoorOpen = false;
    stateRef.current.doorOpenProgress = 0;
    stateRef.current.hasKey = false;
    stateRef.current.lastMoveTime = Date.now();
    stateRef.current.ghost.visible = false;
    stateRef.current.ghost.opacity = 0;
  };

  const respawnPlayer = (lvlIndex: number) => {
    const map = currentMapRef.current;

    // Reset player position to spawn point
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === 9) {
          stateRef.current.player.x = x * TILE_SIZE + TILE_SIZE / 2;
          stateRef.current.player.y = y * TILE_SIZE + TILE_SIZE / 2;
        }
      }
    }

    // Respawn key at original position (if it was collected)
    if (stateRef.current.hasKey && keyPositionRef.current) {
      map[keyPositionRef.current.y][keyPositionRef.current.x] = 3;
      stateRef.current.hasKey = false;
    }

    // Keep relics collected (don't reset collectedRelics)
    stateRef.current.isDoorOpen = false;
    stateRef.current.doorOpenProgress = 0;
    stateRef.current.lastMoveTime = Date.now();
    stateRef.current.ghost.visible = false;
    stateRef.current.ghost.opacity = 0;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    initLevel(stateRef.current.currentLevel);
    stateRef.current.startTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Update scoreboard every 100ms
    const scoreboardInterval = setInterval(() => {
      setScoreboardUpdate(prev => prev + 1);
    }, 100);

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
        const length = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / length) * PLAYER_SPEED;
        dy = (dy / length) * PLAYER_SPEED;
      }

      // Collision Detection (Circle vs AABB Tiles)
      const currentMap = currentMapRef.current;
      const nextX = state.player.x + dx;
      const nextY = state.player.y + dy;

      let collidedX = false;
      let collidedY = false;

      // Check X collision
      const tileX = Math.floor(nextX / TILE_SIZE);
      const tileY_curr = Math.floor(state.player.y / TILE_SIZE);
      if (currentMap[tileY_curr]?.[tileX] === 1) collidedX = true;

      // Check Y collision
      const tileX_curr = Math.floor(state.player.x / TILE_SIZE);
      const tileY = Math.floor(nextY / TILE_SIZE);
      if (currentMap[tileY]?.[tileX_curr] === 1) collidedY = true;

      // Update position if no collision
      if (!collidedX) state.player.x += dx;
      if (!collidedY) state.player.y += dy;

      state.player.isMoving = (dx !== 0 || dy !== 0);

      // Collection logic
      const px = Math.floor(state.player.x / TILE_SIZE);
      const py = Math.floor(state.player.y / TILE_SIZE);
      if (currentMap[py]?.[px] === 3) {
        currentMap[py][px] = 0; // Remove key
        state.hasKey = true;
      }
      if (currentMap[py]?.[px] === 4) {
        currentMap[py][px] = 0; // Remove relic
        state.collectedRelics++;
      }


      // 2. Door Opening Logic - Opens IMMEDIATELY when all items collected
      const allRelicsCollected = state.collectedRelics >= state.totalRelics;
      const hasAllItems = state.hasKey && allRelicsCollected;

      if (hasAllItems && !state.isDoorOpen) {
        // Door opens IMMEDIATELY - NO WAITING!
        state.isDoorOpen = true;
        state.doorOpenProgress = 1;
        onTensionChange(0);
      } else if (!hasAllItems) {
        state.isDoorOpen = false;
        state.doorOpenProgress = 0;
        onTensionChange(0);
      }


      // 3. Ghost Logic (AI Chasing & Prediction)
      const currentTileX = Math.floor(state.player.x / TILE_SIZE);
      const currentTileY = Math.floor(state.player.y / TILE_SIZE);
      const inSafetyZone = currentMap[currentTileY]?.[currentTileX] === 2 && state.isDoorOpen;

      if (!state.ghost.visible) {
        if (!inSafetyZone && Math.random() < GHOST_SPAWN_CHANCE * (1 + state.currentLevel * 0.5)) {
          const angle = Math.random() * Math.PI * 2;
          const dist = GHOST_MAX_DIST;
          state.ghost.x = state.player.x + Math.cos(angle) * dist;
          state.ghost.y = state.player.y + Math.sin(angle) * dist;
          state.ghost.visible = true;
          state.ghost.targetOpacity = 0.6 + (state.currentLevel * 0.05);
        }
      } else {
        if (state.ghost.opacity < state.ghost.targetOpacity) {
          state.ghost.opacity += GHOST_FADE_SPEED;
        }

        if (inSafetyZone) {
          // Fade out and despawn if player enters the door
          state.ghost.opacity -= GHOST_FADE_SPEED * 3;
          if (state.ghost.opacity <= 0) {
            state.ghost.visible = false;
          }
        } else {
          // Chasing logic with basic prediction
          const predictLookahead = 20 + (state.currentLevel * 5);
          const targetX = state.player.x + (state.player.isMoving ? dx * predictLookahead : 0);
          const targetY = state.player.y + (state.player.isMoving ? dy * predictLookahead : 0);

          const angleToTarget = Math.atan2(targetY - state.ghost.y, targetX - state.ghost.x);
          const chaseSpeed = 1.2 + (state.currentLevel * 0.15);

          // Calculate next ghost position
          const nextGhostX = state.ghost.x + Math.cos(angleToTarget) * chaseSpeed;
          const nextGhostY = state.ghost.y + Math.sin(angleToTarget) * chaseSpeed;

          // Check if ghost would enter a door tile (ghost cannot enter doors)
          const ghostTileX = Math.floor(nextGhostX / TILE_SIZE);
          const ghostTileY = Math.floor(nextGhostY / TILE_SIZE);
          const wouldEnterDoor = currentMap[ghostTileY]?.[ghostTileX] === 2;

          // Only move ghost if it won't enter a door
          if (!wouldEnterDoor) {
            state.ghost.x = nextGhostX;
            state.ghost.y = nextGhostY;
          }

          const distToPlayer = Math.hypot(state.player.x - state.ghost.x, state.player.y - state.ghost.y);

          // If caught, respawn player (keeps relics, respawns key)
          if (distToPlayer < PLAYER_RADIUS * 1.5) {
            respawnPlayer(state.currentLevel);
          }

          // Despawn if too far
          if (distToPlayer > GHOST_MAX_DIST * 2) {
            state.ghost.visible = false;
            state.ghost.opacity = 0;
          }
        }
      }

      // 4. Check End Condition (Enter Door)
      if (inSafetyZone && state.isDoorOpen) {
        // Pause game and show level completion screen
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
        setLevelCompleted(true);

        // Only mark game as completed if it's the last level
        if (state.currentLevel >= LEVEL_MAPS.length - 1) {
          state.gameCompleted = true;
          const duration = (Date.now() - state.startTime) / 1000;
          onGameComplete(Math.round(duration), true);
        }
        return; // Stop the game loop
      }

      draw();
      requestRef.current = requestAnimationFrame(update);
    };

    const draw = () => {
      const state = stateRef.current;
      const currentMap = currentMapRef.current;

      // Clear
      ctx.fillStyle = COLOR_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Map
      for (let y = 0; y < currentMap.length; y++) {
        for (let x = 0; x < currentMap[y].length; x++) {
          const tile = currentMap[y][x];
          const px = x * TILE_SIZE;
          const py = y * TILE_SIZE;

          if (tile === 1) {
            ctx.fillStyle = COLOR_WALL;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          } else if (tile === 2) {
            ctx.fillStyle = state.isDoorOpen ? COLOR_DOOR_OPEN : COLOR_DOOR_LOCKED;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            if (!state.isDoorOpen && state.doorOpenProgress > 0) {
              const glowAlpha = state.doorOpenProgress * 0.5;
              ctx.fillStyle = `rgba(255, 255, 255, ${glowAlpha})`;
              ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            }
          } else if (tile === 3) {
            ctx.fillStyle = "#fbbf24"; // Key color
            ctx.beginPath();
            ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 6, 0, Math.PI * 2);
            ctx.fill();
          } else if (tile === 4) {
            ctx.fillStyle = "#8b5cf6"; // Relic color
            ctx.beginPath();
            ctx.moveTo(px + TILE_SIZE / 2, py + 10);
            ctx.lineTo(px + 10, py + TILE_SIZE - 10);
            ctx.lineTo(px + TILE_SIZE - 10, py + TILE_SIZE - 10);
            ctx.closePath();
            ctx.fill();
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
        ctx.arc(state.ghost.x - 4, state.ghost.y - 2, 2, 0, Math.PI * 2);
        ctx.arc(state.ghost.x + 4, state.ghost.y - 2, 2, 0, Math.PI * 2);
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
      clearInterval(scoreboardInterval);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameKey, onTensionChange, onGameComplete]);

  const handleNextLevel = () => {
    const state = stateRef.current;
    if (state.currentLevel < LEVEL_MAPS.length - 1) {
      state.currentLevel++;
      setLevel(state.currentLevel);
      setLevelCompleted(false);
      setGameKey(prev => prev + 1); // Trigger useEffect to restart game loop
    }
  };

  const handleReplayLevel = () => {
    setLevelCompleted(false);
    setGameKey(prev => prev + 1); // Trigger useEffect to restart game loop
  };

  return (
    <div className="flex gap-4 items-start">
      {/* Scoreboard - Left side */}
      <div className="bg-black/80 border border-zinc-700 rounded-lg p-4 text-white font-mono text-sm space-y-2 min-w-[200px]">
        <div className="text-lg font-bold text-purple-400 border-b border-zinc-700 pb-2">
          Level {stateRef.current.currentLevel + 1}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-zinc-400">Key:</span>
            <span className={stateRef.current.hasKey ? "text-yellow-400" : "text-zinc-600"}>
              {stateRef.current.hasKey ? "✓ Collected" : "✗ Missing"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-400">Relics:</span>
            <span className="text-purple-400">
              {stateRef.current.collectedRelics} / {stateRef.current.totalRelics}
            </span>
          </div>
        </div>

        <div className="border-t border-zinc-700 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Door:</span>
            <span className={stateRef.current.isDoorOpen ? "text-green-400" : "text-red-400"}>
              {stateRef.current.isDoorOpen ? "OPEN" : "LOCKED"}
            </span>
          </div>
        </div>
      </div>

      {/* Game Canvas - Right side */}
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



        {/* Level Completion Screen */}
        {levelCompleted && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center space-y-8 px-8 py-12 bg-zinc-900/80 border border-zinc-700 rounded-lg shadow-2xl max-w-md">
              <h2 className="text-4xl font-bold text-white mb-2">
                Level {stateRef.current.currentLevel + 1} Complete!
              </h2>
              <p className="text-zinc-400 text-lg">
                Congratulations! You've mastered the art of patience.
              </p>

              <div className="flex gap-4 justify-center mt-8">
                <button
                  onClick={handleReplayLevel}
                  className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors duration-200 font-semibold"
                >
                  Replay Level
                </button>

                {stateRef.current.currentLevel < LEVEL_MAPS.length - 1 && (
                  <button
                    onClick={handleNextLevel}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors duration-200 font-semibold"
                  >
                    Next Level →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
