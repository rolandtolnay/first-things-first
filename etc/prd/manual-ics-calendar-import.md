# Manual ICS Calendar Import

## Problem Statement

The User already has commitments in external calendars, but First Things First currently requires re-entering them manually into each Week. This makes the weekly planning snapshot less complete and adds friction before the User can plan around real obligations.

The User needs a simple, explicit way to import calendar data into the currently viewed Week without setting up a live provider connection, creating Goals, or assigning Roles. Imported calendar data should land in the planner surfaces that match its shape: timed commitments as Freestyle Blocks and all-day commitments as Freestyle Day Priorities.

## Solution

Add a manual single-file `.ics` import flow from the Week toolbar. The User chooses an `.ics` file, the app parses it in the browser, filters it to the currently viewed Week, expands recurring entries only for that Week, and shows a review screen before anything is persisted.

Timed imported calendar entries become unassigned Freestyle Time Blocks when they fit the visible 8:00–20:00 Slot grid and do not overlap existing or newly selected Time Blocks. All-day imported calendar entries become Freestyle Day Priorities when the target Day has capacity. Items that cannot be safely imported are still shown in review with a clear skipped/conflict reason and default to not imported.

Imported freestyle items preserve Import Metadata for provenance, duplicate detection, and future display. Metadata includes safe event details that are useful to the User, such as notes, location, URL, and a best-effort meeting link, but not raw ICS text, attendees, alarms, or a provider sync cache.

## User Stories

1. As a User, I want an explicit Import Calendar action in the Week toolbar, so that I understand the import targets the currently viewed Week.
2. As a User, I want to drag or select a single `.ics` file, so that I can import from Google Calendar, Apple Calendar, or another provider without connecting an account.
3. As a User, I want the app to review only calendar entries that occur during the currently viewed Week, so that imports stay aligned with the Week snapshot I am planning.
4. As a User, I want timed calendar entries to become Freestyle Blocks, so that real commitments appear on the Slot grid without creating Goals or requiring Role mapping.
5. As a User, I want all-day calendar entries to become Freestyle Day Priorities, so that date-bound commitments are visible for that Day without pretending they have a specific time.
6. As a User, I want recurring calendar entries expanded into this Week’s matching instances, so that weekly repeating commitments import correctly without importing future Weeks.
7. As a User, I want to see notes, location, URLs, and meeting links in the review screen, so that I can confirm the imported item is the right one before adding it.
8. As a User, I want duplicate imports to be detected and defaulted to skipped, so that re-importing the same file does not duplicate my plan.
9. As a User, I want conflicts and unsupported items to be visible with reasons, so that I know why something will not be imported.
10. As a User, I want to select or deselect review items before confirming, so that I stay in control of what enters my Week.
11. As a User, I want imported Freestyle Day Priorities to behave like normal Day Priorities for completion, so that Daily Streak remains consistent.
12. As a User, I want import confirmation to persist all selected items together, so that the Week does not end up partially imported if something fails.

## Implementation Decisions

- V1 is manual `.ics` import only. No Google Calendar OAuth, Apple/iCloud connection, background sync, subscriptions, or provider token storage.
- V1 accepts one `.ics` file per import. Multiple files and provider export ZIP files are out of scope; Users can unzip or import individual calendars manually.
- Import is scoped to the currently viewed Week. Entries outside that Week are ignored for the review result.
- Parsing should happen client-side and persist through the existing Week document flow. Do not introduce an ingestion API or normalized imported-event table.
- Use a deep, pure import module that accepts ICS text, source file information, the target Week date range, existing Week contents, and import options, then returns review candidates plus summary counts. The UI should not own parsing, recurrence expansion, duplicate detection, or conflict classification.
- Use a browser-capable ICS parsing approach that supports recurrence expansion, exceptions, all-day entries, time zones, and common Google/Apple ICS quirks. Candidate libraries include `ical.js` plus recurrence support or a higher-level expander built on it; final implementation should prefer correctness and testability over writing a custom ICS parser.
- Extend the Day Priority model so a Day Priority can be either goal-linked or freestyle. A Freestyle Day Priority has its own text, no Goal, no Role, independent completion, and optional Import Metadata.
- Existing goal-linked Day Priorities keep their current semantics: they reference a Goal, use the Goal text/Role color, can be completed independently, and participate in existing drag/drop behavior.
- Freestyle Day Priorities created by import should render, complete, and delete from the Day Priority list. V1 does not need to make them draggable or convertible into Time Blocks unless implementation can support that without broad drag/drop redesign.
- Extend imported freestyle items with optional Import Metadata. For V1, Import Metadata applies to imported Freestyle Day Priorities and imported Freestyle Blocks, not to Goals or goal-linked instances.
- Import Metadata should include provenance and safe event details:
  - source type (`ics`)
  - source filename
  - calendar name when available
  - ICS UID when available
  - recurrence instance identifier when available
  - original start and end values as interpreted from the ICS
  - all-day flag
  - timezone when known
  - imported-at timestamp
  - stable fingerprint used for duplicate detection
  - original status/availability when available
  - notes/description text when available
  - location when available
  - URL when available
  - best-effort meeting link extracted from URL, location, or notes
- Do not store raw VEVENT text, attendees, alarms, attachments, or full provider-specific payloads in the Week document.
- Review should be selection-only. It can show parsed title, day/time, notes/link/location, status, and reason labels, but editing title, notes, date, time, duration, or conflict resolution is out of scope. Users can edit imported Freestyle Blocks afterward through the normal planner UI where supported.
- Timed entries import only when their full span fits the visible 8:00–20:00 Slot grid. Entries starting before 8:00 or ending after 20:00 are shown as skipped with an out-of-grid reason. Do not clip, move, split, or convert them into Evening Blocks in V1.
- Imported timed entries must preserve the no-overlap invariant. Entries that overlap existing Time Blocks or earlier selected import candidates are shown as conflicts and default to skipped. Do not auto-fit or silently change their times.
- Timed entry durations should map to 30-minute Slots. If an entry does not align cleanly to Slot boundaries, V1 should classify it as unsupported/skipped rather than rounding silently.
- All-day entries import as Freestyle Day Priorities only when the target Day has capacity under the existing Day Priority cap. If the Day is already full, or selected imports would exceed the cap, those candidates are conflicts and default to skipped.
- Imported Freestyle Day Priorities start incomplete and count toward Daily Streak exactly like goal-linked Day Priorities.
- Cancelled ICS entries are skipped. Non-cancelled entries may be imported; their original status/availability should be preserved in metadata when available.
- Duplicate detection should use a stable fingerprint based on ICS identity and interpreted occurrence data. Already-imported matching fingerprints are shown in review and default to skipped. V1 does not replace or update previously imported items.
- The review screen should clearly summarize counts: importable selected items, skipped unsupported items, conflicts, duplicates, and total detected entries for the current Week.
- Confirmation should use a bulk store action that applies all selected candidates in a single Week update. Avoid one persistence write per imported item.
- The main planner UI should not add a special imported-item indicator in V1. Import details are shown during review and preserved for future display.
- The visible UI copy should use customer-friendly language such as “Import calendar” and “this week.” Internal code and docs should preserve canonical domain terms such as Week, Day, Day Priority, Freestyle Day Priority, Freestyle Block, Time Block, Slot, and Import Metadata.
- No ADR is required for manual client-side `.ics` import because it follows the existing browser-direct, JSONB Week snapshot architecture. Revisit ADRs only if future work adds live provider sync, token storage, or normalized imported calendar records.

## Testing Decisions

- Required automated tests should focus on the pure import engine and the store commit path. Good tests should assert observable import outcomes and persisted Week shape, not parser internals, component structure, or Tailwind classes.
- Import engine tests should cover:
  - filtering entries to the currently viewed Week
  - timed versus all-day classification
  - recurrence expansion for instances inside the Week
  - cancelled entries becoming skipped candidates
  - out-of-grid timed entries becoming skipped candidates
  - non-30-minute-aligned entries becoming skipped candidates
  - overlapping timed entries becoming conflict candidates
  - all-day entries exceeding the Day Priority cap becoming conflict candidates
  - duplicate fingerprint detection
  - extraction of safe metadata: UID, recurrence ID, original times, timezone, status/availability, notes, location, URL, meeting link, source filename, imported-at timestamp, and fingerprint
- Store commit tests should cover:
  - selected timed candidates create unassigned Freestyle Time Blocks
  - selected all-day candidates create Freestyle Day Priorities
  - imported items preserve Import Metadata
  - imported Freestyle Day Priorities start incomplete and have stable ordering after existing priorities
  - conflicts, duplicates, unsupported, and unselected candidates are not persisted
  - the import commits the Week once rather than saving once per item
  - existing Goals, Roles, goal-linked Day Priorities, Time Blocks, Evening Blocks, and Freestyle Blocks remain unchanged except for the appended imports
- Existing Week mapping tests should continue to protect JSONB round-trip behavior. Add coverage only if type or fixture changes are needed to prove Import Metadata survives persistence boundaries.
- Browser verification should be run during implementation because this is a UI flow: open the import dialog from the Week toolbar, select an `.ics` file, review mixed importable/skipped/conflict rows, confirm, and verify the resulting Freestyle Blocks and Freestyle Day Priorities appear in the planner.
- Automated E2E coverage is not required for V1 unless the implementation already has an established file-upload E2E harness.

## Out of Scope

- Live Google Calendar, Apple Calendar, iCloud, Outlook, or CalDAV connections.
- Background sync, incremental sync, provider webhooks, sync tokens, or disconnect/reconnect flows.
- Importing provider export ZIP files or multiple `.ics` files in one import.
- Importing into multiple Weeks or automatically creating Weeks from the ICS file.
- Role mapping for imported entries.
- Creating Goals from imported entries.
- Assigning Roles to imported Freestyle Blocks or Freestyle Day Priorities.
- Importing or displaying attendees, alarms, attachments, raw ICS text, or complete provider payloads.
- Importing timed entries outside the 8:00–20:00 grid.
- Clipping, moving, rounding, splitting, or auto-fitting imported timed entries.
- Importing after-hours entries as Evening Blocks.
- Replacing or updating previously imported items on re-import.
- Editing imported item fields inside the review screen.
- Adding a main-planner indicator or details popover for Import Metadata.
- Redesigning the Day Priority cap or priority layout.

## Further Notes

This PRD intentionally treats manual ICS import as a planning aid, not a calendar sync system. The import flow should preserve the User’s explicit control: parse locally, review before commit, and only append selected freestyle planning items to the current Week.

The largest domain change is Freestyle Day Priorities. Keep that model narrow: it exists so all-day imported commitments can appear in the Day’s priority surface without creating Goals or Roles. Avoid letting this become a general task system unless future product work deliberately expands it.
