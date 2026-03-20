// ── 타일 종류 ──
export enum SquareType {
  OPEN = "open",
  WALL = "wall",
  START = "start",
  FINISH = "finish",
  KEY = "key",
  DOOR = "door",
}

// ── 방향 ──
export enum Direction {
  UP = "up",
  RIGHT = "right",
  DOWN = "down",
  LEFT = "left",
}

// ── 블록 타입 ──
export type BlockType =
  // 걷기
  | "move_forward" | "move_back" | "move_left" | "move_right"
  // 돌기
  | "turn_left" | "turn_right" | "turn_around" | "turn_angle"
  // 행동
  | "pick_up" | "put_down"
  // 조건
  | "if_wall_ahead" | "if_item_here" | "else"
  // 반복
  | "repeat" | "while_not_goal" | "while_not_wall"
  // 함수
  | "define_function" | "call_function";

// ── 블록 카테고리 ──
export type BlockCategory = "걷기" | "돌기" | "행동" | "생각" | "반복" | "묶음";

// ── 블록 메타 정보 ──
export interface BlockMeta {
  label: string;
  color: string;
  text: string;
  type: "action" | "control" | "condition" | "function";
  category: BlockCategory;
  hasAngleInput?: boolean;
  hasChildren?: boolean;
  hasElse?: boolean;
}

// ── 프로그램 블록 (사용자가 배치한 블록) ──
export interface ProgramBlock {
  id: string;
  type: BlockType;
  times?: number;         // repeat용
  angle?: number;         // turn_angle용
  children?: ProgramBlock[];
  elseChildren?: ProgramBlock[];
}

// ── 평탄화된 액션 ──
export interface FlatAction {
  id: string;
  type: BlockType;
  depth: number;
  angle?: number;
}

// ── 캐릭터 상태 ──
export interface CharacterState {
  x: number;
  y: number;
  dir: Direction;
  inventory: string[];
  sprite: SpriteState;
  angleDeg?: number;  // 그리기 모드용 자유 각도 (0=위, 시계방향)
}

export type SpriteState =
  | "idle" | "walking" | "pick_up"
  | "happy" | "sad" | "think" | "draw";

// ── 그리기 모드 맵 설정 ──
export interface DrawMapConfig {
  canvasWidth: number;
  canvasHeight: number;
  startX: number;
  startY: number;
  startAngle: number;  // 0=위, 시계방향
  stepSize: number;     // move_forward 1회 이동 픽셀
  guideShape?: { sides: number; turnAngle: number };  // 목표 도형 가이드
}

// ── 맵 설정 ──
export interface MapConfig {
  cols: number;
  rows: number;
  start: { x: number; y: number; dir: Direction };
  goal: { x: number; y: number };
  walls: [number, number][];
  keys?: [number, number][];
  doors?: [number, number][];
}

// ── 레벨 (난이도별) ──
export interface LevelConfig {
  star: number;   // 1, 2, 3
  map: MapConfig;
  idealBlockCount: number;
  hint: string;
  blocks?: BlockType[];  // 이 레벨에서 사용할 블록 (없으면 lesson.unlocked 사용)
  drawMap?: DrawMapConfig;  // 그리기 모드 전용 설정
  successCondition?: "return_to_start" | "free_draw";  // 그리기 성공 조건
}

// ── 레슨 ──
export interface LessonConfig {
  id: number;
  title: string;
  objective: string;
  teacher: string;
  story: string;
  unlocked: BlockType[];
  levels: LevelConfig[];
  mode: "maze" | "draw";
}

// ── 게임 상태 ──
export interface GameState {
  lessonIndex: number;
  levelIndex: number;
  program: ProgramBlock[];
  character: CharacterState;
  grid: SquareType[][];
  keyPositions: [number, number][];
  doorPositions: [number, number][];
  isRunning: boolean;
  stepIndex: number;
  result: RunResult | null;
  message: string;
  completedLessons: number[];
}

// ── 실행 결과 ──
export interface RunResult {
  history: HistoryFrame[];
  success: boolean;
  failedAt: number | null;
  failType?: "fail_wall" | "fail_fall" | "fail_door" | null;
  message: string;
}

// ── 히스토리 프레임 (애니메이션용) ──
export interface HistoryFrame {
  x: number;
  y: number;
  dir: Direction;
  sprite: SpriteState;
  inventory: string[];
  angleDeg?: number;  // 그리기 모드용 각도
  keyPositions?: [number, number][];
  doorPositions?: [number, number][];
  drawPath?: { x: number; y: number }[];
}
