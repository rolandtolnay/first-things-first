# Writing First Things First goals

A goal names an observable outcome. It is not a PRD or implementation checklist: the repository’s canonical documents already supply standing intent and method.

## Include

1. **Outcome** — what becomes true for the User or system.
2. **Success signals** — one to three observations that prove it.
3. **Moment/persona** — only when planning context changes the result.
4. **Guardrails** — planning data, paths, external effects, or adjacent scope not to touch.
5. **Hard constraints** — only requirements not already recorded in the repository.

Describe what and why. Omit stack, file layout, testing steps, and delivery method unless the goal intentionally changes them. Name the relevant PRD when implementing one, because PRDs do not imply shipped status by themselves.

## Skeleton

```text
/goal <Outcome-oriented sentence>.

Outcome: <what becomes true for the planner or system>.
Success: <observable checks in the planner, tests, or persistence boundary>.
Guardrails: <what not to touch, infer, deploy, or mutate>.

This run is unattended: follow AGENTS.md and etc/playbook.md, and finish only at GOAL MET or a recorded [blocked].
```

## Quick check

- Can a cold runner and fresh judge prove whether the outcome was met?
- Is the goal one small vertical slice through the real weekly-planning flow?
- Does it identify the most tempting adjacent feature or dangerous data boundary?
- Does it distinguish an intended PRD from currently implemented behavior?
- Did it avoid repeating standing implementation and verification method?
