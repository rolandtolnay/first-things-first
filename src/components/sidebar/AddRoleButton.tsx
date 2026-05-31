"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TextActionButton } from "@/components/ui/TextActionButton";
import { useWeekStore } from "@/stores/weekStore";
import { getNextRoleColor } from "@/stores/weekStore";
import { getRoleColorStyle } from "@/lib/role-colors";

interface AddRoleButtonProps {
  /** Controlled "currently adding" state, owned by RoleList. */
  isAdding: boolean;
  onStartAdding: () => void;
  onDone: () => void;
}

/**
 * The "add role" affordance: a dashed, mono ghost button at the bottom of the
 * role list that swaps to an inline role-card preview (tinted to the next role
 * color) while typing. The add state is controlled by RoleList so the same flow
 * can be triggered from the section label's + action.
 */
export function AddRoleButton({
  isAdding,
  onStartAdding,
  onDone,
}: AddRoleButtonProps) {
  const addRole = useWeekStore((state) => state.addRole);
  const roles = useWeekStore((state) => state.currentWeek?.roles);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const previewColor = useMemo(() => getNextRoleColor(roles ?? []), [roles]);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  function handleSubmit() {
    const trimmed = value.trim();
    if (trimmed) {
      addRole({ name: trimmed });
    }
    setValue("");
    onDone();
  }

  function handleCancel() {
    setValue("");
    onDone();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  }

  function handleBlur() {
    const trimmed = value.trim();
    if (trimmed) {
      handleSubmit();
    } else {
      handleCancel();
    }
  }

  if (isAdding) {
    return (
      <div
        className="flex flex-col rounded-[var(--ds-r-sm)] border border-[var(--ds-line-soft)] bg-card px-3 py-2.5"
        style={{
          borderLeft: `2px solid ${getRoleColorStyle(previewColor)}`,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: getRoleColorStyle(previewColor) }}
            aria-hidden="true"
          />
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="New role…"
            className="flex-1 text-[13px] font-semibold text-foreground"
            aria-label="New role name"
          />
        </div>
      </div>
    );
  }

  return (
    <TextActionButton
      onClick={onStartAdding}
      className="h-auto w-full gap-1.5 rounded-[var(--ds-r-sm)] border border-dashed border-[var(--ds-line)] py-2.5 hover:border-[var(--ds-line-strong)]"
    >
      <Plus strokeWidth={1.6} />
      Add role
    </TextActionButton>
  );
}
