# calendar

> Custom CSS Grid 7-day calendar (Sun-Sat) with 30-minute time slots from 8:00-20:00, day priorities section, and evening slot per day.

## Decisions

| Decision | Rationale | Source |
|----------|-----------|--------|
| Custom CSS Grid, not library | Calendar libs built for events, not goals | PROJECT.md |
| 30-min slot granularity, 32px height | Compact but readable; 24 slots = 768px | Phase 02-02 |
| Fixed 8:00-20:00 range | Simplifies UI; evening slot handles late | PROJECT.md |
| Sunday-first week array (0=Sun) | Matches DayOfWeek type definition | Phase 02-02 |
| Sticky day headers with z-10 | Maintains scroll context | Phase 02-02 |
| 80px min-height for priorities | Consistent layout when empty | Phase 02-03 |
| 48px min-height for evening slot | Compact single-item container | Phase 02-03 |
| Evening slot: max one block per day | Reflects single evening activity | Phase 01-02 |

## Architecture

- Component hierarchy: `WeekView` > `DayColumn` > (`DayPriorities` + `TimeGrid` + `EveningSlot`).
- `WeekView` renders 7 `DayColumn`s in `grid-cols-7` with `min-w-[1000px]` for horizontal scroll.
- `WeekView` calls `loadWeek(currentWeekId)` on mount via useEffect; auto-creates week if absent.
- `DayColumn` is a vertical flex container: sticky header, priorities, time grid (flex-1), evening.
- `TimeGrid` uses `grid-cols-[3rem_1fr]`: left column for hour labels, right column `relative` for slots + absolute-positioned `TimeBlock`s.
- `TimeSlot` is an `h-8` (32px) cell with hour-boundary alternating backgrounds: `bg-background` (even) vs `bg-muted/30` (odd).
- `TimeBlock` uses absolute positioning: `top = startSlot * 32px`, `height = duration * 32px`.
- `DayPriorities` renders sorted priority items; `EveningSlot` renders zero or one evening block.
- Week dates computed via `getWeekDates(weekId)` returning 7 Date objects indexed by DayOfWeek.
- Today highlighting: `isToday && "bg-primary/10"` on day header, primary color on date text.

## Design

- Day header: short name (Mon, Tue...) + localized date, sticky at top with `bg-background`.
- Hour labels: `text-xs text-muted-foreground` right-aligned in 3rem column.
- Column separator: `border-r border-border` except last column.
- Min column width: `min-w-[140px]` prevents collapse.
- Empty state in priorities/evening: italic `text-xs text-muted-foreground` centered guidance text.
- Time blocks: role-color background at 20% opacity, solid 3px left border in role color.

## Pitfalls

- **TimeBlock absolute positioning requires relative parent**: The slots column in TimeGrid must be `relative` for blocks to overlay correctly.
- **Blocks can overlap**: No collision prevention currently implemented -- overlap handling deferred to future phase.
- **Date calculation off-by-one**: `getWeekDates` returns Sunday at index 0 (Monday - 1 day), which matches `DayOfWeek` but diverges from ISO week-starts-Monday convention.

## Key Files

- `src/components/calendar/WeekView.tsx` -- 7-day container, loads week data
- `src/components/calendar/DayColumn.tsx` -- Single day structure (header + priorities + grid + evening)
- `src/components/calendar/TimeGrid.tsx` -- 24 slots with hour labels + TimeBlock overlay
- `src/components/calendar/TimeSlot.tsx` -- Individual 30-min droppable cell
- `src/components/calendar/TimeBlock.tsx` -- Absolute-positioned draggable block
- `src/components/calendar/DayPriorities.tsx` -- Priority drop zone and list
- `src/components/calendar/EveningSlot.tsx` -- Evening drop zone with single block
- `src/components/calendar/PriorityItem.tsx` -- Individual draggable priority entry
- `src/lib/utils.ts` -- `getWeekDates`, `slotToTime`, `timeToSlot`, `DAY_NAMES_SHORT`
