import { DrawMapConfig, HistoryFrame, ProgramBlock, RunResult, SpriteState } from "./types";
import { Direction } from "./types";

const MAX_STEPS = 500;

// ── 삼각함수 기반 이동 (0°=위, 시계방향) ──
export function drawMoveForward(x: number, y: number, angleDeg: number, distance: number): { x: number; y: number } {
  const rad = angleDeg * Math.PI / 180;
  return {
    x: x + Math.sin(rad) * distance,
    y: y - Math.cos(rad) * distance,
  };
}

// ── 각도 합산 (mod 360) ──
export function drawRotate(currentAngle: number, deltaAngle: number): number {
  return ((currentAngle + deltaAngle) % 360 + 360) % 360;
}

// ── 그리기 모드 프로그램 실행 ──
export function evaluateDrawProgram(
  program: ProgramBlock[],
  drawMap: DrawMapConfig,
  successCondition: "return_to_start" | "free_draw",
): RunResult {
  let x = drawMap.startX;
  let y = drawMap.startY;
  let angleDeg = drawMap.startAngle;
  let sprite: SpriteState = "idle";

  const drawPath: { x: number; y: number }[] = [{ x, y }];
  const history: HistoryFrame[] = [{
    x, y, dir: Direction.UP, sprite: "idle", inventory: [],
    angleDeg, drawPath: [{ x, y }],
  }];

  // 함수 정의 수집
  const functionDefs: Map<string, ProgramBlock[]> = new Map();
  for (const block of program) {
    if (block.type === "define_function" && block.children) {
      functionDefs.set(block.id, block.children);
    }
  }

  let stepCount = 0;
  let moved = false;

  function pushFrame() {
    history.push({
      x, y, dir: Direction.UP, sprite, inventory: [],
      angleDeg, drawPath: [...drawPath],
    });
  }

  function runBlocks(blocks: ProgramBlock[]): boolean {
    for (const block of blocks) {
      if (stepCount >= MAX_STEPS) return false;
      if (block.type === "define_function") continue;

      // 함수 호출
      if (block.type === "call_function") {
        const firstDef = functionDefs.values().next().value;
        if (firstDef) {
          if (!runBlocks(firstDef)) return false;
        }
        continue;
      }

      // 반복
      if (block.type === "repeat") {
        const times = block.times || 2;
        for (let i = 0; i < times; i++) {
          if (!runBlocks(block.children || [])) return false;
        }
        continue;
      }

      // 일반 액션
      stepCount++;
      moved = true;

      if (block.type === "move_forward") {
        const next = drawMoveForward(x, y, angleDeg, drawMap.stepSize);
        x = next.x;
        y = next.y;
        sprite = "walking";
        drawPath.push({ x, y });
        pushFrame();
      } else if (block.type === "move_back") {
        const next = drawMoveForward(x, y, angleDeg + 180, drawMap.stepSize);
        x = next.x;
        y = next.y;
        sprite = "walking";
        drawPath.push({ x, y });
        pushFrame();
      } else if (block.type === "turn_angle") {
        angleDeg = drawRotate(angleDeg, block.angle || 90);
        sprite = "idle";
        pushFrame();
      } else if (block.type === "turn_right") {
        angleDeg = drawRotate(angleDeg, 90);
        sprite = "idle";
        pushFrame();
      } else if (block.type === "turn_left") {
        angleDeg = drawRotate(angleDeg, -90);
        sprite = "idle";
        pushFrame();
      } else {
        pushFrame();
      }
    }
    return true;
  }

  const completed = runBlocks(program);

  if (!completed) {
    return {
      history,
      success: false,
      failedAt: history.length - 1,
      message: "너무 많이 반복했어요! 반복 조건을 확인해 보세요.",
    };
  }

  if (!moved) {
    return {
      history,
      success: false,
      failedAt: null,
      message: "블록을 추가해서 그림을 그려 보세요!",
    };
  }

  // 성공 조건 판정
  let success = false;
  if (successCondition === "free_draw") {
    success = true;
  } else {
    // return_to_start: 시작점 근처로 복귀 (5px 이내)
    const dx = x - drawMap.startX;
    const dy = y - drawMap.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    success = dist < 5;
  }

  if (success) {
    const lastFrame = history[history.length - 1];
    history[history.length - 1] = { ...lastFrame, sprite: "happy" };
    return {
      history,
      success: true,
      failedAt: null,
      message: "정답이에요! 🎉 멋진 별자리가 완성됐어요!",
    };
  }

  return {
    history,
    success: false,
    failedAt: history.length - 1,
    message: "시작 지점으로 돌아오지 못했어요. 각도와 거리를 확인해 보세요.",
  };
}
