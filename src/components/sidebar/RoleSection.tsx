"use client";

import { useCallback, useRef, useState, type CSSProperties, type PointerEventHandler } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreVertical, Plus, Trash2 } from "lucide-react";
import { InlineInput } from "@/components/ui/input";
import { useWeekStore } from "@/stores/weekStore";
import { slotsToHours, EVENING_BLOCK_HOURS } from "@/lib/time-model";
import { getRoleColorStyle, getRoleColorStyleWithOpacity } from "@/lib/role-colors";
import { useEditableText } from "@/hooks/useEditableText";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GoalList } from "./GoalList";
import type { Role } from "@/types";
import type { RoleReorderDragData } from "@/types/dnd";

interface RoleSectionProps {
  role: Role;
}

export function RoleSection({ role }: RoleSectionProps) {
  const updateRole = useWeekStore((state) => state.updateRole);
  const deleteRole = useWeekStore((state) => state.deleteRole);
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const shouldOpenGoalInputAfterMenuCloseRef = useRef(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  const { isEditing, editValue, setEditValue, inputRef, startEdit, save, handleKeyDown } =
    useEditableText(role.name, handleSaveRole);

  const handleStartAddingGoal = useCallback(() => setAddingGoal(true), []);
  const handleStartAddingGoalFromDropdownMenu = useCallback(() => {
    shouldOpenGoalInputAfterMenuCloseRef.current = true;
  }, []);

  const handleDropdownCloseAutoFocus = useCallback((event: Event) => {
    // Radix restores focus to the trigger after close. Here the trigger is a
    // hover-revealed control that swaps with the duration label, so restored
    // focus leaves a visible ring around the duration after pointer/touch use.
    event.preventDefault();

    if (shouldOpenGoalInputAfterMenuCloseRef.current) {
      shouldOpenGoalInputAfterMenuCloseRef.current = false;
      setAddingGoal(true);
      return;
    }

    requestAnimationFrame(() => menuTriggerRef.current?.blur());
  }, []);

  const cardStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: `linear-gradient(180deg, ${getRoleColorStyleWithOpacity(role.color, 0.055)}, transparent 52px), var(--card)`,
    boxShadow: `inset 0 1px 0 ${getRoleColorStyleWithOpacity(role.color, 0.12)}`,
  };
  const pointerListeners: { onPointerDown?: PointerEventHandler<HTMLButtonElement> } = listeners?.onPointerDown
    ? { onPointerDown: listeners.onPointerDown as PointerEventHandler<HTMLButtonElement> }
    : {};

  const menuItems = (
    <>
      <ContextMenuItem onSelect={handleStartAddingGoal}>
        <Plus className="size-3.5 mr-2" />
        Add goal
      </ContextMenuItem>
      <ContextMenuItem
        className="text-destructive"
        onSelect={() => setDeleteDialogOpen(true)}
      >
        <Trash2 className="size-3.5 mr-2" />
        Delete role
      </ContextMenuItem>
    </>
  );

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
                {...pointerListeners}
              >
                <GripVertical className="size-3.5" />
              </Button>
            )}

            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: getRoleColorStyle(role.color) }}
              aria-hidden="true"
            />

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
              <div className="relative h-5 w-8 shrink-0">
                {roleHours > 0 && (
                  <span
                    className={`absolute right-0 top-1/2 -translate-y-1/2 rounded-[var(--ds-r-pill)] border border-[var(--ds-line-soft)] bg-[var(--ds-panel)] px-1.5 py-0.5 font-mono text-[10px] leading-none tracking-[0.04em] text-secondary-foreground tabular-nums transition-opacity ${
                      menuOpen ? "opacity-0" : "group-hover/role:opacity-0"
                    }`}
                  >
                    {roleHours}h
                  </span>
                )}

                {/* Overflow menu — same visual slot, larger tap target. */}
                <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      ref={menuTriggerRef}
                      variant="ghost"
                      size="icon"
                      className={`absolute -right-1 top-1/2 -translate-y-1/2 rounded-[6px] border-0 bg-transparent text-muted-foreground transition-opacity hover:bg-[var(--ds-line)] hover:text-foreground focus-visible:opacity-100 ${
                        menuOpen ? "opacity-100" : "opacity-0 group-hover/role:opacity-100"
                      }`}
                      aria-label={`Menu for ${role.name}`}
                    >
                      <MoreVertical className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onCloseAutoFocus={handleDropdownCloseAutoFocus}>
                    <DropdownMenuItem onSelect={handleStartAddingGoalFromDropdownMenu}>
                      <Plus className="size-3.5 mr-2" />
                      Add goal
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={() => { setDeleteDialogOpen(true); setMenuOpen(false); }}
                    >
                      <Trash2 className="size-3.5 mr-2" />
                      Delete role
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          <div className="mt-2.5">
            <GoalList
              roleId={role.id}
              roleColor={role.color}
              addingGoal={addingGoal}
              onStartAddingGoal={handleStartAddingGoal}
              onAddingGoalDone={() => setAddingGoal(false)}
            />
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {menuItems}
      </ContextMenuContent>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete role</AlertDialogTitle>
          <AlertDialogDescription>
            Delete &ldquo;{role.name}&rdquo;? This will also delete all goals for this role.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteRole(role.id)}>
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </ContextMenu>
  );
}
