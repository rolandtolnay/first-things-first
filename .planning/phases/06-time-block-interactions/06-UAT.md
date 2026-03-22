---
status: complete
phase: 06-time-block-interactions
source:
- 06-01-SUMMARY.md
started: 2026-03-22 09:08
updated: 2026-03-22 09:57
current_batch: null
mocked_files: []
pre_work_stash: null
stash_ref: null
---

## Progress

total: 6
tested: 6
passed: 6
issues: 0
fixing: 0
pending: 0
skipped: 0

## Current Batch

batch: 2 of 2
name: "Overlap Prevention"
mock_type: null
tests: [5, 6]
status: pending

## Tests

### 1. Resize a time block
expected: Drag the bottom edge of a time block downward. Block grows in 30-min increments with visual preview during drag.
mock_required: false
mock_type: null
result: pass

### 2. Resize stops at overlap
expected: With two blocks nearby, resize the first toward the second. Block stops growing at the second block's start time (cannot overlap).
mock_required: false
mock_type: null
result: pass

### 3. Create freestyle block
expected: Click and drag on empty calendar space. A dashed preview appears during drag. On release, a new block is created at that position.
mock_required: false
mock_type: null
result: pass
reported: "Drawing a freestyle block works, but pressing space in the inline title input causes a weird overlapping block to appear"
severity: major
fix_status: verified
fix_commit: a5bd28b
retry_count: 0

### 4. Name a drawn block
expected: After drawing a freestyle block, an inline text input appears. Type a name and press Enter to save. Press Escape or leave empty and blur to cancel (block deleted).
mock_required: false
mock_type: null
result: pass
reported: "Same overlapping block issue as test 3. Also allows saving a block without a name - should cancel instead"
severity: major
fix_status: verified
fix_commit: a5bd28b
retry_count: 0

### 5. Goal drop clamped by overlap
expected: Drop a goal from sidebar onto calendar near an existing block. The new 1-hour block is clamped to fit available space rather than overlapping.
mock_required: false
mock_type: null
result: pass

### 6. Block move rejected on overlap
expected: Drag an existing time block to a slot occupied by another block. Block snaps back to its original position (move rejected).
mock_required: false
mock_type: null
result: pass
reported: "Block move overlap rejection works for goal-based blocks but not for freestyle blocks created via click-drag-draw. Moving a block onto a freestyle block allows overlap."
severity: major
fix_status: verified
fix_commit: 74d67b9
retry_count: 0

## Fixes Applied

- commit: 85c7288
  test: 3
  description: "Stop keyboard event propagation from inline input to prevent dnd-kit KeyboardSensor from triggering on Space"
  files: [src/components/calendar/TimeBlock.tsx]

- commit: 85c7288
  test: 4
  description: "Enter with empty title now cancels and deletes block instead of no-op"
  files: [src/components/calendar/TimeBlock.tsx]

- commit: 74d67b9
  test: 6
  description: "Add hasOverlap pre-check to goal/priority/evening timegrid drop paths - getMaxAvailableDuration only looked forward, missing blocks that started earlier"
  files: [src/components/dnd/DndProvider.tsx]

## Batches

### Batch 1: Interactions
tests: [1, 2, 3, 4]
status: complete
mock_type: null
passed: 4
issues: 2

### Batch 2: Overlap Prevention
tests: [5, 6]
status: complete
mock_type: null
passed: 2
issues: 1

## Assumptions
