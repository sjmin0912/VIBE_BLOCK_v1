"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ProgramBlock, Direction, RunResult, HistoryFrame, SpriteState, BlockType, LessonConfig, LevelConfig } from "@/engine/types";
import { evaluateProgram } from "@/engine/interpreter";
import { LESSONS } from "@/engine/levels";

export function useGameState() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);
  const [program, setProgram] = useState<ProgramBlock[]>([]);
  const [draggingType, setDraggingType] = useState<BlockType | null>(null);
  const [speed, setSpeed] = useState([600]);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [completedLevels, setCompletedLevels] = useState<Record<number, number[]>>({});

  // 캐릭터 상태
  const [characterX, setCharacterX] = useState(0);
  const [characterY, setCharacterY] = useState(0);
  const [characterDir, setCharacterDir] = useState<Direction>(Direction.UP);
  const [characterSprite, setCharacterSprite] = useState<SpriteState>("idle");
  const [angleDeg, setAngleDeg] = useState(0);

  // 동적 오브젝트 상태
  const [keyPositions, setKeyPositions] = useState<[number, number][]>([]);
  const [doorPositions, setDoorPositions] = useState<[number, number][]>([]);
  const [drawPath, setDrawPath] = useState<{ x: number; y: number }[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const lesson: LessonConfig = LESSONS[lessonIndex];
  const level: LevelConfig = lesson.levels[levelIndex];
  const map = level.map;

  const isDrawMode = lesson.mode === "draw";
  const drawMap = level.drawMap;

  // 맵 초기화
  const initMap = useCallback(() => {
    if (isDrawMode && drawMap) {
      setCharacterX(drawMap.startX);
      setCharacterY(drawMap.startY);
      setAngleDeg(drawMap.startAngle);
      setCharacterSprite("idle");
      setDrawPath([{ x: drawMap.startX, y: drawMap.startY }]);
    } else {
      setCharacterX(map.start.x);
      setCharacterY(map.start.y);
      setCharacterDir(map.start.dir);
      setCharacterSprite("idle");
      setDrawPath([{ x: map.start.x, y: map.start.y }]);
    }
    setKeyPositions((map.keys || []).map(([x, y]) => [x, y]));
    setDoorPositions((map.doors || []).map(([x, y]) => [x, y]));
  }, [map, isDrawMode, drawMap]);

  // 레슨/레벨 변경 시 초기화
  useEffect(() => {
    setProgram([]);
    setRunResult(null);
    setStepIndex(0);
    setIsRunning(false);
    setMessage(lesson.teacher);
    initMap();
    if (timerRef.current) clearInterval(timerRef.current);
  }, [lessonIndex, levelIndex, lesson.teacher, initMap]);

  const resetRunState = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setRunResult(null);
    setStepIndex(0);
    initMap();
  }, [initMap]);

  const applyFrame = useCallback((frame: HistoryFrame) => {
    setCharacterX(frame.x);
    setCharacterY(frame.y);
    setCharacterDir(frame.dir);
    setCharacterSprite(frame.sprite);
    if (frame.angleDeg !== undefined) setAngleDeg(frame.angleDeg);
    if (frame.keyPositions) setKeyPositions(frame.keyPositions);
    if (frame.doorPositions) setDoorPositions(frame.doorPositions);
    if (frame.drawPath) setDrawPath(frame.drawPath);
  }, []);

  const executeProgram = useCallback(() => {
    const result = evaluateProgram(program, map, drawMap, level.successCondition);
    setRunResult(result);
    setStepIndex(0);
    applyFrame(result.history[0]);
    setMessage(result.message);
    return result;
  }, [program, map, drawMap, level.successCondition, applyFrame]);

  const handleSuccess = useCallback(() => {
    setCompletedLevels((prev) => {
      const lessonId = lesson.id;
      const existing = prev[lessonId] || [];
      if (!existing.includes(level.star)) {
        return { ...prev, [lessonId]: [...existing, level.star] };
      }
      return prev;
    });

    const allStars = lesson.levels.map((l) => l.star);
    const currentCompleted = completedLevels[lesson.id] || [];
    const newCompleted = [...currentCompleted, level.star];
    const allDone = allStars.every((s) => newCompleted.includes(s));

    if (allDone && !completedLessons.includes(lesson.id)) {
      setCompletedLessons((prev) => [...prev, lesson.id]);
    }

    setTimeout(() => {
      if (levelIndex < lesson.levels.length - 1) {
        setMessage("잘했어요! ⭐ 다음 난이도로 넘어갑니다!");
        setLevelIndex(levelIndex + 1);
      } else if (lessonIndex < LESSONS.length - 1) {
        setMessage("훌륭해요! 🎉 다음 레슨이 해금됐어요!");
        setLessonIndex(lessonIndex + 1);
        setLevelIndex(0);
      } else {
        setMessage("축하해요! 🏆 모든 레슨을 클리어했어요!");
      }
    }, 1200);
  }, [lesson, level, levelIndex, lessonIndex, completedLessons, completedLevels]);

  const toggleRun = useCallback(() => {
    if (isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
      return;
    }
    const result = executeProgram();
    if (!result.history || result.history.length <= 1) {
      setMessage("먼저 블록을 작업 공간에 넣어 보세요!");
      return;
    }
    setIsRunning(true);
    let nextStep = 1;
    timerRef.current = setInterval(() => {
      if (nextStep >= result.history.length) {
        clearInterval(timerRef.current!);
        setIsRunning(false);
        if (result.success) {
          handleSuccess();
        }
        return;
      }
      setStepIndex(nextStep);
      applyFrame(result.history[nextStep]);
      nextStep += 1;
    }, Math.max(150, 1100 - speed[0]));
  }, [isRunning, executeProgram, speed, applyFrame, handleSuccess]);

  const stepBack = useCallback(() => {
    if (!runResult) return;
    const prev = Math.max(0, stepIndex - 1);
    setStepIndex(prev);
    applyFrame(runResult.history[prev]);
  }, [runResult, stepIndex, applyFrame]);

  const stepForward = useCallback(() => {
    let result = runResult;
    if (!result) {
      result = executeProgram();
      if (!result.history || result.history.length <= 1) return;
    }
    const next = Math.min(stepIndex + 1, result.history.length - 1);
    setStepIndex(next);
    applyFrame(result.history[next]);
    if (next === result.history.length - 1 && result.success) {
      handleSuccess();
    }
  }, [runResult, stepIndex, executeProgram, applyFrame, handleSuccess]);

  const selectLesson = useCallback((idx: number) => {
    setLessonIndex(idx);
    setLevelIndex(0);
  }, []);

  const selectLevel = useCallback((idx: number) => {
    setLevelIndex(idx);
  }, []);

  return {
    lessonIndex,
    levelIndex,
    lesson,
    level,
    map,
    program,
    setProgram,
    draggingType,
    setDraggingType,
    speed,
    setSpeed,
    isRunning,
    runResult,
    stepIndex,
    message,
    setMessage,
    completedLessons,
    completedLevels,
    characterX,
    characterY,
    characterDir,
    characterSprite,
    angleDeg,
    isDrawMode,
    drawMap,
    keyPositions,
    doorPositions,
    drawPath,
    resetRunState,
    toggleRun,
    stepBack,
    stepForward,
    selectLesson,
    selectLevel,
  };
}
