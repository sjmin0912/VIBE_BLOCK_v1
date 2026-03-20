"use client";

import React from "react";
import { LessonConfig } from "@/engine/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface StoryProgressProps {
  lessons: LessonConfig[];
  currentLessonIndex: number;
  currentLevelIndex: number;
  completedLessons: number[];
  completedLevels: Record<number, number[]>;  // lessonId -> completed star[]
  onSelectLesson: (lessonIndex: number) => void;
  onSelectLevel: (levelIndex: number) => void;
}

export default function StoryProgress({
  lessons,
  currentLessonIndex,
  currentLevelIndex,
  completedLessons,
  completedLevels,
  onSelectLesson,
  onSelectLevel,
}: StoryProgressProps) {
  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          🚀 스토리 진행도
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {lessons.map((lesson, idx) => {
            const active = idx === currentLessonIndex;
            const completed = completedLessons.includes(lesson.id);
            const unlocked = idx === 0 || completedLessons.includes(lessons[idx - 1].id) || idx <= currentLessonIndex;
            const lessonCompletedLevels = completedLevels[lesson.id] || [];

            return (
              <div
                key={lesson.id}
                onClick={() => unlocked && onSelectLesson(idx)}
                className={`rounded-2xl border p-3 transition cursor-pointer ${
                  active
                    ? "border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-200"
                    : completed
                      ? "border-emerald-400 bg-emerald-50 hover:shadow"
                      : unlocked
                        ? "border-slate-200 bg-white hover:shadow hover:border-slate-300"
                        : "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold truncate">{lesson.title}</span>
                  {completed ? <span className="text-sm">✅</span> : active ? <span className="text-sm">🎯</span> : unlocked ? <span className="text-sm">🔓</span> : <span className="text-sm">🔒</span>}
                </div>
                <div className="text-xs text-slate-600 line-clamp-2 mb-2">{lesson.objective}</div>

                {/* 난이도 별 */}
                {unlocked && (
                  <div className="flex gap-1">
                    {lesson.levels.map((level, li) => {
                      const starCompleted = lessonCompletedLevels.includes(level.star);
                      const isCurrentLevel = active && li === currentLevelIndex;
                      return (
                        <button
                          key={li}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (active) onSelectLevel(li);
                          }}
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition ${
                            isCurrentLevel
                              ? "bg-indigo-500 text-white shadow"
                              : starCompleted
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <Star className={`h-3.5 w-3.5 ${starCompleted ? "fill-yellow-400" : ""}`} />
                        </button>
                      );
                    })}
                  </div>
                )}

                {lesson.mode === "draw" && (
                  <div className="mt-1 text-[10px] text-purple-500 font-medium">🎨 그리기</div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
