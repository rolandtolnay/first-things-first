"use client";

/**
 * CarryoverDialog - Native dialog for selecting goals to carry into a new week.
 *
 * Uses the native <dialog> element with showModal() for focus trapping,
 * backdrop, and Esc dismissal. Shows uncompleted goals grouped by role
 * with checkboxes for selection. All uncompleted goals are pre-selected.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useWeekStore } from "@/stores/weekStore";
import {
  getCurrentWeekId,
  getNextWeekId,
  getWeekIdRange,
} from "@/lib/utils";
import { getRoleColorStyle } from "@/lib/role-colors";
import { WeekSelector } from "./WeekSelector";
import type { Week, Goal, Role, WeekId } from "@/types";

interface CarryoverDialogProps {
  open: boolean;
  onClose: () => void;
  sourceWeek: Week | null;
  viewedWeekId: WeekId;
}

interface RoleGoalGroup {
  role: Role;
  goals: Goal[];
}

export function CarryoverDialog({
  open,
  onClose,
  sourceWeek,
  viewedWeekId,
}: CarryoverDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const createNewWeek = useWeekStore((s) => s.createNewWeek);
  const navigateToWeek = useWeekStore((s) => s.navigateToWeek);

  // Reactive list of existing week IDs (for "Planned" badges)
  const existingWeekIds =
    useLiveQuery(() => db.weeks.orderBy("id").primaryKeys(), [], []) as WeekId[];

  // Week selector state
  const [targetWeekId, setTargetWeekId] = useState<WeekId>(
    () => getCurrentWeekId()
  );
  const [dropdownWeekIds, setDropdownWeekIds] = useState<WeekId[]>(() => []);

  // Group uncompleted goals by role
  const roleGroups: RoleGoalGroup[] = sourceWeek
    ? sourceWeek.roles
        .map((role) => ({
          role,
          goals: sourceWeek.goals.filter(
            (g) => g.roleId === role.id && !g.completed
          ),
        }))
        .filter((group) => group.goals.length > 0)
    : [];

  // All uncompleted goal IDs for initial selection
  const allUncompletedIds = roleGroups.flatMap((g) =>
    g.goals.map((goal) => goal.id)
  );

  // Selected goal IDs (all pre-selected by default)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(allUncompletedIds)
  );

  // Reset selection and compute default target week whenever the dialog opens
  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(allUncompletedIds));

      // Generate range: current calendar week + 10 future weeks
      const range = getWeekIdRange(getCurrentWeekId(), 11);
      setDropdownWeekIds(range);

      // Find first unplanned week, scanning from after the viewed week
      const scanStart = getNextWeekId(viewedWeekId);
      const scanIndex = range.indexOf(scanStart);
      const startIdx = scanIndex >= 0 ? scanIndex : 0;

      let defaultWeek: WeekId | null = null;
      // Scan from startIdx to end
      for (let i = startIdx; i < range.length; i++) {
        if (!existingWeekIds.includes(range[i])) {
          defaultWeek = range[i];
          break;
        }
      }
      // If nothing found, wrap around and scan from beginning
      if (!defaultWeek) {
        for (let i = 0; i < startIdx; i++) {
          if (!existingWeekIds.includes(range[i])) {
            defaultWeek = range[i];
            break;
          }
        }
      }
      // If all planned, default to first in range
      setTargetWeekId(defaultWeek ?? range[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sourceWeek?.id]);

  // Dialog open/close sync
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Handle Esc key (cancel event)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleCancel(e: Event) {
      e.preventDefault();
      onClose();
    }

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  const toggleGoal = useCallback((goalId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(goalId)) {
        next.delete(goalId);
      } else {
        next.add(goalId);
      }
      return next;
    });
  }, []);

  async function handleCarryOver() {
    if (!sourceWeek) return;

    const selectedGoals = sourceWeek.goals.filter((g) =>
      selectedIds.has(g.id)
    );

    await createNewWeek(targetWeekId, {
      carryOverGoals: selectedGoals,
      sourceWeek,
    });
    await navigateToWeek(targetWeekId);
    onClose();
  }

  async function handleStartFresh() {
    if (!sourceWeek) return;

    await createNewWeek(targetWeekId, { sourceWeek });
    await navigateToWeek(targetWeekId);
    onClose();
  }

  const hasUncompletedGoals = roleGroups.length > 0;

  return (
    <dialog
      ref={dialogRef}
      className="m-auto backdrop:bg-black/50 bg-card text-card-foreground rounded-xl p-0 max-w-md w-full shadow-xl border border-border"
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-1">Start a New Week</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {hasUncompletedGoals
            ? "Select goals to carry over from last week."
            : "Ready to plan a fresh week."}
        </p>

        {/* Target week selector */}
        <div className="mb-4">
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Target week
          </label>
          <WeekSelector
            value={targetWeekId}
            onChange={setTargetWeekId}
            options={dropdownWeekIds}
            existingWeekIds={existingWeekIds}
          />
        </div>

        {/* Overwrite warning for already-planned weeks */}
        {existingWeekIds.includes(targetWeekId) && (
          <div className="mb-4 p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-sm">
            <span className="font-medium">This week already has a plan.</span>{" "}
            Continuing will replace its contents.
          </div>
        )}

        {/* Uncompleted goals grouped by role */}
        {hasUncompletedGoals && (
          <div className="space-y-4 max-h-80 overflow-y-auto mb-6">
            {roleGroups.map(({ role, goals }) => (
              <div key={role.id}>
                {/* Role header with color dot */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: getRoleColorStyle(role.color) }}
                  />
                  <span className="text-sm font-medium">{role.name}</span>
                </div>

                {/* Goal checkboxes */}
                <div className="space-y-1.5 ml-[18px]">
                  {goals.map((goal) => (
                    <label
                      key={goal.id}
                      className="flex items-start gap-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(goal.id)}
                        onChange={() => toggleGoal(goal.id)}
                        className="mt-0.5 rounded accent-primary"
                      />
                      <span className="text-sm leading-snug group-hover:text-foreground text-foreground/80">
                        {goal.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>

          {hasUncompletedGoals && (
            <button
              type="button"
              onClick={handleStartFresh}
              className="text-sm px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors"
            >
              Start Fresh
            </button>
          )}

          <button
            type="button"
            onClick={hasUncompletedGoals ? handleCarryOver : handleStartFresh}
            className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            {hasUncompletedGoals ? "Carry Over Selected" : "Start Week"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
