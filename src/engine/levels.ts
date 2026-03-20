import { LessonConfig, Direction, DrawMapConfig } from "./types";

export const LESSONS: LessonConfig[] = [
  // ═══════════════════════════════════════
  // 챕터 1: 이동 (Movement)
  // ═══════════════════════════════════════
  {
    id: 1,
    title: "레슨 1. 우주 행성에 착륙!",
    objective: "블록으로 외계인 친구를 별까지 이동시켜 보세요!",
    teacher: "안녕! 나는 우주 탐험대의 외계인 친구야. 블록으로 나를 움직여서 별을 찾아줘!",
    story: "우주선이 미지의 행성에 착륙했어요. 별을 모아 우주선을 수리해야 해요!",
    unlocked: ["move_forward", "move_left", "move_right", "turn_left", "turn_right"],
    mode: "maze",
    levels: [
      // ⭐1: 앞으로 가기만 (오른쪽 방향 시작 → 캐릭터 옆모습)
      {
        star: 1,
        idealBlockCount: 3,
        hint: "'앞으로 가기' 블록을 3번 놓아 보세요.",
        blocks: ["move_forward"],
        map: {
          cols: 5, rows: 3,
          start: { x: 0, y: 1, dir: Direction.RIGHT },
          goal: { x: 3, y: 1 },
          walls: [[0,0],[1,0],[2,0],[3,0],[4,0],[0,2],[1,2],[2,2],[3,2],[4,2]],
        },
      },
      // ⭐2: 앞으로 + 오른쪽으로 가기 (돌지 않고 옆으로 이동)
      {
        star: 2,
        idealBlockCount: 4,
        hint: "'앞으로 가기'로 오른쪽으로 이동하고, '오른쪽으로 가기'로 아래로 내려가 보세요!",
        blocks: ["move_forward", "move_right"],
        map: {
          cols: 5, rows: 5,
          start: { x: 0, y: 1, dir: Direction.RIGHT },
          goal: { x: 2, y: 3 },
          walls: [[0,0],[1,0],[3,0],[4,0],[3,1],[4,1],[0,3],[0,4],[1,4],[3,3],[4,3],[3,4],[4,4]],
        },
      },
      // ⭐3: 앞으로 + 왼쪽으로 + 오른쪽으로 가기
      {
        star: 3,
        idealBlockCount: 5,
        hint: "'왼쪽으로 가기'는 위로, '오른쪽으로 가기'는 아래로 이동해요. 잘 조합해 보세요!",
        blocks: ["move_forward", "move_left", "move_right"],
        map: {
          cols: 5, rows: 5,
          start: { x: 0, y: 2, dir: Direction.RIGHT },
          goal: { x: 4, y: 0 },
          walls: [[1,0],[1,1],[1,2],[3,2],[3,3],[3,4]],
        },
      },
      // ⭐4: 돌기 등장 (오른쪽으로 돌기)
      {
        star: 4,
        idealBlockCount: 5,
        hint: "막다른 길에서 '오른쪽으로 돌기'를 사용해 보세요! 돌면 바라보는 방향이 바뀌어요.",
        blocks: ["move_forward", "turn_right"],
        map: {
          cols: 5, rows: 5,
          start: { x: 1, y: 3, dir: Direction.UP },
          goal: { x: 3, y: 1 },
          walls: [[2,2],[2,3],[0,0],[4,0],[0,4],[4,4]],
        },
      },
      // ⭐5: 왼쪽 돌기 + 오른쪽 돌기 조합 (Z자 경로)
      {
        star: 5,
        idealBlockCount: 7,
        hint: "'오른쪽으로 돌기'와 '왼쪽으로 돌기'를 모두 사용해서 Z자 경로를 찾아 보세요.",
        blocks: ["move_forward", "turn_left", "turn_right"],
        map: {
          cols: 5, rows: 5,
          start: { x: 0, y: 3, dir: Direction.UP },
          goal: { x: 2, y: 0 },
          walls: [[1,0],[1,2],[1,3],[3,1],[3,2],[3,3]],
        },
      },
    ],
  },

  // ═══════════════════════════════════════
  // 챕터 2: 반복 (Repetition)
  // ═══════════════════════════════════════
  {
    id: 2,
    title: "레슨 2. 반복되는 우주 미로",
    objective: "반복 블록으로 효율적인 코드를 만들어 보세요!",
    teacher: "같은 패턴이 반복되면 '반복' 블록을 쓰면 코드가 짧아져!",
    story: "반복되는 패턴의 우주 미로를 발견했어요. 패턴을 찾아 탈출해야 해요!",
    unlocked: ["move_forward", "turn_left", "turn_right", "repeat"],
    mode: "maze",
    levels: [
      {
        star: 1,
        idealBlockCount: 2,
        hint: "'4번 하기' 안에 '앞으로 가기'를 넣어 보세요.",
        blocks: ["move_forward", "repeat"],
        map: {
          cols: 5, rows: 5,
          start: { x: 1, y: 4, dir: Direction.UP },
          goal: { x: 1, y: 0 },
          walls: [[0,0],[0,1],[0,2],[0,3],[0,4],[2,0],[2,1],[2,2],[2,3],[2,4]],
        },
      },
      {
        star: 2,
        idealBlockCount: 4,
        hint: "'2번 하기' 안에 '앞으로 가기 + 앞으로 가기 + 오른쪽으로 돌기'를 넣어 보세요.",
        blocks: ["move_forward", "turn_right", "repeat"],
        map: {
          cols: 5, rows: 5,
          start: { x: 0, y: 4, dir: Direction.UP },
          goal: { x: 2, y: 2 },
          walls: [[0,0],[0,1],[1,0],[1,1],[1,3],[1,4],[2,3],[2,4]],
        },
      },
      {
        star: 3,
        idealBlockCount: 4,
        hint: "반복되는 패턴을 찾아 보세요! '반복' 블록으로 코드를 줄여 보세요.",
        blocks: ["move_forward", "turn_left", "turn_right", "repeat"],
        map: {
          cols: 7, rows: 7,
          start: { x: 0, y: 6, dir: Direction.UP },
          goal: { x: 6, y: 0 },
          walls: [
            [1,0],[1,1],[1,2],[1,4],[1,5],[1,6],
            [3,0],[3,1],[3,3],[3,4],[3,5],[3,6],
            [5,0],[5,1],[5,2],[5,4],[5,5],[5,6],
          ],
        },
      },
    ],
  },

  // ═══════════════════════════════════════
  // 챕터 3: 조건 + 아이템 (Conditions + Items)
  // ═══════════════════════════════════════
  {
    id: 3,
    title: "레슨 3. 센서와 에너지 셀",
    objective: "조건 블록으로 벽을 감지하고, 에너지 셀을 모아 배리어를 해제하세요!",
    teacher: "벽 센서를 켜면 벽이 있는지 알 수 있어! 에너지 셀🔋을 주워서 배리어⚡를 해제할 수도 있지!",
    story: "미로가 복잡해졌어요. 센서와 에너지 셀을 활용해야 해요!",
    unlocked: ["move_forward", "turn_left", "turn_right", "repeat", "if_wall_ahead", "while_not_goal", "pick_up", "put_down", "if_item_here"],
    mode: "maze",
    levels: [
      {
        star: 1,
        idealBlockCount: 4,
        hint: "'도착할 때까지 하기' 안에 '앞에 벽이 있으면 → 오른쪽으로 돌기, 아니면 → 앞으로 가기'를 넣어 보세요.",
        blocks: ["move_forward", "turn_right", "if_wall_ahead", "while_not_goal"],
        map: {
          cols: 5, rows: 5,
          start: { x: 0, y: 4, dir: Direction.UP },
          goal: { x: 4, y: 0 },
          walls: [[1,0],[1,1],[1,2],[1,3],[3,1],[3,2],[3,3],[3,4]],
        },
      },
      {
        star: 2,
        idealBlockCount: 7,
        hint: "에너지 셀🔋을 주워서 배리어⚡ 앞에서 '사용하기'를 해 보세요.",
        blocks: ["move_forward", "turn_right", "turn_left", "pick_up", "put_down"],
        map: {
          cols: 5, rows: 5,
          start: { x: 0, y: 4, dir: Direction.UP },
          goal: { x: 4, y: 0 },
          walls: [[2,0],[2,1],[2,3],[2,4]],
          keys: [[0,2]],
          doors: [[2,2]],
        },
      },
      {
        star: 3,
        idealBlockCount: 6,
        hint: "조건과 반복을 조합해서 미로를 풀어 보세요! 에너지 셀도 잊지 마세요!",
        blocks: ["move_forward", "turn_right", "turn_left", "repeat", "if_wall_ahead", "while_not_goal", "pick_up", "put_down"],
        map: {
          cols: 7, rows: 7,
          start: { x: 0, y: 6, dir: Direction.UP },
          goal: { x: 6, y: 0 },
          walls: [
            [2,0],[2,1],[2,3],[2,4],[2,5],[2,6],
            [4,0],[4,1],[4,2],[4,4],[4,5],[4,6],
          ],
          keys: [[1,0]],
          doors: [[2,2]],
        },
      },
    ],
  },

  // ═══════════════════════════════════════
  // 챕터 4: 종합 (Final Challenge)
  // ═══════════════════════════════════════
  {
    id: 4,
    title: "레슨 4. 최종 탈출!",
    objective: "배운 모든 블록을 활용해서 행성을 탈출하세요!",
    teacher: "드디어 마지막 관문이야! 이동, 반복, 조건, 에너지 셀까지 모두 써서 우주선으로 돌아가자!",
    story: "우주선 수리가 거의 끝났어요! 마지막 별을 찾으면 탈출할 수 있어요!",
    unlocked: ["move_forward", "turn_right", "turn_left", "repeat", "if_wall_ahead", "while_not_goal", "pick_up", "put_down", "if_item_here"],
    mode: "maze",
    levels: [
      {
        star: 1,
        idealBlockCount: 5,
        hint: "조건과 반복을 잘 활용하면 짧은 코드로 미로를 풀 수 있어요!",
        blocks: ["move_forward", "turn_right", "turn_left", "if_wall_ahead", "while_not_goal"],
        map: {
          cols: 6, rows: 6,
          start: { x: 0, y: 5, dir: Direction.UP },
          goal: { x: 5, y: 0 },
          walls: [
            [1,0],[1,1],[1,3],[1,4],
            [3,1],[3,2],[3,4],[3,5],
            [5,2],[5,3],
          ],
        },
      },
      {
        star: 2,
        idealBlockCount: 10,
        hint: "에너지 셀을 모아서 배리어를 해제하며 진행하세요!",
        blocks: ["move_forward", "turn_right", "turn_left", "repeat", "pick_up", "put_down", "if_wall_ahead", "while_not_goal"],
        map: {
          cols: 7, rows: 7,
          start: { x: 0, y: 6, dir: Direction.UP },
          goal: { x: 6, y: 0 },
          walls: [
            [2,0],[2,1],[2,3],[2,5],[2,6],
            [4,0],[4,1],[4,2],[4,4],[4,5],[4,6],
          ],
          keys: [[1,0],[3,6]],
          doors: [[2,2],[4,3]],
        },
      },
      {
        star: 3,
        idealBlockCount: 6,
        hint: "'도착할 때까지 하기'와 '앞에 벽이 있으면'을 조합해서 어떤 미로든 풀 수 있는 만능 코드를 만들어 보세요!",
        blocks: ["move_forward", "turn_right", "turn_left", "repeat", "if_wall_ahead", "while_not_goal", "if_item_here", "pick_up", "put_down"],
        map: {
          cols: 9, rows: 9,
          start: { x: 0, y: 8, dir: Direction.UP },
          goal: { x: 8, y: 0 },
          walls: [
            [1,0],[1,1],[1,2],[1,4],[1,5],[1,7],[1,8],
            [3,0],[3,1],[3,3],[3,4],[3,6],[3,7],[3,8],
            [5,0],[5,1],[5,2],[5,4],[5,5],[5,7],[5,8],
            [7,0],[7,1],[7,3],[7,4],[7,6],[7,7],[7,8],
          ],
        },
      },
    ],
  },

  // ═══════════════════════════════════════
  // 별자리 그리기편 (그리기 모드) - 레슨 5~8
  // ═══════════════════════════════════════

  // 레슨 5: 도형 기초
  {
    id: 5,
    title: "레슨 5. 첫 별자리 - 도형 기초",
    objective: "직선과 사각형을 그려 보세요!",
    teacher: "이제 그리기 모드야! 외계인 친구가 움직인 길이 빛나는 선이 돼! 직선부터 그려 볼까?",
    story: "밤하늘에 새로운 별자리를 만들어요! 간단한 선부터 시작해 볼까요?",
    unlocked: ["move_forward", "turn_angle", "repeat"],
    mode: "draw",
    levels: [
      {
        star: 1,
        idealBlockCount: 3,
        hint: "'앞으로 가기' 블록을 3번 놓아서 직선을 그려 보세요!",
        blocks: ["move_forward"],
        successCondition: "free_draw",
        drawMap: { canvasWidth: 320, canvasHeight: 320, startX: 160, startY: 280, startAngle: 0, stepSize: 60, guideShape: { sides: 3, turnAngle: 0 } },
        map: { cols: 9, rows: 9, start: { x: 4, y: 8, dir: Direction.UP }, goal: { x: 4, y: 8 }, walls: [] },
      },
      {
        star: 2,
        idealBlockCount: 8,
        hint: "'앞으로 가기' + '90도 돌기'를 4번 반복하면 사각형이 돼요!",
        blocks: ["move_forward", "turn_angle"],
        successCondition: "return_to_start",
        drawMap: { canvasWidth: 320, canvasHeight: 320, startX: 100, startY: 250, startAngle: 0, stepSize: 80, guideShape: { sides: 4, turnAngle: 90 } },
        map: { cols: 9, rows: 9, start: { x: 2, y: 7, dir: Direction.UP }, goal: { x: 2, y: 7 }, walls: [] },
      },
      {
        star: 3,
        idealBlockCount: 4,
        hint: "반복 블록을 써서 사각형을 더 짧게 만들어 보세요! '4번 하기' 안에 넣어 볼까요?",
        blocks: ["move_forward", "turn_angle", "repeat"],
        successCondition: "return_to_start",
        drawMap: { canvasWidth: 320, canvasHeight: 320, startX: 90, startY: 260, startAngle: 0, stepSize: 90, guideShape: { sides: 4, turnAngle: 90 } },
        map: { cols: 9, rows: 9, start: { x: 2, y: 7, dir: Direction.UP }, goal: { x: 2, y: 7 }, walls: [] },
      },
    ],
  },

  // 레슨 6: 다양한 도형
  {
    id: 6,
    title: "레슨 6. 다양한 도형",
    objective: "삼각형, 오각형, 육각형을 그려 보세요!",
    teacher: "도형마다 돌리는 각도가 달라! 삼각형은 120도, 오각형은 72도, 육각형은 60도야!",
    story: "각도를 바꾸면 다양한 도형이 그려져요!",
    unlocked: ["move_forward", "turn_angle", "repeat"],
    mode: "draw",
    levels: [
      {
        star: 1,
        idealBlockCount: 4,
        hint: "'3번 하기' 안에 '앞으로 가기' + '120도 돌기'를 넣으면 삼각형이 돼요!",
        blocks: ["move_forward", "turn_angle", "repeat"],
        successCondition: "return_to_start",
        drawMap: { canvasWidth: 320, canvasHeight: 320, startX: 100, startY: 270, startAngle: 0, stepSize: 100, guideShape: { sides: 3, turnAngle: 120 } },
        map: { cols: 9, rows: 9, start: { x: 2, y: 7, dir: Direction.UP }, goal: { x: 2, y: 7 }, walls: [] },
      },
      {
        star: 2,
        idealBlockCount: 4,
        hint: "'5번 하기' 안에 '앞으로 가기' + '72도 돌기'를 넣으면 오각형이 돼요!",
        blocks: ["move_forward", "turn_angle", "repeat"],
        successCondition: "return_to_start",
        drawMap: { canvasWidth: 320, canvasHeight: 320, startX: 90, startY: 250, startAngle: 0, stepSize: 70, guideShape: { sides: 5, turnAngle: 72 } },
        map: { cols: 9, rows: 9, start: { x: 2, y: 7, dir: Direction.UP }, goal: { x: 2, y: 7 }, walls: [] },
      },
      {
        star: 3,
        idealBlockCount: 4,
        hint: "'6번 하기' 안에 '앞으로 가기' + '60도 돌기'를 넣으면 육각형이 돼요!",
        blocks: ["move_forward", "turn_angle", "repeat"],
        successCondition: "return_to_start",
        drawMap: { canvasWidth: 320, canvasHeight: 320, startX: 85, startY: 230, startAngle: 0, stepSize: 65, guideShape: { sides: 6, turnAngle: 60 } },
        map: { cols: 9, rows: 9, start: { x: 2, y: 7, dir: Direction.UP }, goal: { x: 2, y: 7 }, walls: [] },
      },
    ],
  },

  // 레슨 7: 빛나는 오각별
  {
    id: 7,
    title: "레슨 7. 빛나는 오각별",
    objective: "별 모양을 그려 보세요!",
    teacher: "144도씩 돌면서 앞으로 가면 예쁜 별이 그려져! 한번 해 볼까?",
    story: "가장 화려한 별자리! 다섯 꼭짓점의 별을 그려요!",
    unlocked: ["move_forward", "turn_angle", "repeat"],
    mode: "draw",
    levels: [
      {
        star: 1,
        idealBlockCount: 4,
        hint: "'5번 하기' 안에 '앞으로 가기' + '144도 돌기'를 넣어 보세요!",
        blocks: ["move_forward", "turn_angle", "repeat"],
        successCondition: "return_to_start",
        drawMap: { canvasWidth: 320, canvasHeight: 320, startX: 100, startY: 260, startAngle: 0, stepSize: 90, guideShape: { sides: 5, turnAngle: 144 } },
        map: { cols: 11, rows: 11, start: { x: 3, y: 9, dir: Direction.UP }, goal: { x: 3, y: 9 }, walls: [] },
      },
      {
        star: 2,
        idealBlockCount: 4,
        hint: "더 큰 별을 그려 보세요!",
        blocks: ["move_forward", "turn_angle", "repeat"],
        successCondition: "return_to_start",
        drawMap: { canvasWidth: 360, canvasHeight: 360, startX: 110, startY: 300, startAngle: 0, stepSize: 120, guideShape: { sides: 5, turnAngle: 144 } },
        map: { cols: 13, rows: 13, start: { x: 3, y: 11, dir: Direction.UP }, goal: { x: 3, y: 11 }, walls: [] },
      },
      {
        star: 3,
        idealBlockCount: 6,
        hint: "별 안에 작은 별을 그려 볼까요? 반복을 두 번 써 보세요!",
        blocks: ["move_forward", "turn_angle", "repeat"],
        successCondition: "free_draw",
        drawMap: { canvasWidth: 360, canvasHeight: 360, startX: 120, startY: 300, startAngle: 0, stepSize: 80, guideShape: { sides: 5, turnAngle: 144 } },
        map: { cols: 15, rows: 15, start: { x: 4, y: 13, dir: Direction.UP }, goal: { x: 4, y: 13 }, walls: [] },
      },
    ],
  },

  // 레슨 8: 나만의 별자리
  {
    id: 8,
    title: "레슨 8. 나만의 별자리 만들기",
    objective: "자유롭게 나만의 별자리를 그려 보세요!",
    teacher: "마지막 레슨이야! 배운 모든 블록을 써서 나만의 멋진 별자리를 만들어 봐!",
    story: "우주 탐험대의 마지막 미션! 나만의 별자리를 밤하늘에 남겨요!",
    unlocked: ["move_forward", "move_back", "turn_right", "turn_left", "turn_angle", "repeat", "define_function", "call_function"],
    mode: "draw",
    levels: [
      {
        star: 1,
        idealBlockCount: 8,
        hint: "자유롭게 그려 보세요! 정해진 정답은 없어요.",
        blocks: ["move_forward", "turn_angle", "repeat"],
        successCondition: "free_draw",
        drawMap: { canvasWidth: 320, canvasHeight: 320, startX: 160, startY: 160, startAngle: 0, stepSize: 40 },
        map: { cols: 15, rows: 15, start: { x: 7, y: 7, dir: Direction.UP }, goal: { x: 7, y: 7 }, walls: [] },
      },
      {
        star: 2,
        idealBlockCount: 10,
        hint: "'새 묶음 만들기'로 별 그리기 묶음을 만들고, '묶음 쓰기'로 여러 번 사용해 보세요!",
        blocks: ["move_forward", "turn_angle", "repeat", "define_function", "call_function"],
        successCondition: "free_draw",
        drawMap: { canvasWidth: 360, canvasHeight: 360, startX: 180, startY: 180, startAngle: 0, stepSize: 35 },
        map: { cols: 17, rows: 17, start: { x: 8, y: 8, dir: Direction.UP }, goal: { x: 8, y: 8 }, walls: [] },
      },
      {
        star: 3,
        idealBlockCount: 12,
        hint: "묶음과 반복을 조합해서 복잡한 패턴을 만들어 보세요!",
        blocks: ["move_forward", "move_back", "turn_right", "turn_left", "turn_angle", "repeat", "define_function", "call_function"],
        successCondition: "free_draw",
        drawMap: { canvasWidth: 380, canvasHeight: 380, startX: 190, startY: 190, startAngle: 0, stepSize: 30 },
        map: { cols: 19, rows: 19, start: { x: 9, y: 9, dir: Direction.UP }, goal: { x: 9, y: 9 }, walls: [] },
      },
    ],
  },
];
