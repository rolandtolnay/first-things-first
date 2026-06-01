"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { InlineInput } from "@/components/ui/input";
import { TextActionButton } from "@/components/ui/TextActionButton";
import { useWeekStore } from "@/stores/weekStore";
import { getNextRoleColor, getRoleColorStyle, getRoleColorStyleWithOpacity } from "@/lib/role-colors";
import type { Role } from "@/types";

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
  const searchArchivedRoles = useWeekStore((state) => state.searchArchivedRoles);
  const restoreRole = useWeekStore((state) => state.restoreRole);
  const roles = useWeekStore((state) => state.currentWeek?.roles);
  const [value, setValue] = useState("");
  const [archivedMatches, setArchivedMatches] = useState<Role[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreStartedRef = useRef(false);
  const blurSubmitTimerRef = useRef<number | null>(null);

  const previewColor = useMemo(() => getNextRoleColor(roles ?? []), [roles]);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    if (!isAdding) {
      setArchivedMatches([]);
      return;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      setArchivedMatches([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void searchArchivedRoles(trimmed).then((matches) => {
        if (!cancelled) setArchivedMatches(matches);
      });
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isAdding, searchArchivedRoles, value]);

  function clearBlurSubmitTimer() {
    if (blurSubmitTimerRef.current === null) return;
    window.clearTimeout(blurSubmitTimerRef.current);
    blurSubmitTimerRef.current = null;
  }

  function finish() {
    clearBlurSubmitTimer();
    setValue("");
    setArchivedMatches([]);
    onDone();
  }

  function handleSubmit() {
    const trimmed = value.trim();
    if (trimmed) {
      void addRole({ name: trimmed });
    }
    finish();
  }

  function handleRestore(role: Role) {
    restoreStartedRef.current = true;
    void restoreRole(role).finally(() => {
      restoreStartedRef.current = false;
    });
    finish();
  }

  function handleRestorePointerDown(event: React.PointerEvent<HTMLButtonElement>, role: Role) {
    // Restore must win the input blur race. Without doing the action on pointer
    // down, the input can blur first and create a new Role with the typed query.
    event.preventDefault();
    handleRestore(role);
  }

  function handleRestoreMouseDown(event: React.MouseEvent<HTMLButtonElement>, role: Role) {
    event.preventDefault();
    handleRestore(role);
  }

  function handleCancel() {
    finish();
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
    if (restoreStartedRef.current) return;

    // If restore choices are visible, keep the chooser open so selecting one
    // cannot accidentally create a duplicate Role via input blur first. Enter
    // still creates a new Role explicitly.
    if (archivedMatches.length > 0) return;

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
        className="flex flex-col rounded-[var(--ds-r-sm)] border border-[var(--ds-line-soft)] px-3 py-3"
        style={{
          background: `linear-gradient(180deg, ${getRoleColorStyleWithOpacity(previewColor, 0.055)}, transparent 52px), var(--card)`,
          boxShadow: `inset 0 1px 0 ${getRoleColorStyleWithOpacity(previewColor, 0.12)}`,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: getRoleColorStyle(previewColor) }}
            aria-hidden="true"
          />
          <InlineInput
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
        {archivedMatches.length > 0 && (
          <div className="mt-2 flex flex-col gap-1 border-t border-[var(--ds-line-soft)] pt-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Restore archived
            </p>
            {archivedMatches.map((role) => (
              <button
                key={role.id}
                type="button"
                className="flex items-center gap-2 rounded-[6px] px-1.5 py-1 text-left text-[12px] text-foreground hover:bg-[var(--ds-hover-tint)]"
                onPointerDown={(event) => handleRestorePointerDown(event, role)}
                onMouseDown={(event) => handleRestoreMouseDown(event, role)}
                onClick={() => handleRestore(role)}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: getRoleColorStyle(role.color) }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate">{role.name}</span>
              </button>
            ))}
          </div>
        )}
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
