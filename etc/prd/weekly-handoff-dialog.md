# Weekly Handoff Dialog

## Problem Statement

Starting a new Week is currently treated like a small carryover modal, even though it is a meaningful planning transition. The current dialog is narrow, visually generic, and makes the Target Week selector feel as important as the carryover decision. It also assumes the Source Week is “last week,” which can be inaccurate when the User starts a new Week from an arbitrary viewed Week.

The User needs a calmer, larger Weekly Handoff that helps them close the Source Week, choose the Target Week, and intentionally decide which unfinished Goals deserve to continue forward, without adding stale-goal intelligence or changing the Week persistence model.

## Solution

Redesign the Start a new Week dialog as a wider Weekly Handoff surface aligned with the Dark Workspace Kit. The dialog should feel like a weekly transition: it summarizes the Source Week, clarifies the Target Week, and foregrounds the Carry Forward decision.

On desktop, the dialog uses a roughly 800px-wide layout. A two-column intro section places Source Week context beside the Target Week selector. Below that, a Carry Forward section lists unfinished Goals grouped by Role, with selected count and quick actions. The footer uses quiet Cancel, secondary Start fresh, and a dynamic primary action such as “Carry forward 3 Goals” or “Replace and carry forward 3 Goals.”

The solution preserves current semantics: Weekly Handoff carries Roles and selected unfinished Goals into the Target Week, resets carried Goal completion, and starts Day Priorities, Time Blocks, and Evening Blocks empty.

## User Stories

1. As a User, I want starting a new Week to open a larger, more intentional Weekly Handoff, so that the transition feels meaningful rather than like a small settings action.
2. As a User, I want to see which Source Week I am handing off from, so that I do not confuse an arbitrary viewed Week with “last week.”
3. As a User, I want to see completed/total Goals and the unfinished Goal count for the Source Week, so that I understand what is complete and what might continue.
4. As a User, I want to choose the Target Week before starting, so that I can create the intended Week rather than blindly using the next calendar Week.
5. As a User, I want to know when the Target Week already has a plan, so that I understand continuing will replace that plan.
6. As a User, I want unfinished Goals grouped by Role, so that I can review carryover work in the same mental structure as the Sidebar.
7. As a User, I want all unfinished Goals selected by default, so that normal carryover remains fast while still letting me remove stale or unwanted Goals.
8. As a User, I want Select all, Clear, and a selected count, so that I can manage longer carryover lists quickly.
9. As a User, I want the primary action to state the exact outcome, so that I know whether I am carrying Goals forward, starting fresh, or replacing an existing Week.
10. As a User, I want a clean-slate empty state when there are no unfinished Goals, so that I can celebrate completion and start the Target Week without seeing an empty checklist.
11. As a User, I want submission actions to show pending state and prevent duplicate submits, so that creating or replacing a Week feels reliable.
12. As a User on a narrower viewport, I want the Weekly Handoff content to stack cleanly, so that the dialog remains usable outside the full desktop workspace.

## Implementation Decisions

- The product concept is **Weekly Handoff**. The visible dialog title remains action-oriented: “Start a new Week.”
- Use **Source Week** and **Target Week** terminology in product copy where precision matters. Do not assume the Source Week is literally “last week.”
- Keep this work UI/flow-only. Do not introduce Goal lineage, carryover counts, stale-goal detection, or new persistence metadata.
- Define unfinished Goals as Goals whose own completion state is incomplete. Do not infer unfinished status from Day Priorities, Time Blocks, or Evening Blocks.
- Preserve current carryover semantics: carry Roles and selected unfinished Goals into the Target Week; reset carried Goal completion; do not carry Day Priorities, Time Blocks, Evening Blocks, or Freestyle Blocks.
- Extract a pure Weekly Handoff helper module that computes:
  - Source Week completion summary
  - unfinished Goal groups by Role
  - default selected Goal IDs
  - selected count and total unfinished count
  - whether the Target Week already has a plan
  - dynamic primary action copy
  - empty-state condition
- Refactor the dialog UI around three sections:
  - Source Week summary
  - Target Week selector
  - Carry Forward list
- Use existing accessible primitives for dialog, buttons, checkboxes, progress, and week selection. Do not replace Radix/shadcn primitives with hand-rolled overlay controls.
- Keep Dark Workspace Kit alignment:
  - dark surfaces and tokenized colors
  - hairline borders instead of heavy fills
  - mono uppercase Section Labels
  - amber Accent only for primary/progress/checked emphasis
  - Role colors only as secondary Role identifiers
  - no left-border accent warning cards
  - no heavy nested cards-within-cards
- Existing Target Week replacement remains allowed, but must be communicated with an inline warning and explicit primary action copy.
- The Carry Forward list should be flat and Role-grouped. Avoid Role mini-cards unless implementation proves the flat grouping is visually unclear.
- All unfinished Goals are selected by default when the dialog opens.
- The Carry Forward section includes selected count plus Select all and Clear actions.
- The Carry Forward list is the scrollable region for long content; header/intro and footer remain visible.
- Footer action hierarchy:
  - Cancel is quiet
  - Start fresh is secondary
  - primary action is dynamic and outcome-specific
- When no unfinished Goals exist, hide the checklist and show a clean-slate completion message with a Start Week primary action.
- On smaller viewports, the two-column intro stacks into Source Week, Target Week, then Carry Forward.
- Submission actions enter a pending state, disable duplicate submission, and keep the dialog open if creation/navigation fails.
- No ADR is required for this redesign because the choice is reversible, mostly presentational, and does not change persistence or core architecture.

## Testing Decisions

- Add unit tests for the pure Weekly Handoff helper module. These tests should cover behavior, not JSX structure.
- Helper tests should verify:
  - completion summary for zero, partial, and complete Source Week Goal sets
  - unfinished Goal grouping by Role
  - default selection includes all unfinished Goals
  - selected count updates when selected IDs change
  - Target Week planned/replacement detection
  - dynamic primary CTA copy for carry forward, start fresh, and replacement cases
  - empty-state detection when there are no unfinished Goals
- Existing Week creation tests remain the primary semantic coverage for carryover persistence behavior: Role remapping, Goal copying, completion reset, notes preservation, orphan handling, and empty Goal creation.
- No new store tests are required unless implementation changes carryover semantics.
- Browser verification should confirm visual layout, scroll behavior, empty state, existing Target Week warning, pending disabled state, and responsive stacking.
- Good tests should assert user-visible outcomes and pure data transformations, not private component structure or Tailwind class names.

## Out of Scope

- Stale-goal detection or filtering.
- Carryover count, Goal lineage, Source Goal references, or new metadata.
- Smart defaulting based on prior behavior.
- Copying Day Priorities, Time Blocks, Evening Blocks, or Freestyle Blocks into the Target Week.
- Changing the Week document persistence model.
- Normalizing Roles, Goals, or blocks into separate database tables.
- Redesigning the WeekSelector interaction beyond minimal styling or placement needs.
- Building a multi-step wizard.
- Adding a distinct mobile bottom-sheet flow.

## Further Notes

The Weekly Handoff should be designed as the Pareto improvement over the current dialog: make the transition clearer, bigger, and more intentional while avoiding the model complexity of stale-goal intelligence. The implementation should leave room for future Goal metadata under each row, but should not introduce that metadata now.
