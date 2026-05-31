"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useWeekStore } from "@/stores/weekStore";
import {
  getCurrentWeekId,
  getNextWeekId,
  getWeekIdRange,
} from "@/lib/utils";
import { getRoleColorStyle } from "@/lib/role-colors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
  const createNewWeek = useWeekStore((s) => s.createNewWeek);
  const navigateToWeek = useWeekStore((s) => s.navigateToWeek);

  const existingWeekIds = useWeekStore((s) => s.availableWeekIds);

  const [targetWeekId, setTargetWeekId] = useState<WeekId>(getCurrentWeekId());
  const [dropdownWeekIds, setDropdownWeekIds] = useState<WeekId[]>([]);

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

  const allUncompletedIds = roleGroups.flatMap((g) =>
    g.goals.map((goal) => goal.id)
  );

  const completionSummary = useMemo(() => {
    if (!sourceWeek || sourceWeek.goals.length === 0) return null;
    const total = sourceWeek.goals.length;
    const completed = sourceWeek.goals.filter((g) => g.completed).length;
    return { total, completed, percent: Math.round((completed / total) * 100) };
  }, [sourceWeek]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(allUncompletedIds)
  );

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(allUncompletedIds));

      const range = getWeekIdRange(getCurrentWeekId(), 11);
      setDropdownWeekIds(range);

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
      setTargetWeekId(defaultWeek ?? range[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sourceWeek?.id]);

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
    const selectedGoals = sourceWeek.goals.filter((g) => selectedIds.has(g.id));
    await createNewWeek(targetWeekId, { carryOverGoals: selectedGoals, sourceWeek });
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
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Start a New Week</DialogTitle>
          <DialogDescription>
            {hasUncompletedGoals
              ? "Select goals to carry over from last week."
              : "Ready to plan a fresh week."}
          </DialogDescription>
        </DialogHeader>

        {/* Completion summary */}
        {completionSummary && (
          <div className="rounded-md bg-primary-soft p-3 mb-4">
            <div className="text-caption font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Last Week
            </div>
            <div className="text-sm font-medium">
              You completed{' '}
              <span className="text-primary font-bold">{completionSummary.completed}</span>{' '}
              of{' '}
              <span className="text-secondary-foreground">{completionSummary.total}</span>{' '}
              goals
            </div>
            <Progress value={completionSummary.percent} className="mt-2 h-1" />
          </div>
        )}

        {/* Target week selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Target week
          </label>
          <WeekSelector
            value={targetWeekId}
            onChange={setTargetWeekId}
            options={dropdownWeekIds}
            existingWeekIds={existingWeekIds}
          />
        </div>

        {/* Overwrite warning */}
        {existingWeekIds.includes(targetWeekId) && (
          <div className="mb-4 p-3 rounded-md bg-warning-soft text-sm text-secondary-foreground"
            style={{ borderLeft: '3px solid var(--warning)' }}
          >
            <span className="font-semibold">This week already has a plan.</span>{" "}
            Continuing will replace its contents.
          </div>
        )}

        {/* Uncompleted goals */}
        {hasUncompletedGoals && (
          <div className="space-y-4 overflow-y-auto max-h-[280px] mb-6">
            {roleGroups.map(({ role, goals }) => (
              <div key={role.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: getRoleColorStyle(role.color) }}
                  />
                  <span className="text-sm font-medium">{role.name}</span>
                </div>
                <div className="space-y-1.5 ml-[18px]">
                  {goals.map((goal) => (
                    <label
                      key={goal.id}
                      className="flex items-start gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedIds.has(goal.id)}
                        onCheckedChange={() => toggleGoal(goal.id)}
                        className="mt-0.5"
                      />
                      <span className="text-sm leading-snug text-secondary-foreground">
                        {goal.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {hasUncompletedGoals && (
            <Button variant="outline" onClick={handleStartFresh}>Start fresh</Button>
          )}
          <Button onClick={hasUncompletedGoals ? handleCarryOver : handleStartFresh}>
            {hasUncompletedGoals ? "Carry over selected" : "Start week"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
