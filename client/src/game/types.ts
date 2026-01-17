export interface Point {
  x: number;
  y: number;
}

export interface Player {
  x: number;
  y: number;
  isMoving: boolean;
}

export interface Ghost {
  x: number;
  y: number;
  opacity: number;
  targetOpacity: number;
  visible: boolean;
}

export interface GameState {
  player: Player;
  ghost: Ghost;
  lastMoveTime: number; // Timestamp when player last moved
  doorOpenProgress: number; // 0 to 1
  isDoorOpen: boolean;
  gameCompleted: boolean;
  startTime: number;
}
