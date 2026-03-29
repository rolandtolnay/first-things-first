"use client";

import { useCallback, useState } from "react";
import { MoreVertical, Plus, Trash2 } from "lucide-react";
import { useWeekStore } from "@/stores/weekStore";
import { getRoleColorStyle, getRoleColorStyleWithOpacity } from "@/lib/role-colors";
import { useEditableText } from "@/hooks/useEditableText";
import { Input } from "@/components/ui/input";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GoalList } from "./GoalList";
import type { Role } from "@/types";

interface RoleSectionProps {
  role: Role;
}

export function RoleSection({ role }: RoleSectionProps) {
  const updateRole = useWeekStore((state) => state.updateRole);
  const deleteRole = useWeekStore((state) => state.deleteRole);

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
          className="flex flex-col rounded-md p-3 mb-2"
          style={{
            backgroundColor: getRoleColorStyleWithOpacity(role.color, 0.08),
          }}
        >
          {/* Role header */}
          <div className="group relative flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
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
                className="flex-1 min-w-0 h-auto py-0.5 text-base font-semibold"
                aria-label="Edit role name"
              />
            ) : (
              <span
                className="flex-1 min-w-0 cursor-pointer text-base font-semibold text-foreground overflow-hidden"
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

            {/* Absolute-positioned menu button */}
            {!isEditing && (
              <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                <PopoverTrigger asChild>
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
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto min-w-[160px] p-1"
                  align="end"
                  side="bottom"
                >
                  <button
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-foreground"
                    onClick={() => { setAddingGoal(true); setMenuOpen(false); }}
                  >
                    <Plus className="size-3.5" />
                    Add goal
                  </button>
                  <button
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-destructive"
                    onClick={() => { setDeleteDialogOpen(true); setMenuOpen(false); }}
                  >
                    <Trash2 className="size-3.5" />
                    Delete role
                  </button>
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="mt-3">
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
