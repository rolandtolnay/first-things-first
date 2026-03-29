"use client";

import { useCallback } from "react";
import { Trash2 } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
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

  const { isEditing, editValue, setEditValue, inputRef, startEdit, save, handleKeyDown } =
    useEditableText(role.name, handleSaveRole);

  return (
    <div
      className="flex flex-col rounded-md p-3 mb-2"
      style={{
        backgroundColor: getRoleColorStyleWithOpacity(role.color, 0.08),
      }}
    >
      {/* Role header */}
      <div className="group flex items-center gap-2">
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
            className="flex-1 min-w-0 h-auto py-0.5 text-[15px] font-semibold"
            aria-label="Edit role name"
          />
        ) : (
          <span
            className="flex-1 min-w-0 truncate cursor-pointer text-[15px] font-semibold text-foreground"
            onDoubleClick={startEdit}
            title={role.name}
          >
            {role.name}
          </span>
        )}

        {!isEditing && (
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete role ${role.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Delete role</TooltipContent>
            </Tooltip>
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
        )}
      </div>

      <div className="mt-2">
        <GoalList roleId={role.id} roleColor={role.color} />
      </div>
    </div>
  );
}
