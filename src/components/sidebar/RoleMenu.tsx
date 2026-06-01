"use client";

import { useCallback, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import { MoreVertical, Palette, Pencil, Plus, Trash2 } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AppContextMenuContent,
  AppDropdownMenuContent,
  AppMenuItem,
  AppMenuSub,
  AppMenuSubContent,
} from "@/components/ui/app-menu";
import { RoleColorPicker } from "./RoleColorPicker";
import { useWeekStore } from "@/stores/weekStore";
import { getRoleColorStyle } from "@/lib/role-colors";
import type { RoleColor, RoleSnapshot } from "@/types";

interface RoleMenuControllerInput {
  role: RoleSnapshot;
  startEdit: () => void;
  setAddingGoal: Dispatch<SetStateAction<boolean>>;
}

interface RoleMenuItemsProps {
  roleColor: RoleColor;
  onChangeRoleColor: (color: RoleColor) => void;
  onAddGoal: () => void;
  onRenameRole: () => void;
  onArchiveRole: () => void;
}

export interface RoleMenuController {
  dotColorMenuOpen: boolean;
  setDotColorMenuOpen: Dispatch<SetStateAction<boolean>>;
  overflowMenuOpen: boolean;
  setOverflowMenuOpen: Dispatch<SetStateAction<boolean>>;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: Dispatch<SetStateAction<boolean>>;
  overflowTriggerRef: RefObject<HTMLButtonElement | null>;
  handleChangeRoleColor: (color: RoleColor) => void;
  handleDropdownCloseAutoFocus: (event: Event) => void;
  handleAddGoalFromDropdown: () => void;
  handleRenameRoleFromDropdown: () => void;
  handleAddGoal: () => void;
  handleRenameRole: () => void;
  handleArchiveRole: () => void;
  handleArchiveRoleFromDropdown: () => void;
  handleConfirmArchive: () => void;
}

function RoleMenuItems({
  roleColor,
  onChangeRoleColor,
  onAddGoal,
  onRenameRole,
  onArchiveRole,
}: RoleMenuItemsProps) {
  return (
    <>
      <AppMenuItem icon={Plus} onSelect={onAddGoal}>
        Add goal
      </AppMenuItem>
      <AppMenuItem icon={Pencil} onSelect={onRenameRole}>
        Rename role
      </AppMenuItem>
      <AppMenuSub>
        <AppMenuItem icon={Palette} kind="subTrigger">
          Change color
        </AppMenuItem>
        <AppMenuSubContent>
          <RoleColorPicker value={roleColor} onChange={onChangeRoleColor} variant="menu" />
        </AppMenuSubContent>
      </AppMenuSub>
      <AppMenuItem
        icon={Trash2}
        variant="destructive"
        onSelect={onArchiveRole}
      >
        Archive role
      </AppMenuItem>
    </>
  );
}

export function useRoleMenuController({
  role,
  startEdit,
  setAddingGoal,
}: RoleMenuControllerInput): RoleMenuController {
  const updateRole = useWeekStore((state) => state.updateRole);
  const deleteRole = useWeekStore((state) => state.deleteRole);
  const [dotColorMenuOpen, setDotColorMenuOpen] = useState(false);
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const pendingAfterDropdownCloseRef = useRef<(() => void) | null>(null);
  const overflowTriggerRef = useRef<HTMLButtonElement>(null);

  const handleAddGoal = useCallback(() => setAddingGoal(true), [setAddingGoal]);
  const handleRenameRole = useCallback(() => startEdit(), [startEdit]);

  const scheduleAfterDropdownClose = useCallback((action: () => void) => {
    pendingAfterDropdownCloseRef.current = action;
  }, []);

  const handleAddGoalFromDropdown = useCallback(() => {
    scheduleAfterDropdownClose(() => setAddingGoal(true));
  }, [scheduleAfterDropdownClose, setAddingGoal]);

  const handleRenameRoleFromDropdown = useCallback(() => {
    scheduleAfterDropdownClose(startEdit);
  }, [scheduleAfterDropdownClose, startEdit]);

  const handleArchiveRole = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleArchiveRoleFromDropdown = useCallback(() => {
    setDeleteDialogOpen(true);
    setOverflowMenuOpen(false);
  }, []);

  const handleChangeRoleColor = useCallback((color: RoleColor) => {
    updateRole(role.id, { color });
    setDotColorMenuOpen(false);
    setOverflowMenuOpen(false);
  }, [role.id, updateRole]);

  const handleDropdownCloseAutoFocus = useCallback((event: Event) => {
    // Radix restores focus to the trigger after close. Here the trigger is a
    // hover-revealed control that swaps with the duration label, so restored
    // focus leaves a visible ring around the duration after pointer/touch use.
    event.preventDefault();

    const pendingAction = pendingAfterDropdownCloseRef.current;
    if (pendingAction) {
      pendingAfterDropdownCloseRef.current = null;
      pendingAction();
      return;
    }

    requestAnimationFrame(() => overflowTriggerRef.current?.blur());
  }, []);

  const handleConfirmArchive = useCallback(() => {
    deleteRole(role.id);
  }, [deleteRole, role.id]);

  return {
    dotColorMenuOpen,
    setDotColorMenuOpen,
    overflowMenuOpen,
    setOverflowMenuOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    overflowTriggerRef,
    handleChangeRoleColor,
    handleDropdownCloseAutoFocus,
    handleAddGoalFromDropdown,
    handleRenameRoleFromDropdown,
    handleAddGoal,
    handleRenameRole,
    handleArchiveRole,
    handleArchiveRoleFromDropdown,
    handleConfirmArchive,
  };
}

export function RoleColorDotMenu({
  role,
  controller,
}: {
  role: RoleSnapshot;
  controller: RoleMenuController;
}) {
  const { dotColorMenuOpen, setDotColorMenuOpen, handleChangeRoleColor } = controller;

  return (
    <DropdownMenu open={dotColorMenuOpen} onOpenChange={setDotColorMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="-mx-1 shrink-0 rounded-full border-0 bg-transparent p-0 hover:bg-[var(--ds-line)]"
          aria-label={`Change color for ${role.name}`}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: getRoleColorStyle(role.color) }}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-auto min-w-0 p-2">
        <RoleColorPicker value={role.color} onChange={handleChangeRoleColor} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RoleOverflowMenu({
  role,
  roleHours,
  controller,
}: {
  role: RoleSnapshot;
  roleHours: number;
  controller: RoleMenuController;
}) {
  const {
    overflowMenuOpen,
    setOverflowMenuOpen,
    overflowTriggerRef,
    handleDropdownCloseAutoFocus,
    handleChangeRoleColor,
    handleAddGoalFromDropdown,
    handleRenameRoleFromDropdown,
    handleArchiveRoleFromDropdown,
  } = controller;

  return (
    <div className="relative h-5 w-8 shrink-0">
      {roleHours > 0 && (
        <span
          className={`absolute right-0 top-1/2 -translate-y-1/2 rounded-[var(--ds-r-pill)] border border-[var(--ds-line-soft)] bg-[var(--ds-panel)] px-1.5 py-0.5 font-mono text-[10px] leading-none tracking-[0.04em] text-secondary-foreground tabular-nums transition-opacity ${
            overflowMenuOpen ? "opacity-0" : "group-hover/role:opacity-0"
          }`}
        >
          {roleHours}h
        </span>
      )}

      <DropdownMenu open={overflowMenuOpen} onOpenChange={setOverflowMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            ref={overflowTriggerRef}
            variant="ghost"
            size="icon"
            className={`absolute -right-1 top-1/2 -translate-y-1/2 rounded-[6px] border-0 bg-transparent text-muted-foreground transition-opacity hover:bg-[var(--ds-line)] hover:text-foreground focus-visible:opacity-100 ${
              overflowMenuOpen ? "opacity-100" : "opacity-0 group-hover/role:opacity-100"
            }`}
            aria-label={`Menu for ${role.name}`}
          >
            <MoreVertical className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <AppDropdownMenuContent
          align="start"
          className="w-auto min-w-36"
          onCloseAutoFocus={handleDropdownCloseAutoFocus}
        >
          <RoleMenuItems
            roleColor={role.color}
            onChangeRoleColor={handleChangeRoleColor}
            onAddGoal={handleAddGoalFromDropdown}
            onRenameRole={handleRenameRoleFromDropdown}
            onArchiveRole={handleArchiveRoleFromDropdown}
          />
        </AppDropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function RoleContextMenuContent({
  role,
  controller,
}: {
  role: RoleSnapshot;
  controller: RoleMenuController;
}) {
  const { handleChangeRoleColor, handleAddGoal, handleRenameRole, handleArchiveRole } = controller;

  return (
    <AppContextMenuContent>
      <RoleMenuItems
        roleColor={role.color}
        onChangeRoleColor={handleChangeRoleColor}
        onAddGoal={handleAddGoal}
        onRenameRole={handleRenameRole}
        onArchiveRole={handleArchiveRole}
      />
    </AppContextMenuContent>
  );
}

export function RoleArchiveDialog({
  role,
  controller,
}: {
  role: RoleSnapshot;
  controller: RoleMenuController;
}) {
  const { deleteDialogOpen, setDeleteDialogOpen, handleConfirmArchive } = controller;

  return (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogTitle>Archive role</AlertDialogTitle>
        <AlertDialogDescription>
          Archive &ldquo;{role.name}&rdquo;? It will be removed from this Week and future planning, while other Weeks keep their existing Role Snapshot.
        </AlertDialogDescription>
        <div className="mt-4 flex justify-end gap-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmArchive}>
            Archive
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
