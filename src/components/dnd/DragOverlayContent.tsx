"use client";

import type { DragData, GoalDragData, BlockDragData, PriorityDragData, EveningDragData } from "@/types/dnd";
import type { RoleColor } from "@/types";
import { useWeekStore } from "@/stores/weekStore";
import { DragPreview } from "./DragPreview";

interface DragOverlayContentProps {
  data: DragData;
}

export function DragOverlayContent({ data }: DragOverlayContentProps) {
  if (data.type === "goal") {
    return <GoalOverlay data={data} />;
  }
  if (data.type === "block") {
    return <BlockOverlay data={data} />;
  }
  if (data.type === "priority") {
    return <PriorityOverlay data={data} />;
  }
  if (data.type === "evening") {
    return <EveningOverlay data={data} />;
  }
  return null;
}

function GoalOverlay({ data }: { data: GoalDragData }) {
  const roleColor = useWeekStore((state) =>
    state.currentWeek?.roles.find((r) => r.id === data.roleId)?.color
  ) as RoleColor | undefined;

  return <DragPreview text={data.text} roleColor={roleColor ?? "teal"} />;
}

function BlockOverlay({ data }: { data: BlockDragData }) {
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
    />
  );
}

function PriorityOverlay({ data }: { data: PriorityDragData }) {
  const roleColor = useWeekStore((state) =>
    state.currentWeek?.roles.find((r) => r.id === data.roleId)?.color
  ) as RoleColor | undefined;

  return <DragPreview text={data.text} roleColor={roleColor ?? "teal"} />;
}

function EveningOverlay({ data }: { data: EveningDragData }) {
  const roleColor = useWeekStore((state) =>
    data.roleId ? state.currentWeek?.roles.find((r) => r.id === data.roleId)?.color : undefined
  ) as RoleColor | undefined;

  return <DragPreview text={data.title} roleColor={roleColor} />;
}

export default DragOverlayContent;
