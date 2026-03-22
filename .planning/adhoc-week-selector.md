# Adhoc: Week Selector in Carryover Dialog

## Problem

Current "Start Fresh" and carryover flow creates/clears the current week without letting the user choose WHICH week to create. The user expects:

1. **Week selector** inside the carryover dialog — user picks the target week
2. **Default to next week** relative to the currently viewed week
3. **Calendar dropdown** for selecting different weeks
4. **Never clear the current week** — always create a NEW week with the selected target date

## Current Behavior

- "+New" opens dialog showing uncompleted goals
- "Start Fresh" clears the current week (wrong — should create a new, separate week)
- No way to specify which week the new week targets

## Expected Behavior

- "+New" opens dialog with:
  - Week selector (defaults to next week, allows picking any week)
  - Uncompleted goals grouped by role with checkboxes
  - "Carry Over" creates the selected week WITH checked goals
  - "Start Fresh" creates the selected week with roles only, no goals
- Current week is never modified — always a new week entry is created

## Source

Discovered during Phase 8 UAT (2026-03-22). User feedback verbatim:

> "When we go to 'New' there should definitely be a confirmation for which week we are creating and the user needs to be able to select. By default it will always select the next week compared to the current one but then the user can select from a calendar drop-down different weeks."
