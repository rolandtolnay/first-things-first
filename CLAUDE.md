# First Things First

If something in the project surprises you, flag it to the user and note it in AGENTS.md to help future agents.

## Browser Verification

You have access to the `agent-browser` skill. Load it (via the Skill tool) whenever you need to visually verify UI changes, test interactions, or confirm that functionality works correctly in the browser. Don't rely solely on reading code to judge whether something looks or behaves right — launch the browser and check. This is especially important after layout, styling, or interaction changes.

## UI Components (shadcn/ui)

This project uses **shadcn/ui** components (style: `radix-nova`, base color: `neutral`). Existing components live in `src/components/ui/`. The project is configured via `components.json`.

When working with UI components — adding new ones, debugging styling, composing layouts, or looking up component APIs — load the `shadcn` skill (via the Skill tool) for project-aware guidance and component documentation.

Always check `src/components/ui/` first to see what's already installed before adding a new component. When a feature needs a UI primitive not already present, add it with `npx shadcn@latest add <component-name>`. Prefer composing existing shadcn primitives over building custom components from scratch.

**Shared components over inline styling**: Never create one-off styled elements (e.g. raw `<input>` with inline classes) when a shared component exists in `src/components/ui/`. Instead:
1. Modify the existing shared component so the change is reflected app-wide.
2. If modifying would cause regressions elsewhere, flag it and ask — we may make a local exception or create a new shared variant.
The goal is consistency: all UI flows through shared components so the app looks and behaves uniformly.
