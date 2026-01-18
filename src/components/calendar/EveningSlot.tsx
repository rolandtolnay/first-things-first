"use client";

/**
 * EveningSlot - Evening slot section below time grid
 *
 * Appears at the bottom of each day column for evening activities
 * (after 8:00 PM). Each day can hold one goal or freestyle block.
 * Drop target for goals - dropping creates an evening block.
 */

import { useDroppable } from "@dnd-kit/core";
import type { DayOfWeek } from "@/types";
import type { DropZoneData } from "@/types/dnd";
import { useWeekStore, selectEveningBlock } from "@/stores/weekStore";
import { getRoleColorStyle } from "@/lib/role-colors";
import { cn } from "@/lib/utils";

interface EveningSlotProps {
  dayIndex: DayOfWeek;
}

export function EveningSlot({ dayIndex }: EveningSlotProps) {
  const deleteEveningBlock = useWeekStore((state) => state.deleteEveningBlock);

  // Get evening block for this day
  const eveningBlock = useWeekStore((state) => selectEveningBlock(state, dayIndex));

  // Make this slot a drop target
  const dropData: DropZoneData = {
    zone: "evening",
    dayIndex,
  };

  const { setNodeRef, isOver } = useDroppable({
    id: `evening-${dayIndex}`,
    data: dropData,
  });

  // Get role color for styling (if block has a role)
  const roleColor = eveningBlock?.roleId
    ? getRoleColorStyle(
        useWeekStore.getState().currentWeek?.roles.find((r) => r.id === eveningBlock.roleId)?.color ?? "teal"
      )
    : undefined;

  const handleDelete = () => {
    if (eveningBlock) {
      deleteEveningBlock(eveningBlock.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[48px] p-2 border-t border-border bg-muted/10",
        isOver && "bg-primary/10 ring-1 ring-primary/50"
      )}
      data-day={dayIndex}
      data-section="evening"
    >
      {!eveningBlock ? (
        <div className="h-full flex items-center justify-center">
          <span className="text-xs text-muted-foreground italic">Evening</span>
        </div>
      ) : (
        <div
          className={cn(
            "group relative rounded-sm p-2",
            eveningBlock.roleId ? "" : "bg-muted"
          )}
          style={
            roleColor
              ? {
                  backgroundColor: `${roleColor.replace(")", " / 0.2)")}`,
                  borderLeft: `3px solid ${roleColor}`,
                }
              : undefined
          }
        >
          {/* Block title */}
          <span className="text-xs font-medium truncate pr-5">{eveningBlock.title}</span>

          {/* Delete button - visible on hover */}
          <button
            type="button"
            onClick={handleDelete}
            className={cn(
              "absolute top-1 right-1 p-0.5 rounded-sm",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              "hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
            )}
            aria-label="Delete evening block"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
