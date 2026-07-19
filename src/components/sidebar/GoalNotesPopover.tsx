"use client";

import { useState } from "react";
import { StickyNote } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Textarea } from "@/components/ui/textarea";
import { formatBlockMeta, weekDayBounds } from "@/lib/time-model";
import { DAY_NAMES_SHORT, cn } from "@/lib/utils";
import { useWeekStore } from "@/stores/weekStore";
import type { Goal } from "@/types";

interface GoalNotesPopoverProps {
  goal: Goal;
  /** Extra classes for the trigger (hover-reveal handled by the goal row). */
  triggerClassName?: string;
}

/**
 * Notes + this-week placement details for a Goal, opened from the goal row's
 * reserved trailing slot. Notes autosave on close/blur; the placement list is
 * read-only planning context ("why did I commit to this, and where is it").
 */
export function GoalNotesPopover({ goal, triggerClassName }: GoalNotesPopoverProps) {
  const updateGoal = useWeekStore((state) => state.updateGoal);
  const week = useWeekStore((state) => state.currentWeek);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(goal.notes ?? "");

  const hasNotes = Boolean(goal.notes?.trim());
  const bounds = weekDayBounds(week);

  const placements: string[] = week
    ? [
        ...week.dayPriorities
          .filter((priority) => priority.goalId === goal.id)
          .map((priority) => `${DAY_NAMES_SHORT[priority.dayIndex]} · priority`),
        ...week.timeBlocks
          .filter((block) => block.goalId === goal.id)
          .map(
            (block) =>
              `${DAY_NAMES_SHORT[block.dayIndex]} · ${formatBlockMeta(block.startSlot, block.duration, bounds)}`
          ),
        ...week.eveningBlocks
          .filter((block) => block.goalId === goal.id)
          .map((block) => `${DAY_NAMES_SHORT[block.dayIndex]} · evening`),
      ]
    : [];

  function commitDraft() {
    const trimmed = draft.trim();
    if ((goal.notes ?? "") === (trimmed ? draft : "")) return;
    void updateGoal(goal.id, { notes: trimmed ? draft : undefined });
  }

  function handleOpenChange(open: boolean) {
    if (open) setDraft(goal.notes ?? "");
    else commitDraft();
    setIsOpen(open);
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={hasNotes ? "Goal notes" : "Add goal notes"}
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-[3px] transition-[opacity,background-color,color] hover:bg-[var(--ds-line)] hover:text-foreground",
            hasNotes
              ? "text-[var(--ds-fg-dim)] opacity-100"
              : "text-[var(--ds-fg-faint)] opacity-0 group-hover/goal:opacity-100",
            isOpen && "opacity-100",
            triggerClassName
          )}
        >
          <StickyNote size={11} strokeWidth={1.8} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="right"
        className="w-72 p-4"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="grid gap-3">
          <div className="grid gap-2">
            <SectionLabel>Notes</SectionLabel>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitDraft}
              placeholder="Why does this matter this week?"
              rows={4}
              className="min-h-20 resize-none text-[12px] leading-[1.45]"
              aria-label={`Notes for ${goal.text}`}
            />
          </div>
          <div className="grid gap-1.5">
            <SectionLabel>This week</SectionLabel>
            {placements.length > 0 ? (
              <ul className="m-0 grid list-none gap-1 p-0">
                {placements.map((placement, index) => (
                  <li
                    key={index}
                    className="font-mono text-[11px] tabular-nums text-secondary-foreground"
                  >
                    {placement}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-[12px] leading-5 text-muted-foreground">
                Not placed yet — drag it onto a day to give it time.
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
