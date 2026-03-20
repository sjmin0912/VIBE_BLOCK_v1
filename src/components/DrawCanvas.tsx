"use client";

import React, { useMemo } from "react";
import { Direction, DrawMapConfig, SpriteState } from "@/engine/types";
import Character from "./Character";

interface DrawCanvasProps {
  drawMap?: DrawMapConfig;
  cols: number;
  rows: number;
  characterX: number;
  characterY: number;
  characterDir: Direction;
  characterSprite: SpriteState;
  angleDeg: number;
  isAnimating: boolean;
  drawPath: { x: number; y: number }[];
}

// 배경 별 위치를 고정 (렌더링 시 Math.random 방지)
const BG_STARS = Array.from({ length: 30 }).map((_, i) => ({
  cx: ((i * 137.508) % 100) / 100,
  cy: ((i * 97.31 + 23) % 100) / 100,
  r: (i % 3) * 0.5 + 0.5,
  opacity: (i % 5) * 0.1 + 0.3,
}));

// 가이드 도형 꼭짓점 계산
function computeGuideVertices(dm: DrawMapConfig): { x: number; y: number }[] {
  if (!dm.guideShape) return [];
  const { sides, turnAngle } = dm.guideShape;
  const verts: { x: number; y: number }[] = [{ x: dm.startX, y: dm.startY }];
  let a = dm.startAngle;
  let x = dm.startX;
  let y = dm.startY;
  for (let i = 0; i < sides; i++) {
    const rad = (a * Math.PI) / 180;
    x += Math.sin(rad) * dm.stepSize;
    y -= Math.cos(rad) * dm.stepSize;
    verts.push({ x, y });
    a = (((a + turnAngle) % 360) + 360) % 360;
  }
  return verts;
}

// 두 점 사이 거리
function dist(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// SVG 5각 별 모양 path (중심 cx,cy, 반지름 r)
function starPath(cx: number, cy: number, r: number): string {
  const inner = r * 0.4;
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? r : inner;
    points.push(
      `${cx + Math.cos(angle) * radius},${cy - Math.sin(angle) * radius}`
    );
  }
  return `M${points.join("L")}Z`;
}

const REACH_DIST = 10;

export default function DrawCanvas({
  drawMap,
  cols,
  rows,
  characterX,
  characterY,
  characterDir,
  characterSprite,
  angleDeg,
  isAnimating,
  drawPath,
}: DrawCanvasProps) {
  const width = drawMap
    ? drawMap.canvasWidth
    : cols * Math.floor(320 / Math.max(cols, rows));
  const height = drawMap
    ? drawMap.canvasHeight
    : rows * Math.floor(320 / Math.max(cols, rows));
  const charSize = 32;

  // 가이드 꼭짓점
  const guideVerts = useMemo(() => {
    if (!drawMap) return [];
    return computeGuideVertices(drawMap);
  }, [drawMap]);

  // 각 가이드 꼭짓점이 도달되었는지 판정
  const reachedVerts = useMemo(() => {
    if (guideVerts.length === 0) return [];
    return guideVerts.map((gv) =>
      drawPath.some((dp) => dist(dp, gv) < REACH_DIST)
    );
  }, [guideVerts, drawPath]);

  // 가이드 선분 트래킹: 양 끝 꼭짓점이 모두 도달되면 "traced"
  const tracedSegments = useMemo(() => {
    if (guideVerts.length < 2) return [];
    return guideVerts.slice(1).map((_, i) =>
      reachedVerts[i] && reachedVerts[i + 1]
    );
  }, [guideVerts, reachedVerts]);

  // 가이드 라인 (미트래킹=흐린 점선, 트래킹됨=진한 네온)
  const guideLines = useMemo(() => {
    if (guideVerts.length < 2) return null;
    return guideVerts.slice(1).map((pt, i) => {
      const traced = tracedSegments[i];
      return (
        <line
          key={`guide-${i}`}
          x1={guideVerts[i].x}
          y1={guideVerts[i].y}
          x2={pt.x}
          y2={pt.y}
          stroke={traced ? "url(#guideTracedGrad)" : "white"}
          strokeWidth={traced ? 2.5 : 1.5}
          strokeDasharray={traced ? "none" : "6 4"}
          opacity={traced ? 0.55 : 0.15}
          strokeLinecap="round"
          className={traced ? "animate-guide-traced" : ""}
        />
      );
    });
  }, [guideVerts, tracedSegments]);

  // 가이드 꼭짓점 별 아이콘
  const guideStars = useMemo(() => {
    if (guideVerts.length === 0) return null;
    return guideVerts.map((gv, i) => {
      const reached = reachedVerts[i];
      return (
        <g key={`gstar-${i}`}>
          {reached && (
            <circle
              cx={gv.x}
              cy={gv.y}
              r={14}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={2}
              opacity={0.6}
              className="animate-guide-pulse"
            />
          )}
          <path
            d={starPath(gv.x, gv.y, reached ? 8 : 5)}
            fill={reached ? "#fbbf24" : "white"}
            opacity={reached ? 1 : 0.2}
            className={reached ? "animate-guide-glow" : ""}
          />
        </g>
      );
    });
  }, [guideVerts, reachedVerts]);

  // 그리기 선 (네온) + 트레일 스파클
  const lines = useMemo(() => {
    if (drawPath.length < 2) return null;
    const total = drawPath.length - 1;
    return drawPath.slice(1).map((pt, i) => {
      // 최근 선분일수록 밝고 두꺼움
      const recency = i / total;
      const isNewest = i === total - 1;
      return (
        <line
          key={i}
          x1={drawPath[i].x}
          y1={drawPath[i].y}
          x2={pt.x}
          y2={pt.y}
          stroke="url(#neonGrad)"
          strokeWidth={isNewest ? 4 : 3}
          strokeLinecap="round"
          opacity={0.6 + recency * 0.4}
          className={isNewest ? "animate-trail-glow" : ""}
        />
      );
    });
  }, [drawPath]);

  // 꼭짓점 점 표시 + 스파클
  const dots = useMemo(() => {
    const total = drawPath.length;
    return drawPath.map((p, i) => {
      const isLast = i === total - 1 && total > 1;
      return (
        <g key={i}>
          {/* 스파클 링 (최신 점) */}
          {isLast && (
            <circle
              cx={p.x}
              cy={p.y}
              r={10}
              fill="none"
              stroke="#00f0ff"
              strokeWidth={1.5}
              opacity={0.6}
              className="animate-trail-sparkle"
            />
          )}
          <circle
            cx={p.x}
            cy={p.y}
            r={isLast ? 4 : 3}
            fill={isLast ? "#00f0ff" : "#fff"}
            opacity={isLast ? 1 : 0.8}
            className={isLast ? "animate-trail-dot" : ""}
          />
        </g>
      );
    });
  }, [drawPath]);

  return (
    <div
      className="flex items-center justify-center rounded-2xl bg-slate-900 p-2"
      style={{ minHeight: 336 }}
    >
      <div className="relative" style={{ width, height }}>
        <svg width={width} height={height} className="absolute inset-0">
          <defs>
            <linearGradient
              id="neonGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="50%" stopColor="#7b61ff" />
              <stop offset="100%" stopColor="#ff61d8" />
            </linearGradient>
            <linearGradient
              id="guideTracedGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#c4b5fd" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="starGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 배경 별 (장식용) */}
          {BG_STARS.map((s, i) => (
            <circle
              key={`star-${i}`}
              cx={s.cx * width}
              cy={s.cy * height}
              r={s.r}
              fill="white"
              opacity={s.opacity}
            />
          ))}

          {/* 가이드 도형 (희미한 점선) */}
          {guideLines}

          {/* 가이드 꼭짓점 별 */}
          <g filter="url(#starGlow)">{guideStars}</g>

          {/* 그리기 선 (네온 트레일) */}
          <g filter="url(#glow)">
            {lines}
            {dots}
          </g>
        </svg>

        {/* 캐릭터 (절대 위치, 회전 없음) */}
        <div
          className="absolute z-20 transition-all duration-300"
          style={{
            left: characterX - charSize / 2,
            top: characterY - charSize / 2,
            width: charSize,
            height: charSize,
          }}
        >
          <Character
            direction={characterDir}
            sprite={characterSprite}
            isAnimating={isAnimating}
            cellSize={charSize}
            isDrawMode
            angleDeg={angleDeg}
          />
        </div>
      </div>
    </div>
  );
}
