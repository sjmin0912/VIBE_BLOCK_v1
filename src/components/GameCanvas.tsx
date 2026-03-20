"use client";

import React, { useMemo } from "react";
import { Direction, MapConfig, SpriteState } from "@/engine/types";
import { TILE_EMOJI } from "@/engine/constants";
import { MAZE_THEMES, generateStars } from "./mazeThemes";
import Image from "next/image";
import Character from "./Character";
import SpaceConfetti from "./SpaceConfetti";

const MAX_CANVAS = 320;

interface GameCanvasProps {
  map: MapConfig;
  characterX: number;
  characterY: number;
  characterDir: Direction;
  characterSprite: SpriteState;
  isAnimating: boolean;
  keyPositions: [number, number][];
  doorPositions: [number, number][];
  chapterId?: number;
}

export default function GameCanvas({
  map,
  characterX,
  characterY,
  characterDir,
  characterSprite,
  isAnimating,
  keyPositions,
  doorPositions,
  chapterId = 1,
}: GameCanvasProps) {
  const theme = MAZE_THEMES[chapterId] ?? MAZE_THEMES[1];
  const cellSize = Math.floor(MAX_CANVAS / Math.max(map.cols, map.rows));

  const wallSet = useMemo(() => new Set((map.walls || []).map(([x, y]) => `${x},${y}`)), [map.walls]);
  const keySet = useMemo(() => new Set(keyPositions.map(([x, y]) => `${x},${y}`)), [keyPositions]);
  const doorSet = useMemo(() => new Set(doorPositions.map(([x, y]) => `${x},${y}`)), [doorPositions]);
  const bgStars = useMemo(() => generateStars(theme.starCount), [theme.starCount]);

  const emojiSize = cellSize < 36 ? "text-sm" : "text-lg";
  const wallEmojiSize = cellSize < 36 ? "text-lg" : "text-2xl";

  const cells = useMemo(() => {
    const result = [];
    for (let y = 0; y < map.rows; y++) {
      for (let x = 0; x < map.cols; x++) {
        const key = `${x},${y}`;
        const isWall = wallSet.has(key);
        const isGoal = map.goal.x === x && map.goal.y === y;
        const isCharacter = characterX === x && characterY === y;
        const isKey = keySet.has(key);
        const isDoor = doorSet.has(key);

        let bgClass = theme.emptyCellBg;
        if (isDoor) bgClass = theme.doorCellBg;

        result.push(
          <div
            key={`${x}-${y}`}
            style={{ width: cellSize, height: cellSize }}
            className={`relative flex items-center justify-center rounded-lg border ${bgClass} transition-colors duration-200`}
          >
            {isGoal && <div className={`absolute inset-1 rounded-md border-2 border-dashed ${theme.goalBorderColor} ${theme.goalBgColor}`} />}
            {isWall && <Image src="/character/blackhall.png" alt="블랙홀" width={Math.floor(cellSize * 2.5)} height={Math.floor(cellSize * 2.5)} className="object-contain" />}
            {isGoal && !isWall && <span className={`relative z-10 ${emojiSize}`}>{TILE_EMOJI.goal}</span>}
            {isKey && <span className={emojiSize}>{TILE_EMOJI.key}</span>}
            {isDoor && <span className={emojiSize}>{TILE_EMOJI.door}</span>}
            {isCharacter && (
              <>
                {characterSprite === "happy" && <div className="absolute inset-0 z-10"><SpaceConfetti /></div>}
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <Character
                    direction={characterDir}
                    sprite={characterSprite}
                    isAnimating={isAnimating}
                    cellSize={cellSize}
                  />
                </div>
              </>
            )}
          </div>
        );
      }
    }
    return result;
  }, [map, cellSize, emojiSize, characterX, characterY, characterDir, characterSprite, isAnimating, wallSet, keySet, doorSet, theme]);

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-2xl p-2"
      style={{ minHeight: MAX_CANVAS + 16, background: theme.containerBg }}
    >
      {/* 배경 별 + 장식 SVG */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <filter id="nebula-blur">
            <feGaussianBlur stdDeviation="25" />
          </filter>
          <filter id="galaxy-blur">
            <feGaussianBlur stdDeviation="35" />
          </filter>
        </defs>

        {/* 별 */}
        {bgStars.map((s, i) => (
          <circle
            key={i}
            cx={`${s.cx * 100}%`}
            cy={`${s.cy * 100}%`}
            r={s.r}
            fill={theme.starColor}
            opacity={s.opacity}
          />
        ))}

        {/* 챕터별 장식 */}
        {theme.extraDecoration === "nebula" && (
          <>
            <circle cx="75%" cy="25%" r="70" fill={theme.accentColor} opacity={0.1} filter="url(#nebula-blur)" />
            <circle cx="20%" cy="70%" r="50" fill={theme.accentColor} opacity={0.07} filter="url(#nebula-blur)" />
          </>
        )}
        {theme.extraDecoration === "sand" && (
          <>
            {Array.from({ length: 15 }).map((_, i) => (
              <circle
                key={`sand-${i}`}
                cx={`${((i * 53.7 + 10) % 90) + 5}%`}
                cy={`${((i * 41.3 + 50) % 40) + 60}%`}
                r={1}
                fill={theme.accentColor}
                opacity={0.3 + (i % 3) * 0.1}
              />
            ))}
          </>
        )}
        {theme.extraDecoration === "galaxy" && (
          <ellipse
            cx="50%"
            cy="50%"
            rx="140"
            ry="50"
            fill={theme.accentColor}
            opacity={0.06}
            transform="rotate(-25 50 50)"
            filter="url(#galaxy-blur)"
          />
        )}
      </svg>

      {/* 그리드 */}
      <div
        className="relative z-10 grid gap-1"
        style={{ gridTemplateColumns: `repeat(${map.cols}, ${cellSize}px)` }}
      >
        {cells}
      </div>

    </div>
  );
}
