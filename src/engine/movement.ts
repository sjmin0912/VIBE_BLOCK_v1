import {
  Direction,
  CharacterState,
  HistoryFrame,
  MapConfig,
  BlockType,
  SpriteState,
} from "./types";
import { DIR_ORDER, DIR_VECTOR } from "./constants";

// ── 방향 회전 ──
export function rotate(dir: Direction, turn: "left" | "right"): Direction {
  const idx = DIR_ORDER.indexOf(dir);
  return turn === "left" ? DIR_ORDER[(idx + 3) % 4] : DIR_ORDER[(idx + 1) % 4];
}

export function turnAround(dir: Direction): Direction {
  const idx = DIR_ORDER.indexOf(dir);
  return DIR_ORDER[(idx + 2) % 4];
}

// 각도 기반 회전 (시계 방향)
export function rotateByAngle(dir: Direction, angleDeg: number): Direction {
  const steps = Math.round(angleDeg / 90);
  const idx = DIR_ORDER.indexOf(dir);
  return DIR_ORDER[(idx + steps + 400) % 4];
}

// ── 이동 벡터 계산 ──
export function getMoveVector(blockType: BlockType, dir: Direction): { x: number; y: number } {
  if (blockType === "move_forward") return DIR_VECTOR[dir];
  if (blockType === "move_back") {
    const v = DIR_VECTOR[dir];
    return { x: -v.x, y: -v.y };
  }
  if (blockType === "move_left") return DIR_VECTOR[rotate(dir, "left")];
  if (blockType === "move_right") return DIR_VECTOR[rotate(dir, "right")];
  return { x: 0, y: 0 };
}

// ── 맵 경계 체크 ──
export function isInBounds(x: number, y: number, cols: number, rows: number): boolean {
  return x >= 0 && y >= 0 && x < cols && y < rows;
}

// ── 앞 방향에 벽이 있는지 체크 ──
export function isWallAhead(
  state: CharacterState,
  map: MapConfig,
  wallSet: Set<string>,
  doorSet?: Set<string>,
): boolean {
  const v = DIR_VECTOR[state.dir];
  const nx = state.x + v.x;
  const ny = state.y + v.y;
  if (!isInBounds(nx, ny, map.cols, map.rows)) return true;
  if (wallSet.has(`${nx},${ny}`)) return true;
  if (doorSet && doorSet.has(`${nx},${ny}`)) return true;
  return false;
}

// ── 현재 위치에 아이템이 있는지 체크 ──
export function isItemHere(
  state: CharacterState,
  keyPositions: [number, number][],
): boolean {
  return keyPositions.some(([kx, ky]) => kx === state.x && ky === state.y);
}

// ── 목표 도달 체크 ──
export function isAtGoal(state: CharacterState, goal: { x: number; y: number }): boolean {
  return state.x === goal.x && state.y === goal.y;
}

// ── 이동 실행 (순수 함수) ──
export interface MoveResult {
  frame: HistoryFrame;
  success: boolean;
  failType?: "fail_wall" | "fail_fall" | "fail_door" | null;
  keyPositions: [number, number][];
  doorPositions: [number, number][];
}

export function executeAction(
  blockType: BlockType,
  state: CharacterState,
  map: MapConfig,
  wallSet: Set<string>,
  keyPositions: [number, number][],
  doorPositions: [number, number][],
  drawPath: { x: number; y: number }[],
  angle?: number,
): MoveResult {
  let newX = state.x;
  let newY = state.y;
  let newDir = state.dir;
  let newInventory = [...state.inventory];
  let newSprite: SpriteState = "idle";
  let newKeyPositions = [...keyPositions.map(([x, y]) => [x, y] as [number, number])];
  let newDoorPositions = [...doorPositions.map(([x, y]) => [x, y] as [number, number])];
  let newDrawPath = [...drawPath];
  const doorSet = new Set(newDoorPositions.map(([x, y]) => `${x},${y}`));

  // 회전 블록
  if (blockType === "turn_left") {
    newDir = rotate(state.dir, "left");
    return makeResult(newX, newY, newDir, newInventory, "idle", newKeyPositions, newDoorPositions, newDrawPath);
  }
  if (blockType === "turn_right") {
    newDir = rotate(state.dir, "right");
    return makeResult(newX, newY, newDir, newInventory, "idle", newKeyPositions, newDoorPositions, newDrawPath);
  }
  if (blockType === "turn_around") {
    newDir = turnAround(state.dir);
    return makeResult(newX, newY, newDir, newInventory, "idle", newKeyPositions, newDoorPositions, newDrawPath);
  }
  if (blockType === "turn_angle") {
    newDir = rotateByAngle(state.dir, angle || 90);
    return makeResult(newX, newY, newDir, newInventory, "idle", newKeyPositions, newDoorPositions, newDrawPath);
  }

  // 이동 블록
  if (blockType === "move_forward" || blockType === "move_back" || blockType === "move_left" || blockType === "move_right") {
    const vec = getMoveVector(blockType, state.dir);
    const nx = state.x + vec.x;
    const ny = state.y + vec.y;

    if (!isInBounds(nx, ny, map.cols, map.rows)) {
      return { frame: makeFrame(state.x, state.y, state.dir, newInventory, "sad", newKeyPositions, newDoorPositions, newDrawPath), success: false, failType: "fail_fall", keyPositions: newKeyPositions, doorPositions: newDoorPositions };
    }
    if (wallSet.has(`${nx},${ny}`)) {
      return { frame: makeFrame(nx, ny, state.dir, newInventory, "sad", newKeyPositions, newDoorPositions, newDrawPath), success: false, failType: "fail_wall", keyPositions: newKeyPositions, doorPositions: newDoorPositions };
    }
    if (doorSet.has(`${nx},${ny}`)) {
      return { frame: makeFrame(state.x, state.y, state.dir, newInventory, "sad", newKeyPositions, newDoorPositions, newDrawPath), success: false, failType: "fail_door", keyPositions: newKeyPositions, doorPositions: newDoorPositions };
    }

    newX = nx;
    newY = ny;
    newSprite = "walking";
    newDrawPath = [...newDrawPath, { x: nx, y: ny }];
    return makeResult(newX, newY, state.dir, newInventory, newSprite, newKeyPositions, newDoorPositions, newDrawPath);
  }

  // 줍기 (에너지 셀)
  if (blockType === "pick_up") {
    const keyIdx = newKeyPositions.findIndex(([kx, ky]) => kx === state.x && ky === state.y);
    if (keyIdx !== -1) {
      newKeyPositions.splice(keyIdx, 1);
      newInventory = [...newInventory, "key"];
      newSprite = "pick_up";
    }
    return makeResult(newX, newY, state.dir, newInventory, newSprite, newKeyPositions, newDoorPositions, newDrawPath);
  }

  // 사용하기 (에너지 배리어 해제)
  if (blockType === "put_down") {
    const vec = DIR_VECTOR[state.dir];
    const frontX = state.x + vec.x;
    const frontY = state.y + vec.y;
    const doorIdx = newDoorPositions.findIndex(([dx, dy]) => dx === frontX && dy === frontY);
    if (doorIdx !== -1 && newInventory.includes("key")) {
      newDoorPositions.splice(doorIdx, 1);
      newInventory = newInventory.filter((item, idx) => !(item === "key" && idx === newInventory.indexOf("key")));
      newSprite = "pick_up";
    }
    return makeResult(newX, newY, state.dir, newInventory, newSprite, newKeyPositions, newDoorPositions, newDrawPath);
  }

  // 기본: 아무것도 안 함
  return makeResult(newX, newY, state.dir, newInventory, "idle", newKeyPositions, newDoorPositions, newDrawPath);
}

function makeFrame(
  x: number, y: number, dir: Direction, inventory: string[], sprite: SpriteState,
  keyPositions: [number, number][], doorPositions: [number, number][],
  drawPath: { x: number; y: number }[],
): HistoryFrame {
  return { x, y, dir, sprite, inventory: [...inventory], keyPositions: [...keyPositions], doorPositions: [...doorPositions], drawPath: [...drawPath] };
}

function makeResult(
  x: number, y: number, dir: Direction, inventory: string[], sprite: SpriteState,
  keyPositions: [number, number][], doorPositions: [number, number][],
  drawPath: { x: number; y: number }[],
): MoveResult {
  return {
    frame: makeFrame(x, y, dir, inventory, sprite, keyPositions, doorPositions, drawPath),
    success: true,
    failType: null,
    keyPositions, doorPositions,
  };
}
