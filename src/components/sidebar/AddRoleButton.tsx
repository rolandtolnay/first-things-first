"use client";

import { Plus } from "lucide-react";
import { useWeekStore } from "@/stores/weekStore";
import { AddItemInput } from "@/components/ui/AddItemInput";

export function AddRoleButton() {
  const addRole = useWeekStore((state) => state.addRole);

  return (
    <AddItemInput
      label="Add role"
      placeholder="Role name..."
      onAdd={(name) => addRole({ name })}
      icon={<Plus size={14} style={{ color: 'var(--primary)' }} />}
    />
  );
}
