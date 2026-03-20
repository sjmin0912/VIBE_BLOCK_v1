export interface MazeTheme {
  containerBg: string;
  emptyCellBg: string;
  wallCellBg: string;
  doorCellBg: string;
  goalBorderColor: string;
  goalBgColor: string;
  starColor: string;
  starCount: number;
  accentColor: string;
  extraDecoration?: "nebula" | "sand" | "galaxy";
}

export const MAZE_THEMES: Record<number, MazeTheme> = {
  // 챕터 1: 초록 행성 착륙
  1: {
    containerBg: "linear-gradient(135deg, #064e3b, #134e4a, #0f172a)",
    emptyCellBg: "border-emerald-800/30 bg-emerald-900/20",
    wallCellBg: "border-emerald-600/50 bg-emerald-800/60",
    doorCellBg: "border-violet-400/60 bg-violet-800/40",
    goalBorderColor: "border-yellow-400",
    goalBgColor: "bg-yellow-900/30",
    starColor: "#ffffff",
    starCount: 25,
    accentColor: "#6ee7b7",
  },
  // 챕터 2: 보라 성운 지대
  2: {
    containerBg: "linear-gradient(135deg, #4c1d95, #581c87, #0f172a)",
    emptyCellBg: "border-purple-800/30 bg-purple-900/20",
    wallCellBg: "border-purple-600/50 bg-purple-800/60",
    doorCellBg: "border-violet-400/60 bg-violet-700/40",
    goalBorderColor: "border-yellow-300",
    goalBgColor: "bg-yellow-900/30",
    starColor: "#c4b5fd",
    starCount: 30,
    accentColor: "#a78bfa",
    extraDecoration: "nebula",
  },
  // 챕터 3: 주황 사막 행성
  3: {
    containerBg: "linear-gradient(135deg, #78350f, #92400e, #1c1917)",
    emptyCellBg: "border-amber-800/30 bg-amber-900/20",
    wallCellBg: "border-amber-600/50 bg-amber-800/60",
    doorCellBg: "border-violet-400/60 bg-violet-800/40",
    goalBorderColor: "border-yellow-300",
    goalBgColor: "bg-yellow-900/30",
    starColor: "#fde68a",
    starCount: 20,
    accentColor: "#fbbf24",
    extraDecoration: "sand",
  },
  // 챕터 4: 깊은 우주
  4: {
    containerBg: "linear-gradient(135deg, #1e1b4b, #0c0a3e, #020617)",
    emptyCellBg: "border-indigo-800/30 bg-indigo-900/20",
    wallCellBg: "border-indigo-600/50 bg-indigo-800/60",
    doorCellBg: "border-violet-400/60 bg-violet-700/40",
    goalBorderColor: "border-yellow-300",
    goalBgColor: "bg-yellow-900/30",
    starColor: "#ffffff",
    starCount: 45,
    accentColor: "#818cf8",
    extraDecoration: "galaxy",
  },
};

// 배경 별 위치 생성 (DrawCanvas와 동일한 알고리즘)
export function generateStars(count: number) {
  return Array.from({ length: count }).map((_, i) => ({
    cx: ((i * 137.508) % 100) / 100,
    cy: ((i * 97.31 + 23) % 100) / 100,
    r: (i % 3) * 0.5 + 0.5,
    opacity: (i % 5) * 0.1 + 0.3,
  }));
}
