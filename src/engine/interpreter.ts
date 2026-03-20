import {
  ProgramBlock,
  CharacterState,
  Direction,
  DrawMapConfig,
  HistoryFrame,
  MapConfig,
  RunResult,
  SpriteState,
} from "./types";
import { executeAction, isWallAhead, isItemHere, isAtGoal } from "./movement";
import { evaluateDrawProgram } from "./drawMovement";

const MAX_STEPS = 500; // 무한 루프 방지

export function evaluateProgram(
  program: ProgramBlock[],
  map: MapConfig,
  drawMap?: DrawMapConfig,
  successCondition?: "return_to_start" | "free_draw",
): RunResult {
  // 그리기 모드 분기
  if (drawMap) {
    return evaluateDrawProgram(program, drawMap, successCondition || "return_to_start");
  }
  const wallSet = new Set((map.walls || []).map(([x, y]) => `${x},${y}`));
  let keyPositions: [number, number][] = [...(map.keys || []).map(([x, y]) => [x, y] as [number, number])];
  let doorPositions: [number, number][] = [...(map.doors || []).map(([x, y]) => [x, y] as [number, number])];

  const start = map.start;
  let state: CharacterState = {
    x: start.x,
    y: start.y,
    dir: start.dir,
    inventory: [],
    sprite: "idle",
  };

  const drawPath: { x: number; y: number }[] = [{ x: start.x, y: start.y }];
  const history: HistoryFrame[] = [
    { x: state.x, y: state.y, dir: state.dir, sprite: "idle", inventory: [], keyPositions: [...keyPositions], doorPositions: [...doorPositions], drawPath: [...drawPath] },
  ];

  // 함수 정의 수집
  const functionDefs: Map<string, ProgramBlock[]> = new Map();
  for (const block of program) {
    if (block.type === "define_function" && block.children) {
      functionDefs.set(block.id, block.children);
    }
  }

  let stepCount = 0;

  function runBlocks(blocks: ProgramBlock[]): { success: boolean; failType?: string | null } {
    for (const block of blocks) {
      if (stepCount >= MAX_STEPS) {
        return { success: false, failType: null };
      }

      if (block.type === "define_function") continue;

      if (block.type === "call_function") {
        const firstDef = functionDefs.values().next().value;
        if (firstDef) {
          const result = runBlocks(firstDef);
          if (!result.success) return result;
        }
        continue;
      }

      if (block.type === "repeat") {
        const times = block.times || 2;
        for (let i = 0; i < times; i++) {
          const result = runBlocks(block.children || []);
          if (!result.success) return result;
        }
        continue;
      }

      if (block.type === "while_not_goal") {
        while (!isAtGoal(state, map.goal) && stepCount < MAX_STEPS) {
          const result = runBlocks(block.children || []);
          if (!result.success) return result;
        }
        continue;
      }

      if (block.type === "while_not_wall") {
        while (!isWallAhead(state, map, wallSet) && stepCount < MAX_STEPS) {
          const result = runBlocks(block.children || []);
          if (!result.success) return result;
        }
        continue;
      }

      if (block.type === "if_wall_ahead") {
        if (isWallAhead(state, map, wallSet)) {
          const result = runBlocks(block.children || []);
          if (!result.success) return result;
        } else if (block.elseChildren && block.elseChildren.length > 0) {
          const result = runBlocks(block.elseChildren);
          if (!result.success) return result;
        }
        continue;
      }

      if (block.type === "if_item_here") {
        if (isItemHere(state, keyPositions)) {
          const result = runBlocks(block.children || []);
          if (!result.success) return result;
        } else if (block.elseChildren && block.elseChildren.length > 0) {
          const result = runBlocks(block.elseChildren);
          if (!result.success) return result;
        }
        continue;
      }

      if (block.type === "else") continue;

      // 일반 액션 실행
      stepCount++;
      const moveResult = executeAction(
        block.type,
        state,
        map,
        wallSet,
        keyPositions,
        doorPositions,
        drawPath,
        block.angle,
      );

      state = {
        x: moveResult.frame.x,
        y: moveResult.frame.y,
        dir: moveResult.frame.dir,
        inventory: moveResult.frame.inventory || [],
        sprite: moveResult.frame.sprite,
      };
      keyPositions = moveResult.keyPositions;
      doorPositions = moveResult.doorPositions;

      if (moveResult.frame.drawPath) {
        drawPath.length = 0;
        drawPath.push(...moveResult.frame.drawPath);
      }

      history.push({ ...moveResult.frame, drawPath: [...drawPath] });

      if (!moveResult.success) {
        return { success: false, failType: moveResult.failType };
      }
    }

    return { success: true };
  }

  const execResult = runBlocks(program);
  const success = execResult.success && isAtGoal(state, map.goal);

  if (!execResult.success) {
    return {
      history,
      success: false,
      failedAt: history.length - 1,
      failType: (execResult.failType as RunResult["failType"]) || null,
      message: execResult.failType === "fail_wall"
        ? "블랙홀에 빨려 들어갔어요! 🕳️ 다른 길을 찾아보세요."
        : execResult.failType === "fail_door"
          ? "에너지 배리어에 막혔어요! ⚡ 에너지 셀을 먼저 모아보세요."
        : execResult.failType === "fail_fall"
          ? "우주 밖으로 날아갔어요! 경로를 다시 확인해 보세요."
          : stepCount >= MAX_STEPS
            ? "너무 많이 반복했어요! 반복 조건을 확인해 보세요."
            : "실행 중 문제가 생겼어요.",
    };
  }

  if (success) {
    const lastFrame = history[history.length - 1];
    history[history.length - 1] = { ...lastFrame, sprite: "happy" };
    return {
      history,
      success: true,
      failedAt: null,
      message: "정답이에요! 🎉 다음 레슨이 해금됩니다!",
    };
  }

  return {
    history,
    success: false,
    failedAt: history.length - 1,
    message: "아직 목표에 도착하지 않았어요. 블록을 더 추가해 보세요.",
  };
}

// ── 프로그램 평탄화 (실행 흐름 표시용) ──
export function flattenProgram(program: ProgramBlock[]) {
  const result: { id: string; type: string; depth: number }[] = [];
  const walk = (blocks: ProgramBlock[], depth = 0) => {
    blocks.forEach((block) => {
      if (block.type === "repeat") {
        for (let i = 0; i < (block.times || 2); i++) walk(block.children || [], depth + 1);
      } else if (block.type === "define_function") {
        // 정의는 표시하지 않음
      } else if (block.type === "call_function") {
        result.push({ id: block.id, type: block.type, depth });
      } else if (block.type === "if_wall_ahead" || block.type === "if_item_here") {
        result.push({ id: block.id, type: block.type, depth });
        walk(block.children || [], depth + 1);
        if (block.elseChildren && block.elseChildren.length > 0) {
          result.push({ id: block.id + "_else", type: "else", depth });
          walk(block.elseChildren, depth + 1);
        }
      } else if (block.type === "while_not_goal" || block.type === "while_not_wall") {
        result.push({ id: block.id, type: block.type, depth });
        walk(block.children || [], depth + 1);
      } else {
        result.push({ ...block, depth });
      }
    });
  };
  walk(program);
  return result;
}
