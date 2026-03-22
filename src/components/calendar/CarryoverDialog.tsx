"use client";

/**
 * CarryoverDialog - Native dialog for selecting goals to carry into a new week.
 *
 * Uses the native <dialog> element with showModal() for focus trapping,
 * backdrop, and Esc dismissal. Shows uncompleted goals grouped by role
 * with checkboxes for selection. All uncompleted goals are pre-selected.
 * Includes a completion summary of the source week.
 */

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  const [targetWeekId, setTargetWeekId] = useState<WeekId>(getCurrentWeekId());
  const [dropdownWeekIds, setDropdownWeekIds] = useState<WeekId[]>([]);

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

  // Completion summary for the source week
  const completionSummary = useMemo(() => {
    if (!sourceWeek || sourceWeek.goals.length === 0) return null;
    const total = sourceWeek.goals.length;
    const completed = sourceWeek.goals.filter((g) => g.completed).length;
    return { total, completed, percent: Math.round((completed / total) * 100) };
  }, [sourceWeek]);

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

      // Find first unplanned week, starting from the week after the viewed week
      // and wrapping around to the beginning of the range if needed.
      const scanStart = getNextWeekId(viewedWeekId);
      const scanIndex = range.indexOf(scanStart);
      const startIdx = scanIndex >= 0 ? scanIndex : 0;

      let defaultWeek: WeekId | null = null;
      for (let i = 0; i < range.length; i++) {
        const candidate = range[(startIdx + i) % range.length];
        if (!existingWeekIds.includes(candidate)) {
          defaultWeek = candidate;
          break;
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
      className="m-auto p-0 max-w-[480px] w-full"
      style={{
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-dialog)',
        border: 'none',
      }}
    >
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 600,
            lineHeight: '1.4',
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}
        >
          Start a New Week
        </h3>
        <p
          style={{
            fontSize: '14px',
            lineHeight: '1.5',
            color: 'var(--text-secondary)',
            marginBottom: '16px',
          }}
        >
          {hasUncompletedGoals
            ? "Select goals to carry over from last week."
            : "Ready to plan a fresh week."}
        </p>

        {/* Completion summary */}
        {completionSummary && (
          <div
            style={{
              backgroundColor: 'var(--primary-soft)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '4px',
              }}
            >
              Last Week
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '1.5',
              }}
            >
              You completed{' '}
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                {completionSummary.completed}
              </span>{' '}
              of{' '}
              <span style={{ color: 'var(--text-secondary)' }}>
                {completionSummary.total}
              </span>{' '}
              goals
            </div>
            {/* Progress bar */}
            <div
              style={{
                height: '4px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--border-subtle)',
                marginTop: '8px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${completionSummary.percent}%`,
                  backgroundColor: 'var(--primary-muted)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 300ms ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Target week selector */}
        <div style={{ marginBottom: '16px' }}>
          <label
            className="block"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              marginBottom: '6px',
            }}
          >
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
          <div
            style={{
              marginBottom: '16px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--warning-soft)',
              borderLeft: '3px solid var(--warning)',
              fontSize: '14px',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ fontWeight: 600 }}>This week already has a plan.</span>{" "}
            Continuing will replace its contents.
          </div>
        )}

        {/* Uncompleted goals grouped by role */}
        {hasUncompletedGoals && (
          <div
            className="space-y-4 overflow-y-auto"
            style={{
              maxHeight: '280px',
              marginBottom: '24px',
            }}
          >
            {roleGroups.map(({ role, goals }) => (
              <div key={role.id}>
                {/* Role header with color dot */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: getRoleColorStyle(role.color) }}
                  />
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    {role.name}
                  </span>
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
                        className="mt-0.5 rounded"
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      <span
                        className="leading-snug"
                        style={{
                          fontSize: '14px',
                          color: 'var(--text-secondary)',
                        }}
                      >
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
            className="transition-colors cursor-pointer"
            style={{
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              minHeight: '36px',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Cancel
          </button>

          {hasUncompletedGoals && (
            <button
              type="button"
              onClick={handleStartFresh}
              className="transition-colors cursor-pointer"
              style={{
                fontSize: '14px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                minHeight: '36px',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Start Fresh
            </button>
          )}

          <button
            type="button"
            onClick={hasUncompletedGoals ? handleCarryOver : handleStartFresh}
            className="transition-colors font-medium cursor-pointer"
            style={{
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              minHeight: '36px',
              backgroundColor: 'var(--primary)',
              color: 'var(--text-on-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
            }}
          >
            {hasUncompletedGoals ? "Carry Over Selected" : "Start Week"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
