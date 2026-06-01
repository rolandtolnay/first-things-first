"use client";

import type { DragData, GoalDragData, BlockDragData, PriorityDragData, EveningDragData } from "@/types/dnd";
import type { RoleColor } from "@/types";
import { useWeekStore } from "@/stores/weekStore";
import { DragPreview } from "./DragPreview";

interface DragOverlayContentProps {
  data: DragData;
  sourceRect?: { width: number; height: number } | null;
}

export function DragOverlayContent({ data, sourceRect }: DragOverlayContentProps) {
  if (data.type === "goal") {
    return <GoalOverlay data={data} sourceRect={sourceRect} />;
  }
  if (data.type === "block") {
    return <BlockOverlay data={data} sourceRect={sourceRect} />;
  }
  if (data.type === "priority") {
    return <PriorityOverlay data={data} sourceRect={sourceRect} />;
  }
  if (data.type === "evening") {
    return <EveningOverlay data={data} sourceRect={sourceRect} />;
  }
  return null;
}

type SourceRect = { width: number; height: number } | null | undefined;

function GoalOverlay({ data, sourceRect }: { data: GoalDragData; sourceRect?: SourceRect }) {
  const roleColor = useWeekStore((state) =>
    state.currentWeek?.roles.find((r) => r.id === data.roleId)?.color
  ) as RoleColor | undefined;

  return <DragPreview text={data.text} roleColor={roleColor ?? "teal"} width={sourceRect?.width} height={sourceRect?.height} />;
}

function BlockOverlay({ data, sourceRect }: { data: BlockDragData; sourceRect?: SourceRect }) {
  const block = useWeekStore((state) =>
    state.currentWeek?.timeBlocks.find((b) => b.id === data.blockId)
  );
  const roleColor = useWeekStore((state) =>
    state.currentWeek?.roles.find((r) => r.id === block?.roleId)?.color
  ) as RoleColor | undefined;

  if (!block) return null;

  return (
    <DragPreview
      text={block.title}
      roleColor={block.roleId ? (roleColor ?? "teal") : undefined}
      width={sourceRect?.width}
      height={sourceRect?.height}
    />
  );
}

function PriorityOverlay({ data, sourceRect }: { data: PriorityDragData; sourceRect?: SourceRect }) {
  const roleColor = useWeekStore((state) =>
    state.currentWeek?.roles.find((r) => r.id === data.roleId)?.color
  ) as RoleColor | undefined;

  return (
    <DragPreview
      text={data.text}
      roleColor={roleColor ?? "teal"}
      roleBorder="uniform"
      width={sourceRect?.width}
      height={sourceRect?.height}
    />
  );
}

function EveningOverlay({ data, sourceRect }: { data: EveningDragData; sourceRect?: SourceRect }) {
  const roleColor = useWeekStore((state) =>
    data.roleId ? state.currentWeek?.roles.find((r) => r.id === data.roleId)?.color : undefined
  ) as RoleColor | undefined;

  return <DragPreview text={data.title} roleColor={roleColor} width={sourceRect?.width} height={sourceRect?.height} />;
}

export default DragOverlayContent;
