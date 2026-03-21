"use client";

import { useWeekStore } from "@/stores/weekStore";
import { AddItemInput } from "@/components/ui/AddItemInput";

export function AddRoleButton() {
  const addRole = useWeekStore((state) => state.addRole);

  return (
    <AddItemInput
      label="Add Role"
      placeholder="Role name..."
      onAdd={(name) => addRole({ name })}
      wrapperClassName="py-2 border-t border-border mt-2"
      inputClassName="w-full text-sm border border-border rounded px-2 py-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
      buttonClassName="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary/50"
    />
  );
}
