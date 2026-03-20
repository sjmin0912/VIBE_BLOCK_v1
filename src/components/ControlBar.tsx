"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react";

interface ControlBarProps {
  isRunning: boolean;
  hasResult: boolean;
  stepIndex: number;
  speed: number[];
  onToggleRun: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onReset: () => void;
  onSpeedChange: (value: number[]) => void;
}

export default function ControlBar({
  isRunning,
  hasResult,
  stepIndex,
  speed,
  onToggleRun,
  onStepBack,
  onStepForward,
  onReset,
  onSpeedChange,
}: ControlBarProps) {
  return (
    <div className="space-y-3">
      {/* 실행 속도 */}
      <div className="rounded-2xl border bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm font-medium">
          <span>실행 속도</span>
          <span className="text-xs text-slate-500">{speed[0] >= 800 ? "빠름" : speed[0] >= 400 ? "보통" : "느림"}</span>
        </div>
        <Slider value={speed} min={100} max={1000} step={50} onValueChange={onSpeedChange} />
      </div>

      {/* 실행 | ← | → */}
      <div className="grid grid-cols-3 gap-2">
        <Button className="h-12 rounded-2xl text-sm font-semibold" onClick={onToggleRun}>
          {isRunning ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
          {isRunning ? "멈춤" : "실행"}
        </Button>
        <Button
          variant="secondary"
          className="h-12 rounded-2xl font-semibold"
          onClick={onStepBack}
          disabled={!hasResult || stepIndex === 0}
          title="이전 단계로"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          className="h-12 rounded-2xl font-semibold"
          onClick={onStepForward}
          title="다음 단계로"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* 다시 시작 */}
      <Button variant="outline" className="h-10 w-full rounded-2xl" onClick={onReset}>
        <RotateCcw className="mr-2 h-4 w-4" />
        다시 시작
      </Button>
    </div>
  );
}
