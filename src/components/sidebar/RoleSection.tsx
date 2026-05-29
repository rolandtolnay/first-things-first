"use client";

import { useCallback, useState } from "react";
import { MoreVertical, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useWeekStore } from "@/stores/weekStore";
import { slotsToHours, EVENING_BLOCK_HOURS } from "@/lib/time-model";
import { getRoleColorStyle, getRoleColorStyleWithOpacity } from "@/lib/role-colors";
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

  const { isEditing, editValue, setEditValue, inputRef, startEdit, save, handleKeyDown } =
    useEditableText(role.name, handleSaveRole);

  const menuItems = (
    <>
      <ContextMenuItem onClick={() => setAddingGoal(true)}>
        <Plus className="size-3.5 mr-2" />
        Add goal
      </ContextMenuItem>
      <ContextMenuItem
        className="text-destructive"
        onClick={() => setDeleteDialogOpen(true)}
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
          className="flex flex-col rounded-[8px] p-3 mb-2"
          style={{
            backgroundColor: getRoleColorStyleWithOpacity(role.color, 0.10),
            borderLeft: `4px solid ${getRoleColorStyle(role.color)}`,
          }}
        >
          {/* Role header */}
          <div className="group relative flex items-start gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-[5px]"
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
                className="flex-1 text-sm font-bold text-foreground"
                aria-label="Edit role name"
              />
            ) : (
              <span
                className="flex-1 min-w-0 cursor-pointer text-sm font-bold text-foreground overflow-hidden"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
                onDoubleClick={startEdit}
                title={role.name}
              >
                {role.name}
              </span>
            )}

            {roleHours > 0 && !isEditing && (
              <span className="text-caption text-muted-foreground ml-auto mt-0.5 shrink-0 group-hover:opacity-0 transition-opacity">{roleHours}h planned</span>
            )}

            {/* Absolute-positioned menu button */}
            {!isEditing && (
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className={`absolute top-0 right-0 rounded-sm border-0 bg-transparent text-foreground/60 hover:bg-foreground/10 hover:text-foreground/80 transition-opacity ${
                      menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                    aria-label={`Menu for ${role.name}`}
                  >
                    <MoreVertical className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setAddingGoal(true); setMenuOpen(false); }}>
                    <Plus className="size-3.5 mr-2" />
                    Add goal
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => { setDeleteDialogOpen(true); setMenuOpen(false); }}
                  >
                    <Trash2 className="size-3.5 mr-2" />
                    Delete role
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="mt-1.5">
            <GoalList roleId={role.id} roleColor={role.color} addingGoal={addingGoal} onAddingGoalDone={() => setAddingGoal(false)} />
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
