# Role Color Selector

## Problem Statement

Roles carry the color used to recognize their Goals and scheduled work across the workspace, but users cannot currently choose those colors. Colors are auto-assigned, which means a Role can end up with a color that does not feel meaningful to the user or easy to recognize at a glance. The existing palette also has only eight slots and was not designed as a user-facing picker, so exposing it directly would not fully meet the need for a differentiated, intentional color choice.

## Solution

Users can change a Role’s color from the Sidebar. Tapping the small Role color dot opens a compact 3×3 swatch picker with nine supported colors. The same color picker is also available from a `Change color` submenu in both the Role overflow menu and the Role right-click menu.

Selecting a swatch immediately updates the Role color used in the active planning context. In the current code model, that means the current Week’s Role. If first-party Role defaults land first, this feature should update the Role default and the current Week’s Role Snapshot, without scanning or rewriting historical Week snapshots. All existing surfaces that derive color from the Role update through the existing Role color propagation path: Role card accents, Goals, Weekly Balance, Day Priorities, Time Blocks, Evening Blocks, drag previews, and Weekly Handoff carryover into newly created or replaced Target Weeks.

The nine-color palette is rebalanced as a cohesive, moderately saturated spectrum that remains aligned with the existing workspace design system while making choices easy to distinguish. Users see swatches, not internal color names.

## User Stories

1. As a planner, I want to tap a Role’s color dot and choose from nine distinct swatches, so that each Role has a color that feels meaningful and recognizable to me.
2. As a planner, I want the selected Role color to update immediately across Goals, blocks, priorities, summaries, and previews, so that the workspace stays visually consistent.
3. As a planner, I want color selection to also be available from the Role menus, so that I can discover and use the action from the same place as other Role actions.
4. As a planner using touch or a small pointer target, I want the small color dot to have a larger tap target, so that changing color is not fiddly.
5. As a planner, I want the current color to be visibly marked in the picker, so that I know which swatch is already selected.
6. As a planner, I want new Roles to start with an unused color when possible, so that Roles are visually distinct by default.
7. As a planner with more Roles than available colors, I want the app to keep working by reusing colors, so that I am not blocked from creating or recoloring Roles.

## Implementation Decisions

- Expand the Role color palette from eight to nine internal slots.
- Rebalance the rendered hues across all nine slots instead of preserving the previous rendered hues. This is intentional: the goal is a stronger user-facing selector palette, and internal Role color values remain decoupled from rendered hue.
- Keep internal color names out of visible UI. The picker shows swatches only; accessible labels may describe the swatches for assistive technologies.
- Use a balanced-spectrum palette direction: cohesive, moderately saturated hues spread across warm, yellow, green, mint/teal, cyan/sky, blue/violet, purple, magenta, and rose families.
- Maintain one curated palette order used by both the picker and automatic new-Role assignment.
- New Role auto-assignment uses the first unused color in the current Week, then cycles once all nine colors are already used.
- Allow duplicate Role colors. Users can intentionally assign the same color to multiple Roles.
- Role color changes must not scan and rewrite historical Weeks. In the current code model, the change affects the current Week’s Role. If first-party Role defaults are implemented first, the change may also update the Role default and the current Week’s Role Snapshot, while leaving other existing Week snapshots historically unchanged.
- Weekly Handoff continues to carry Role colors forward by cloning Roles into the Target Week.
- The visible Role dot remains compact, but it is wrapped in a larger accessible tap target.
- While the Role name is being edited inline, the color dot remains passive to avoid save/focus conflicts.
- The dot picker uses a 3×3 swatch layout with ring + check selected state.
- Selecting a swatch updates immediately and closes the picker/menu.
- Role overflow and right-click menus gain a `Change color` submenu after rename-related actions and before the destructive delete action.
- The Role color picker should be reusable between the dot-triggered picker and both menu submenu variants, so swatch rendering and selection behavior do not drift.
- Existing Role color consumers should continue to derive color from the Role, not copy color onto Goals, Day Priorities, Time Blocks, or Evening Blocks.

## Testing Decisions

- Automated tests should cover store and palette behavior, not implementation details of menu composition.
- Palette tests should verify that the supported Role color list has nine entries and that each internal color maps to a valid role color slot.
- New Role assignment tests should verify first-unused behavior, cycling after all nine colors are used, and sane behavior when existing Roles contain duplicate colors.
- Existing Role update tests should continue to cover changing a Role color and persisting exactly one update.
- Weekly Handoff behavior does not need new tests unless implementation changes its cloning path; existing coverage that Role color carries from Source Week to Target Week should remain passing.
- UI behavior should be validated manually in the browser during implementation, especially picker placement, submenu behavior, selected state, touch target size, light/dark theme contrast, and propagation across calendar surfaces.

## Out of Scope

- Creating or depending on global first-party Roles or a normalized Role identity model.
- Updating existing Weeks by matching Role names across history.
- Enforcing unique Role colors within a Week.
- Adding color selection to the Add Role flow before the Role exists.
- User-defined custom colors, arbitrary color pickers, or palette editing.
- Visible color names in the picker.
- Keyboard-only reordering or any changes to Role drag-and-drop behavior.
- Changing Goal, Time Block, Day Priority, or Evening Block ownership semantics.

## Further Notes

The project already treats Role color names as internal slots decoupled from rendered hues. That invariant remains: stored values identify stable internal choices, while design tokens own the visual hue. The existing Role color ADR has been updated to record the nine-slot rebalance decision.

Because the palette is user-facing after this change, implementation should visually verify the nine hues together in both dark and light themes rather than relying only on type-level correctness.
