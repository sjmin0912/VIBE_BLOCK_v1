"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { BLOCK_LIBRARY } from "@/engine/constants";
import { flattenProgram } from "@/engine/interpreter";
import { LESSONS } from "@/engine/levels";
import { useGameState } from "@/hooks/useGameState";
import BlockPalette from "@/components/BlockPalette";
import Workspace, { cloneBlock } from "@/components/Workspace";
import GameCanvas from "@/components/GameCanvas";
import DrawCanvas from "@/components/DrawCanvas";
import ControlBar from "@/components/ControlBar";
import TeacherPanel from "@/components/TeacherPanel";
import StoryProgress from "@/components/StoryProgress";
import BlockChip from "@/components/BlockChip";

export default function VibeBlock2() {
  const state = useGameState();
  const [showFlow, setShowFlow] = React.useState(false);
  const [adminMode, setAdminMode] = React.useState(false);
  const flatProgram = React.useMemo(() => flattenProgram(state.program), [state.program]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 text-slate-900">
      <div className="mx-auto max-w-[1440px] space-y-4">

        {/* ── 상단: 선생님 안내 ── */}
        <TeacherPanel
          lesson={state.lesson}
          level={state.level}
          message={state.message}
          onResetMessage={() => state.setMessage(state.lesson.teacher)}
        />

        {/* ── 메인: 블록 바 | 작업 공간 | 실행화면 ── */}
        <div className="flex items-start gap-4">

          {/* 블록 팔레트 */}
          <div className="w-[200px] shrink-0">
            <BlockPalette
              availableBlocks={state.level.blocks || state.lesson.unlocked}
              onDragStart={(type) => state.setDraggingType(type)}
              onDragEnd={() => state.setDraggingType(null)}
              onDoubleClick={(type) => state.setProgram((prev) => [...prev, cloneBlock(type)])}
            />
          </div>

          {/* 작업 공간 */}
          <div className="min-w-0 flex-1">
            <Workspace
              program={state.program}
              setProgram={state.setProgram}
              draggingType={state.draggingType}
              runResult={state.runResult ? { flat: flatProgram } : null}
              stepIndex={state.stepIndex}
            />
          </div>

          {/* 실행화면 + 컨트롤 */}
          <div className="w-[360px] shrink-0 space-y-4">
            <Card className="overflow-hidden rounded-3xl shadow-lg">
              <CardHeader className={`py-3 text-white ${state.lesson.mode === "draw" ? "bg-slate-900" : "bg-indigo-900"}`}>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>실행 화면</span>
                  <Badge className="bg-white/15 text-white text-xs">
                    {state.lesson.mode === "draw" ? "🎨 그리기 모드" : "🗺️ 미로 모드"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                {/* 캔버스 */}
                {state.lesson.mode === "draw" ? (
                  <DrawCanvas
                    drawMap={state.drawMap}
                    cols={state.map.cols}
                    rows={state.map.rows}
                    characterX={state.characterX}
                    characterY={state.characterY}
                    characterDir={state.characterDir}
                    characterSprite={state.characterSprite}
                    angleDeg={state.angleDeg}
                    isAnimating={state.isRunning}
                    drawPath={state.drawPath}
                  />
                ) : (
                  <GameCanvas
                    map={state.map}
                    characterX={state.characterX}
                    characterY={state.characterY}
                    characterDir={state.characterDir}
                    characterSprite={state.characterSprite}
                    isAnimating={state.isRunning}
                    keyPositions={state.keyPositions}
                    doorPositions={state.doorPositions}
                    chapterId={state.lesson.id}
                  />
                )}

                {/* 컨트롤 바 */}
                <ControlBar
                  isRunning={state.isRunning}
                  hasResult={!!state.runResult}
                  stepIndex={state.stepIndex}
                  speed={state.speed}
                  onToggleRun={state.toggleRun}
                  onStepBack={state.stepBack}
                  onStepForward={state.stepForward}
                  onReset={() => {
                    state.resetRunState();
                    state.setMessage("처음 위치로 되돌렸어요. 다시 시도해 볼까요?");
                  }}
                  onSpeedChange={state.setSpeed}
                />
              </CardContent>
            </Card>

            {/* 실행 흐름 */}
            <Card className="rounded-3xl shadow-lg">
              <CardHeader
                className="cursor-pointer select-none pb-3"
                onClick={() => setShowFlow((p) => !p)}
              >
                <CardTitle className="flex items-center justify-between text-base">
                  <span>실행 흐름</span>
                  <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${showFlow ? "rotate-90" : ""}`} />
                </CardTitle>
              </CardHeader>
              {showFlow && (
                <CardContent className="max-h-[280px] space-y-2 overflow-auto pt-0">
                  {flatProgram.length ? (
                    flatProgram.map((block, idx) => (
                      <div key={`${block.id}-${idx}`}>
                        <BlockChip
                          block={{ id: block.id, type: block.type as any }}
                          compact
                          highlightStep={idx + 1 === state.stepIndex}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed p-4 text-sm text-slate-500">
                      아직 실행할 블록이 없어요.
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        </div>

        {/* ── 하단: 스토리 진행도 ── */}
        <StoryProgress
          lessons={LESSONS}
          currentLessonIndex={state.lessonIndex}
          currentLevelIndex={state.levelIndex}
          completedLessons={state.completedLessons}
          completedLevels={state.completedLevels}
          onSelectLesson={state.selectLesson}
          onSelectLevel={state.selectLevel}
        />

        {/* ── 관리자 모드 ── */}
        <div className="pt-2">
          <button
            onClick={() => setAdminMode((p) => !p)}
            className="text-xs text-slate-400 hover:text-slate-600 transition"
          >
            {adminMode ? "관리자 모드 닫기" : "관리자 모드"}
          </button>

          {adminMode && (
            <Card className="mt-2 rounded-3xl border-red-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-red-600">
                  🔧 관리자 모드 - 전체 레벨 바로가기
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {LESSONS.map((lesson, li) => (
                  <div key={lesson.id} className="rounded-2xl border border-slate-200 p-3">
                    <div className="mb-2 text-sm font-semibold text-slate-700">
                      {lesson.title}
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        {lesson.mode === "draw" ? "🎨 그리기" : "🗺️ 미로"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {lesson.levels.map((level, vi) => {
                        const isActive = state.lessonIndex === li && state.levelIndex === vi;
                        return (
                          <button
                            key={vi}
                            onClick={() => {
                              state.selectLesson(li);
                              setTimeout(() => state.selectLevel(vi), 0);
                            }}
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                              isActive
                                ? "bg-red-500 text-white shadow"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            ⭐{level.star}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
