# Durable Role Snapshots

## Problem Statement

Roles are currently embedded inside each Week snapshot. That makes a Role useful within one Week, but it does not give the app a stable identity for the same life area across multiple Weeks. Weekly Handoff copies Roles forward with new identities, so “Work” this Week and “Work” next Week are not truly the same Role.

This limits the product direction. A User should be able to define their Roles once, keep familiar colors and order across newly created Weeks, archive and restore Roles deliberately, and eventually ask cross-week questions such as which Goals were completed for a Role or how planned work varies by Role over time.

## Solution

Promote Roles to durable user-owned entities while keeping Weeks as historical planning snapshots. A User manages active Roles from the existing Sidebar. Each new Week receives Role Snapshots for the User’s active Roles, using the durable Role ID and the current default name, color, and order. The Week still owns its planning content, so historical Weeks preserve how Roles looked in that Week even if the durable Role is later renamed, recolored, reordered, archived, or restored.

The foundation does not add analytics UI yet. It creates the durable Role identity and snapshot model that later analytics can build on.

## User Stories

1. As a User, I want to define a Role once, so that I do not need to recreate the same life areas in every Week.
2. As a User, I want a new Week to start with my active Roles, so that weekly planning begins from my stable Role structure.
3. As a User, I want Role colors and order to carry into new Weeks, so that my planning workspace remains familiar.
4. As a User, I want editing a Role from the Sidebar to update the current Week and future defaults, so that the visible Week reflects my change without rewriting other historical Weeks.
5. As a User, I want deleting a Role from the Sidebar to archive it and remove it from the current Week, so that it no longer appears in future planning while historical Weeks remain intact.
6. As a User, I want archived Roles to appear as restore options when adding a matching Role, so that I can bring back a previous Role instead of accidentally creating a duplicate.
7. As a User, I want restored Roles to keep their previous color and be appended to the current Role order, so that restoration feels familiar but does not unexpectedly rearrange my Sidebar.
8. As a User, I want the app to avoid active duplicate Role names, so that Sidebar search, restore, and future analytics labels stay understandable.
9. As a User, I want a restored Role with a conflicting active name to receive a distinct name automatically, so that restoration can proceed without a blocking rename flow.
10. As a User, I want Weekly Handoff to carry unfinished Goals only for active Roles, so that archived Roles stay out of future planning unless I restore them first.
11. As a User, I want old Weeks to keep their original Role display, so that reviewing past planning does not become confusing after I rename or recolor a Role.
12. As a User, I want future role-based analytics to group work by real Role identity, so that renamed Roles do not fragment historical stats.

## Implementation Decisions

- Keep the canonical split between **Role** and **Role Snapshot**.
  - A Role is a durable user-owned life area with default name, color, order, and archive state.
  - A Role Snapshot is the Week-contained display copy used by that Week.
- A Role Snapshot uses the durable Role ID as its own ID. Goals and goal-linked Time Blocks / Evening Blocks continue to reference `roleId`; that ID is now stable across Weeks.
- Weeks remain JSONB planning snapshots. This work selectively promotes Roles only; Goals, Day Priorities, Time Blocks, and Evening Blocks stay nested in the Week document.
- Add a user-owned Roles table with Row Level Security matching the existing client-direct Supabase model. The table stores durable Role defaults and archive state.
- No backwards-compatible data migration or backfill is required because existing production data is not a concern for this change. The implementation can choose the simplest clean schema and app model.
- New Users receive no starter Roles. They create their own Roles through the existing Sidebar flow.
- New Weeks are seeded from active durable Roles. If there are no active Roles, the Week starts with no Role Snapshots.
- Role creation from the Sidebar creates a durable Role and appends a Role Snapshot to the current Week.
- Role rename, recolor, or reorder from the Sidebar updates the durable Role defaults and the current Week’s Role Snapshot only. Other existing Week snapshots remain unchanged.
- Role deletion from the Sidebar archives the durable Role, removes the current Week’s Role Snapshot, and cascades current-Week Goal-linked planning items the same way Role deletion does today. Other Weeks remain historically unchanged.
- Archived Roles are excluded from new Week seeding and Weekly Handoff carryover.
- Add-role search in the Sidebar shows matching archived Roles as restore options. Selecting an archived Role reactivates it and appends a Role Snapshot to the current Week.
- Restored Roles keep their previous color and are appended after current active Roles. They do not reclaim their old order if that would reshuffle the Sidebar.
- A User cannot have two active Roles with the same name. Name comparison should be normalized enough to prevent obvious trimmed/case-only duplicates.
- If restoring an archived Role would conflict with an active Role name, automatically assign the restored Role a distinct name.
- Weekly Handoff creates the Target Week’s Role Snapshots from active Role defaults, not from Source Week Role Snapshots.
- Weekly Handoff carries selected unfinished Goals forward by Role identity. Goals whose Role is archived or otherwise absent from active Role defaults are not carried forward.
- Cross-week Role analytics are out of scope, but the data model should support future aggregation by durable Role identity. Aggregate analytics should use the current Role display values; individual Week detail views may show historical Role Snapshots.
- Stay with the client-direct Supabase architecture. Do not introduce a Postgres RPC transaction for combined Role/default + current Week snapshot updates in this foundation. The store coordinates direct Supabase calls and existing optimistic/error patterns.
- Sidebar remains the only Role management surface for this PRD. Do not add a dedicated Role settings screen.
- Freestyle Block Role assignment is out of scope. The current feature should preserve today’s user-facing behavior: Freestyle Blocks are not assigned to Roles.
- Add a pure Role Snapshot rules module. This should be a deep module that owns seeding, appending, updating, removing/cascading, reordering, and restored-name conflict resolution for Role Snapshots.
- Add a pure Role mapping module mirroring the existing Week mapping style, so database rows and app Roles are translated in one testable place.
- Extend the database adapter with durable Role operations for listing active Roles, searching archived Roles, creating Roles, updating defaults, archiving, restoring, and reordering.
- Update store orchestration so Role operations persist both durable Role state and current Week snapshots where required.
- Update Weekly Handoff helpers to accept active Role defaults and produce Target Week Role Snapshots without generating new Role IDs.
- Update Sidebar add/delete/restore copy so archive semantics are clear and restoration feels like part of adding a Role.
- Document the architecture in ADR-0005: Durable Roles with Week Snapshots.

## Testing Decisions

- Automated tests should focus on pure modules and stable behavior, not implementation details or transient component structure.
- Add unit tests for the Role Snapshot rules module. These should cover:
  - seeding active Roles into Role Snapshots with stable durable Role IDs;
  - excluding archived Roles from seeding;
  - appending a new Role Snapshot to the current Week;
  - updating only the current Week’s Role Snapshot values;
  - removing a Role Snapshot and cascading current-Week Goal-linked planning items;
  - preserving Freestyle Blocks during Role removal;
  - reordering Role Snapshots only from a complete, valid ordered ID list;
  - restoring an archived Role at the end of the order;
  - resolving restored-name conflicts with a distinct active name.
- Add unit tests for the Role mapping module. These should cover round-tripping durable Role defaults, archive state, color, order, timestamps, and ownership fields.
- Update Weekly Handoff unit tests. These should cover:
  - Target Week Role Snapshots are created from active Role defaults;
  - Role Snapshot IDs match durable Role IDs;
  - Role IDs are not regenerated during handoff;
  - selected unfinished Goals carry by Role identity;
  - Goals under archived or inactive Roles are not carried forward;
  - Day Priorities, Time Blocks, Evening Blocks, and Freestyle Blocks still start empty in the Target Week.
- Existing store tests can be updated as needed to keep the suite passing, but this PRD does not require a comprehensive new store-orchestration test matrix beyond what implementation changes make necessary.
- Schema and RLS should be manually smoke-verified during implementation because the app relies on Supabase RLS as the security boundary.

## Out of Scope

- Role analytics UI or reports.
- Showing all completed Goals for a Role.
- Planned-vs-completed Role charts.
- Goal lineage or references back to Source Week Goals.
- Backfilling or merging existing historical embedded Roles.
- A dedicated Role settings screen.
- Starter Role templates or onboarding prompts.
- Full archived Role management beyond restore through add-role search.
- Permanent Role deletion.
- Manual merge/split of Roles.
- Assigning Roles to Freestyle Blocks.
- Normalizing Goals, Day Priorities, Time Blocks, or Evening Blocks into database tables.
- Introducing RPC/server actions solely to make Role + Week edits transactional.

## Further Notes

This work intentionally changes the meaning of Role in the domain model. A Role is now durable; a Role Snapshot is what a Week contains. The implementation should use this terminology consistently so future work does not accidentally erase the historical Week snapshot invariant or over-normalize the planner.

The most important implementation risk is partial inconsistency between durable Role rows and current Week snapshots. The accepted trade-off is to keep the existing client-direct, optimistic persistence model and make the pure Role Snapshot rules easy to test and reason about.
