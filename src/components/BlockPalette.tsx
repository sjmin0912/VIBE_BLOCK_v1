"use client";

import React from "react";
import { BlockType, BlockCategory } from "@/engine/types";
import { BLOCK_LIBRARY, CATEGORY_COLORS } from "@/engine/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Unlock } from "lucide-react";

interface BlockPaletteProps {
  availableBlocks: BlockType[];
  onDragStart: (type: BlockType) => void;
  onDragEnd: () => void;
  onDoubleClick?: (type: BlockType) => void;
}

export default function BlockPalette({ availableBlocks, onDragStart, onDragEnd, onDoubleClick }: BlockPaletteProps) {
  // 카테고리별로 그룹핑
  const grouped = React.useMemo(() => {
    const map = new Map<BlockCategory, { key: BlockType; label: string; color: string; text: string }[]>();
    for (const key of availableBlocks) {
      const meta = BLOCK_LIBRARY[key];
      if (!meta) continue;
      const cat = meta.category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push({ key, label: meta.label, color: meta.color, text: meta.text });
    }
    return map;
  }, [availableBlocks]);

  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Unlock className="h-4 w-4" />
          블록 바
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from(grouped.entries()).map(([category, blocks]) => (
          <div key={category}>
            <div className={`mb-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[category]}`}>
              {category}
            </div>
            <div className="space-y-2">
              {blocks.map((block) => (
                <div
                  key={block.key}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("block/type", block.key);
                    onDragStart(block.key);
                  }}
                  onDragEnd={onDragEnd}
                  onDoubleClick={() => onDoubleClick?.(block.key)}
                  className="cursor-grab active:cursor-grabbing select-none"
                >
                  <div className={`rounded-2xl ${block.color} px-4 py-2.5 text-sm font-semibold ${block.text} shadow-md transition hover:scale-[1.02]`}>
                    {block.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="rounded-2xl border border-dashed p-3 text-xs text-slate-500">
          블록을 드래그하거나 더블클릭해서 추가하세요.
        </div>
      </CardContent>
    </Card>
  );
}
