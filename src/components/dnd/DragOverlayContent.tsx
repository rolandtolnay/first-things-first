"use client";

/**
 * DragOverlayContent - Visual Preview During Drag
 *
 * Renders a preview of the item being dragged.
 * Styled to match the source component but with overlay-specific adjustments
 * (shadow, pointer-events-none, etc.)
 */

import type { DragData, GoalDragData, BlockDragData } from "@/types/dnd";
import type { RoleColor } from "@/types";
import { getRoleColorStyle } from "@/lib/role-colors";
import { useWeekStore } from "@/stores/weekStore";
import { cn } from "@/lib/utils";

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

  return null;
}

/**
 * Preview for dragged goals.
 * Styled similar to GoalItem with left border color accent.
 */
function GoalOverlay({ data }: { data: GoalDragData }) {
  // Get role color from store
  const role = useWeekStore((state) =>
    state.currentWeek?.roles.find((r) => r.id === data.roleId)
  );
  const roleColor = role?.color ?? "teal";

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-1.5 px-3 rounded-md",
        "bg-card border border-border",
        "shadow-lg pointer-events-none",
        "min-w-[120px] max-w-[240px]"
      )}
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: getRoleColorStyle(roleColor as RoleColor),
      }}
    >
      <span className="text-sm text-foreground truncate">{data.text}</span>
    </div>
  );
}

/**
 * Preview for dragged time blocks.
 * Simple preview showing block title.
 */
function BlockOverlay({ data }: { data: BlockDragData }) {
  // Get block from store to show title
  const block = useWeekStore((state) =>
    state.currentWeek?.timeBlocks.find((b) => b.id === data.blockId)
  );

  if (!block) {
    return null;
  }

  // Get role color if block has a role
  const role = useWeekStore((state) =>
    block.roleId ? state.currentWeek?.roles.find((r) => r.id === block.roleId) : null
  );
  const roleColor = role?.color ?? "teal";

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-1.5 px-3 rounded-md",
        "bg-card border border-border",
        "shadow-lg pointer-events-none",
        "min-w-[100px] max-w-[200px]"
      )}
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: block.roleId
          ? getRoleColorStyle(roleColor as RoleColor)
          : "var(--border)",
      }}
    >
      <span className="text-sm text-foreground truncate">{block.title}</span>
    </div>
  );
}

export default DragOverlayContent;
