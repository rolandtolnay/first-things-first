# Phase 5: Drag-Drop Integration - Research

**Researched:** 2026-01-18
**Domain:** React drag-and-drop, dnd-kit, cross-container operations
**Confidence:** MEDIUM

## Summary

This phase implements drag-drop for scheduling goals from the sidebar to calendar drop zones. The use case is NOT sortable lists - it's cross-container drops that CREATE new entities (DayPriority, TimeBlock) rather than moving items between lists.

The established library for this is **@dnd-kit/core** (not the sortable preset). dnd-kit is the de facto standard for React drag-drop in 2025-2026 after react-beautiful-dnd was deprecated and archived in August 2025. Alternatives like pragmatic-drag-and-drop exist but dnd-kit has the best documentation, largest community, and most flexible API for this use case.

The core challenge is handling THREE different drop zone types (Day Priorities, Time Grid slots, Evening slots) with different behaviors per zone, while providing smooth visual feedback via DragOverlay.

**Primary recommendation:** Use @dnd-kit/core with custom collision detection, leverage the `data` property on both useDraggable and useDroppable to pass metadata that determines drop behavior in onDragEnd.

## Standard Stack

The established libraries for React drag-and-drop:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | 6.3.1 | Drag-drop primitives | Modular, accessible, 10kb, hooks-based, industry standard |
| @dnd-kit/modifiers | 9.0.0 | Transform modifiers | Snap-to-grid, axis restriction, boundary constraints |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @dnd-kit/sortable | 10.0.0 | Sortable lists | NOT needed for this phase - we're dropping to CREATE, not to SORT |
| @dnd-kit/utilities | 3.2.2 | CSS transform helpers | Optional for CSS.Translate.toString() |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @dnd-kit/core | pragmatic-drag-and-drop | Smaller bundle, native HTML5 DnD, but less documentation and community examples |
| @dnd-kit/core | react-dnd | Older, more complex API, less active maintenance |
| @dnd-kit/core | @hello-pangea/dnd | Fork of react-beautiful-dnd, opinionated, less flexible for our multi-zone case |

**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/modifiers
```

## Architecture Patterns

### Recommended Provider Structure
```
src/
├── components/
│   ├── dnd/
│   │   ├── DndProvider.tsx        # DndContext wrapper with sensors and collision
│   │   ├── DragOverlayContent.tsx # Renders dragged item preview
│   │   └── index.ts
│   ├── sidebar/
│   │   └── GoalItem.tsx           # Add useDraggable
│   └── calendar/
│       ├── DayPriorities.tsx      # Add useDroppable (zone: "priorities")
│       ├── TimeSlot.tsx           # Add useDroppable (zone: "timegrid")
│       └── EveningSlot.tsx        # Add useDroppable (zone: "evening")
```

### Pattern 1: Data-Driven Drop Handling
**What:** Pass metadata via `data` property, use it in onDragEnd to determine action
**When to use:** Multiple drop zones with different behaviors (our exact case)
**Example:**
```typescript
// Draggable - pass goal metadata
const { attributes, listeners, setNodeRef } = useDraggable({
  id: `goal-${goal.id}`,
  data: {
    type: 'goal',
    goalId: goal.id,
    roleId: goal.roleId,
    text: goal.text,
  },
});

// Droppable - identify zone type and context
const { setNodeRef, isOver } = useDroppable({
  id: `priorities-${dayIndex}`,
  data: {
    zone: 'priorities',
    dayIndex,
  },
});

// Handler - different action per zone
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!over) return;

  const goalData = active.data.current as GoalDragData;
  const dropData = over.data.current as DropZoneData;

  switch (dropData.zone) {
    case 'priorities':
      addDayPriority({
        goalId: goalData.goalId,
        dayIndex: dropData.dayIndex,
        completed: false,
      });
      break;
    case 'timegrid':
      addTimeBlock({
        type: 'goal',
        goalId: goalData.goalId,
        roleId: goalData.roleId,
        dayIndex: dropData.dayIndex,
        startSlot: dropData.slotIndex,
        duration: 2, // 1 hour default (2 x 30-min slots)
        title: goalData.text,
        completed: false,
      });
      break;
    case 'evening':
      addEveningBlock({
        type: 'goal',
        goalId: goalData.goalId,
        roleId: goalData.roleId,
        dayIndex: dropData.dayIndex,
        title: goalData.text,
        completed: false,
      });
      break;
  }
}
```

### Pattern 2: DragOverlay for Smooth Previews
**What:** Use DragOverlay component instead of transforming the original element
**When to use:** Always for cross-container drag (prevents unmount issues)
**Example:**
```typescript
// DndProvider.tsx
const [activeGoal, setActiveGoal] = useState<GoalDragData | null>(null);

<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragStart={(event) => {
    setActiveGoal(event.active.data.current as GoalDragData);
  }}
  onDragEnd={(event) => {
    handleDragEnd(event);
    setActiveGoal(null);
  }}
  onDragCancel={() => setActiveGoal(null)}
>
  {children}
  <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
    {activeGoal ? <GoalPreview goal={activeGoal} /> : null}
  </DragOverlay>
</DndContext>
```

**CRITICAL:** Always keep DragOverlay mounted, conditionally render its children. This ensures drop animations work:
```typescript
// CORRECT
<DragOverlay>
  {activeGoal ? <GoalPreview goal={activeGoal} /> : null}
</DragOverlay>

// WRONG - breaks animations
{activeGoal && <DragOverlay><GoalPreview goal={activeGoal} /></DragOverlay>}
```

### Pattern 3: Collision Detection for Grid Layouts
**What:** Use closestCenter for most cases, pointerWithin for precision
**When to use:** Time grid slots need precise detection
**Example:**
```typescript
import { closestCenter, pointerWithin, CollisionDetection } from '@dnd-kit/core';

// Custom collision that prefers pointerWithin for timegrid, closestCenter for others
const customCollision: CollisionDetection = (args) => {
  // Try pointer-based first for precision
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  // Fall back to closest center
  return closestCenter(args);
};
```

### Pattern 4: Visual Feedback States
**What:** Use isOver from useDroppable to show valid drop targets
**When to use:** All droppable zones
**Example:**
```typescript
function TimeSlot({ slotIndex, dayIndex }: TimeSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${dayIndex}-${slotIndex}`,
    data: { zone: 'timegrid', dayIndex, slotIndex },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-8 border-b border-border",
        isOver && "bg-primary/20 ring-1 ring-primary"
      )}
    />
  );
}
```

### Anti-Patterns to Avoid
- **Transforming original element during cross-container drag:** Use DragOverlay instead to prevent unmount issues
- **Using sortable preset for non-sortable drops:** Creates unnecessary complexity; use core hooks only
- **Forgetting to track activeId in state:** DragOverlay needs to know what's being dragged
- **Conditional DragOverlay rendering:** Always mount DragOverlay, only conditionally render children
- **Ignoring keyboard accessibility:** dnd-kit includes keyboard sensor by default, but you need custom announcements

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag preview positioning | Manual transform + state | DragOverlay component | Handles portal rendering, z-index, scroll position, animations |
| Touch vs mouse vs keyboard | Event listeners for each | dnd-kit sensors | Unified API, handles all input methods with configurable activation |
| Collision detection | Manual coordinate math | Built-in algorithms | closestCenter, pointerWithin, rectIntersection - battle tested |
| Accessibility announcements | Manual aria-live regions | DndContext announcements prop | Defaults provided, customizable for your context |
| Snap to grid | Manual position rounding | createSnapModifier | Handles transform coordinate rounding |

**Key insight:** dnd-kit's value is in the edge cases - scroll during drag, keyboard operation, touch vs pointer, accessibility. These are extremely hard to get right manually.

## Common Pitfalls

### Pitfall 1: Keyboard Sensor Default Movement
**What goes wrong:** Arrow keys move 25px by default, not aligned to your grid
**Why it happens:** dnd-kit uses arbitrary 25px default for keyboard movement
**How to avoid:** Configure getNextCoordinates option on KeyboardSensor for 32px (slot height) movement
**Warning signs:** Keyboard drag lands items between slots

### Pitfall 2: Empty Container Drop Detection
**What goes wrong:** Can't drop into empty Day Priorities section
**Why it happens:** No droppable elements exist if priorities list is empty
**How to avoid:** The container itself must be the droppable, not just its children
**Warning signs:** Drop only works when section has items

### Pitfall 3: DragOverlay Mismatch
**What goes wrong:** Preview looks different from original item
**Why it happens:** Using different component for overlay vs source
**How to avoid:** Create shared presentational component used in both places
**Warning signs:** Visual jump when drag starts/ends

### Pitfall 4: React 19 StrictMode Double-Mounting
**What goes wrong:** Drag state gets corrupted in development
**Why it happens:** React 19 StrictMode mounts effects twice
**How to avoid:** Ensure drag state cleanup in onDragEnd and onDragCancel is idempotent
**Warning signs:** Drag works in production but behaves oddly in development

### Pitfall 5: State Update Race Conditions
**What goes wrong:** Drop creates item but UI doesn't update
**Why it happens:** Async store updates race with drag state cleanup
**How to avoid:** Use optimistic updates (already in weekStore pattern), clear drag state AFTER state update
**Warning signs:** Item appears then disappears, or duplicate items

### Pitfall 6: Forgetting to Disable While Editing
**What goes wrong:** Trying to edit goal text triggers drag
**Why it happens:** Click on goal text fires drag start
**How to avoid:** Add disabled prop to useDraggable when isEditing state is true in GoalItem
**Warning signs:** Can't select text in goal input

## Code Examples

Verified patterns from official sources:

### DndContext Provider Setup
```typescript
// Source: https://docs.dndkit.com/api-documentation/context-provider
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';

export function DndProvider({ children }: { children: React.ReactNode }) {
  const [activeGoal, setActiveGoal] = useState<GoalDragData | null>(null);

  // Configure sensors with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as GoalDragData;
    setActiveGoal(data);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // Handle drop logic here
    setActiveGoal(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveGoal(null)}
    >
      {children}
      <DragOverlay>
        {activeGoal ? <GoalPreview {...activeGoal} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

### Draggable Goal Implementation
```typescript
// Source: https://docs.dndkit.com/api-documentation/draggable/usedraggable
import { useDraggable } from '@dnd-kit/core';

export function GoalItem({ goal, roleColor, isEditing }: GoalItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `goal-${goal.id}`,
    data: {
      type: 'goal',
      goalId: goal.id,
      roleId: goal.roleId,
      text: goal.text,
    },
    disabled: isEditing, // Disable drag while editing
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group flex items-center gap-2 py-1 px-2 rounded-md",
        isDragging && "opacity-50"
      )}
      {...listeners}
      {...attributes}
    >
      {/* Goal content */}
    </div>
  );
}
```

### Droppable Zone Implementation
```typescript
// Source: https://docs.dndkit.com/api-documentation/droppable/usedroppable
import { useDroppable } from '@dnd-kit/core';

export function DayPriorities({ dayIndex }: DayPrioritiesProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `priorities-${dayIndex}`,
    data: {
      zone: 'priorities',
      dayIndex,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[80px] p-2 border-b border-border",
        isOver && "bg-primary/10 ring-1 ring-primary/50"
      )}
    >
      {/* Priority items */}
    </div>
  );
}
```

### Accessibility Announcements
```typescript
// Source: https://docs.dndkit.com/guides/accessibility
const announcements = {
  onDragStart({ active }) {
    const data = active.data.current as GoalDragData;
    return `Picked up goal: ${data.text}. Use arrow keys to move, Enter to drop, Escape to cancel.`;
  },
  onDragOver({ active, over }) {
    const goalData = active.data.current as GoalDragData;
    if (!over) {
      return `Goal ${goalData.text} is not over a drop zone.`;
    }
    const dropData = over.data.current as DropZoneData;
    switch (dropData.zone) {
      case 'priorities':
        return `Goal ${goalData.text} is over Day Priorities for ${DAY_NAMES[dropData.dayIndex]}.`;
      case 'timegrid':
        const time = slotToTime(dropData.slotIndex);
        return `Goal ${goalData.text} is over ${time} on ${DAY_NAMES[dropData.dayIndex]}.`;
      case 'evening':
        return `Goal ${goalData.text} is over Evening slot for ${DAY_NAMES[dropData.dayIndex]}.`;
    }
  },
  onDragEnd({ active, over }) {
    const goalData = active.data.current as GoalDragData;
    if (!over) {
      return `Goal ${goalData.text} was dropped outside a valid zone.`;
    }
    const dropData = over.data.current as DropZoneData;
    switch (dropData.zone) {
      case 'priorities':
        return `Goal ${goalData.text} added to Day Priorities for ${DAY_NAMES[dropData.dayIndex]}.`;
      case 'timegrid':
        const time = slotToTime(dropData.slotIndex);
        return `Goal ${goalData.text} scheduled at ${time} on ${DAY_NAMES[dropData.dayIndex]}.`;
      case 'evening':
        return `Goal ${goalData.text} added to Evening slot for ${DAY_NAMES[dropData.dayIndex]}.`;
    }
  },
  onDragCancel({ active }) {
    const data = active.data.current as GoalDragData;
    return `Drag cancelled. Goal ${data.text} was not moved.`;
  },
};

<DndContext announcements={announcements}>
```

## State of the Art (2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | @dnd-kit/core | Aug 2025 (rbd archived) | rbd no longer maintained; dnd-kit is the standard |
| HTML5 DnD API directly | pragmatic-drag-and-drop OR dnd-kit | 2024 | Libraries smooth over API inconsistencies |
| Class components with refs | Hooks (useDraggable, useDroppable) | 2020 | Simpler composition, better TypeScript |

**New tools/patterns to consider:**
- @dnd-kit/react (v0.2.1): New version in development, not stable yet - stick with @dnd-kit/core for now
- pragmatic-drag-and-drop: Atlassian's new library, good alternative if bundle size is critical

**Deprecated/outdated:**
- react-beautiful-dnd: Archived August 2025, do not use for new projects
- react-dnd: Still works but less active development, API more complex than dnd-kit

## Open Questions

Things that couldn't be fully resolved:

1. **React 19 Compatibility Status**
   - What we know: Some issues reported with @dnd-kit/react (new package) and React 19, but @dnd-kit/core appears to work
   - What's unclear: Whether there are subtle issues with React 19 strict mode
   - Recommendation: Test thoroughly in development; the project already uses React 19 successfully with other libraries

2. **Maintenance Trajectory**
   - What we know: Releases have slowed; community concerned about long-term maintenance
   - What's unclear: Whether maintainer will continue active development
   - Recommendation: Proceed with dnd-kit (still best option); keep eye on pragmatic-drag-and-drop as backup

3. **Block Between-Day Drag (05-04)**
   - What we know: Dragging existing blocks between days requires tracking source block ID
   - What's unclear: Whether to delete+recreate or update existing block
   - Recommendation: Update existing block (change dayIndex) to preserve IDs and any future references

## Sources

### Primary (HIGH confidence)
- [dnd-kit Official Documentation](https://docs.dndkit.com) - DndContext, useDroppable, useDraggable, collision detection, accessibility
- [dnd-kit useDroppable API](https://docs.dndkit.com/api-documentation/droppable/usedroppable) - data property, return values
- [dnd-kit Modifiers](https://docs.dndkit.com/api-documentation/modifiers) - snap-to-grid, restrict to axis
- [dnd-kit DragOverlay](https://docs.dndkit.com/api-documentation/draggable/drag-overlay) - drop animations, portal rendering

### Secondary (MEDIUM confidence)
- [LogRocket Kanban Tutorial](https://blog.logrocket.com/build-kanban-board-dnd-kit-react/) - Multi-container patterns, onDragEnd handling
- [Puck Editor Blog - Top 5 DnD Libraries 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) - Library comparison, why dnd-kit over alternatives
- [dnd-kit GitHub Issues](https://github.com/clauderic/dnd-kit/issues) - React 19 compatibility, maintenance status

### Tertiary (LOW confidence, needs validation)
- Various DEV.to and Medium articles from 2025 - Implementation examples, patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official docs confirm API, npm confirms versions
- Architecture patterns: HIGH - Based on official documentation examples
- Pitfalls: MEDIUM - Mix of official docs and community reports
- React 19 compatibility: LOW - Conflicting reports, needs testing

**Research date:** 2026-01-18
**Valid until:** 60 days (dnd-kit is stable, patterns unlikely to change rapidly)
