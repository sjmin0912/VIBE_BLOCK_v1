"use client";

import React from "react";

const COLORS = ["#FFD700", "#FF6B6B", "#4ECDC4", "#A78BFA", "#F472B6", "#38BDF8", "#FBBF24", "#34D399"];

interface Spark {
  color: string;
  tx: number;
  ty: number;
  delay: number;
  duration: number;
  size: number;
}

// 1차 폭발: 중심에서 퍼지는 큰 불꽃
function generateBurst(count: number, dist: number, baseDelay: number): Spark[] {
  return Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * 360;
    const rad = (angle * Math.PI) / 180;
    const d = dist + (i * 31) % 80;
    return {
      color: COLORS[i % COLORS.length],
      tx: Math.cos(rad) * d,
      ty: Math.sin(rad) * d,
      delay: baseDelay + (i * 0.02) % 0.15,
      duration: 0.8 + (i % 3) * 0.2,
      size: 6 + (i % 3) * 2,
    };
  });
}

// 2차 폭발: 약간 늦게, 더 넓게
const SPARKS = [
  ...generateBurst(30, 150, 0),
  ...generateBurst(25, 300, 0.3),
  ...generateBurst(20, 450, 0.6),
];

export default function SpaceConfetti() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-visible">
      {/* 중심 플래시 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-firework-flash">
        <div className="h-8 w-8 rounded-full bg-white" />
      </div>

      {/* 불꽃 파티클 */}
      {SPARKS.map((s, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 animate-firework-spark"
          style={{
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
            borderRadius: "50%",
            boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
            ["--tx" as string]: `${s.tx}px`,
            ["--ty" as string]: `${s.ty}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}

      {/* 이모지 장식 (별/로켓) */}
      {["⭐", "🌟", "✨", "🚀", "💫", "🪐", "☄️", "🌙"].map((emoji, i) => {
        const angle = (i / 8) * 360;
        const rad = (angle * Math.PI) / 180;
        const dist = 200 + (i * 70) % 150;
        return (
          <div
            key={`e-${i}`}
            className="absolute left-1/2 top-1/2 animate-firework-spark"
            style={{
              fontSize: 20 + (i % 3) * 6,
              ["--tx" as string]: `${Math.cos(rad) * dist}px`,
              ["--ty" as string]: `${Math.sin(rad) * dist}px`,
              animationDelay: `${0.2 + i * 0.08}s`,
              animationDuration: "1.8s",
            }}
          >
            {emoji}
          </div>
        );
      })}
    </div>
  );
}
