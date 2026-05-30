# Role color names decoupled from rendered hues

The `RoleColor` type stays a fixed eight-value name union (`teal | amber | rose | violet | emerald | orange | sky | fuchsia`) and `COLOR_TO_INDEX` in `role-colors.ts` is left unchanged, but the underlying `--role-1..8` CSS variables are re-hued to the Dark Workspace Kit's oklch palette. We deliberately decouple the stored color **name** from the rendered **hue**: a role persisted as `"teal"` may now render as a different hue, and that is intentional — names are internal-only (users see color, never the word), so no Dexie data migration of historical week snapshots is required.

As part of this, `getRoleColorStyleWithOpacity` moves from `rgba(var(--role-N-rgb), x)` to `color-mix(in oklab, var(--role-N), transparent …)`, and the now-unused `--role-N-rgb` triplet variables are dropped — oklch values cannot be expressed as rgb triplets.

## Consequences

- A future reader seeing a stored `"teal"` render as amber should not "fix" it — the decoupling is the design, chosen to avoid migrating every persisted `Week` record during a presentation-only reskin.
- `role-colors.ts` has no unit tests; the `rgba → color-mix` refactor is covered by visual verification, not the suite.
