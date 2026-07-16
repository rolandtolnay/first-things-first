# Goal evidence

Keep compact tracked evidence needed to reconstruct a goal verdict. Create one directory per goal and link it from `docs/goal-log.md`.

Good evidence includes selected screenshots from the real planner, sanitized fixture comparisons, short judge results, or concise traces that directly support a rubric item.

Do not store:

- Supabase credentials, auth cookies, magic links, or `.env.local` values;
- production or real User planning data;
- full build/test logs, browser profiles, videos, caches, or temporary worktrees;
- local database dumps or raw calendar imports containing personal data.

Keep bulky transient work under the ignored `.agents/goal-work/` directory and distill only decision-relevant facts into `docs/goal-log.md`.
