"use client";

import { useCallback, useState, type CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { InlineInput } from "@/components/ui/input";
import { useWeekStore } from "@/stores/weekStore";
import { slotsToHours, EVENING_BLOCK_HOURS } from "@/lib/time-model";
import { getRoleColorStyle, getRoleColorStyleWithOpacity } from "@/lib/role-colors";
import { useEditableText } from "@/hooks/useEditableText";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { GoalList } from "./GoalList";
import {
  RoleArchiveDialog,
  RoleColorDotMenu,
  RoleContextMenuContent,
  RoleOverflowMenu,
  useRoleMenuController,
} from "./RoleMenu";
import type { RoleSnapshot } from "@/types";
import type { RoleReorderDragData } from "@/types/dnd";

interface RoleSectionProps {
  role: RoleSnapshot;
}

export function RoleSection({ role }: RoleSectionProps) {
  const updateRole = useWeekStore((state) => state.updateRole);
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: role.id,
    data: { type: "role-reorder", roleId: role.id } satisfies RoleReorderDragData,
  });

  // Primitive selector (returns a number) to preserve re-render frequency;
  // weighting goes through the shared time-model helpers so the magic numbers
  // match computeRoleBalance exactly.
  const roleHours = useWeekStore((state) => {
    const week = state.currentWeek;
    if (!week) return 0;
    let h = 0;
    for (const tb of week.timeBlocks) if (tb.roleId === role.id) h += slotsToHours(tb.duration);
    for (const eb of week.eveningBlocks) if (eb.roleId === role.id) h += EVENING_BLOCK_HOURS;
    return h;
  });

  const handleSaveRole = useCallback(
    (value: string) => updateRole(role.id, { name: value }),
    [updateRole, role.id]
  );

  const [addingGoal, setAddingGoal] = useState(false);

  const { isEditing, editValue, setEditValue, inputRef, startEdit, save, handleKeyDown } =
    useEditableText(role.name, handleSaveRole);
  const menuController = useRoleMenuController({ role, startEdit, setAddingGoal });

  const cardStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: `linear-gradient(180deg, ${getRoleColorStyleWithOpacity(role.color, 0.055)}, transparent 52px), var(--card)`,
    boxShadow: `inset 0 1px 0 ${getRoleColorStyleWithOpacity(role.color, 0.12)}`,
  };
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          className={cn(
            "group/role flex flex-col rounded-[var(--ds-r-sm)] border border-[var(--ds-line-soft)] px-3 py-3 transition-colors hover:border-[var(--ds-line)]",
            isDragging && "opacity-70"
          )}
          style={cardStyle}
        >
          {/* Role header */}
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                ref={setActivatorNodeRef}
                type="button"
                variant="ghost"
                size="icon"
                className="-ml-1 size-5 shrink-0 cursor-grab touch-none rounded-[5px] border-0 bg-transparent text-[var(--ds-fg-faint)] hover:bg-[var(--ds-line)] hover:text-foreground active:cursor-grabbing"
                aria-label={`Reorder ${role.name}`}
                {...attributes}
                {...listeners}
              >
                <GripVertical className="size-3.5" />
              </Button>
            )}

            {isEditing ? (
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: getRoleColorStyle(role.color) }}
                aria-hidden="true"
              />
            ) : (
              <RoleColorDotMenu role={role} controller={menuController} />
            )}

            {isEditing ? (
              <InlineInput
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={save}
                onKeyDown={handleKeyDown}
                className="flex-1 text-[13px] font-semibold text-foreground"
                aria-label="Edit role name"
              />
            ) : (
              <span
                className="min-w-0 flex-1 cursor-text truncate text-[13px] font-semibold text-foreground"
                onDoubleClick={startEdit}
                title={role.name}
              >
                {role.name}
              </span>
            )}

            {!isEditing && (
              <RoleOverflowMenu
                role={role}
                roleHours={roleHours}
                controller={menuController}
              />
            )}
          </div>

          <div className="mt-2.5">
            <GoalList
              roleId={role.id}
              roleColor={role.color}
              addingGoal={addingGoal}
              onStartAddingGoal={menuController.handleAddGoal}
              onAddingGoalDone={() => setAddingGoal(false)}
            />
          </div>
        </div>
      </ContextMenuTrigger>
      <RoleContextMenuContent role={role} controller={menuController} />
      <RoleArchiveDialog role={role} controller={menuController} />
    </ContextMenu>
  );
}
