"use client";

import React, { useState } from "react";
import { ProgramBlock, BlockType } from "@/engine/types";
import { BLOCK_LIBRARY, uid } from "@/engine/constants";
import BlockChip from "./BlockChip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WorkspaceProps {
  program: ProgramBlock[];
  setProgram: React.Dispatch<React.SetStateAction<ProgramBlock[]>>;
  draggingType: BlockType | null;
  runResult: { flat: { id: string }[]; } | null;
  stepIndex: number;
}

export function cloneBlock(type: BlockType): ProgramBlock {
  if (type === "repeat") {
    return { id: uid("repeat"), type, times: 2, children: [] };
  }
  if (type === "while_not_goal" || type === "while_not_wall") {
    return { id: uid(type), type, children: [] };
  }
  if (type === "if_wall_ahead" || type === "if_item_here") {
    return { id: uid(type), type, children: [], elseChildren: [] };
  }
  if (type === "define_function") {
    return { id: uid("func"), type, children: [] };
  }
  if (type === "turn_angle") {
    return { id: uid("angle"), type, angle: 90 };
  }
  return { id: uid(type), type };
}

export default function Workspace({ program, setProgram, draggingType, runResult, stepIndex }: WorkspaceProps) {
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDropToWorkspace = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggingIdx !== null) return;
    const type = (e.dataTransfer.getData("block/type") || draggingType) as BlockType;
    if (!type) return;
    setProgram((prev) => [...prev, cloneBlock(type)]);
  };

  const handleReorder = (toIdx: number) => {
    if (draggingIdx === null || draggingIdx === toIdx) return;
    setProgram((prev) => {
      const next = [...prev];
      const [moved] = next.splice(draggingIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const handleDropToChild = (parentId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const type = (e.dataTransfer.getData("block/type") || draggingType) as BlockType;
    if (!type) return;
    // 컨테이너 블록은 자식으로 넣지 않음 (간소화)
    const meta = BLOCK_LIBRARY[type];
    if (meta?.hasChildren) return;
    setProgram((prev) =>
      prev.map((block) => {
        if (block.id !== parentId) return block;
        return { ...block, children: [...(block.children || []), cloneBlock(type)] };
      })
    );
  };

  const handleDropToElseChild = (parentId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const type = (e.dataTransfer.getData("block/type") || draggingType) as BlockType;
    if (!type) return;
    const meta = BLOCK_LIBRARY[type];
    if (meta?.hasChildren) return;
    setProgram((prev) =>
      prev.map((block) => {
        if (block.id !== parentId) return block;
        return { ...block, elseChildren: [...(block.elseChildren || []), cloneBlock(type)] };
      })
    );
  };

  const deleteBlock = (id: string) => setProgram((prev) => prev.filter((b) => b.id !== id));
  const deleteChild = (parentId: string, childId: string) => {
    setProgram((prev) =>
      prev.map((block) => {
        if (block.id !== parentId) return block;
        return { ...block, children: (block.children || []).filter((c) => c.id !== childId) };
      })
    );
  };
  const deleteElseChild = (parentId: string, childId: string) => {
    setProgram((prev) =>
      prev.map((block) => {
        if (block.id !== parentId) return block;
        return { ...block, elseChildren: (block.elseChildren || []).filter((c) => c.id !== childId) };
      })
    );
  };
  const changeTimes = (id: string, times: number) => {
    setProgram((prev) => prev.map((b) => (b.id === id ? { ...b, times } : b)));
  };
  const changeAngle = (id: string, angle: number) => {
    setProgram((prev) => prev.map((b) => (b.id === id ? { ...b, angle } : b)));
  };
  const changeChildAngle = (parentId: string, childId: string, angle: number) => {
    setProgram((prev) =>
      prev.map((block) => {
        if (block.id !== parentId) return block;
        return { ...block, children: (block.children || []).map((c) => c.id === childId ? { ...c, angle } : c) };
      })
    );
  };
  const changeElseChildAngle = (parentId: string, childId: string, angle: number) => {
    setProgram((prev) =>
      prev.map((block) => {
        if (block.id !== parentId) return block;
        return { ...block, elseChildren: (block.elseChildren || []).map((c) => c.id === childId ? { ...c, angle } : c) };
      })
    );
  };

  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span>작업 공간</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">블록 {program.length}개</Badge>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setProgram([])}>
              전체 비우기
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent
        className="min-h-[520px] space-y-2 bg-slate-50 p-4"
        onDragOver={(e) => {
          if (draggingIdx !== null) return;
          e.preventDefault();
        }}
        onDrop={handleDropToWorkspace}
      >
        <div className="inline-flex rounded-2xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-md">
          실행하면
        </div>

        {program.length ? (
          program.map((block, idx) => (
            <div
              key={block.id}
              draggable
              onDragStart={(e) => {
                setDraggingIdx(idx);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggingIdx !== null) setDragOverIdx(idx);
              }}
              onDrop={(e) => {
                e.stopPropagation();
                handleReorder(idx);
              }}
              onDragEnd={(e) => {
                if (e.dataTransfer.dropEffect === "none") deleteBlock(block.id);
                setDraggingIdx(null);
                setDragOverIdx(null);
              }}
              className={`cursor-grab rounded-xl transition-all active:cursor-grabbing ${
                draggingIdx === idx ? "opacity-40" : ""
              } ${
                dragOverIdx === idx && draggingIdx !== idx ? "ring-2 ring-sky-400 ring-offset-1" : ""
              }`}
            >
              <BlockChip
                block={block}
                compact
                active={!!(runResult && stepIndex > 0 && runResult.flat[stepIndex - 1]?.id === block.id)}
                onDelete={deleteBlock}
                onChangeTimes={changeTimes}
                onChangeAngle={changeAngle}
                onDropChild={handleDropToChild}
                onDropElseChild={handleDropToElseChild}
                onDeleteChild={deleteChild}
                onDeleteElseChild={deleteElseChild}
                onChangeChildAngle={changeChildAngle}
                onChangeElseChildAngle={changeElseChildAngle}
              />
            </div>
          ))
        ) : (
          <div className="flex min-h-[420px] items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white text-center text-slate-500">
            <div>
              <p className="text-lg font-semibold">여기가 작업 공간이에요</p>
              <p className="mt-2 text-sm">왼쪽 블록을 이곳으로 끌어와서 나만의 코드를 만들어 보세요.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
