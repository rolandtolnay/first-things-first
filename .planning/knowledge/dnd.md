# dnd

> dnd-kit-based drag-drop system with a single DndContext at app root, 4 draggable item types, 3 drop zones, and full cross-section move semantics.

## Decisions

| Decision | Rationale | Source |
|----------|-----------|--------|
| @dnd-kit/core v6.3.1, not v0.2 React | Stable API, not experimental | Phase 05-01 |
| Single DndContext at app root | Avoids nested context complexity | PROJECT.md |
| PointerSensor with 8px activation | Prevents accidental drags on click | Phase 05-01 |
| rectIntersection collision detection | Detects overlap with drop zones | Phase 05.1 |
| Goals create copies, blocks/etc move | Goals are sources, not consumed | Phase 05-02 |
| Null drop animation for goals | Copies don't swoosh back | Phase 05.1-02 |
| Ref tracks drag type across re-render | State cleared before animation reads it | Phase 05.1-02 |
| Inner draggable for evening blocks | Outer stays droppable, inner draggable | Phase 05.1-01 |

## Architecture

- **Provider hierarchy**: `ThemeProvider` > `DndProvider` > `DatabaseProvider` > app content.
- **DndProvider** wraps `DndContext` with sensors, collision detection, and `DragOverlay`.
- **4 drag data types** (discriminated union `DragData`): `GoalDragData`, `BlockDragData`, `PriorityDragData`, `EveningDragData`. Each has a `type` field for dispatch.
- **3 drop zone types** (`DropZoneData`): `priorities`, `timegrid`, `evening`. Each carries `dayIndex`; timegrid also carries `slotIndex`.
- **Drop handling matrix** in `handleDragEnd`:
  - Goal -> priorities: creates DayPriority (copy)
  - Goal -> timegrid: creates 1hr TimeBlock (copy)
  - Goal -> evening: creates EveningBlock (copy, if unoccupied)
  - Block -> timegrid: updates dayIndex/startSlot (move)
  - Block -> priorities: creates DayPriority + deletes block (move, goal-based only)
  - Block -> evening: creates EveningBlock + deletes block (move, if unoccupied)
  - Priority -> timegrid: creates TimeBlock + removes priority (move)
  - Priority -> evening: creates EveningBlock + removes priority (move, if unoccupied)
  - Priority -> priorities (diff day): creates new + removes old (move)
  - Evening -> timegrid: creates TimeBlock + deletes evening (move)
  - Evening -> priorities: creates DayPriority + deletes evening (move, goal-based only)
  - Evening -> evening (diff day): creates new + deletes old (move, if unoccupied)
- **DragOverlay** always mounted, children conditionally rendered. Uses `DragOverlayContent` which dispatches to `GoalOverlay`, `BlockOverlay`, `PriorityOverlay`, `EveningOverlay`.
- **DragPreview** component has 3 variants: `default` (goal), `compact` (priority), `evening`.
- `activeTypeRef` (useRef) preserves drag type for `dropAnimation` after `setActiveData(null)`.

## Pitfalls

- **Freestyle items to priorities**: Blocks/evening without `goalId` cannot become priorities. Drop handlers check and silently skip.
- **Same-day priority/evening drops**: Moving to the same day is a no-op; handlers check `sourceDayIndex === dropData.dayIndex`.
- **useCallback dependency array**: All store actions used in `handleDragEnd` must be in the dependency array to avoid stale closures.
- **DragOverlay re-render timing**: `setActiveData(null)` triggers re-render before dnd-kit reads `dropAnimation`. The `activeTypeRef` pattern solves this by persisting the type in a ref.
- **Collision detection choice matters**: Changed from `closestCenter` to `rectIntersection` during Phase 05.1 for better cross-section detection.

## Key Files

- `src/types/dnd.ts` -- GoalDragData, BlockDragData, PriorityDragData, EveningDragData, DropZoneData
- `src/components/dnd/DndProvider.tsx` -- DndContext wrapper, sensors, all drop handling logic
- `src/components/dnd/DragOverlayContent.tsx` -- Overlay component dispatch per drag type
- `src/components/dnd/DragPreview.tsx` -- Visual preview with default/compact/evening variants
- `src/components/dnd/index.ts` -- Barrel export
