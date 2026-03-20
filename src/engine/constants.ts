import { Direction, BlockMeta, BlockType, BlockCategory } from "./types";

// ── 방향 순서 (시계 방향) ──
export const DIR_ORDER: Direction[] = [
  Direction.UP,
  Direction.RIGHT,
  Direction.DOWN,
  Direction.LEFT,
];

// ── 방향 벡터 ──
export const DIR_VECTOR: Record<Direction, { x: number; y: number }> = {
  [Direction.UP]: { x: 0, y: -1 },
  [Direction.RIGHT]: { x: 1, y: 0 },
  [Direction.DOWN]: { x: 0, y: 1 },
  [Direction.LEFT]: { x: -1, y: 0 },
};

// ── 블록 라이브러리 ──
export const BLOCK_LIBRARY: Record<BlockType, BlockMeta> = {
  // 걷기 (파란 계열)
  move_forward: { label: "앞으로 가기", color: "bg-blue-500", text: "text-white", type: "action", category: "걷기" },
  move_back: { label: "뒤로 가기", color: "bg-blue-600", text: "text-white", type: "action", category: "걷기" },
  move_left: { label: "왼쪽으로 가기", color: "bg-blue-400", text: "text-white", type: "action", category: "걷기" },
  move_right: { label: "오른쪽으로 가기", color: "bg-sky-500", text: "text-white", type: "action", category: "걷기" },

  // 돌기 (초록 계열)
  turn_left: { label: "왼쪽으로 돌기", color: "bg-emerald-500", text: "text-white", type: "action", category: "돌기" },
  turn_right: { label: "오른쪽으로 돌기", color: "bg-emerald-600", text: "text-white", type: "action", category: "돌기" },
  turn_around: { label: "뒤돌기", color: "bg-green-500", text: "text-white", type: "action", category: "돌기" },
  turn_angle: { label: "N도 돌기", color: "bg-teal-500", text: "text-white", type: "action", category: "돌기", hasAngleInput: true },

  // 행동 (노랑 계열)
  pick_up: { label: "줍기", color: "bg-yellow-500", text: "text-white", type: "action", category: "행동" },
  put_down: { label: "사용하기", color: "bg-yellow-600", text: "text-white", type: "action", category: "행동" },

  // 생각 (하늘 계열 - 조건)
  if_wall_ahead: { label: "앞에 벽이 있으면", color: "bg-cyan-500", text: "text-white", type: "condition", category: "생각", hasChildren: true, hasElse: true },
  if_item_here: { label: "여기 아이템이 있으면", color: "bg-cyan-600", text: "text-white", type: "condition", category: "생각", hasChildren: true, hasElse: true },
  else: { label: "아니면", color: "bg-cyan-400", text: "text-white", type: "condition", category: "생각" },

  // 반복 (보라 계열)
  repeat: { label: "N번 하기", color: "bg-purple-500", text: "text-white", type: "control", category: "반복", hasChildren: true },
  while_not_goal: { label: "도착할 때까지 하기", color: "bg-violet-500", text: "text-white", type: "control", category: "반복", hasChildren: true },
  while_not_wall: { label: "벽 나올 때까지 하기", color: "bg-violet-600", text: "text-white", type: "control", category: "반복", hasChildren: true },

  // 묶음 (분홍 계열 - 함수)
  define_function: { label: "새 묶음 만들기", color: "bg-pink-500", text: "text-white", type: "function", category: "묶음", hasChildren: true },
  call_function: { label: "묶음 쓰기", color: "bg-pink-400", text: "text-white", type: "function", category: "묶음" },
};

// ── 타일 이모지 ──
export const TILE_EMOJI: Record<string, string> = {
  wall: "🕳️",
  key: "🔋",
  door: "⚡",
  goal: "⭐",
  start: "🚩",
};

// ── 셀 크기 ──
export const CELL_SIZE = 54;

// ── 카테고리별 색상 ──
export const CATEGORY_COLORS: Record<BlockCategory, string> = {
  "걷기": "bg-blue-100 text-blue-700",
  "돌기": "bg-emerald-100 text-emerald-700",
  "행동": "bg-yellow-100 text-yellow-700",
  "생각": "bg-cyan-100 text-cyan-700",
  "반복": "bg-purple-100 text-purple-700",
  "묶음": "bg-pink-100 text-pink-700",
};

// ── 각도 옵션 ──
export const ANGLE_OPTIONS = [30, 36, 45, 60, 72, 90, 120, 135, 144, 150, 180];

// ── uid 생성 ──
export function uid(prefix = "block"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
