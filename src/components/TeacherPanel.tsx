"use client";

import React, { useState } from "react";
import { LessonConfig, LevelConfig } from "@/engine/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Sparkles, Star } from "lucide-react";

interface TeacherPanelProps {
  lesson: LessonConfig;
  level: LevelConfig;
  message: string;
  onResetMessage: () => void;
}

function TeacherAvatar() {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-3xl shadow-inner">
      👽
    </div>
  );
}

export default function TeacherPanel({ lesson, level, message, onResetMessage }: TeacherPanelProps) {
  const [showHint, setShowHint] = useState(false);

  return (
    <Card className="rounded-3xl shadow-lg">
      <CardContent className="flex items-start gap-4 p-5">
        <TeacherAvatar />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-indigo-100 text-indigo-700">{lesson.title}</Badge>
            <Badge variant="outline" className="rounded-full">{lesson.objective}</Badge>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${s <= level.star ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-600 italic mb-2">{lesson.story}</p>
          <p className="text-base font-semibold leading-relaxed">{message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={() => setShowHint((p) => !p)}>
              <Lightbulb className="mr-2 h-4 w-4" />
              힌트
            </Button>
            <Button variant="outline" className="rounded-2xl" onClick={onResetMessage}>
              <Sparkles className="mr-2 h-4 w-4" />
              설명 다시 보기
            </Button>
          </div>
          {showHint && (
            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              💡 {level.hint}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
