# Role color names decoupled from rendered hues

The original `RoleColor` type used a fixed eight-value name union (`teal | amber | rose | violet | emerald | orange | sky | fuchsia`) and `COLOR_TO_INDEX` in `role-colors.ts` mapped those internal names to `--role-1..8` presentation slots. The underlying `--role-1..8` CSS variables were re-hued to the Dark Workspace Kit's oklch palette. We deliberately decouple the stored color **name** from the rendered **hue**: a role persisted as `"teal"` may render as a different hue, and that is intentional — names are internal-only (users see color, never the word), so no persisted Week data migration is required for presentation-only palette changes.

A later Role color selector expands the palette from eight to nine slots and intentionally rebalances the rendered hues instead of preserving every previous rendered color. This keeps the decoupling model: persisted Role color values identify stable internal slots, while the CSS role tokens own the user-visible hue. The ninth slot requires adding a new internal color value, but user-facing UI still presents swatches rather than internal color names.

As part of this, `getRoleColorStyleWithOpacity` moves from `rgba(var(--role-N-rgb), x)` to `color-mix(in oklab, var(--role-N), transparent …)`, and the now-unused `--role-N-rgb` triplet variables are dropped — oklch values cannot be expressed as rgb triplets.

## Consequences

- A future reader seeing a stored `"teal"` render as amber should not "fix" it — the decoupling is the design, chosen to avoid migrating every persisted `Week` record during a presentation-only reskin.
- Rebalancing the nine role slots can change how existing Roles look without changing their stored values. That is acceptable when the product goal is a more differentiable, cohesive selector palette.
- `role-colors.ts` has no unit tests; palette and opacity changes need visual verification in both themes, not just the suite.
