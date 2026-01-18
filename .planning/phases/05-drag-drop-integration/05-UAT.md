---
status: complete
phase: 05-drag-drop-integration
source: [05-01-SUMMARY.md, 05-02-SUMMARY.md, 05-03-SUMMARY.md, 05-04-SUMMARY.md]
started: 2026-01-18T19:00:00Z
updated: 2026-01-18T19:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Goal drag starts from sidebar
expected: Hover over a goal in the sidebar. Cursor shows grab hand. Click and drag - after moving 8px, the goal becomes semi-transparent (opacity reduced) and a floating preview appears under your cursor showing the goal text with its role color.
result: pass

### 2. Drop goal on Day Priorities
expected: Drag a goal from sidebar and drop it onto a day's "Day Priorities" section at the top. The section highlights while hovering over it. On drop, the goal appears in that section with the role's color accent and the goal text.
result: pass

### 3. Priority item shows delete
expected: Hover over a priority item in Day Priorities. A delete (X) button appears. Clicking it removes the priority from that day.
result: pass

### 4. Drop goal on time slot creates block
expected: Drag a goal from sidebar and drop it onto a time slot in the calendar grid (e.g., 10:00). A 1-hour block appears starting at that slot, showing the goal text and the role's color as a left border accent.
result: pass

### 5. Time block shows delete
expected: Hover over a time block. A delete (X) button appears. Clicking it removes the block from the calendar.
result: pass

### 6. Drop goal on evening slot
expected: Drag a goal from sidebar to the evening section below the time grid. On drop, an evening block appears with the goal text and role color.
result: pass

### 7. Evening block shows delete
expected: Hover over an evening block. A delete (X) button appears. Clicking it removes the evening block.
result: pass

### 8. Same goal multiple placements
expected: Drag the same goal multiple times - drop it on Day Priorities, drop it on a time slot, drop it on evening. All three instances coexist independently (the goal remains in the sidebar and appears in all three locations).
result: pass
note: "Fixed swoosh-back animation (commit 88941b4)"

### 9. Time block is draggable
expected: Hover over an existing time block. Cursor shows grab hand. Click and drag - the block becomes semi-transparent and a floating preview appears.
result: pass

### 10. Move block to different slot
expected: Drag an existing time block and drop it on a different time slot (same day or different day). The block moves to the new position, keeping its duration (1 hour if that's what it was).
result: pass

### 11. Drop zone highlights
expected: While dragging any item (goal or block), hovering over valid drop zones shows visual highlight feedback (subtle background color change and ring/border).
result: issue
reported: "Visual feedback when dragging over zones is inaccurate. Even tho the block is 1 hour, the feedback is only 30 mins"
severity: minor

## Summary

total: 11
passed: 10
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "Drop zone highlight should indicate actual block size"
  status: deferred
  reason: "User reported: 1-hour block drop shows only 30-min highlight, misleading. Deferred to Phase 6 (Time Block Interactions) which handles block sizing and collision preview."
  severity: minor
  test: 11

## Fixes Applied During UAT

1. **Infinite loop with parameterized selectors** (commit dd4bab1)
   - Issue: DayPriorities and TimeGrid caused infinite re-renders
   - Fix: Use useMemo for filtering instead of selectors returning new arrays

2. **Swoosh-back animation on goal drops** (commit 88941b4)
   - Issue: Goals showed cancel-like animation on successful drop
   - Fix: Disable drop animation for goals (they create copies, don't move)
