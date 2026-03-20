"use client";

import React, { useCallback } from "react";
import { ProgramBlock, BlockType } from "@/engine/types";
import { BLOCK_LIBRARY, ANGLE_OPTIONS, uid } from "@/engine/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface BlockChipProps {
  block: ProgramBlock;
  active?: boolean;
  compact?: boolean;
  highlightStep?: boolean;
  onDelete?: (id: string) => void;
  onChangeTimes?: (id: string, times: number) => void;
  onChangeAngle?: (id: string, angle: number) => void;
  onDropChild?: (parentId: string, e: React.DragEvent) => void;
  onDropElseChild?: (parentId: string, e: React.DragEvent) => void;
  onDeleteChild?: (parentId: string, childId: string) => void;
  onDeleteElseChild?: (parentId: string, childId: string) => void;
  onChangeChildAngle?: (parentId: string, childId: string, angle: number) => void;
  onChangeElseChildAngle?: (parentId: string, childId: string, angle: number) => void;
}

// ── 비주얼 각도 다이얼 (드래그 가능) ──
function AngleDial({
  angle,
  onChange,
}: {
  angle: number;
  onChange: (newAngle: number) => void;
}) {
  const size = 56;
  const cx = size / 2;
  const cy = size / 2;
  const r = 20;
  const absAngle = Math.abs(angle);
  const isLeft = angle < 0;

  // 아크 끝점 계산
  const endRad = (absAngle * Math.PI) / 180;
  const endX = isLeft
    ? cx - Math.sin(endRad) * r
    : cx + Math.sin(endRad) * r;
  const endY = cy - Math.cos(endRad) * r;
  const largeArc = absAngle > 180 ? 1 : 0;
  const sweep = isLeft ? 0 : 1;

  const arcPath =
    absAngle > 0 && absAngle < 360
      ? `M${cx},${cy - r} A${r},${r} 0 ${largeArc} ${sweep} ${endX},${endY}`
      : absAngle >= 360
        ? `M${cx},${cy - r} A${r},${r} 0 1 ${sweep} ${cx},${cy + r} A${r},${r} 0 1 ${sweep} ${cx},${cy - r}`
        : "";

  // 드래그로 각도 변경
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      e.preventDefault();
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();

      const calcAngle = (clientX: number, clientY: number) => {
        const mx = clientX - rect.left - cx;
        const my = clientY - rect.top - cy;
        let deg = (Math.atan2(mx, -my) * 180) / Math.PI;
        if (deg < 0) deg += 360;
        // 5도 단위 스냅
        deg = Math.round(deg / 5) * 5;
        if (deg === 0) deg = 5;
        if (deg > 355) deg = 360;
        // 방향 유지
        onChange(isLeft ? -deg : deg);
      };

      calcAngle(e.clientX, e.clientY);

      const onMove = (me: MouseEvent) => calcAngle(me.clientX, me.clientY);
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [cx, cy, isLeft, onChange]
  );

  return (
    <svg
      width={size}
      height={size}
      className="shrink-0 cursor-pointer"
      onMouseDown={handleMouseDown}
    >
      {/* 배경 원 */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="rgba(255,255,255,0.05)"
        stroke="white"
        strokeWidth={1.5}
        opacity={0.3}
      />
      {/* 시작 표시 (위쪽) */}
      <line
        x1={cx}
        y1={cy - r - 3}
        x2={cx}
        y2={cy - r + 3}
        stroke="white"
        strokeWidth={2}
        opacity={0.5}
      />
      {/* 아크 */}
      {absAngle > 0 && (
        <path
          d={arcPath}
          fill="none"
          stroke="#00f0ff"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.9}
        />
      )}
      {/* 끝점 */}
      {absAngle > 0 && absAngle < 360 && (
        <circle cx={endX} cy={endY} r={4} fill="#00f0ff" />
      )}
      {/* 방향 화살표 아이콘 */}
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={12}
        opacity={0.7}
      >
        {isLeft ? "↺" : "↻"}
      </text>
    </svg>
  );
}

// ── 인라인 각도 컨트롤 (자식 블록용 컴팩트 버전) ──
function InlineAngleControl({
  angle,
  onChange,
}: {
  angle: number;
  onChange: (a: number) => void;
}) {
  const absAngle = Math.abs(angle);
  const isLeft = angle < 0;

  return (
    <div className="flex items-center gap-1">
      {/* 방향 토글 */}
      <button
        className={`rounded px-1.5 py-0.5 text-xs font-bold transition ${isLeft ? "bg-white/30" : "bg-white/10"}`}
        onClick={() => onChange(-absAngle)}
      >
        ↺
      </button>
      <button
        className={`rounded px-1.5 py-0.5 text-xs font-bold transition ${!isLeft ? "bg-white/30" : "bg-white/10"}`}
        onClick={() => onChange(absAngle)}
      >
        ↻
      </button>
      {/* 각도 드롭다운 */}
      <select
        value={absAngle}
        onChange={(e) => {
          const v = Number(e.target.value);
          onChange(isLeft ? -v : v);
        }}
        className="h-7 rounded-lg border-white/30 bg-white/20 px-1 text-xs text-white"
      >
        {ANGLE_OPTIONS.map((a) => (
          <option key={a} value={a} className="text-black">
            {a}°
          </option>
        ))}
      </select>
    </div>
  );
}

// ── 자식 블록 렌더링 ──
function ChildBlock({
  child,
  parentId,
  onDelete,
  onChangeAngle,
}: {
  child: ProgramBlock;
  parentId: string;
  onDelete?: (parentId: string, childId: string) => void;
  onChangeAngle?: (parentId: string, childId: string, angle: number) => void;
}) {
  const childMeta = BLOCK_LIBRARY[child.type];
  if (!childMeta) return null;

  const isTurnAngle = child.type === "turn_angle";
  const absAngle = Math.abs(child.angle || 90);
  const isLeft = (child.angle || 90) < 0;
  const dirLabel = isLeft ? "왼쪽" : "오른쪽";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex flex-1 items-center justify-between rounded-xl ${childMeta.color} px-3 py-2 text-sm font-semibold text-white shadow`}
      >
        <span>
          {isTurnAngle ? `${dirLabel} ${absAngle}도 돌기` : childMeta.label}
        </span>
        {isTurnAngle && onChangeAngle && (
          <InlineAngleControl
            angle={child.angle || 90}
            onChange={(a) => onChangeAngle(parentId, child.id, a)}
          />
        )}
      </div>
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/20"
          onClick={() => onDelete(parentId, child.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default function BlockChip({
  block,
  active = false,
  compact = false,
  highlightStep = false,
  onDelete,
  onChangeTimes,
  onChangeAngle,
  onDropChild,
  onDropElseChild,
  onDeleteChild,
  onDeleteElseChild,
  onChangeChildAngle,
  onChangeElseChildAngle,
}: BlockChipProps) {
  const meta = BLOCK_LIBRARY[block.type];
  if (!meta) return null;

  const glow =
    active || highlightStep ? "ring-4 ring-yellow-300 scale-[1.02]" : "";

  // ── 각도 입력 블록 (리디자인) ──
  if (block.type === "turn_angle") {
    const currentAngle = block.angle || 90;
    const absAngle = Math.abs(currentAngle);
    const isLeft = currentAngle < 0;

    return (
      <div
        className={`rounded-2xl ${meta.color} ${meta.text} p-3 shadow-md transition ${glow}`}
      >
        <div className="flex items-center gap-3">
          {/* 비주얼 다이얼 */}
          <AngleDial
            angle={currentAngle}
            onChange={(a) => onChangeAngle?.(block.id, a)}
          />

          <div className="flex flex-1 flex-col gap-2">
            {/* 방향 토글 */}
            <div className="flex overflow-hidden rounded-lg border border-white/30">
              <button
                className={`flex-1 px-3 py-1 text-xs font-bold transition ${isLeft ? "bg-white/30 text-white" : "bg-white/10 text-white/70"}`}
                onClick={() =>
                  onChangeAngle?.(block.id, -absAngle)
                }
              >
                ↺ 왼쪽
              </button>
              <button
                className={`flex-1 px-3 py-1 text-xs font-bold transition ${!isLeft ? "bg-white/30 text-white" : "bg-white/10 text-white/70"}`}
                onClick={() =>
                  onChangeAngle?.(block.id, absAngle)
                }
              >
                오른쪽 ↻
              </button>
            </div>

            {/* 각도 선택 */}
            <div className="flex items-center gap-2">
              <select
                value={absAngle}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  onChangeAngle?.(block.id, isLeft ? -v : v);
                }}
                className="h-8 flex-1 rounded-lg border-white/30 bg-white/20 px-2 text-sm text-white"
              >
                {ANGLE_OPTIONS.map((a) => (
                  <option key={a} value={a} className="text-black">
                    {a}도
                  </option>
                ))}
              </select>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => onDelete(block.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 컨테이너 블록 (반복, 조건, while, 함수) ──
  if (meta.hasChildren) {
    return (
      <div
        className={`rounded-2xl ${meta.color} ${meta.text} p-3 shadow-md transition ${glow}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">{meta.label}</div>
          <div className="flex items-center gap-2">
            {block.type === "repeat" && (
              <>
                <span className="text-xs opacity-90">횟수</span>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={block.times || 2}
                  onChange={(e) =>
                    onChangeTimes?.(
                      block.id,
                      Math.max(1, Math.min(20, Number(e.target.value) || 1))
                    )
                  }
                  className="h-8 w-16 border-white/30 bg-white/20 text-white placeholder:text-white/70"
                />
              </>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => onDelete(block.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 자식 블록 영역: "하기" */}
        <div className="mt-3 rounded-xl bg-white/15 p-3">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-white/80">
            하기
          </div>
          <div
            className="min-h-14 space-y-2 rounded-xl border border-dashed border-white/40 p-2"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDropChild?.(block.id, e)}
          >
            {block.children?.length ? (
              block.children.map((child) => (
                <ChildBlock
                  key={child.id}
                  child={child}
                  parentId={block.id}
                  onDelete={onDeleteChild}
                  onChangeAngle={onChangeChildAngle}
                />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-white/40 px-3 py-3 text-sm text-white/80">
                여기에 블록을 드래그하세요
              </div>
            )}
          </div>
        </div>

        {/* 조건 블록의 "아니면" 영역 */}
        {meta.hasElse && (
          <div className="mt-3 rounded-xl bg-white/10 p-3">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-white/80">
              아니면
            </div>
            <div
              className="min-h-14 space-y-2 rounded-xl border border-dashed border-white/40 p-2"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDropElseChild?.(block.id, e)}
            >
              {block.elseChildren?.length ? (
                block.elseChildren.map((child) => (
                  <ChildBlock
                    key={child.id}
                    child={child}
                    parentId={block.id}
                    onDelete={onDeleteElseChild}
                    onChangeAngle={onChangeElseChildAngle}
                  />
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-white/40 px-3 py-3 text-sm text-white/80">
                  아니면 할 일을 넣으세요
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── 일반 블록 ──
  return (
    <div
      className={`inline-flex items-center rounded-2xl ${meta.color} ${meta.text} ${compact ? "px-3 py-2 text-sm" : "px-4 py-3"} font-semibold shadow-md transition ${glow}`}
    >
      {meta.label}
    </div>
  );
}
