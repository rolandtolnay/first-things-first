# roles

> Life-area entities (e.g. "Family", "Work") with auto-assigned colors from an 8-color palette, managed per-week via the snapshot model.

## Decisions

| Decision | Rationale | Source |
|----------|-----------|--------|
| 8-color palette with cycling | Distinct visual coding per role | Phase 01-02 |
| Auto-assign color on creation | No manual color picking needed | Phase 01-02 |
| Per-week snapshot, not global | Historical accuracy, matches Sheets | Phase 01-02 |
| Carry-over with new IDs | Fresh UUIDs prevent cross-week refs | Phase 01-02 |
| Inline styles, not Tailwind classes | Tailwind v4 purges dynamic classes | Phase 03-02 |
| `max(order)+1` for new roles | Avoids order gaps after deletions | Phase 03-02 |
| Cascading delete to goals/blocks | Role removal cleans all dependents | Phase 01-02 |
| Double-click to edit name | Consistent edit pattern across app | Phase 03-01 |

## Architecture

- `Role` interface: `id` (UUID), `name`, `color` (RoleColor union), `order` (display position).
- `RoleColor` is a union of 8 strings: teal, amber, rose, violet, emerald, orange, sky, fuchsia.
- Color assignment cycles through `ROLE_COLORS` array based on `existingRoles.length % 8` in `weekStore.addRole`.
- `role-colors.ts` maps RoleColor to CSS variable index (1-8) via `COLOR_TO_INDEX` record; exports `getRoleColorClass`, `getRoleColorIndex`, `getRoleColorStyle`.
- CSS variables `--role-1` through `--role-8` defined in `:root` and `.dark` in `globals.css` with mode-adjusted HSL values.
- `weekStore.deleteRole` cascades: removes role, its goals, and any dayPriorities/timeBlocks/eveningBlocks referencing those goals (freestyle blocks preserved).
- `weekStore.reorderRoles` remaps `order` field based on new ID sequence.

## Design

- Color dot: 12x12px (`w-3 h-3`) rounded circle with `getRoleColorStyle` inline background.
- Role header: color dot + name + hover-reveal delete (X) button.
- Goals indented `ml-5` (20px) below role header to show hierarchy.
- Hover state: `bg-secondary/50` with smooth transition.
- Confirmation dialog (`window.confirm`) before role deletion.

## Pitfalls

- **Dynamic Tailwind class purging**: `bg-role-N` classes are purged at build time because they are generated dynamically. Use `getRoleColorStyle()` with inline styles instead of `getRoleColorClass()` for runtime color rendering.
- **Hydration loop with sorted roles**: Creating new arrays in Zustand selectors causes infinite re-renders. RoleList uses `useMemo` over raw store data to avoid this.
- **Order gaps after deletion**: Using `roles.length` for new role order fails when deletions create gaps. Fixed by computing `max(order) + 1`.

## Key Files

- `src/types/index.ts` -- Role, RoleColor type definitions
- `src/lib/role-colors.ts` -- RoleColor-to-CSS-variable mapping utilities
- `src/stores/weekStore.ts` -- Role CRUD operations (addRole, updateRole, deleteRole, reorderRoles)
- `src/components/sidebar/RoleSection.tsx` -- Role header with edit/delete + GoalList composition
- `src/components/sidebar/RoleList.tsx` -- Container rendering sorted RoleSections + AddRoleButton
- `src/components/sidebar/AddRoleButton.tsx` -- Two-state button/input for role creation
- `src/app/globals.css` -- `--role-1` through `--role-8` CSS variable definitions (light + dark)
