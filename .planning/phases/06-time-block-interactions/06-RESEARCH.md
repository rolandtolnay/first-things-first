# Phase 6: Time Block Interactions — Research

**Mode:** Implementation
**Question:** How to implement pointer-based block resize, click-drag freestyle block creation, and collision detection/overlap prevention in a React 19 + dnd-kit calendar grid?

<research_summary>

## Summary

All three features (resize, click-drag-draw, overlap prevention) are implementable with the existing stack — **no new libraries needed**. The key architectural insight is that resize and freestyle creation are **pointer event interactions**, completely separate from dnd-kit's drag-drop system. dnd-kit has no resize capability; the community consensus is to use raw `onPointerDown/Move/Up` with `setPointerCapture` for both resize and click-drag-draw, while dnd-kit continues handling block drag-drop exclusively.

The coexistence strategy is straightforward: dnd-kit's `PointerSensor` listens via `onPointerDown` on block elements. The resize handle (a child element at the block's bottom edge) calls `e.stopPropagation()` on its own `onPointerDown`, preventing the event from reaching dnd-kit's listener. Click-drag-draw operates on the TimeGrid container (not on individual blocks), so it doesn't interact with dnd-kit at all.

Overlap prevention uses standard interval intersection (`startA < endB && startB < endA`) applied at two levels: real-time boundary clamping during resize/draw (block stops growing at occupied slots) and a safety-net validation on commit.

</research_summary>

<standard_stack>

## Standard Stack

| Library | Version | Purpose in Phase 6 | Status |
|---------|---------|---------------------|--------|
| React Pointer Events API | built-in | Resize handles + click-drag-draw | New usage |
| @dnd-kit/core | 6.3.1 | Block drag-drop (existing, unchanged) | Existing |
| Zustand | 5.0.10 | Block CRUD, overlap validation in store | Existing |
| @dnd-kit/modifiers | 9.0.0 | Installed but NOT needed for this phase | Existing (unused) |

**No new dependencies required.** Do NOT reach for react-rnd, InteractJS, or re-resizable — the grid-snapped resize is ~30 lines of pointer event code, simpler than adapting a generic library to the slot-based model.

</standard_stack>

<architecture_patterns>

## Architecture Patterns

### 1. Separation of Concerns: dnd-kit vs Pointer Events

| Interaction | System | Why |
|------------|--------|-----|
| Block drag-to-move | dnd-kit (existing) | Discrete start/end, uses DragOverlay, collision detection |
| Block resize | Raw pointer events | Continuous feedback, grid snapping, no DragOverlay needed |
| Freestyle creation | Raw pointer events | Continuous drawing, no drag source exists yet |
| Inline title edit | React controlled input | Standard text input, `useEditableText` hook exists |

The two systems share DOM elements (TimeBlock has both dnd-kit listeners AND a resize handle) but never share state. `stopPropagation()` is the boundary.

### 2. Interaction State Machine

All interactions should be modeled as a state machine:

```typescript
type InteractionMode =
  | { type: 'idle' }
  | { type: 'resizing'; blockId: string; initialDuration: number; containerRect: DOMRect }
  | { type: 'drawing'; dayIndex: DayOfWeek; startSlot: number; currentEndSlot: number }
  | { type: 'editing'; blockId: string }
```

This state drives which pointer handlers are active, what visual feedback shows, and whether dnd-kit drag is suppressed during drawing.

### 3. Local State During Interaction, Store on Commit

- **During resize/draw:** Use component-local state (useState/useRef) for visual preview. Never call `updateTimeBlock()` on every pointermove — it thrashes renders, persistence writes, and re-renders the calendar 60+ times/second.
- **On commit (pointerup/Enter):** Single store mutation. Matches the existing optimistic update pattern via `withWeek`.

### 4. Container-Relative Coordinate System

Calculate slot positions relative to the TimeGrid container using `getBoundingClientRect()`:

```typescript
function getSlotFromPointerY(clientY: number, containerRect: DOMRect): number {
  const relativeY = Math.max(0, clientY - containerRect.top);
  return Math.min(23, Math.round(relativeY / SLOT_HEIGHT)); // SLOT_HEIGHT = 32
}
```

Cache the rect on `pointerdown` — don't call `getBoundingClientRect()` on every `pointermove` (forces layout reflow). Use absolute position, not cumulative deltas (avoids floating-point drift).

### 5. Custom Hook Architecture

Extract each interaction into a focused hook:

```
useBlockResize(blockId) → { handleProps, isResizing, previewDuration }
useBlockDraw(dayIndex, blocks) → { containerProps, isDrawing, previewBlock }
useInlineEdit(blockId) → reuse existing useEditableText hook
```

Each hook encapsulates pointer event setup, state machine, and cleanup. Components stay declarative.

</architecture_patterns>

<dont_hand_roll>

## Don't Hand-Roll

| Problem | Existing Solution | Location |
|---------|-------------------|----------|
| Pointer tracking during drag | `setPointerCapture(pointerId)` | Native Web API — retargets all pointer events to capturing element even if pointer leaves |
| Slot-to-time conversion | `slotToTime()` | `src/lib/utils.ts:199-203` |
| ID generation | `generateId()` | `src/lib/utils.ts` |
| Inline text editing lifecycle | `useEditableText` hook | `src/hooks/useEditableText.ts` — handles isEditing, inputRef focus, Enter/Escape/trim |
| Block update (duration change) | `updateTimeBlock(id, { duration })` | `src/stores/weekStore.ts:396-400` — accepts Partial, duration-only update is valid |
| Freestyle block creation | `addTimeBlock({ type: "freestyle", ... })` | `src/stores/weekStore.ts:375-394` — already supports freestyle type |
| Day-filtered blocks for overlap checks | `blocks.filter(b => b.dayIndex === dayIndex)` | `src/components/calendar/TimeGrid.tsx:29-32` — already computed in useMemo |
| Hover-reveal UI pattern | `opacity-0 group-hover:opacity-100` | Already used on TimeBlock delete button (`src/components/calendar/TimeBlock.tsx:83-94`) |

</dont_hand_roll>

<common_pitfalls>

## Common Pitfalls

### 1. Using onMouseDown Instead of onPointerDown for stopPropagation
dnd-kit's PointerSensor listens to `onPointerDown`, which fires before `onMouseDown`. Only `onPointerDown` stopPropagation prevents sensor activation. Source: dnd-kit issue #827.

### 2. Resize Without setPointerCapture
During fast pointer movement, the pointer leaves the resize handle element and events stop firing. Always call `setPointerCapture()` — it guarantees pointermove/pointerup fire on the capturing element regardless of pointer position.

### 3. Drawing on Occupied Slots
The click-drag-draw gesture must check that the pointer started on empty space, not on an existing TimeBlock. Guard: `if ((e.target as HTMLElement).closest('[data-block]')) return;`

### 4. Cumulative Delta vs Absolute Position
Using `movementY` deltas to track resize causes floating-point drift. Calculate from absolute position every frame: `Math.round((clientY - containerTop) / 32)`.

### 5. Store Thrashing During Drag
Calling `updateTimeBlock()` on every pointermove triggers Zustand re-renders + Dexie writes 60x/sec. Use local state during interaction, commit once on pointerup.

### 6. Missing CSS touch-action / user-select
Without `touch-action: none` on drag surfaces, browsers may interpret gestures as scroll. Without `user-select: none`, text selection triggers during drag.

### 7. Overlap Check Not Excluding Self
During resize, the overlap check must exclude the block being resized — otherwise it always "overlaps" itself.

### 8. TimeSlotIndex Type Casting
`TimeSlotIndex` is a literal union `0 | 1 | ... | 23`. Any computed slot value must be cast with `as TimeSlotIndex`. Out-of-range values are TypeScript errors.

### 9. useCallback Dependency Arrays
Any new store actions added to `handleDragEnd` (e.g., for overlap clamping on drop) must be in the dependency array. This was a bug caught during Phase 5.1.

### 10. Role Color Inline Styles
Role colors use `style={{ backgroundColor: ... }}` because Tailwind v4 purges dynamic class names. Any new colored element (resize preview, drawing preview) must follow this inline style pattern.

</common_pitfalls>

<code_examples>

## Code Examples

### Resize Handle on TimeBlock (coexistence with dnd-kit)

```tsx
// Inside TimeBlock component — resize handle as child, stopPropagation prevents dnd-kit
<div
  ref={setNodeRef}
  {...listeners}      // dnd-kit drag: onPointerDown on the whole block
  {...attributes}
  data-block          // marker for click-drag-draw to detect existing blocks
  className="group absolute left-0 right-0 ..."
  style={{ top: `${top}px`, height: `${height}px` }}
>
  {/* Block content */}
  <span>{block.title}</span>

  {/* Resize handle — hover-revealed, captures pointer events */}
  <div
    className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize
               opacity-0 group-hover:opacity-100"
    onPointerDown={(e) => {
      e.stopPropagation();  // Prevents dnd-kit PointerSensor activation
      e.preventDefault();    // Prevents text selection
      e.currentTarget.setPointerCapture(e.pointerId);
      startResize(e);
    }}
    onPointerMove={handleResizeMove}
    onPointerUp={handleResizeEnd}
  />
</div>
```

### Resize Logic (pointer capture + absolute position)

```typescript
// Use absolute position, not deltas — avoids floating-point drift
function handleResizeMove(e: React.PointerEvent) {
  if (!resizeState) return;
  const relativeY = e.clientY - resizeState.containerRect.top;
  const newEndSlot = Math.round(relativeY / 32); // 32px per slot
  const newDuration = newEndSlot - block.startSlot;

  // Clamp: min 1 slot (30min), max to nearest occupied boundary or 16 slots (8hr)
  const maxDuration = getMaxAvailableDuration(block, dayBlocks);
  const clampedDuration = Math.max(1, Math.min(newDuration, maxDuration));

  setPreviewDuration(clampedDuration); // Local state only
}

function handleResizeEnd(e: React.PointerEvent) {
  // Pointer capture auto-releases on pointerup
  updateTimeBlock(block.id, { duration: finalDuration }); // Commit to store
}
```

### Click-Drag-Draw on TimeGrid Container

```typescript
// On the slots container div (the relative parent in TimeGrid)
function handleGridPointerDown(e: React.PointerEvent<HTMLDivElement>) {
  if ((e.target as HTMLElement).closest('[data-block]')) return; // Skip existing blocks
  const rect = e.currentTarget.getBoundingClientRect();
  const startSlot = Math.floor((e.clientY - rect.top) / 32);
  if (startSlot < 0 || startSlot > 23) return;

  e.currentTarget.setPointerCapture(e.pointerId);
  setDrawing({ startSlot, endSlot: startSlot + 1, containerRect: rect });
}

function handleGridPointerMove(e: React.PointerEvent<HTMLDivElement>) {
  if (!drawing) return;
  const relativeY = e.clientY - drawing.containerRect.top;
  const currentSlot = Math.min(23, Math.max(drawing.startSlot + 1, Math.round(relativeY / 32)));
  // Clamp to nearest occupied boundary
  const maxSlot = getMaxEndSlot(drawing.startSlot, dayBlocks);
  setDrawing(prev => ({ ...prev!, endSlot: Math.min(currentSlot, maxSlot) }));
}

function handleGridPointerUp() {
  if (!drawing) return;
  const duration = drawing.endSlot - drawing.startSlot;
  const block = addTimeBlock({
    type: "freestyle", dayIndex, startSlot: drawing.startSlot as TimeSlotIndex,
    duration, title: "", completed: false,
  });
  setDrawing(null);
  setEditingBlockId(block.id); // Triggers inline title input
}
```

### Overlap Detection Utilities

```typescript
function hasOverlap(
  start: number, end: number,
  blocks: TimeBlock[], excludeId?: string
): boolean {
  return blocks
    .filter(b => !excludeId || b.id !== excludeId)
    .some(b => start < b.startSlot + b.duration && end > b.startSlot);
}

function getMaxAvailableDuration(
  block: TimeBlock, dayBlocks: TimeBlock[]
): number {
  const maxEndSlot = Math.min(block.startSlot + 16, 24); // 16 slots = 8hr, 24 = end of day
  let availableEnd = maxEndSlot;
  for (const other of dayBlocks) {
    if (other.id === block.id) continue;
    if (other.startSlot >= block.startSlot && other.startSlot < availableEnd) {
      availableEnd = other.startSlot; // Stop at nearest occupied boundary
    }
  }
  return availableEnd - block.startSlot;
}
```

</code_examples>

<sota_updates>

## State of the Art

**Current (recommended):**
- **Pointer Events API** (`setPointerCapture`) — modern standard for all drag/resize. Unified mouse+touch+pen. No separate mouse/touch handlers needed.
- **Raw pointer events for resize** — all major calendar apps (Google Calendar, Notion Calendar, Fantastical, Amie) implement resize with native pointer events, not drag-drop libraries.
- **dnd-kit v6** — still the standard React drag-drop library. Drag handle pattern (`setActivatorNodeRef` + selective `listeners`) is the official coexistence approach.
- **Component-local state during interaction** — optimistic local state during drag, commit to store on release. React 19 / concurrent mode friendly.

**Deprecated / Avoid:**
- **react-beautiful-dnd** — officially deprecated by Atlassian.
- **HTML5 Drag and Drop API** — poor mobile support, can't customize drag preview, no resize.
- **document.addEventListener('mousemove')** for resize — replaced by `setPointerCapture`. Old pattern is error-prone (forgotten cleanup, memory leaks).
- **react-rnd / InteractJS** — wrong abstraction for slot-grid calendars. 36kB+ bundle for ~30 lines of pointer event code.

</sota_updates>

<open_questions>

## Open Questions

1. **PointerSensor 8px activation + resize handle:** dnd-kit's PointerSensor has `distance: 8` activation. If `stopPropagation()` fires on the resize handle's `onPointerDown`, dnd-kit should never see the event at all — but worth a quick validation test during implementation.

2. **Drawing vs dnd-kit droppable slots:** During click-drag-draw, the pointer moves over TimeSlot droppable elements. The drawing handler is on the container (not slots), and no dnd-kit drag is active, so interference is unlikely. If issues arise, conditionally disable droppables during drawing mode.

3. **Scroll during resize/draw:** If the calendar grid is scrollable and the user resizes past the visible area, should it auto-scroll? Google Calendar does this. Adds complexity — recommend deferring unless the grid scrolls in practice (current fixed 8:00-20:00 range at 768px may fit without scrolling on target 1440px+ viewports).

</open_questions>

<sources>

## Sources

**From external docs:**
- dnd-kit official documentation (dndkit.com) — confirmed no resize capability, PointerSensor uses `onPointerDown`
- MDN setPointerCapture — standard Web API for pointer tracking during drag
- javascript.info Pointer Events — setPointerCapture patterns and behavior
- dnd-kit source code (core.esm.js:1632-1651) — PointerSensor activator implementation
- dnd-kit GitHub issues #477 (data-no-dnd pattern), #827 (stopPropagation with pointer events)

**From codebase analysis:**
- `src/components/calendar/TimeBlock.tsx` — current block rendering, dnd-kit listeners spread
- `src/components/calendar/TimeGrid.tsx` — slots container (relative parent), day-filtered blocks
- `src/components/calendar/TimeSlot.tsx` — droppable cells with data-slot/data-day attributes
- `src/components/dnd/DndProvider.tsx` — PointerSensor config (8px distance), handleDragEnd matrix
- `src/stores/weekStore.ts` — updateTimeBlock accepts Partial, addTimeBlock supports freestyle
- `src/hooks/useEditableText.ts` — reusable inline editing hook
- `src/types/index.ts` — TimeSlotIndex literal union type (0-23)
- Phase 05-04 summary — "blocks can overlap (Phase 6 will handle)"
- Phase 05.1-02 summary — useCallback dependency array bug pattern

**From best practices:**
- Radzion calendar editor (radzion.com/blog/calendar-editor) — absolute position for slot calculation
- Google Calendar UX observation — bottom-edge resize, click-drag-draw, boundary clamping
- React Native Calendar Kit docs — drag-to-create state machine pattern
- InteractJS snap docs — Math.round snap formula
- blog.r0b.io — setPointerCapture superiority over document-level listeners

</sources>

<metadata>

## Metadata

- **Research date:** 2026-03-22
- **Research mode:** Implementation
- **Agents used:** External Docs (ms-researcher), Codebase Patterns (ms-codebase-researcher), Best Practices (ms-researcher)
- **Confidence:** HIGH across all sections (no LOW confidence areas)
- **New dependencies:** None required
- **Phase:** 06-time-block-interactions

</metadata>
