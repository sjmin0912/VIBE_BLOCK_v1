"use client";

import React from "react";
import { Direction, SpriteState } from "@/engine/types";
import Image from "next/image";

interface CharacterProps {
  direction: Direction;
  sprite: SpriteState;
  isAnimating?: boolean;
  cellSize: number;
  isDrawMode?: boolean;
  angleDeg?: number;
}

// angleDeg → 4방향 변환 (0=위, 시계방향)
function angleDegToDirection(angleDeg: number): Direction {
  const n = ((angleDeg % 360) + 360) % 360;
  if (n >= 315 || n < 45) return Direction.UP;
  if (n >= 45 && n < 135) return Direction.RIGHT;
  if (n >= 135 && n < 225) return Direction.DOWN;
  return Direction.LEFT;
}

// 방향별 기본 스프라이트 매핑
function getSpriteSrc(direction: Direction, sprite: SpriteState): string {
  if (sprite === "happy") return "/character/happy.png";
  if (sprite === "think") return "/character/think.png";
  if (sprite === "pick_up") return "/character/pick_up.png";

  const dirMap: Record<Direction, string> = {
    [Direction.UP]: "back",
    [Direction.DOWN]: "front",
    [Direction.LEFT]: "left",
    [Direction.RIGHT]: "right",
  };
  return `/character/${dirMap[direction]}.png`;
}

export default function Character({ direction, sprite, isAnimating, cellSize, isDrawMode, angleDeg }: CharacterProps) {
  const drawDir = isDrawMode && angleDeg !== undefined ? angleDegToDirection(angleDeg) : direction;
  const src = getSpriteSrc(drawDir, sprite);
  const size = Math.floor(cellSize * 0.45

  );

  const animClasses: Partial<Record<SpriteState, string>> = {
    happy: "animate-char-happy",
    sad: "animate-char-sad",
    think: "animate-char-think",
    pick_up: "animate-char-pickup",
  };
  const animClass = animClasses[sprite] || "";

  return (
    <div
      className={`relative flex items-center justify-center transition-all duration-300 ${animClass}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt="외계인 캐릭터"
        width={size}
        height={size}
        className="object-contain drop-shadow-lg"
        priority
      />
    </div>
  );
}
