# blocks

> Scheduled items on the calendar: TimeBlocks (8:00-20:00 grid), DayPriorities (top of day), and EveningBlocks (post-20:00 slot), all trackable with independent completion.

## Decisions

| Decision | Rationale | Source |
|----------|-----------|--------|
| Two block types: goal and freestyle | Supports both goal-linked and manual | Phase 01-02 |
| Blocks store roleId for color coding | Enables analytics without joins | PROJECT.md |
| 1-hour default for dropped goals | Reasonable starting duration | Phase 05-03 |
| Evening max one per day | Single activity for evening slot | Phase 01-02 |
| Occupied evening silently rejects | No error toast, just no-op | Phase 05.1-02 |
| Freestyle blocks survive goal delete | Only goal-linked blocks cascade | Phase 01-02 |
| Overlap prevention: clamp drops, reject moves | Adaptive clamp is more helpful; silent reject feels designed-in | Phase 06-01 |
| Goal drops clamp to available space (min 1 slot) | User chose slot intentionally; give as much time as fits | Phase 06-01 |
| Block moves silently snap-back on overlap | No toast; constraint is philosophical (one thing at a time) | Phase 06-01 |
| MAX_BLOCK_SLOTS = 16 (8hr), TOTAL_SLOTS = 24 | 8hr cap prevents meaningless full-day spans; 24 = end-of-day | Phase 06-01 |
| getClampedDuration enforces floor of 1 slot | Safety floor even in edge cases (e.g. resize to zero) | Phase 06-01 |
| Independent completion per instance | No sync between same-goal instances | PROJECT.md |

## Architecture

- **TimeBlock**: `id`, `type` ("goal"|"freestyle"), optional `goalId`/`roleId`, `dayIndex` (DayOfWeek), `startSlot` (TimeSlotIndex 0-23), `duration` (in 30-min slots), `title`, `completed`.
- **DayPriority**: `id`, `goalId`, `dayIndex`, `order`, `completed`. Always goal-linked (no freestyle priorities).
- **EveningBlock**: `id`, `type`, optional `goalId`/`roleId`, `dayIndex`, `title`, `completed`. Max one per day enforced in `addEveningBlock`.
- **Overlap detection** (`src/lib/overlap.ts`): `hasOverlap(start, end, blocks, excludeId?)` uses standard interval intersection (`startA < endB && startB < endA`). `getMaxAvailableDuration(block, dayBlocks)` returns slots until next occupied boundary or 8hr/end-of-day cap. `getClampedDuration` is the shared boundary enforcer used by resize, draw, and drop paths.
- Store operations follow optimistic update pattern via `withWeek` helper: mutate Zustand state, then `saveCurrentWeek` to Dexie.
- `addDayPriority` auto-calculates order as count of existing priorities for that day.
- `addEveningBlock` throws if evening block exists for target day (callers check beforehand).
- TimeBlock position: `top = startSlot * 32`, `height = duration * 32` (32px per slot).
- Block rendering: `TimeGrid` filters blocks by `dayIndex` via `useMemo`, renders as absolute-positioned children.

## Design

- TimeBlock: role-color background at 20% opacity (`roleColor.replace(")", " / 0.2)")`), 3px solid left border in full role color. Freestyle blocks use `bg-muted`.
- PriorityItem: compact `text-xs py-0.5 px-1.5` with 3px role-color left border.
- EveningBlock: same color pattern as TimeBlock, rendered inside 48px-min-height container.
- All block types: hover-reveal delete button (CloseIcon), group-hover opacity transition.
- Drag feedback: `opacity-50` when dragging, `cursor-grab`/`active:cursor-grabbing`.

## Pitfalls

- **Overlap self-exclusion**: All overlap checks during resize/move must pass `excludeId` of the block being modified — without it, the block always overlaps itself and is immediately clamped to zero.
- **Freestyle blocks lack goalId**: Drop handlers that create priorities from blocks must check `block.goalId` existence first -- freestyle blocks cannot become priorities.
- **Evening singleton enforcement**: `addEveningBlock` throws on duplicate; DndProvider checks `existingEvening` before calling. Missing the check would cause an unhandled error.
- **Block height precision**: `duration * 32` must match TimeSlot's `h-8` (32px). Changing slot height without updating TimeBlock calculation will break layout.
- **getMaxAvailableDuration only looks forward**: It finds blocks starting at or after the given slot, but misses blocks that started BEFORE and extend into it. All timegrid drop paths must pre-check `hasOverlap` on the drop slot before calling `getClampedDuration`, or drops can land inside existing blocks.

## Key Files

- `src/lib/overlap.ts` -- hasOverlap, getMaxAvailableDuration, getClampedDuration utilities
- `src/lib/__tests__/overlap.test.ts` -- 19 TDD test cases covering all interval scenarios
- `src/types/index.ts` -- TimeBlock, DayPriority, EveningBlock, TimeSlotIndex type definitions
- `src/stores/weekStore.ts` -- All block CRUD operations and toggle-completed methods
- `src/components/calendar/TimeBlock.tsx` -- Draggable absolute-positioned time block
- `src/components/calendar/PriorityItem.tsx` -- Draggable priority display
- `src/components/calendar/EveningSlot.tsx` -- Droppable evening container + DraggableEveningBlock inner component
- `src/components/calendar/DayPriorities.tsx` -- Droppable priority zone with lookup maps
