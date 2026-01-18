# Pitfalls Research

**Domain:** Drag-drop calendar/productivity app with IndexedDB persistence
**Researched:** 2026-01-18
**Confidence:** HIGH (verified across multiple authoritative sources)

## Critical Pitfalls

### 1. Safari IndexedDB Data Eviction (7-Day Rule)

**What goes wrong:** Safari's Intelligent Tracking Prevention (ITP) deletes all browser storage (including IndexedDB) after 7 days of user inactivity. Users return to find their data gone.

**Why it happens:** Safari treats script-writable storage as potentially trackable, applying anti-tracking heuristics that weren't designed with offline-first apps in mind.

**How to avoid:**
- Call `navigator.storage.persist()` on first use and handle the response
- Display clear UI indicating persistence status ("Data saved locally" vs "Data may be cleared")
- Implement export/backup functionality as a safety net
- Consider PWA installation prompt (home screen apps are exempt from eviction)

**Warning signs:**
- No persistence request in initialization code
- No user feedback about storage status
- Safari-specific bug reports about missing data

**Phase to address:** Phase 1 (Data Layer) - Must be built into storage initialization from day one.

---

### 2. Drag-and-Drop Performance Collapse (>100 Drop Targets)

**What goes wrong:** With many draggable/droppable elements (e.g., 48 half-hour slots x 7 days = 336 drop targets), drag operations become sluggish. The UI lags, frame rates drop, and the app feels broken.

**Why it happens:** Most React DnD libraries re-render all draggable/droppable components when any drag state changes. The collect functions fire on every drag move event.

**How to avoid:**
- Use `React.memo` or `PureComponent` for all draggable/droppable wrappers
- Create stable references (pass entire data objects, not dynamically-created arrays)
- Consider dnd-kit or pragmatic-drag-and-drop over deprecated react-beautiful-dnd
- Implement "inner list" pattern to prevent child re-renders
- Profile with React DevTools during drag operations

**Warning signs:**
- Visible lag when starting a drag
- Chrome DevTools showing high scripting time during drags
- Console warnings about slow renders

**Phase to address:** Phase 2 (Calendar Grid) - Architecture decision for DnD library. Phase 3 (Drag-Drop) - Optimization during implementation.

---

### 3. Snap-to-Grid Inconsistency

**What goes wrong:** Dragging a block that started at 2:15 PM snaps to 2:45, 3:15, 3:45 instead of 2:30, 3:00, 3:30. Users get confused why snapping behaves differently for different blocks.

**Why it happens:** Some libraries calculate snap relative to the block's current start time rather than absolute grid positions.

**How to avoid:**
- Snap to absolute grid positions (00, 30) not relative offsets
- Calculate drop position as: `Math.round(dropY / slotHeight) * slotHeight`
- Test with blocks starting at various times (on-hour, 15-past, 30-past, 45-past)
- Verify resize also snaps to absolute 30-min boundaries

**Warning signs:**
- QA only tests blocks that start on the hour
- No unit tests for snap calculation
- Snap calculation uses the block's current position as reference

**Phase to address:** Phase 3 (Drag-Drop) - Core to drag implementation.

---

### 4. IndexedDB Transaction Auto-Close (Safari)

**What goes wrong:** Safari closes IndexedDB transactions more aggressively when there's "idle time" in the call stack. Async operations with Promise chains fail silently or throw unexpected errors.

**Why it happens:** Safari interprets the IndexedDB spec differently than Chrome/Firefox. Using `Promise.resolve().then()` or awaiting non-IDB promises can cause the transaction to close prematurely.

**How to avoid:**
- Use a wrapper library (Dexie.js or idb) that handles these edge cases
- Never mix IDB operations with non-IDB async operations in the same transaction
- Keep transactions short - read/compute/write in separate transactions if needed
- Add explicit error handling for transaction abort events

**Warning signs:**
- Data saves work in Chrome but fail silently in Safari
- "TransactionInactiveError" in Safari console
- Intermittent data loss reports from Safari users

**Phase to address:** Phase 1 (Data Layer) - Library choice and patterns from the start.

---

### 5. Collision Detection Edge Cases

**What goes wrong:** Users can create overlapping blocks through edge cases: simultaneous drags, rapid resizing, or blocks that span DST transitions. "No overlapping" invariant breaks silently.

**Why it happens:** Simple `(start1 < end2 && start2 < end1)` collision check misses concurrent operations and boundary conditions.

**How to avoid:**
- Validate on both preview and commit (not just one)
- Include boundary in check: blocks ending at 2:00 shouldn't block slots starting at 2:00
- Implement optimistic UI with server-style conflict resolution
- Add integrity check that runs on load and periodically

**Warning signs:**
- Only visual preview prevents overlap, no backend validation
- No test cases for concurrent drag operations
- DST transitions not considered in time calculations

**Phase to address:** Phase 3 (Drag-Drop) - Collision detection during drag implementation. Phase 4 (Time Blocks) - Resize adds new collision scenarios.

---

### 6. Week Transition Data Loss

**What goes wrong:** When transitioning to a new week, uncompleted goals disappear or are duplicated. Users lose track of what carried over vs what's new.

**Why it happens:** Week snapshot model without clear carryover semantics. Race conditions when multiple tabs are open. No clear "source of truth" for goal completion status.

**How to avoid:**
- Define explicit carryover rules before building (automatic vs manual)
- Store goals with their origin week reference (for lineage tracking)
- Implement week transition as an explicit user action, not automatic
- Add UI to show "carried from last week" indicator
- Handle multi-tab scenarios with Web Locks API

**Warning signs:**
- No written specification for week transition behavior
- Goals stored with only current-week reference
- No visual distinction between new and carried-over goals

**Phase to address:** Phase 5 (Goal Management) - Core to goal lifecycle. Phase 6 (Weekly Workflow) - Week transition implementation.

---

### 7. Theme Flash on Load (FOUC)

**What goes wrong:** Page loads with wrong theme (usually light), then flashes to correct theme (dark) when React hydrates. Jarring user experience.

**Why it happens:** Theme preference is read from localStorage after React hydrates, causing a repaint.

**How to avoid:**
- Use inline script in `<head>` to set `data-theme` attribute before body renders
- For Next.js: use `next-themes` which handles this correctly
- Store theme in both localStorage and a cookie for SSR access
- Set `color-scheme` CSS property for native element theming

**Warning signs:**
- Theme logic only in React components, no head script
- Visible flash when switching between tabs
- No blocking script in document head

**Phase to address:** Phase 7 (Polish) - But architecture decision (CSS variables vs styled-components) needed earlier in Phase 2.

---

### 8. Resize Handle Touch Target Too Small

**What goes wrong:** Users struggle to grab resize handles, especially the bottom edge of short blocks. Rage-tapping ensues. Accessibility failures.

**Why it happens:** Designers make handles small for aesthetics. 30-minute blocks at typical scale have very little vertical space.

**How to avoid:**
- Minimum 24x24px touch target (WCAG 2.2 AA), prefer 44x44px
- Extend hit area beyond visible handle (invisible touch padding)
- Add visual feedback on hover/focus before drag starts
- Consider dedicated resize mode activated by click, not just drag
- Test at minimum block size (30 minutes)

**Warning signs:**
- Resize handles are CSS borders or single-pixel lines
- No hover state on resize affordance
- Users accidentally selecting text instead of resizing

**Phase to address:** Phase 4 (Time Blocks) - Resize handle implementation.

---

### 9. No Undo for Destructive Actions

**What goes wrong:** User accidentally deletes a block or drops a goal in the wrong slot. No way to recover without starting over.

**Why it happens:** Undo is complex and "can be added later." Later never comes.

**How to avoid:**
- Plan state history architecture from the start
- Use immutable state patterns (Immer) that make undo trivial
- Consider libraries: zundo (for Zustand), use-travel, or Redux undo
- At minimum, implement single-level undo for delete operations
- Provide "shake to undo" or keyboard shortcut (Cmd+Z)

**Warning signs:**
- State mutations happen directly, not through actions
- No confirmation dialogs for destructive operations
- Delete is immediate with no recovery path

**Phase to address:** Phase 3 (Drag-Drop) - State management architecture. Phase 4 (Time Blocks) - Delete/resize undo.

---

### 10. IndexedDB Schema Migration Failures

**What goes wrong:** App update changes data schema but migration fails, leaving users with corrupted or inaccessible data.

**Why it happens:** IndexedDB's `onupgradeneeded` is poorly understood. Migrations not tested. Multi-tab scenarios cause version conflicts.

**How to avoid:**
- Always increment version number for schema changes
- Use sequential `if (oldVersion < N)` blocks, not switch statements
- Handle `onblocked` event (another tab has DB open)
- Test migrations from every previous version, not just latest
- Keep migration code forever (users may skip versions)
- Store schema version in data for verification

**Warning signs:**
- No `onupgradeneeded` handler or it's a stub
- Migrations not tested with real old-version data
- No handling for blocked upgrade scenario

**Phase to address:** Phase 1 (Data Layer) - Schema and migration patterns from day one.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|------------------|----------------|-----------------|
| Raw IndexedDB API | No library dependency | Verbose, error-prone, Safari issues | Never - use Dexie or idb |
| Inline styles for positioning | Quick to implement | Hard to theme, performance issues | Prototyping only |
| Single global time zone (UTC) | Simpler date math | Breaks for traveling users, DST edge cases | If explicitly designed as local-only |
| No block lineage tracking | Simpler data model | Can't trace goal progress, analytics useless | Never for productivity app |
| Mutable state updates | Less boilerplate | Undo impossible, subtle bugs | Never in drag-drop context |
| setTimeout for debouncing | Works immediately | Memory leaks, race conditions | Use lodash.debounce or useDebouncedCallback |
| CSS class toggling for themes | Quick to implement | Flash on load, hard to extend | Use CSS variables from start |
| Local state for dragging | Simple implementation | Can't coordinate multi-element drags | Fine for single-item drags |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|---------------|------------------|
| dnd-kit + Calendar Grid | Using one Droppable per slot (100s of drop targets) | Single droppable with coordinate-based drop detection |
| IndexedDB + React State | Syncing on every render | Sync on mount + specific mutation actions only |
| CSS Variables + Next.js | Setting in useEffect (causes flash) | Inline script in _document.tsx or use next-themes |
| Week navigation + IDB | Loading all weeks into memory | Load current week only, lazy-load adjacent |
| Resize handles + Block render | Re-rendering entire block on resize preview | Separate resize preview layer from block content |
| External drop (sidebar) + Calendar | Different DnD systems for sidebar vs calendar | Unified DnD context wrapping both |
| Dark mode + Time grid | Hardcoded colors in grid lines | All colors via CSS variables |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-rendering all blocks on any drag | Visible lag, high CPU during drag | Memoize aggressively, use stable keys | ~50+ blocks visible |
| IndexedDB read on every render | Sluggish UI, battery drain | Load once, update incrementally | Any production use |
| Unthrottled resize handlers | Choppy resize, dropped frames | requestAnimationFrame or throttle to 16ms | Any resize interaction |
| Massive state objects | Slow undo, memory pressure | Normalize state, store diffs not snapshots | ~100+ operations in history |
| CSS-in-JS theme recalculation | Flash on theme toggle, slow paint | CSS variables, single class toggle | Any theme implementation |
| Synchronous IDB operations blocking UI | Frozen UI during saves | Always use async, show save indicator | Large data operations |
| Day/week render without virtualization | Scroll lag, memory bloat | Only relevant if scrollable view (not fixed week) | Long time ranges |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visual feedback during drag | Users unsure if drag started | Ghost preview + drop zone highlight immediately |
| Snap on release only | Confusing where block will land | Preview snaps while dragging |
| Delete without confirmation | Accidental data loss | Undo capability or "trash" with recovery period |
| Silent save failures | Data loss without awareness | Toast notification + retry UI |
| Theme ignores system preference | User must set manually | Default to `prefers-color-scheme`, allow override |
| No keyboard navigation | Accessibility failure | Tab through blocks, arrow keys for time adjustment |
| Week navigation loses scroll position | Disorienting after navigation | Maintain scroll position or scroll to "now" |
| Resize handles invisible until hover | Hard to discover | Subtle always-visible affordance |
| Goal completion without feedback | Unsatisfying, uncertain if it worked | Animation, sound, or confetti for completion |
| Block too short to show content | Unreadable 30-min blocks | Minimum content display or expand on hover |

---

## "Looks Done But Isn't" Checklist

Functionality that's commonly declared complete prematurely:

- [ ] **Drag-drop works** - But not tested with 100+ blocks visible
- [ ] **Blocks don't overlap** - But not tested with concurrent drags or rapid operations
- [ ] **Data persists** - But not tested in Safari, not tested after 7 days inactivity
- [ ] **Resize works** - But not tested at minimum (30min) and maximum (8hr) sizes
- [ ] **Theme toggles** - But flashes on cold load
- [ ] **Week navigation works** - But scroll position resets, carried-over goals disappear
- [ ] **Undo works** - But only for the last action, not for drag operations
- [ ] **Keyboard accessible** - But drag-drop has no keyboard alternative
- [ ] **Goals persist** - But lineage/origin week not tracked
- [ ] **Schema migrations work** - But not tested from old versions with real data
- [ ] **Multi-tab works** - But no conflict handling for simultaneous edits
- [ ] **Export works** - But no way to import the export
- [ ] **Block shows role color** - But deleted role leaves orphan color reference

---

## Pitfall-to-Phase Mapping

| Phase | Critical Pitfalls to Address | Verification Method |
|-------|-----------------------------|--------------------|
| **Phase 1: Data Layer** | Safari eviction (#1), Transaction auto-close (#4), Schema migration (#10) | Test in Safari with persistence check, multi-tab test |
| **Phase 2: Calendar Grid** | Performance foundation, CSS variables setup, Theme flash prevention (#7) | Profile with 336 slots (week view), test theme on cold load |
| **Phase 3: Drag-Drop** | DnD performance (#2), Snap consistency (#3), Collision detection (#5), State/undo architecture (#9) | Drag test with 50+ existing blocks, snap tests at various start times |
| **Phase 4: Time Blocks** | Resize handle size (#8), Collision on resize (#5), Undo for resize (#9) | Test resize at 30min block, WCAG touch target audit |
| **Phase 5: Goals** | Week transition (#6), Block lineage tracking, Role deletion orphans | Week transition test with uncompleted goals |
| **Phase 6: Weekly Workflow** | Multi-tab conflicts, Carryover duplication (#6) | Multi-tab editing test |
| **Phase 7: Polish** | Theme flash fix if not done (#7), Keyboard navigation, Accessibility audit | Lighthouse accessibility, keyboard-only navigation test |

---

## Sources

### Primary (HIGH confidence)
- [MDN: Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [MDN: Storage Quotas and Eviction Criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [WebKit: Updates to Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/)
- [W3C WCAG 2.5.8: Target Size Minimum](https://w3c.github.io/wcag/understanding/target-size-minimum.html)
- [NN/Group: Drag and Drop Design](https://www.nngroup.com/articles/drag-drop/)
- [dnd-kit Documentation](https://dndkit.com/)
- [FullCalendar Event Dragging & Resizing](https://fullcalendar.io/docs/event-dragging-resizing)

### Secondary (MEDIUM confidence)
- [GitHub: IndexedDB Pain Points](https://gist.github.com/pesterhazy/4de96193af89a6dd5ce682ce2adff49a) - Community-documented issues, verified against MDN
- [Josh W. Comeau: The Quest for the Perfect Dark Mode](https://www.joshwcomeau.com/react/dark-mode/)
- [React DnD GitHub Issues on Performance](https://github.com/react-dnd/react-dnd/issues/421)
- [dnd-kit GitHub Issues on Re-renders](https://github.com/clauderic/dnd-kit/issues/389)
- [Puck Editor: Top 5 DnD Libraries 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)
- [Smart Interface Design Patterns: Drag-and-Drop UX](https://smart-interface-design-patterns.com/articles/drag-and-drop-ux/)
- [Dexie.js: Main Limitations of IndexedDB](https://dexie.org/docs/The-Main-Limitations-of-IndexedDB)

### Tertiary (LOW confidence - patterns observed, needs project-specific validation)
- Week transition carryover patterns (aggregated from multiple task app user forums)
- 30-minute snap inconsistency (observed in FullCalendar issue tracker)
