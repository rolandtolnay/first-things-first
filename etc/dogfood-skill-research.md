# Vercel Dogfood Skill — Research Notes

> Researched 2026-03-22. Revisit after redesign is complete to evaluate integration.

## What It Is

The **dogfood** skill lives in `vercel-labs/agent-browser` on GitHub (`skills/dogfood/`).
It's a structured SKILL.md prompt that turns an AI agent with browser access into an
autonomous exploratory QA tester.

- **Repo**: `github.com/vercel-labs/agent-browser/tree/main/skills/dogfood/`
- **Install**: `npx skills add vercel-labs/agent-browser --skill dogfood`
- **Trigger**: `dogfood http://localhost:3000` or `/dogfood`
- **~4,000 installs** as of March 2026 (base agent-browser has ~72K)

## How It Works

1. Opens target URL in a headless browser via `agent-browser` CLI
2. Systematically navigates every section, tests interactive elements, checks edge cases
3. Runs end-to-end workflows (create/edit/delete flows)
4. Monitors browser console for JS errors
5. Documents each issue with severity, repro steps, screenshots, and video recordings
6. Produces a self-contained markdown report

Targets **5-10 well-documented issues** per session across 7 categories:
Visual/UI, Functional, UX, Content, Performance, Console/Errors, Accessibility.

## Skill Structure

```
skills/dogfood/
  SKILL.md                              # Main skill prompt/instructions
  references/
    issue-taxonomy.md                   # What to look for + severity definitions
  templates/
    dogfood-report-template.md          # Output report structure
```

The `allowed-tools` frontmatter restricts execution to `agent-browser` Bash commands only.

## Key Design Principles

- **"Repro is everything"** — verifies reproducibility before collecting evidence
- **"Never read source code"** — tests as a user, not a code auditor
- **"Never delete output files"** — works forward only, partial results survive interruptions
- Evidence type matches issue type: video + step-by-step screenshots for interactive bugs,
  single annotated screenshot for static issues
- Uses `type` (character-by-character) instead of `fill` during video so recordings look real

## Six-Phase Workflow

1. **Initialize** — create output dirs, copy report template, open target URL
2. **Authenticate** — if credentials provided (supports form login, OTP with user interaction)
3. **Orient** — take initial screenshot and snapshot
4. **Explore** — systematic navigation using issue taxonomy as guide
5. **Document** — verify repro, then capture evidence matched to issue type
6. **Wrap Up** — update summary counts, close session

## Issue Taxonomy (Severity)

| Level | Definition |
|-------|-----------|
| Critical | Blocks core workflow, causes data loss, or crashes the app |
| High | Major feature broken/unusable, no workaround |
| Medium | Feature works but with noticeable problems, workaround exists |
| Low | Minor cosmetic or polish issue |

## Benchmarks vs Playwright MCP

From Pulumi engineering blog (March 2026):

| Metric | Playwright MCP | Agent-Browser | Reduction |
|--------|---------------|---------------|-----------|
| Total response chars | 31,117 | 5,455 | 82.5% |
| Largest single response | 12,891 | 2,847 | 77.9% |
| Homepage snapshot | 8,247 | 280 | 96.6% |

95% first-try task completion vs 75-80% for Playwright MCP.

## Known Gotchas

- **Auth friction**: First-time setup for apps behind Clerk/Supabase requires manual session injection
- **Dynamic content**: Modals after async API calls can stall the agent
- **Concurrent agents**: Multiple agents writing to same `report.md` will conflict (issue #547, open)
- **Snapshot confusion**: `snapshot -i` returns only interactive elements, plain `snapshot` returns full content — wrong mode wastes 4+ turns (fixed in PR #630, but older installs may not have the fix)
- **Skill invocation**: If you have many competing skills, the dogfood skill may not trigger automatically — invoke explicitly with `/dogfood`

## Best Practices

1. **Scope narrow** — "Focus on the settings page" yields better results than unbounded exploration
2. Always use the direct `agent-browser` binary, never `npx agent-browser` (Rust vs Node speed)
3. Don't rely on it as your only QA gate — it's exploratory testing, not deterministic regression
4. Each session consumes meaningful context/tokens — target specific flows rather than "test everything"

## Applicability to First Things First

**Good fit for:**
- Catching visual regressions after the redesign
- JS console errors and unhandled promise rejections
- Edge-case form behavior (empty states, boundary inputs)
- Accessibility gaps (missing alt text, focus traps, contrast)
- UX dead-ends and missing feedback on interactions

**Less useful for:**
- Complex stateful flows requiring specific data setup
- Anything behind auth that requires non-trivial session management

## Next Steps

- [ ] Wait for redesign to complete
- [ ] Install the skill: `npx skills add vercel-labs/agent-browser --skill dogfood`
- [ ] Run against local dev server scoped to a specific flow
- [ ] Evaluate report quality and decide if it fits the workflow

## Sources

- [GitHub: vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser)
- [Dogfood SKILL.md](https://github.com/vercel-labs/agent-browser/blob/main/skills/dogfood/SKILL.md)
- [Pulumi Blog: Self-Verifying AI Agents](https://www.pulumi.com/blog/self-verifying-ai-agents-vercels-agent-browser-in-the-ralph-wiggum-loop/)
- [GitHub Issue #565: Evidence before reproducibility](https://github.com/vercel-labs/agent-browser/issues/565)
- [GitHub Issue #547: Multiple agents conflict](https://github.com/vercel-labs/agent-browser/issues/547)
