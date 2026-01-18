---
phase: 03
plan: 01
subsystem: sidebar
tags: [roles, components, tailwind, color-mapping]

dependency-graph:
  requires:
    - phase-01 (types, store, CSS variables)
  provides:
    - Role color mapping utility
    - RoleItem component with inline edit/delete
    - AddRoleButton component for role creation
  affects:
    - 03-02 (RoleList composition)

tech-stack:
  added: []
  patterns:
    - Two-state input components (button/input mode)
    - Double-click to edit pattern
    - Hover-reveal delete buttons
    - CSS variable mapping for dynamic colors

key-files:
  created:
    - src/lib/role-colors.ts
    - src/components/sidebar/RoleItem.tsx
    - src/components/sidebar/AddRoleButton.tsx
  modified: []

decisions:
  - id: role-color-index-mapping
    choice: Map RoleColor string to CSS variable index (1-8)
    why: Enables dynamic Tailwind class generation while using theme variables

metrics:
  duration: 4 min
  completed: 2026-01-18
---

# Phase 3 Plan 1: Role Item Components Summary

Role color utility and individual role UI components with edit/delete capabilities.

## What Was Built

### 1. Role Color Utility (`src/lib/role-colors.ts`)

Maps the `RoleColor` type (teal, amber, rose, etc.) to CSS variable indices:

| RoleColor | CSS Variable | Index |
|-----------|--------------|-------|
| teal      | --role-1     | 1     |
| violet    | --role-2     | 2     |
| orange    | --role-3     | 3     |
| sky       | --role-4     | 4     |
| rose      | --role-5     | 5     |
| emerald   | --role-6     | 6     |
| amber     | --role-7     | 7     |
| fuchsia   | --role-8     | 8     |

Exports:
- `getRoleColorClass(color)` - Returns `bg-role-N` for Tailwind classes
- `getRoleColorIndex(color)` - Returns index for custom class building
- `getRoleColorStyle(color)` - Returns `hsl(var(--role-N))` for inline styles

### 2. RoleItem Component (`src/components/sidebar/RoleItem.tsx`)

Individual role display with:
- Color dot indicator using `getRoleColorClass()`
- Role name (truncated with title tooltip)
- Double-click to edit inline
- Save on Enter/blur, cancel on Escape
- Delete button (X) appears on hover
- Confirmation dialog before deletion
- Wired to `updateRole` and `deleteRole` store actions

### 3. AddRoleButton Component (`src/components/sidebar/AddRoleButton.tsx`)

Two-state component:
1. **Button mode**: Shows "+ Add Role" button
2. **Input mode**: Text input for new role name

Behavior:
- Click button switches to input mode, auto-focuses
- Enter submits (if not empty) and resets
- Escape cancels and resets
- Blur submits if has value, otherwise cancels
- Calls `addRole({ name })` which auto-assigns color

## Commits

| Hash | Description |
|------|-------------|
| 05e62ed | feat(03-01): create role color utility |
| 28b5197 | feat(03-01): create RoleItem component |
| a36de6a | feat(03-01): create AddRoleButton component |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] `npx tsc --noEmit` passes
- [x] `npm run build` succeeds
- [x] All three files exist and export expected items
- [x] No ESLint errors

## Next Phase Readiness

Ready for 03-02 (RoleList composition). Components are ready to be composed into the RoleList container that will manage the list of roles and integrate with the sidebar.

**Dependencies provided:**
- `getRoleColorClass` and `getRoleColorStyle` for color display
- `RoleItem` for rendering each role
- `AddRoleButton` for creating new roles
