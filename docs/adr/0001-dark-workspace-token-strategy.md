# Dark Workspace Kit token strategy

We adopt the Dark Workspace Kit's `--ds-*` design tokens (oklch surfaces, amber accent, hairline borders, Geist + Geist Mono, the 4px spacing scale) as the **single source of truth** in `globals.css`, and bridge them to Tailwind/shadcn through `@theme inline` (e.g. `--color-background: var(--ds-window)`, `--color-primary: var(--ds-accent)`). This keeps the existing radix-backed shadcn primitives in `src/components/ui/` working unmodified — they resolve through the bridge — while new and restyled surfaces consume `--ds-*` directly, matching the `design/` prototype's vocabulary.

## Considered Options

- **Option A — keep shadcn token names, remap values.** Lowest primitive churn, but forces hand-translating the prototype's `ds-*`/`ftf-*` CSS back into shadcn terms and leaves two competing token vocabularies in the codebase.
- **Option B — drop shadcn entirely (tokens *and* primitives).** Maximum fidelity, but rebuilds accessibility-sensitive interactions (context menu, dialog, dropdown, popover, tooltip) on the kit's lighter hand-rolled primitives — the opposite of simpler, and concentrated in the most complex existing component (`BlockCard`).
- **Option C — drop the shadcn token *naming* layer, keep the *primitives* (chosen).** One token vocabulary (`--ds-*`, matching the canonical `design-systems/dark-workspace-kit` repo so future kit updates drop in), prototype CSS ports near-verbatim, and the maintained radix engineering is preserved.

## Consequences

- The `@theme inline` bridge must stay in sync: a renamed/removed `--ds-*` token silently breaks the Tailwind utility it backs (Tailwind v4 ignores unknown tokens with no error). Verify compiled CSS after token changes.
- Dark becomes the default theme; light is an opt-in via the kit's `.ds-light` equivalent.
