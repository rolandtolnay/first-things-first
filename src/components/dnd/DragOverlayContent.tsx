"use client";

/**
 * DragOverlayContent - Visual Preview During Drag
 *
 * Renders a preview of the item being dragged.
 * Styled to match the source component but with overlay-specific adjustments
 * (shadow, pointer-events-none, etc.)
 */

import type { DragData, GoalDragData, BlockDragData, PriorityDragData, EveningDragData } from "@/types/dnd";
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

  if (data.type === "priority") {
    return <PriorityOverlay data={data} />;
  }

  if (data.type === "evening") {
    return <EveningOverlay data={data} />;
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
  // Get block and role from store - ALL hooks must be called before any return
  const block = useWeekStore((state) =>
    state.currentWeek?.timeBlocks.find((b) => b.id === data.blockId)
  );
  const role = useWeekStore((state) =>
    state.currentWeek?.roles.find((r) => r.id === block?.roleId)
  );

  // Early return AFTER all hooks
  if (!block) {
    return null;
  }

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

/**
 * Preview for dragged priority items.
 * Compact style matching PriorityItem with left border color accent.
 */
function PriorityOverlay({ data }: { data: PriorityDragData }) {
  // Get role color from store
  const role = useWeekStore((state) =>
    state.currentWeek?.roles.find((r) => r.id === data.roleId)
  );
  const roleColor = role?.color ?? "teal";

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 py-1 px-2 rounded",
        "bg-card border border-border",
        "shadow-lg pointer-events-none",
        "min-w-[100px] max-w-[200px]"
      )}
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: getRoleColorStyle(roleColor as RoleColor),
      }}
    >
      <span className="text-xs text-foreground truncate">{data.text}</span>
    </div>
  );
}

/**
 * Preview for dragged evening blocks.
 * Style matching EveningSlot blocks with role color background.
 */
function EveningOverlay({ data }: { data: EveningDragData }) {
  // Get role color from store if roleId exists
  const role = useWeekStore((state) =>
    data.roleId ? state.currentWeek?.roles.find((r) => r.id === data.roleId) : null
  );
  const roleColor = role?.color;

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-2 px-3 rounded-sm",
        "shadow-lg pointer-events-none",
        "min-w-[100px] max-w-[200px]",
        roleColor ? "" : "bg-muted border border-border"
      )}
      style={
        roleColor
          ? {
              backgroundColor: `${getRoleColorStyle(roleColor as RoleColor).replace(")", " / 0.2)")}`,
              borderLeft: `3px solid ${getRoleColorStyle(roleColor as RoleColor)}`,
            }
          : undefined
      }
    >
      <span className="text-xs font-medium text-foreground truncate">{data.title}</span>
    </div>
  );
}

export default DragOverlayContent;
