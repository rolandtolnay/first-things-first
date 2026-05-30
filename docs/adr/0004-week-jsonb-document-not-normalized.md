# Week persisted as a JSONB document, not normalized

A `Week` is already a self-contained snapshot — `roles`, `goals`, `dayPriorities`, `timeBlocks`, and `eveningBlocks` nested in one object keyed by `WeekId`, which Dexie stored as a single record. In Postgres we keep that shape: **one `weeks` table** with promoted scalar columns (`id`, `user_id`, `start_date`, `created_at`, `updated_at`) for ownership, filtering, and sorting, plus a **`data jsonb`** column holding the whole Week snapshot. We deliberately do **not** normalize roles/goals/blocks into separate tables: the snapshot model is already document-shaped, normalizing would be a large refactor that loses snapshot atomicity and duplicates the aggregation logic that already lives (unit-tested) in TypeScript, and at single-user scale a week is kilobytes — there is no performance argument for it.

## Consequences

- A future reader expecting normalized tables should not "fix" this — the document shape mirrors the in-app snapshot model and is intentional.
- Cross-week stats are computed client-side (`role-balance.ts` etc.) over loaded weeks. When a stat genuinely needs DB-side aggregation, the idiomatic escalation ladder is: query the JSONB (`jsonb_array_elements`) → add a generated column → add a view → and only selectively normalize a single hot entity if one ever dominates analytics. No upfront normalization.
- There are no DB-level foreign keys between a role and its blocks, but they live in the same document and integrity is enforced in store logic (cascading deletes), so there is no cross-table reference to protect.
- Field-level concurrent merges are impossible (the unit is the whole week) — consistent with the online-first last-write-wins choice in [ADR-0003](./0003-supabase-backend-client-direct-online-first.md).
