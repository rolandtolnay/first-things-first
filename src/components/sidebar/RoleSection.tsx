"use client";

import { useCallback, useRef, useState } from "react";
import { MoreVertical, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useWeekStore } from "@/stores/weekStore";
import { slotsToHours, EVENING_BLOCK_HOURS } from "@/lib/time-model";
import { getRoleColorStyle } from "@/lib/role-colors";
import { useEditableText } from "@/hooks/useEditableText";
import { Button } from "@/components/ui/button";
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

interface RoleSectionProps {
  role: Role;
}

export function RoleSection({ role }: RoleSectionProps) {
  const updateRole = useWeekStore((state) => state.updateRole);
  const deleteRole = useWeekStore((state) => state.deleteRole);

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

  const { isEditing, editValue, setEditValue, inputRef, startEdit, save, handleKeyDown } =
    useEditableText(role.name, handleSaveRole);

  const handleStartAddingGoal = useCallback(() => setAddingGoal(true), []);
  const handleStartAddingGoalFromDropdownMenu = useCallback(() => {
    shouldOpenGoalInputAfterMenuCloseRef.current = true;
  }, []);

  const handleDropdownCloseAutoFocus = useCallback((event: Event) => {
    if (!shouldOpenGoalInputAfterMenuCloseRef.current) return;

    shouldOpenGoalInputAfterMenuCloseRef.current = false;
    event.preventDefault();
    setAddingGoal(true);
  }, []);

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
          className="group/role flex flex-col rounded-[var(--ds-r-sm)] border border-[var(--ds-line-soft)] bg-card px-3 py-2.5 transition-colors hover:border-[var(--ds-line)]"
          style={{ borderLeft: `2px solid ${getRoleColorStyle(role.color)}` }}
        >
          {/* Role header */}
          <div className="relative flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: getRoleColorStyle(role.color) }}
              aria-hidden="true"
            />

            {isEditing ? (
              <Input
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
              <>
                {roleHours > 0 && (
                  <span className="shrink-0 font-mono text-[10px] tracking-[0.04em] text-secondary-foreground tabular-nums group-hover/role:opacity-0 transition-opacity">
                    {roleHours}h
                  </span>
                )}

                {/* Overflow menu — top-right, reveals on hover */}
                <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className={`absolute -top-1 right-0 rounded-[4px] border-0 bg-transparent text-muted-foreground hover:bg-[var(--ds-line)] hover:text-foreground transition-opacity ${
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
              </>
            )}
          </div>

          <div className="mt-2 pl-0.5">
            <GoalList
              roleId={role.id}
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
