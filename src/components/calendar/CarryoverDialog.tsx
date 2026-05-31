"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useWeekStore } from "@/stores/weekStore";
import {
  formatWeekId,
  getCurrentWeekId,
  getWeekNumber,
} from "@/lib/utils";
import { getRoleColorStyle } from "@/lib/role-colors";
import { buildWeeklyHandoffModel, buildWeeklyHandoffOpeningModel } from "@/lib/weekly-handoff";
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
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TextActionButton } from "@/components/ui/TextActionButton";
import { WeekSelector } from "./WeekSelector";
import type { Goal, Week, WeekId } from "@/types";

interface CarryoverDialogProps {
  open: boolean;
  onClose: () => void;
  sourceWeek: Week | null;
  viewedWeekId: WeekId;
}

function formatGoalCount(count: number): string {
  return `${count} ${count === 1 ? "Goal" : "Goals"}`;
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }
    if (wasOpenRef.current) return;
    wasOpenRef.current = true;

    const openingModel = buildWeeklyHandoffOpeningModel({
      sourceWeek,
      viewedWeekId,
      existingWeekIds,
    });

    setDropdownWeekIds(openingModel.dropdownWeekIds);
    setTargetWeekId(openingModel.targetWeekId);
    setSelectedIds(new Set(openingModel.defaultSelectedGoalIds));
    setSubmitError(null);
    setIsSubmitting(false);
  }, [open, sourceWeek, viewedWeekId, existingWeekIds]);

  const model = useMemo(
    () =>
      buildWeeklyHandoffModel({
        sourceWeek,
        targetWeekId,
        existingWeekIds,
        selectedGoalIds: selectedIds,
      }),
    [sourceWeek, targetWeekId, existingWeekIds, selectedIds]
  );

  const sourceWeekLabel = sourceWeek
    ? `W${getWeekNumber(sourceWeek.id)} — ${formatWeekId(sourceWeek.id)}`
    : "No Source Week";

  const targetWeekLabel = `W${getWeekNumber(targetWeekId)} — ${formatWeekId(targetWeekId)}`;

  const targetExplanation = model.isReplacingTargetWeek
    ? "This Target Week already has a plan. Continuing will replace its current Roles, Goals, and blocks."
    : "A new Target Week will be created with carried Roles and only the selected unfinished Goals.";

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

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(model.unfinishedGoalIds));
  }, [model.unfinishedGoalIds]);

  const clearSelected = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  async function submit(mode: "carry-forward" | "fresh") {
    if (!sourceWeek || isSubmitting) return;
    if (targetWeekId === sourceWeek.id) {
      setSubmitError("Choose a Target Week that is different from the Source Week.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (mode === "carry-forward") {
        const unfinishedSelectedIds = new Set(
          model.unfinishedGoalIds.filter((id) => selectedIds.has(id))
        );
        const carryOverGoals: Goal[] = sourceWeek.goals.filter((goal) =>
          unfinishedSelectedIds.has(goal.id)
        );
        await createNewWeek(targetWeekId, { carryOverGoals, sourceWeek });
      } else {
        await createNewWeek(targetWeekId, { sourceWeek });
      }

      await navigateToWeek(targetWeekId);
      onClose();
    } catch {
      setSubmitError("Couldn’t start the Target Week. Please try again.");
      setIsSubmitting(false);
    }
  }

  const canCarryForward = !model.isCleanSlate && model.selectedCount > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isSubmitting) onClose();
      }}
    >
      <DialogContent
        showCloseButton={!isSubmitting}
        className="flex max-h-[min(90vh,760px)] max-w-[calc(100%-1rem)] flex-col gap-5 overflow-hidden bg-[var(--ds-overlay)] p-5 sm:max-w-[800px]"
      >
        <DialogHeader className="shrink-0 gap-2 pr-8">
          <DialogTitle className="text-[length:var(--text-h5)]">Start a new Week</DialogTitle>
          <DialogDescription>
            Close the Source Week, choose what continues, and begin with a clean plan.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-4 overflow-hidden">
          <div className="grid shrink-0 gap-3 md:grid-cols-2">
            <section className="rounded-lg border border-[var(--ds-line-soft)] bg-[var(--ds-panel)] p-4">
              <SectionLabel className="mb-3">Source Week</SectionLabel>
              <div className="mb-4 text-sm font-medium text-foreground">{sourceWeekLabel}</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-mono text-[length:var(--text-caption)] uppercase tracking-[0.12em] text-muted-foreground">
                    Completed
                  </div>
                  <div className="mt-1 text-foreground">
                    {model.summary.completedGoals}/{model.summary.totalGoals} Goals
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[length:var(--text-caption)] uppercase tracking-[0.12em] text-muted-foreground">
                    Unfinished
                  </div>
                  <div className="mt-1 text-foreground">
                    {formatGoalCount(model.summary.unfinishedGoals)}
                  </div>
                </div>
              </div>
              <Progress value={model.summary.completionPercent} className="mt-4 h-1.5" />
            </section>

            <section className="rounded-lg border border-[var(--ds-line-soft)] bg-[var(--ds-panel)] p-4">
              <SectionLabel className="mb-3">Target Week</SectionLabel>
              <WeekSelector
                value={targetWeekId}
                onChange={(weekId) => {
                  setTargetWeekId(weekId);
                  setSubmitError(null);
                }}
                options={dropdownWeekIds}
                existingWeekIds={existingWeekIds}
                disabled={isSubmitting}
                triggerClassName="bg-[var(--ds-window)]"
              />
              <p className="mt-3 text-caption leading-relaxed text-muted-foreground">
                <span className="font-medium text-secondary-foreground">{targetWeekLabel}.</span>{" "}
                {targetExplanation}
              </p>
            </section>
          </div>

          {model.isReplacingTargetWeek && (
            <div
              role="alert"
              className="shrink-0 rounded-lg border border-[var(--ds-line-soft)] bg-[color:color-mix(in_oklch,var(--ds-warning)_8%,transparent)] p-3 text-sm text-secondary-foreground"
            >
              <span className="font-semibold text-foreground">The Target Week already has a plan.</span>{" "}
              Continuing will replace it with this Weekly Handoff.
            </div>
          )}

          <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
            <SectionLabel
              action={
                !model.isCleanSlate && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-muted-foreground">
                      {model.selectedCount} selected
                    </span>
                    <TextActionButton
                      onClick={selectAll}
                      disabled={isSubmitting || model.selectedCount === model.unfinishedGoalIds.length}
                    >
                      Select all
                    </TextActionButton>
                    <TextActionButton
                      onClick={clearSelected}
                      disabled={isSubmitting || model.selectedCount === 0}
                    >
                      Clear
                    </TextActionButton>
                  </div>
                )
              }
            >
              Carry Forward
            </SectionLabel>

            {model.isCleanSlate ? (
              <div className="rounded-lg border border-[var(--ds-line-soft)] bg-[var(--ds-panel)] p-5 text-sm text-secondary-foreground">
                <div className="mb-1 font-medium text-foreground">No unfinished Goals in the Source Week.</div>
                Start the Target Week with a clean slate. Roles can still carry forward, while Day Priorities,
                Time Blocks, and Evening Blocks start empty.
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-[var(--ds-line-soft)] bg-[var(--ds-panel)]">
                {model.unfinishedGoalGroups.map(({ role, goals }) => (
                  <div key={role.id} className="border-b border-[var(--ds-line-soft)] last:border-b-0">
                    <div className="flex items-center gap-2 px-4 py-3">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: getRoleColorStyle(role.color) }}
                      />
                      <span className="text-sm font-medium text-foreground">{role.name}</span>
                    </div>
                    <div className="border-t border-[var(--ds-line-soft)]">
                      {goals.map((goal) => (
                        <label
                          key={goal.id}
                          className="flex cursor-pointer items-start gap-3 border-b border-[var(--ds-line-soft)] px-4 py-3 text-sm last:border-b-0 hover:bg-[var(--ds-hover-tint)]"
                        >
                          <Checkbox
                            checked={selectedIds.has(goal.id)}
                            onCheckedChange={() => toggleGoal(goal.id)}
                            disabled={isSubmitting}
                            className="mt-0.5"
                          />
                          <span className="leading-snug text-secondary-foreground">{goal.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {submitError && (
            <p
              role="alert"
              className="shrink-0 rounded-md border border-[var(--ds-line-soft)] bg-[var(--ds-panel)] px-3 py-2 text-caption text-secondary-foreground"
            >
              {submitError}
            </p>
          )}
        </div>

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          {canCarryForward && (
            <Button variant="outline" onClick={() => submit("fresh")} disabled={isSubmitting}>
              Start fresh
            </Button>
          )}
          <Button
            onClick={() => submit(canCarryForward ? "carry-forward" : "fresh")}
            disabled={isSubmitting || !sourceWeek}
          >
            {isSubmitting ? "Starting…" : model.primaryActionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
