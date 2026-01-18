# Architecture Research

**Domain:** Weekly planning/productivity app
**Researched:** 2026-01-18
**Confidence:** HIGH (patterns verified against official documentation and established libraries)

## Executive Summary

Browser-based weekly planning apps with drag-drop calendars follow a **feature-based component architecture** with **centralized state management** (Zustand) and **IndexedDB persistence** (Dexie.js). The key architectural decisions involve:

1. **dnd-kit** for drag-drop (lightweight, extensible, React-native)
2. **Zustand** for state management (minimal boilerplate, persist middleware)
3. **Dexie.js** for IndexedDB (reactive hooks, schema versioning)
4. **Feature-based folder structure** (components grouped by business domain)

The calendar grid is built from scratch using CSS Grid, not a calendar library, because existing libraries (FullCalendar, react-big-calendar) are optimized for event scheduling rather than goal-to-time-block planning workflows.

## Standard Architecture

### System Overview

```
+------------------------------------------------------------------+
|                        Next.js App Shell                          |
|  +------------------------------------------------------------+  |
|  |                      DndContext                            |  |
|  |  +---------------+  +----------------------------------+   |  |
|  |  |   Sidebar     |  |          Calendar Grid           |   |  |
|  |  |  (Droppable)  |  |         (Droppable x N)          |   |  |
|  |  |               |  |                                  |   |  |
|  |  |  RoleList     |  |  +-------+-------+-------+       |   |  |
|  |  |   |           |  |  | Day 1 | Day 2 | Day 3 | ...   |   |  |
|  |  |   +- Role 1   |  |  +-------+-------+-------+       |   |  |
|  |  |   |  +- Goal  |  |  | Slots | Slots | Slots |       |   |  |
|  |  |   |  +- Goal  |  |  | (30m) | (30m) | (30m) |       |   |  |
|  |  |   +- Role 2   |  |  +-------+-------+-------+       |   |  |
|  |  |      +- Goal  |  |  | Time  | Time  | Time  |       |   |  |
|  |  |               |  |  | Block | Block | Block |       |   |  |
|  |  +---------------+  +----------------------------------+   |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|                              v                                    |
|  +------------------------------------------------------------+  |
|  |                     Zustand Store                          |  |
|  |  +------------------+  +------------------+                 |  |
|  |  | weekStore        |  | uiStore          |                 |  |
|  |  | - currentWeek    |  | - dragState      |                 |  |
|  |  | - roles[]        |  | - selectedBlock  |                 |  |
|  |  | - timeBlocks[]   |  | - theme          |                 |  |
|  |  +------------------+  +------------------+                 |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|                              v                                    |
|  +------------------------------------------------------------+  |
|  |                  Dexie.js (IndexedDB)                      |  |
|  |  +----------+  +----------+  +-------------+               |  |
|  |  | weeks    |  | roles    |  | timeBlocks  |               |  |
|  |  +----------+  +----------+  +-------------+               |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **DndContext** | Orchestrates drag-drop state, collision detection, sensors | `@dnd-kit/core` DndContext provider wrapping app |
| **Sidebar** | Displays roles and goals, source for drag operations | Feature component with `useDraggable` per goal |
| **RoleList** | Lists roles with collapsible goal lists | Controlled accordion, maps role data |
| **GoalItem** | Individual draggable goal | `useDraggable` hook, visual drag handle |
| **CalendarGrid** | 7-day time grid layout | CSS Grid container, generates day columns |
| **DayColumn** | Single day with time slots | Droppable zones, renders time blocks |
| **TimeSlot** | 30-minute droppable zone | `useDroppable`, collision detection target |
| **TimeBlock** | Scheduled block (goal or freestyle) | Draggable + resizable, displays content |
| **DayPriorities** | Priority goals for day (top section) | Droppable list at top of each day |
| **EveningSlot** | Below-grid evening area | Special droppable zone after time grid |
| **WeekStore** | Week data state management | Zustand store with persist middleware |
| **UIStore** | Transient UI state (drag, selection) | Zustand store (no persistence) |
| **Database** | IndexedDB abstraction | Dexie.js with versioned schema |

## Recommended Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Main planner page
│   └── globals.css               # Global styles, CSS variables
│
├── components/                   # Shared/primitive components
│   ├── ui/                       # Generic UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   └── dnd/                      # Drag-drop primitives
│       ├── DraggableItem.tsx     # Reusable draggable wrapper
│       ├── DroppableZone.tsx     # Reusable droppable wrapper
│       └── DragOverlay.tsx       # Custom drag overlay
│
├── features/                     # Feature-based organization
│   ├── sidebar/                  # Role sidebar feature
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── RoleList.tsx
│   │   │   ├── RoleItem.tsx
│   │   │   └── GoalItem.tsx
│   │   ├── hooks/
│   │   │   └── useSidebarDrag.ts
│   │   └── index.ts              # Public exports
│   │
│   ├── calendar/                 # Calendar grid feature
│   │   ├── components/
│   │   │   ├── CalendarGrid.tsx
│   │   │   ├── DayColumn.tsx
│   │   │   ├── TimeSlot.tsx
│   │   │   ├── TimeBlock.tsx
│   │   │   ├── DayPriorities.tsx
│   │   │   └── EveningSlot.tsx
│   │   ├── hooks/
│   │   │   ├── useTimeSlots.ts   # Generate time slot data
│   │   │   ├── useBlockResize.ts # Handle block resizing
│   │   │   └── useCalendarDrop.ts
│   │   ├── utils/
│   │   │   ├── timeUtils.ts      # Time calculations
│   │   │   └── slotUtils.ts      # Slot positioning
│   │   └── index.ts
│   │
│   └── week/                     # Week management feature
│       ├── components/
│       │   ├── WeekHeader.tsx
│       │   └── WeekNavigation.tsx
│       ├── hooks/
│       │   └── useWeekNavigation.ts
│       └── index.ts
│
├── stores/                       # Zustand stores
│   ├── weekStore.ts              # Week/role/goal/block data
│   ├── uiStore.ts                # UI state (drag, selection, theme)
│   └── index.ts
│
├── db/                           # Database layer
│   ├── schema.ts                 # Dexie schema definition
│   ├── database.ts               # Database instance
│   ├── hooks/                    # Database query hooks
│   │   ├── useWeek.ts
│   │   ├── useRoles.ts
│   │   └── useTimeBlocks.ts
│   └── migrations/               # Schema migrations
│       └── v1.ts
│
├── lib/                          # Utilities and helpers
│   ├── dates.ts                  # Date manipulation (date-fns)
│   ├── ids.ts                    # ID generation (nanoid)
│   └── constants.ts              # App constants
│
├── types/                        # TypeScript types
│   ├── week.ts                   # Week, Role, Goal types
│   ├── calendar.ts               # TimeBlock, Slot types
│   └── dnd.ts                    # Drag-drop types
│
└── providers/                    # React context providers
    ├── DndProvider.tsx           # DndContext configuration
    ├── ThemeProvider.tsx         # Light/dark mode
    └── index.tsx                 # Combined providers
```

## Architectural Patterns

### Pattern 1: Centralized DndContext with Data-Driven Drops

**What:** Single DndContext wrapping the entire app, with drop behavior determined by data attributes rather than component hierarchy.

**When to use:** When draggables can move between different container types (sidebar to calendar, calendar to calendar).

**Why:** Avoids nested DndContext complexity; all drag-drop logic lives in one place.

**Example:**
```typescript
// providers/DndProvider.tsx
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { useWeekStore } from '@/stores/weekStore';

export function DndProvider({ children }: { children: React.ReactNode }) {
  const { addTimeBlock, moveTimeBlock } = useWeekStore();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    // Data-driven: check what type of drag this is
    const dragType = active.data.current?.type;
    const dropType = over.data.current?.type;

    if (dragType === 'goal' && dropType === 'time-slot') {
      // Goal dragged from sidebar to calendar
      addTimeBlock({
        goalId: active.data.current.goalId,
        roleId: active.data.current.roleId,
        slotId: over.id,
        dayIndex: over.data.current.dayIndex,
        startTime: over.data.current.time,
        duration: 60, // default 1 hour
      });
    } else if (dragType === 'time-block' && dropType === 'time-slot') {
      // Existing block moved to new slot
      moveTimeBlock({
        blockId: active.id,
        newSlotId: over.id,
        newDayIndex: over.data.current.dayIndex,
        newStartTime: over.data.current.time,
      });
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}
```

### Pattern 2: Zustand Store with Dexie Sync

**What:** Zustand manages in-memory state; changes sync to IndexedDB. useLiveQuery provides reactive reads.

**When to use:** When you need fast UI updates with durable persistence.

**Why:** Zustand gives instant updates; Dexie provides persistence and complex queries.

**Example:**
```typescript
// stores/weekStore.ts
import { create } from 'zustand';
import { db } from '@/db/database';
import type { Week, Role, TimeBlock } from '@/types/week';

interface WeekState {
  currentWeekId: string | null;
  roles: Role[];
  timeBlocks: TimeBlock[];

  // Actions
  loadWeek: (weekId: string) => Promise<void>;
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => Promise<void>;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => Promise<void>;
  deleteTimeBlock: (id: string) => Promise<void>;
}

export const useWeekStore = create<WeekState>((set, get) => ({
  currentWeekId: null,
  roles: [],
  timeBlocks: [],

  loadWeek: async (weekId: string) => {
    const [roles, timeBlocks] = await Promise.all([
      db.roles.where('weekId').equals(weekId).toArray(),
      db.timeBlocks.where('weekId').equals(weekId).toArray(),
    ]);
    set({ currentWeekId: weekId, roles, timeBlocks });
  },

  addTimeBlock: async (blockData) => {
    const id = nanoid();
    const block: TimeBlock = { ...blockData, id };

    // Optimistic update
    set(state => ({ timeBlocks: [...state.timeBlocks, block] }));

    // Persist to IndexedDB
    await db.timeBlocks.add(block);
  },

  updateTimeBlock: async (id, updates) => {
    // Optimistic update
    set(state => ({
      timeBlocks: state.timeBlocks.map(b =>
        b.id === id ? { ...b, ...updates } : b
      ),
    }));

    // Persist
    await db.timeBlocks.update(id, updates);
  },

  deleteTimeBlock: async (id) => {
    set(state => ({
      timeBlocks: state.timeBlocks.filter(b => b.id !== id),
    }));
    await db.timeBlocks.delete(id);
  },
}));
```

### Pattern 3: Time Slot Grid with CSS Grid

**What:** Generate time slots programmatically; use CSS Grid for layout.

**When to use:** Custom time grids with specific granularity (30-min slots, 8:00-20:00 range).

**Why:** Calendar libraries are designed for events, not planning workflows; custom grid gives full control.

**Example:**
```typescript
// features/calendar/hooks/useTimeSlots.ts
import { useMemo } from 'react';

interface TimeSlot {
  id: string;
  time: string; // "08:00", "08:30", etc.
  hour: number;
  minute: number;
  gridRow: number;
}

export function useTimeSlots(startHour = 8, endHour = 20) {
  return useMemo(() => {
    const slots: TimeSlot[] = [];
    let gridRow = 1;

    for (let hour = startHour; hour < endHour; hour++) {
      for (const minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          id: `slot-${time}`,
          time,
          hour,
          minute,
          gridRow,
        });
        gridRow++;
      }
    }
    return slots;
  }, [startHour, endHour]);
}
```

```typescript
// features/calendar/components/DayColumn.tsx
import { useDroppable } from '@dnd-kit/core';
import { useTimeSlots } from '../hooks/useTimeSlots';
import { TimeSlot } from './TimeSlot';
import { TimeBlock } from './TimeBlock';

interface DayColumnProps {
  dayIndex: number;
  date: Date;
  timeBlocks: TimeBlock[];
}

export function DayColumn({ dayIndex, date, timeBlocks }: DayColumnProps) {
  const slots = useTimeSlots();

  return (
    <div className="day-column" style={{
      display: 'grid',
      gridTemplateRows: `repeat(${slots.length}, 30px)`,
    }}>
      {slots.map(slot => (
        <TimeSlot
          key={slot.id}
          slot={slot}
          dayIndex={dayIndex}
        />
      ))}

      {/* Render time blocks positioned absolutely within grid */}
      {timeBlocks.map(block => (
        <TimeBlock
          key={block.id}
          block={block}
          slots={slots}
        />
      ))}
    </div>
  );
}
```

### Pattern 4: Block Resizing with Pointer Events

**What:** Handle resize by tracking pointer movement and snapping to 30-min increments.

**When to use:** Time blocks need to be resizable from edges.

**Why:** dnd-kit handles movement; resize needs custom pointer handling.

**Example:**
```typescript
// features/calendar/hooks/useBlockResize.ts
import { useState, useCallback, useRef } from 'react';

interface UseBlockResizeOptions {
  minDuration: number; // 30 minutes
  maxDuration: number; // 480 minutes (8 hours)
  slotHeight: number;  // pixels per 30-min slot
  onResize: (newDuration: number) => void;
}

export function useBlockResize({
  minDuration,
  maxDuration,
  slotHeight,
  onResize,
}: UseBlockResizeOptions) {
  const [isResizing, setIsResizing] = useState(false);
  const startY = useRef(0);
  const startDuration = useRef(0);

  const handleResizeStart = useCallback((e: React.PointerEvent, currentDuration: number) => {
    e.stopPropagation();
    setIsResizing(true);
    startY.current = e.clientY;
    startDuration.current = currentDuration;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handleResizeMove = useCallback((e: React.PointerEvent) => {
    if (!isResizing) return;

    const deltaY = e.clientY - startY.current;
    const deltaSlots = Math.round(deltaY / slotHeight);
    const deltaDuration = deltaSlots * 30;

    let newDuration = startDuration.current + deltaDuration;
    newDuration = Math.max(minDuration, Math.min(maxDuration, newDuration));

    onResize(newDuration);
  }, [isResizing, slotHeight, minDuration, maxDuration, onResize]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  return {
    isResizing,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
  };
}
```

## Data Flow

### Creating a Time Block from Goal

```
User Action: Drag goal from sidebar to calendar slot
                          |
                          v
+------------------+     +------------------+     +------------------+
| GoalItem         | --> | DndContext       | --> | handleDragEnd()  |
| useDraggable     |     | onDragEnd event  |     | Extract data     |
| data: {          |     | active: goal     |     | from active/over |
|   type: 'goal',  |     | over: time-slot  |     |                  |
|   goalId, roleId |     |                  |     |                  |
| }                |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
                                                          |
                                                          v
+------------------+     +------------------+     +------------------+
| UI Re-render     | <-- | weekStore        | --> | db.timeBlocks   |
| DayColumn shows  |     | addTimeBlock()   |     | .add(block)     |
| new TimeBlock    |     | Optimistic update|     | Persist to IDB  |
+------------------+     +------------------+     +------------------+
```

### Loading Week Data

```
App Mount / Week Navigation
            |
            v
+------------------+     +------------------+     +------------------+
| useEffect in     | --> | weekStore        | --> | Dexie db        |
| page.tsx         |     | loadWeek(weekId) |     | .roles.where()  |
| getOrCreateWeek()|     |                  |     | .timeBlocks...  |
+------------------+     +------------------+     +------------------+
            |                    |                        |
            v                    v                        v
+------------------+     +------------------+     +------------------+
| Check if week    |     | set({            |     | Return Week,    |
| exists in IDB    |     |   roles,         |     | Role[], Block[] |
| Create if not    |     |   timeBlocks     |     |                 |
+------------------+     | })               |     +------------------+
                         +------------------+
                                |
                                v
                    Components re-render with data
```

### State Management Architecture

```
+---------------------------------------------------------------+
|                        React Components                        |
+---------------------------------------------------------------+
        |                    |                    |
        v                    v                    v
+---------------+    +---------------+    +---------------+
| useWeekStore  |    | useUIStore    |    | useLiveQuery  |
| (Zustand)     |    | (Zustand)     |    | (Dexie React) |
| - roles       |    | - dragState   |    | - Reactive    |
| - timeBlocks  |    | - theme       |    |   DB queries  |
| - actions     |    | - selectedId  |    |               |
+---------------+    +---------------+    +---------------+
        |                                         |
        v                                         v
+---------------------------------------------------------------+
|                    Dexie.js (IndexedDB)                       |
|  +----------+  +----------+  +-------------+  +------------+  |
|  | weeks    |  | roles    |  | goals       |  | timeBlocks |  |
|  | id, date |  | weekId   |  | roleId      |  | weekId     |  |
|  |          |  | name     |  | title       |  | goalId?    |  |
|  |          |  | color    |  |             |  | dayIndex   |  |
|  |          |  | order    |  |             |  | startTime  |  |
|  +----------+  +----------+  +-------------+  | duration   |  |
|                                               | type       |  |
|                                               +------------+  |
+---------------------------------------------------------------+
```

## IndexedDB Schema Design

```typescript
// db/schema.ts
import Dexie, { Table } from 'dexie';

export interface Week {
  id: string;           // "2026-W03" format
  startDate: string;    // ISO date of Monday
  createdAt: number;
}

export interface Role {
  id: string;
  weekId: string;
  name: string;
  color: string;        // hex color
  order: number;        // display order
}

export interface Goal {
  id: string;
  roleId: string;
  weekId: string;       // denormalized for query efficiency
  title: string;
  order: number;
}

export interface TimeBlock {
  id: string;
  weekId: string;
  goalId: string | null;  // null for freestyle blocks
  roleId: string | null;  // null for freestyle blocks
  dayIndex: number;       // 0-6 (Mon-Sun)
  startTime: string;      // "08:00" format
  duration: number;       // minutes (30-480)
  type: 'goal' | 'freestyle';
  title: string | null;   // only for freestyle blocks
}

export class PlannerDatabase extends Dexie {
  weeks!: Table<Week>;
  roles!: Table<Role>;
  goals!: Table<Goal>;
  timeBlocks!: Table<TimeBlock>;

  constructor() {
    super('first-things-first');

    this.version(1).stores({
      weeks: 'id, startDate',
      roles: 'id, weekId, order',
      goals: 'id, roleId, weekId, order',
      timeBlocks: 'id, weekId, goalId, dayIndex, [weekId+dayIndex]',
    });
  }
}

export const db = new PlannerDatabase();
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Nested DndContexts

**What goes wrong:** Creating separate DndContexts for sidebar and calendar.

**Why it's bad:** Draggables cannot cross context boundaries; requires complex communication between contexts.

**What to do instead:** Single DndContext at app root; use data attributes to determine drop behavior.

### Anti-Pattern 2: Storing UI State in IndexedDB

**What goes wrong:** Persisting drag state, selected items, or modal visibility to IndexedDB.

**Why it's bad:** Causes unnecessary writes, stale UI on reload, complexity.

**What to do instead:** Separate stores: weekStore (persisted) and uiStore (memory only).

### Anti-Pattern 3: Recalculating Time Slots on Every Render

**What goes wrong:** Generating slot arrays inline without memoization.

**Why it's bad:** Creates new objects on every render, causes unnecessary child re-renders.

**What to do instead:** useMemo for slot generation; stable references for slot data.

### Anti-Pattern 4: Direct IndexedDB Calls in Components

**What goes wrong:** Calling `db.timeBlocks.add()` directly in event handlers.

**Why it's bad:** No optimistic updates; UI feels slow; no centralized state.

**What to do instead:** Actions in Zustand store that update state optimistically, then persist.

### Anti-Pattern 5: Using Calendar Libraries for Planning UI

**What goes wrong:** Using FullCalendar or react-big-calendar for weekly planning.

**Why it's bad:** These libraries are built for event viewing, not goal-to-block workflows. Fighting their assumptions leads to hacks.

**What to do instead:** Build custom time grid with CSS Grid; it is less code than customizing a calendar library.

## Build Order Implications

Based on component dependencies, the recommended build order is:

### Phase 1: Foundation
Build order rationale: These have no dependencies and are needed by everything else.

1. **Types** (`types/`) - Define Week, Role, Goal, TimeBlock types
2. **Database schema** (`db/schema.ts`) - Dexie schema and instance
3. **Zustand stores** (`stores/`) - State management with persist
4. **Theme/styling foundation** - CSS variables, dark mode setup

### Phase 2: Core Components
Build order rationale: UI primitives needed by features.

1. **UI primitives** (`components/ui/`) - Button, Card, Modal
2. **DnD primitives** (`components/dnd/`) - Reusable draggable/droppable wrappers
3. **DndProvider** - App-level drag-drop context

### Phase 3: Calendar Grid (Core Feature)
Build order rationale: Most complex feature; sidebar depends on understanding drop targets.

1. **CalendarGrid** - Container layout
2. **DayColumn** - Single day structure
3. **TimeSlot** - Droppable zones (no drag handling yet)
4. **TimeBlock** - Display only (no drag/resize yet)

### Phase 4: Sidebar
Build order rationale: Source of drags; needs drop targets to exist.

1. **Sidebar** - Container
2. **RoleList/RoleItem** - Role display
3. **GoalItem** - Draggable goals

### Phase 5: Interactions
Build order rationale: Connect everything; requires both sources and targets.

1. **Goal-to-calendar drag** - handleDragEnd for new blocks
2. **Block movement** - Drag existing blocks to new slots
3. **Block resizing** - Pointer-based resize handling
4. **Freestyle block creation** - Click-to-create in empty slots

### Phase 6: Polish
Build order rationale: Enhancement layer on working foundation.

1. **DayPriorities** - Top-of-day priority section
2. **EveningSlot** - Below-grid evening area
3. **WeekNavigation** - Week switching
4. **Visual polish** - JARVIS aesthetic, animations

## Sources

### Primary (HIGH confidence)
- [dnd-kit Official Documentation](https://docs.dndkit.com) - Core architecture, hooks, patterns
- [Zustand Persist Middleware](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) - IndexedDB integration
- [Dexie.js Documentation](https://dexie.org/docs/Dexie.js) - Schema definition, React hooks
- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) - App Router conventions

### Secondary (MEDIUM confidence)
- [dnd-kit GitHub Discussion #809](https://github.com/clauderic/dnd-kit/discussions/809) - Complex interactions pattern (sidebar to canvas)
- [Feature-Based Architecture Guide](https://medium.com/@nishibuch25/scaling-react-next-js-apps-a-feature-based-architecture-that-actually-works-c0c89c25936d) - Folder structure patterns
- [Zustand IndexedDB Discussion](https://github.com/pmndrs/zustand/discussions/1721) - idb-keyval integration pattern

### Tertiary (LOW confidence - patterns from multiple blog sources)
- Time grid component patterns synthesized from Syncfusion, Mobiscroll, and DayPilot documentation
- React architecture patterns from GeeksforGeeks and Medium articles (cross-verified with official React docs)
