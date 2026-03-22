# Phase 6: Time Block Interactions - Context

**Gathered:** 2026-03-22
**Status:** Ready for research

<vision>
## How This Should Work

Time blocks should feel like Google Calendar — smooth, familiar, no learning curve. When you hover over a block, a subtle resize handle appears at the bottom edge. Drag it down to extend the block, drag it up to shrink it, and it snaps cleanly to 30-minute increments. You feel the grid guiding you.

To create a freestyle block (something not tied to a goal), you click and drag on empty time slots to "draw" the block's duration. As you drag, the block appears immediately. When you release, a cursor appears inline on the block for typing the title — no popover, no modal, just type and hit Enter. It's the fastest possible path from "I need time for this" to "it's on the calendar."

The calendar enforces a quiet constraint: no overlapping blocks. You can only do one thing at a time, and the calendar reflects that. During resize, the block simply stops growing when it reaches an occupied slot — you feel the boundary without any error message. When dropping a block, if it would overlap, it snaps back silently. The constraint is intentional and philosophical, not a limitation.

</vision>

<essential>
## What Must Be Nailed

- **Resize feels smooth and predictable** — bottom-edge handle with 30-min snapping, live time feedback. Must feel as natural as Google Calendar.
- **Freestyle creation is fast** — click-drag-draw followed by inline title entry. Zero friction from "I want to block time" to "it's scheduled."
- **Overlap prevention is invisible** — boundary clamping and silent rejection. The constraint should feel like the app was designed this way, not like something is broken.

</essential>

<specifics>
## Specific Ideas

- Resize should work exactly like Google Calendar: bottom-edge only, handle appears on hover, cursor changes to `ns-resize`
- Click-drag-draw for freestyle blocks like Google Calendar's event creation gesture
- Inline title editing directly on the drawn block (not a popover) — Enter confirms, Escape cancels
- When dropping a goal that would create a 1hr block but only 30min is available, clamp to the available space rather than rejecting the drop
- Minimum 30min block duration enforced during both creation and resize

</specifics>

<notes>
## Additional Context

Research confirmed that bottom-edge-only resize is universal across Google Calendar, Notion Calendar, Fantastical, and Amie. No mainstream calendar uses top-edge resize for daily/weekly views.

Overlap prevention is a deliberate departure from mainstream calendars (which all allow overlaps). This aligns with Covey's philosophy — you can only do one thing at a time. The UX must communicate this as an intentional design choice, not a missing feature.

The target user is a desktop power user at 1440px+ who will discover hover states quickly. Resize handles can be compact with hover-reveal rather than always-visible.

</notes>

<decisions>
## Decisions (Locked)

- Bottom-edge-only resize handles — Why: universal standard across Google Calendar, Notion Calendar, Fantastical, Amie; zero learning curve for the target audience
- 30-minute snap increments for resize — Why: matches the existing grid granularity and Covey's half-hour planning unit; coarser than Google's 15min but intentional for this planning model
- Click-drag-draw on empty grid for freestyle block creation — Why: dominant creation pattern established by Google Calendar; matches the physical act of blocking time
- Inline title editing on the drawn block (not popover/modal) — Why: fastest creation path; freestyle blocks only need a name, no extra fields; maintains spatial context
- Boundary clamping for overlap prevention during resize — Why: more tactile and forgiving than hard rejection; block stops at occupied boundary so user feels the constraint naturally
- Silent snap-back for invalid drops — Why: no toasts or warnings; the constraint is philosophical (Covey: one thing at a time) and should feel designed-in, not like an error
- Goal drops clamp to available space (min 30min) — Why: adaptive behavior is more helpful than rejection; user chose this slot intentionally, give them as much time as fits
- Reject drops only when less than 30min available — Why: 30min is the minimum meaningful planning unit in this system
- Resize handle: hover-revealed, compact — Why: desktop power user at 1440px+ discovers hover states quickly; always-visible handles would add visual clutter to a planning-focused UI
- Min 30min / max 8hr or end-of-day duration limits — Why: 30min is the grid's atomic unit; 8hr/end-of-day prevents blocks from becoming meaningless full-day spans

### Claude's Discretion

- Resize handle visual design (size, color, opacity, animation)
- Live time label positioning and styling during resize drag
- Click-drag-draw visual feedback style (how the forming block looks before mouse-up)
- Whether to show a brief cancel affordance during inline title editing
- Pointer event handling strategy for coexisting resize + dnd-kit drag on the same block element
- Snap-back animation timing and easing

</decisions>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-time-block-interactions*
*Context gathered: 2026-03-22*
