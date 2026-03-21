# goals

> Weekly objectives belonging to a role, with independent completion tracking and the ability to appear as multiple instances (priorities, time blocks, evening blocks).

## Decisions

| Decision | Rationale | Source |
|----------|-----------|--------|
| Goals belong to roles via roleId | Enables role-based color coding | Phase 04-01 |
| Independent completion per instance | Simpler than cross-instance sync | PROJECT.md |
| Same goal in multiple places | Matches real planning workflows | Phase 05-02 |
| Left border for role color accent | More visible than dot on small items | Phase 04-01 |
| Notes field is optional | Most goals need only a title | Phase 04-01 |
| Cascading delete to all instances | Goal removal cleans priorities/blocks | Phase 01-02 |
| Drag disabled during text editing | Prevents accidental drags mid-edit | Phase 05-02 |

## Architecture

- `Goal` interface: `id` (UUID), `roleId`, `text`, optional `notes`, `completed` (boolean).
- `CreateGoalInput` = `Pick<Goal, "roleId" | "text"> & { notes?: string }` -- id and completed are auto-set.
- `weekStore.addGoal` generates UUID, sets `completed: false`, appends to `currentWeek.goals`, persists.
- `weekStore.deleteGoal` cascades: removes goal, filters out matching dayPriorities, timeBlocks (except freestyle), eveningBlocks (except freestyle).
- GoalItem is draggable via `useDraggable` with `GoalDragData { type: "goal", goalId, roleId, text }`.
- Dropping a goal creates a **copy** (new DayPriority/TimeBlock/EveningBlock) -- goals are sources, not moved.
- GoalList filters goals by `roleId` using `useMemo` for hydration safety.

## Design

- Role color left border: `3px solid getRoleColorStyle(roleColor)` via inline style.
- Compact styling: `text-sm`, `py-1`, `px-2` for nesting within role sections.
- Notes indicator: inline SVG document icon (12x12px) shown when `goal.notes` exists.
- Double-click to edit text with Enter/Escape/blur handling via `useEditableText` hook.
- Hover-reveal delete button with confirmation dialog.
- Drag affordance: `cursor-grab` / `active:cursor-grabbing`, `opacity-50` when dragging.

## Pitfalls

- **Freestyle blocks survive goal deletion**: `deleteGoal` filters blocks with `b.type === "freestyle" || b.goalId !== goalId`, preserving manually-created blocks.
- **GoalDragData must include text**: The text field is used by drop handlers to set titles on created blocks/priorities, not looked up from store.

## Key Files

- `src/types/index.ts` -- Goal, CreateGoalInput type definitions
- `src/stores/weekStore.ts` -- Goal CRUD (addGoal, updateGoal, deleteGoal, toggleGoalCompleted)
- `src/components/sidebar/GoalItem.tsx` -- Draggable goal display with edit/delete
- `src/components/sidebar/GoalList.tsx` -- Filtered goal container per role
- `src/components/sidebar/AddGoalButton.tsx` -- Two-state button/input for goal creation
- `src/hooks/useEditableText.ts` -- Shared hook for inline editing (see ui subsystem)
