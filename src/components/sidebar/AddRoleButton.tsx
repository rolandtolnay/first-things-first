"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useWeekStore } from "@/stores/weekStore";
import { getNextRoleColor } from "@/stores/weekStore";
import { getRoleColorStyle, getRoleColorStyleWithOpacity } from "@/lib/role-colors";

export function AddRoleButton() {
  const addRole = useWeekStore((state) => state.addRole);
  const roles = useWeekStore((state) => state.currentWeek?.roles);
  const [isAdding, setIsAdding] = useState(false);
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
    setIsAdding(false);
  }

  function handleCancel() {
    setValue("");
    setIsAdding(false);
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
        className="flex flex-col rounded-[8px] p-3"
        style={{
          backgroundColor: getRoleColorStyleWithOpacity(previewColor, 0.10),
          borderLeft: `4px solid ${getRoleColorStyle(previewColor)}`,
        }}
      >
        <div className="flex items-start gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-[5px]"
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
            placeholder="Role name..."
            className="flex-1 text-sm font-bold text-foreground"
            aria-label="New role name"
          />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="w-full py-2.5 rounded-lg border-2 border-dashed border-muted-foreground/25 text-sm text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground/60 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
    >
      <Plus size={14} />
      Add role
    </button>
  );
}
