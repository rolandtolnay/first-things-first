"use client";

/**
 * TodayView — the phone-width companion surface.
 *
 * Plans are made on the desktop seven-Day workspace; this view is for executing
 * them away from the desk: see today's priorities, schedule, and evening plan,
 * check things off, and capture a quick priority. No drag-and-drop, no block
 * drawing — the desktop workspace stays the planning surface.
 */

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { AppActions } from "@/components/layout/AppActions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InlineInput } from "@/components/ui/input";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { MAX_PRIORITIES_PER_DAY } from "@/lib/constants";
import { priorityRoleId, priorityText } from "@/lib/priorities";
import { getRoleColorStyle } from "@/lib/role-colors";
import { slotToTime, weekDayBounds } from "@/lib/time-model";
import {
  DAY_NAMES,
  cn,
  formatWeekId,
  getCurrentWeekId,
  getWeekDates,
} from "@/lib/utils";
import { useWeekStore } from "@/stores/weekStore";
import type { DayOfWeek, RoleColor, Week } from "@/types";

/** Monday-0 index of the local calendar day. */
function todayDayIndex(): DayOfWeek {
  return ((new Date().getDay() + 6) % 7) as DayOfWeek;
}

export function TodayView() {
  const currentWeek = useWeekStore((s) => s.currentWeek);
  const selectedWeekId = useWeekStore((s) => s.selectedWeekId);
  const availableWeekIds = useWeekStore((s) => s.availableWeekIds);
  const navigateToWeek = useWeekStore((s) => s.navigateToWeek);
  const isLoading = useWeekStore((s) => s.isLoading);

  const isCurrentCalendarWeek = selectedWeekId === getCurrentWeekId();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() =>
    isCurrentCalendarWeek ? todayDayIndex() : 0
  );

  // Follow week navigation: land on today in the current week, Monday elsewhere.
  useEffect(() => {
    setSelectedDay(selectedWeekId === getCurrentWeekId() ? todayDayIndex() : 0);
  }, [selectedWeekId]);

  const weekIndex = selectedWeekId ? availableWeekIds.indexOf(selectedWeekId) : -1;
  const canGoPrev = weekIndex > 0;
  const canGoNext = weekIndex >= 0 && weekIndex < availableWeekIds.length - 1;

  const dates = useMemo(
    () => (selectedWeekId ? getWeekDates(selectedWeekId) : null),
    [selectedWeekId]
  );

  if (!selectedWeekId || !dates) {
    return <div className="h-full" />;
  }

  const selectedDate = dates[selectedDay];
  const isTodaySelected = isCurrentCalendarWeek && selectedDay === todayDayIndex();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header: week switcher + global actions */}
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => canGoPrev && navigateToWeek(availableWeekIds[weekIndex - 1])}
            disabled={!canGoPrev}
            aria-label="Previous week"
          >
            <ChevronLeft className="size-4" strokeWidth={1.4} />
          </Button>
          <span className="min-w-0 truncate font-mono text-label uppercase tracking-[0.12em] text-muted-foreground">
            {formatWeekId(selectedWeekId)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => canGoNext && navigateToWeek(availableWeekIds[weekIndex + 1])}
            disabled={!canGoNext}
            aria-label="Next week"
          >
            <ChevronRight className="size-4" strokeWidth={1.4} />
          </Button>
        </div>
        <AppActions />
      </header>

      {/* Day strip */}
      <nav
        className="grid shrink-0 grid-cols-7 gap-1 border-b border-border px-3 py-2"
        aria-label="Day of week"
      >
        {dates.map((date, index) => {
          const isSelected = index === selectedDay;
          const isToday = isCurrentCalendarWeek && index === todayDayIndex();
          return (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedDay(index as DayOfWeek)}
              aria-current={isSelected ? "date" : undefined}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-[var(--ds-r-sm)] transition-colors",
                isSelected
                  ? "bg-[var(--ds-panel)] text-foreground shadow-[inset_0_0_0_1px_var(--ds-line)]"
                  : "text-muted-foreground hover:bg-[var(--ds-hover-tint)]"
              )}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.08em]">
                {DAY_NAMES[index].slice(0, 3)}
              </span>
              <span
                className={cn(
                  "text-[13px] font-medium tabular-nums leading-none",
                  isToday && "text-[var(--ds-accent)]"
                )}
              >
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Day content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-10 pt-4">
        <h1 className="mb-4 text-[length:var(--text-h5)] font-semibold tracking-[-0.01em] text-foreground">
          {isTodaySelected ? "Today" : DAY_NAMES[selectedDay]}
          <span className="ml-2 font-mono text-label font-normal uppercase tracking-[0.12em] text-muted-foreground">
            {selectedDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        </h1>

        {currentWeek ? (
          <DayContent week={currentWeek} dayIndex={selectedDay} />
        ) : (
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading…" : "This week isn't planned yet — start it from a desktop."}
          </p>
        )}
      </div>
    </div>
  );
}

function roleColorOf(week: Week, roleId: string | undefined): RoleColor | undefined {
  return roleId ? week.roles.find((role) => role.id === roleId)?.color : undefined;
}

function DayContent({ week, dayIndex }: { week: Week; dayIndex: DayOfWeek }) {
  const bounds = weekDayBounds(week);

  const priorities = week.dayPriorities
    .filter((priority) => priority.dayIndex === dayIndex)
    .sort((left, right) => left.order - right.order);
  const blocks = week.timeBlocks
    .filter((block) => block.dayIndex === dayIndex)
    .sort((left, right) => left.startSlot - right.startSlot);
  const evening = week.eveningBlocks.find((block) => block.dayIndex === dayIndex);

  return (
    <div className="flex flex-col gap-6">
      <PrioritiesSection week={week} dayIndex={dayIndex} priorities={priorities} />

      <section className="flex flex-col gap-2">
        <SectionLabel>Schedule</SectionLabel>
        {blocks.length === 0 ? (
          <p className="m-0 py-1 text-[13px] text-muted-foreground">
            Nothing scheduled — enjoy the open space.
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {blocks.map((block) => (
              <BlockRow
                key={block.id}
                title={block.title.trim() || "Untitled"}
                timeLabel={`${slotToTime(block.startSlot, bounds)}–${slotToTime(
                  block.startSlot + block.duration,
                  bounds
                )}`}
                roleColor={roleColorOf(week, block.roleId)}
                completed={block.completed}
                blockId={block.id}
                kind="time"
              />
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>Evening</SectionLabel>
        {!evening ? (
          <p className="m-0 py-1 text-[13px] text-muted-foreground">Evening is free.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col p-0">
            <BlockRow
              title={evening.title.trim() || "Untitled"}
              timeLabel={`After ${bounds.endHour}:00`}
              roleColor={roleColorOf(week, evening.roleId)}
              completed={evening.completed}
              blockId={evening.id}
              kind="evening"
            />
          </ul>
        )}
      </section>
    </div>
  );
}

function PrioritiesSection({
  week,
  dayIndex,
  priorities,
}: {
  week: Week;
  dayIndex: DayOfWeek;
  priorities: Week["dayPriorities"];
}) {
  const toggleDayPriorityCompleted = useWeekStore((s) => s.toggleDayPriorityCompleted);
  const addDayPriority = useWeekStore((s) => s.addDayPriority);
  const [draft, setDraft] = useState<string | null>(null);

  const atCap = priorities.length >= MAX_PRIORITIES_PER_DAY;

  async function commitDraft() {
    const text = draft?.trim();
    setDraft(null);
    if (!text) return;
    await addDayPriority({ type: "freestyle", text, dayIndex, completed: false });
  }

  return (
    <section className="flex flex-col gap-2">
      <SectionLabel
        action={
          <span className="font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-muted-foreground tabular-nums">
            {priorities.length}/{MAX_PRIORITIES_PER_DAY}
          </span>
        }
      >
        Priorities
      </SectionLabel>

      {priorities.length === 0 && draft === null && (
        <p className="m-0 py-1 text-[13px] text-muted-foreground">
          No priorities for this day.
        </p>
      )}

      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {priorities.map((priority) => {
          const color = roleColorOf(week, priorityRoleId(priority, week.goals));
          const text = priorityText(priority, week.goals).trim() || "Untitled";
          return (
            <li key={priority.id}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--ds-r-sm)] border border-[var(--ds-line-soft)] bg-[var(--ds-panel)] px-3 py-2.5">
                <Checkbox
                  checked={priority.completed}
                  onCheckedChange={() => toggleDayPriorityCompleted(priority.id)}
                  className="size-5"
                  aria-label={`Mark ${text} ${priority.completed ? "incomplete" : "complete"}`}
                />
                <span
                  className={cn(
                    "min-w-0 flex-1 text-[13px] leading-snug",
                    priority.completed
                      ? "text-muted-foreground line-through decoration-[var(--ds-fg-faint)]"
                      : "text-foreground"
                  )}
                >
                  {text}
                </span>
                {color && (
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: getRoleColorStyle(color) }}
                    aria-hidden={true}
                  />
                )}
              </label>
            </li>
          );
        })}
      </ul>

      {draft !== null ? (
        <InlineInput
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void commitDraft()}
          onKeyDown={(event) => {
            if (event.key === "Enter") void commitDraft();
            if (event.key === "Escape") setDraft(null);
          }}
          placeholder="What matters today?"
          className="min-h-11 rounded-[var(--ds-r-sm)] border border-[var(--ds-line)] bg-[var(--ds-panel)] px-3 text-[13px]"
          aria-label="New priority"
        />
      ) : atCap ? (
        <p className="m-0 text-caption text-muted-foreground">
          Both priority spots are taken — a deliberate limit.
        </p>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDraft("")}
          className="min-h-11 justify-start gap-2 border-dashed text-muted-foreground"
        >
          <Plus className="size-3.5" strokeWidth={1.4} />
          Add priority
        </Button>
      )}
    </section>
  );
}

function BlockRow({
  title,
  timeLabel,
  roleColor,
  completed,
  blockId,
  kind,
}: {
  title: string;
  timeLabel: string;
  roleColor: RoleColor | undefined;
  completed: boolean;
  blockId: string;
  kind: "time" | "evening";
}) {
  const toggleTimeBlockCompleted = useWeekStore((s) => s.toggleTimeBlockCompleted);
  const toggleEveningBlockCompleted = useWeekStore((s) => s.toggleEveningBlockCompleted);
  const toggle =
    kind === "time"
      ? () => toggleTimeBlockCompleted(blockId)
      : () => toggleEveningBlockCompleted(blockId);

  return (
    <li>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 overflow-hidden rounded-[var(--ds-r-sm)] border border-[var(--ds-line-soft)] bg-[var(--ds-panel)] py-2.5 pr-3">
        <span
          className="self-stretch"
          style={{
            width: 3,
            backgroundColor: roleColor ? getRoleColorStyle(roleColor) : "var(--ds-line)",
          }}
          aria-hidden={true}
        />
        <Checkbox
          checked={completed}
          onCheckedChange={toggle}
          className="size-5"
          aria-label={`Mark ${title} ${completed ? "incomplete" : "complete"}`}
        />
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-[13px] leading-snug",
              completed
                ? "text-muted-foreground line-through decoration-[var(--ds-fg-faint)]"
                : "text-foreground"
            )}
          >
            {title}
          </span>
          <span className="block font-mono text-[10px] tabular-nums text-muted-foreground">
            {timeLabel}
          </span>
        </span>
      </label>
    </li>
  );
}
