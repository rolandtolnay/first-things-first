# Phase 9: Visual Polish - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<vision>
## How This Should Work

This is the final phase of the MVP — after this, the product should be usable and feel good to use daily. The visual redesign transforms the current functional-but-utilitarian interface into something calm, intentional, and warm. Think "well-organized desk on a Sunday morning" — not a dark JARVIS command center.

The DESIGN-SYSTEM.md was created using design inspiration from dashboard UIs with floating white cards on soft tinted backgrounds, generous whitespace, and rounded geometry. That spec captures the design principles but it's text — the actual design will be finalized visually through design-phase mockups where I can see options and refine.

Beyond pure visual reskinning, this phase is also an opportunity to make small UX adjustments informed by how competitors (Sunsama, Amie, Fantastical, Outlook) handle the same patterns. The app's feature set is comprehensive — the layout, drag-drop, completion tracking, week navigation all stay the same. But how certain things are presented can be refined to be more intuitive and space-efficient.

When I open the app after this phase, it should feel polished, scannable, and calming. I should be able to glance at the week and immediately see: what day is today, how am I progressing, and what still needs my attention.

</vision>

<essential>
## What Must Be Nailed

- **Visual cohesion** — The entire app must feel like one intentional design, not a collection of components with inconsistent styling. The DESIGN-SYSTEM.md tokens (colors, typography, spacing, shadows, radius) must be applied consistently.
- **Both modes polished** — Light and dark mode must both look intentional and complete, not one polished and one afterthought.
- **Scannability** — The weekly view must be scannable at a glance. Today's column, progress, and remaining items should be immediately obvious without searching.

</essential>

<specifics>
## Specific Ideas

- **Design inspiration**: Three reference images in `/assets/` — dashboard UIs with warm palettes, floating cards on tinted backgrounds, generous rounding. The DESIGN-SYSTEM.md extracts principles from these.
- **Font change**: Replace Geist Sans with Plus Jakarta Sans — geometric, friendly, modern sans-serif.
- **Layout transformation**: Two floating white cards (sidebar + calendar) on a soft teal-tinted page background, separated by gap instead of border.
- **Single time column**: Like Outlook/Google Calendar/Fantastical — time labels appear once on the far left instead of being duplicated per day. This reclaims significant horizontal space for block content.
- **Multi-line block titles**: Currently titles are always single-line truncated. Titles should wrap to fill available block height, capped at 2-3 lines max. 30-minute blocks still truncate; taller blocks show more text.
- **Today column highlight**: Entire column gets a subtle tinted background (not just the header), making today immediately identifiable.
- **Daily progress bar**: Thin horizontal bar (3-4px) directly under each day header, filling left-to-right in primary color as items are completed. Counts all completable items in that day (priorities + time blocks + evening).
- **Completion styling**: Remove the green tint that competes with role colors. Use opacity reduction (40-50%) to de-emphasize completed items while preserving role color identity through left border.
- **Carryover dialog enhancement**: Add previous week completion summary at the top ("You completed 7 of 12 goals last week") before presenting uncompleted items. Makes the weekly planning ritual feel meaningful rather than administrative.
- **Icons**: Replace custom inline SVGs with Lucide equivalents for consistency.

</specifics>

<notes>
## Additional Context

This is the last phase of the v1 milestone. After this + light polishing, the product should be daily-driver ready. The user opens this app multiple times a day — every visual choice should serve scannability and calm.

The DESIGN-SYSTEM.md is comprehensive (500+ lines) with per-component reskinning guides, but it's a starting point, not final. The design-phase workflow will generate mockups for visual comparison and iteration.

Competitive research revealed that Week Plan (the only other Covey-methodology app) is praised for concept but criticized for cluttered UI. FTF's opportunity is to be the first Covey-style planner that actually feels good to use. Sunsama and Amie set the bar for "calm, intentional planning app" aesthetics.

The UX improvements (single time column, multi-line titles, progress bar, today highlight, completion styling, carryover enhancement) are all small structural tweaks, not meaningful refactors of functionality. They align the app with established patterns users carry from other calendar/planning tools.

</notes>

<decisions>
## Decisions (Locked)

- Single shared time column at far left of calendar card, day columns use full width for content — Why: every competitor uses this pattern; per-day labels consume ~21rem of calendar space and break the mental model all users carry from Google Calendar/Outlook/Fantastical
- Multi-line title wrapping in time blocks, capped at 2-3 lines max — Why: single-line truncation undersells blocks representing significant planned time; 2-hour blocks showing 18 characters feels informationally thin; competitors uniformly wrap to fill available height
- Full-column today highlight with subtle tinted background on entire column — Why: user opens app multiple times daily; eye should land on today instantly; header-only highlighting insufficient for rapid scanning
- Thin progress bar (3-4px) under each day header counting all completable items (priorities + time blocks + evening) — Why: answers "how is today going?" at a glance; Sunsama validates this pattern
- Completion styling uses opacity reduction (40-50%) without green tint, preserving role color left border — Why: green tint competes with role color coding; opacity-only de-emphasis is the industry standard and keeps the role → color → goal visual chain intact
- Carryover dialog shows previous week completion summary at top before goal selection — Why: makes the weekly planning ritual feel meaningful; Sunsama's multi-step review validates the pattern
- DESIGN-SYSTEM.md is the starting point for visual tokens, refined through design-phase mockups — Why: design is visual and needs iteration; text spec alone can't guarantee the right feel
- Replace custom inline SVGs with Lucide equivalents — Why: consistency; lucide-react already in project

### Claude's Discretion

- Exact opacity values for completed item de-emphasis (40-50% range)
- Whether multi-line titles cap at 2 or 3 lines (determine during implementation based on visual result)
- Progress bar empty-state behavior (hidden when no items? always visible?)
- Specific animation timing for progress bar fill
- How single-word goal titles handle word-breaking in narrow blocks
- Scrollbar styling details
- Exact shadow values and fine-tuning beyond DESIGN-SYSTEM.md spec

</decisions>

<deferred>
## Deferred Ideas

- "Hide completed" toggle (power-user setting, not needed for MVP)
- Weekly reflection/journaling step in carryover dialog (Sunsama-style, but adds scope)
- Keyboard shortcuts for common actions (good idea but separate phase)
- Mobile/tablet responsive layout (explicitly deferred to v2)

</deferred>

---

*Phase: 09-visual-polish*
*Context gathered: 2026-03-22*
