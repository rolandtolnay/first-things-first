# Week persisted as a whole document, not normalized

A Week is a self-contained snapshot: Role Snapshots, Goals, Day Priorities, Time Blocks, Evening Blocks, Day Bounds, and Reflection live in one object keyed by WeekId. Firestore stores that object verbatim as `users/{uid}/weeks/{weekId}`. We deliberately do not normalize its nested planning entities into collections: the domain is already document-shaped, snapshot atomicity is valuable, and single-User Weeks are small.

## Consequences

- A future reader should not normalize this by default; the document mirrors the planning model intentionally.
- Cross-week summaries load the User's Week documents and compute in TypeScript. Escalate only when observed scale demands a derived read model.
- There are no database foreign keys inside a Week. Store/domain rules preserve references, overlap, caps, and cascades.
- Field-level concurrent merges are not attempted. The unit is the whole Week and ordered optimistic saves are last-write-wins, consistent with [ADR-0003](./0003-firebase-backend-client-direct-online-first.md).
- Read mapping still normalizes legacy additive fields (for example pre-discriminant Day Priorities) without rewriting historical documents.
