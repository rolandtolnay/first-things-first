"use client";

/**
 * BlockMenuExtras — shared menu items for freestyle planning items.
 *
 * AssignRoleMenuItems: assign/clear a Role on a Freestyle Block, freestyle
 * Evening Block, or Freestyle Day Priority. Affects color coding and Weekly
 * Balance only — never the Sidebar goal list.
 *
 * RepeatMenuItem: toggle weekly repetition on a Freestyle Block; repeating
 * blocks are copied into the Target Week during Weekly Handoff.
 *
 * Rendered inside BlockCard's menuExtras slot, so they appear in both the
 * hover dropdown and the right-click context menu.
 */

import { Repeat, Tag } from "lucide-react";
import { AppMenuItem, AppMenuSub, AppMenuSubContent } from "@/components/ui/app-menu";
import { useWeekStore } from "@/stores/weekStore";
import { suppressBlockDraw } from "@/hooks/useBlockDraw";
import { getRoleColorStyle } from "@/lib/role-colors";

interface AssignRoleMenuItemsProps {
  currentRoleId?: string;
  onAssign: (roleId: string | undefined) => void;
}

export function AssignRoleMenuItems({ currentRoleId, onAssign }: AssignRoleMenuItemsProps) {
  const roles = useWeekStore((state) => state.currentWeek?.roles);
  const sortedRoles = [...(roles ?? [])].sort((a, b) => a.order - b.order);

  if (sortedRoles.length === 0) return null;

  function select(roleId: string | undefined) {
    suppressBlockDraw();
    onAssign(roleId);
  }

  return (
    <AppMenuSub>
      <AppMenuItem kind="subTrigger" icon={Tag}>
        Assign role
      </AppMenuItem>
      <AppMenuSubContent className="min-w-36">
        {sortedRoles.map((role) => (
          <AppMenuItem
            key={role.id}
            leading={
              <span
                className="size-2.5 rounded-full"
                style={{
                  backgroundColor: getRoleColorStyle(role.color),
                  opacity: role.id === currentRoleId ? 1 : 0.85,
                }}
              />
            }
            className={role.id === currentRoleId ? "font-semibold" : undefined}
            onSelect={() => select(role.id)}
          >
            {role.name}
          </AppMenuItem>
        ))}
        {currentRoleId && (
          <AppMenuItem
            leading={
              <span className="size-2.5 rounded-full border border-dashed border-[var(--ds-fg-faint)]" />
            }
            onSelect={() => select(undefined)}
          >
            No role
          </AppMenuItem>
        )}
      </AppMenuSubContent>
    </AppMenuSub>
  );
}

interface RepeatMenuItemProps {
  recurring: boolean;
  onToggle: () => void;
}

export function RepeatMenuItem({ recurring, onToggle }: RepeatMenuItemProps) {
  return (
    <AppMenuItem
      icon={Repeat}
      onSelect={() => {
        suppressBlockDraw();
        onToggle();
      }}
    >
      {recurring ? "Stop repeating" : "Repeat weekly"}
    </AppMenuItem>
  );
}
