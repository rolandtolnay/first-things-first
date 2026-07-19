import { describe, expect, it } from "vitest";
import { buildImportPayload, buildImportReview } from "@/lib/ics-import";
import type { DayPriority, TimeBlock, Week, WeekId } from "@/types";

// The viewed Week: Monday 2026-07-20 through Sunday 2026-07-26.
// Events use floating local times so assertions hold in any machine timezone.
function week(overrides: Partial<Week> = {}): Week {
  return {
    id: "2026-W30" as WeekId,
    startDate: "2026-07-20T00:00:00.000Z",
    roles: [],
    goals: [],
    dayPriorities: [],
    timeBlocks: [],
    eveningBlocks: [],
    createdAt: "2026-07-20T00:00:00.000Z",
    updatedAt: "2026-07-20T00:00:00.000Z",
    ...overrides,
  };
}

function vevent(lines: string[]): string {
  return ["BEGIN:VEVENT", ...lines, "END:VEVENT"].join("\r\n");
}

function ics(...events: string[]): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "X-WR-CALNAME:Personal",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

function review(icsText: string, weekOverrides: Partial<Week> = {}) {
  return buildImportReview({
    icsText,
    filename: "calendar.ics",
    week: week(weekOverrides),
    now: "2026-07-19T12:00:00.000Z",
  });
}

const existingBlock: TimeBlock = {
  id: "block-1",
  type: "freestyle",
  dayIndex: 1,
  startSlot: 4, // 10:00
  duration: 2, // – 11:00
  title: "Existing",
  completed: false,
};

describe("week filtering and classification", () => {
  it("keeps only entries inside the viewed week", () => {
    const result = review(
      ics(
        vevent(["UID:before", "DTSTART:20260715T100000", "DTEND:20260715T110000", "SUMMARY:Before"]),
        vevent(["UID:inside", "DTSTART:20260721T100000", "DTEND:20260721T110000", "SUMMARY:Inside"]),
        vevent(["UID:after", "DTSTART:20260728T100000", "DTEND:20260728T110000", "SUMMARY:After"])
      )
    );

    expect(result.counts.total).toBe(1);
    expect(result.candidates[0]).toMatchObject({
      title: "Inside",
      kind: "timed",
      dayIndex: 1,
      startSlot: 4,
      duration: 2,
      status: "importable",
      timeLabel: "10:00–11:00",
    });
  });

  it("maps days from the week id even when startDate carries a timezone-skewed ISO string", () => {
    // Weeks created in a positive-UTC-offset browser store startDate as the
    // local Monday midnight, whose ISO date component is the Sunday before
    // (e.g. Bucharest: 2026-07-19T21:00:00Z). Day mapping must not shift.
    const result = review(
      ics(
        vevent(["UID:tue", "DTSTART:20260721T100000", "DTEND:20260721T110000", "SUMMARY:Tuesday"]),
        vevent(["UID:sun", "DTSTART:20260726T100000", "DTEND:20260726T110000", "SUMMARY:Sunday"])
      ),
      { startDate: "2026-07-19T21:00:00.000Z" }
    );

    expect(result.counts.total).toBe(2);
    expect(result.candidates.map((c) => [c.title, c.dayIndex])).toEqual([
      ["Tuesday", 1],
      ["Sunday", 6],
    ]);
  });

  it("classifies all-day entries as Freestyle Day Priority candidates", () => {
    const result = review(
      ics(vevent(["UID:allday", "DTSTART;VALUE=DATE:20260722", "SUMMARY:Conference day"]))
    );

    expect(result.candidates[0]).toMatchObject({
      kind: "allday",
      dayIndex: 2,
      status: "importable",
      timeLabel: "All day",
    });
  });

  it("expands a multi-day all-day entry across its covered days in the week", () => {
    const result = review(
      ics(
        vevent([
          "UID:trip",
          "DTSTART;VALUE=DATE:20260724",
          "DTEND;VALUE=DATE:20260726", // exclusive: Fri + Sat
          "SUMMARY:Trip",
        ])
      )
    );

    expect(result.candidates.map((c) => c.dayIndex)).toEqual([4, 5]);
  });

  it("expands weekly recurrence only for instances inside the week", () => {
    const result = review(
      ics(
        vevent([
          "UID:standup",
          "DTSTART:20260601T090000",
          "DTEND:20260601T093000",
          "RRULE:FREQ=WEEKLY;BYDAY=MO,WE",
          "SUMMARY:Standup",
        ])
      )
    );

    expect(result.counts.total).toBe(2);
    expect(result.candidates.map((c) => [c.dayIndex, c.startSlot])).toEqual([
      [0, 2],
      [2, 2],
    ]);
    expect(result.candidates.every((c) => c.status === "importable")).toBe(true);
    expect(result.candidates[0].importMeta.recurrenceId).toBeTruthy();
  });

  it("marks cancelled entries as skipped", () => {
    const result = review(
      ics(
        vevent([
          "UID:cancelled",
          "DTSTART:20260721T100000",
          "DTEND:20260721T110000",
          "STATUS:CANCELLED",
          "SUMMARY:Cancelled thing",
        ])
      )
    );

    expect(result.candidates[0]).toMatchObject({
      status: "unsupported",
      reason: "Cancelled in the source calendar",
    });
  });

  it("skips timed entries outside the 8:00–20:00 grid", () => {
    const result = review(
      ics(
        vevent(["UID:early", "DTSTART:20260721T070000", "DTEND:20260721T080000", "SUMMARY:Early"]),
        vevent(["UID:late", "DTSTART:20260721T193000", "DTEND:20260721T203000", "SUMMARY:Late"])
      )
    );

    expect(result.candidates.map((c) => c.status)).toEqual(["unsupported", "unsupported"]);
    expect(result.candidates[0].reason).toBe("Outside the 8:00–20:00 planner day");
  });

  it("skips entries that don't align to 30-minute slots", () => {
    const result = review(
      ics(vevent(["UID:odd", "DTSTART:20260721T101500", "DTEND:20260721T111500", "SUMMARY:Odd"]))
    );

    expect(result.candidates[0]).toMatchObject({
      status: "unsupported",
      reason: "Doesn't align to 30-minute slots",
    });
  });

  it("marks entries overlapping existing blocks as conflicts", () => {
    const result = review(
      ics(vevent(["UID:clash", "DTSTART:20260721T103000", "DTEND:20260721T113000", "SUMMARY:Clash"])),
      { timeBlocks: [existingBlock] }
    );

    expect(result.candidates[0]).toMatchObject({
      status: "conflict",
      reason: "Overlaps a block already on this day",
    });
  });

  it("marks a later candidate overlapping an earlier accepted one as a conflict", () => {
    const result = review(
      ics(
        vevent(["UID:first", "DTSTART:20260721T100000", "DTEND:20260721T110000", "SUMMARY:First"]),
        vevent(["UID:second", "DTSTART:20260721T103000", "DTEND:20260721T113000", "SUMMARY:Second"])
      )
    );

    expect(result.candidates.map((c) => c.status)).toEqual(["importable", "conflict"]);
  });

  it("marks all-day entries beyond the day priority cap as conflicts", () => {
    const fullDay: DayPriority[] = [
      { id: "p1", type: "goal", goalId: "g", dayIndex: 2, order: 0, completed: false },
      { id: "p2", type: "goal", goalId: "g", dayIndex: 2, order: 1, completed: false },
    ];
    const result = review(
      ics(vevent(["UID:allday", "DTSTART;VALUE=DATE:20260722", "SUMMARY:Overflow"])),
      { dayPriorities: fullDay }
    );

    expect(result.candidates[0]).toMatchObject({
      status: "conflict",
      reason: "This day's priorities are already full",
    });
  });
});

describe("duplicates", () => {
  const fileText = ics(
    vevent(["UID:meeting", "DTSTART:20260721T100000", "DTEND:20260721T110000", "SUMMARY:Meeting"])
  );

  it("marks candidates whose fingerprint already exists in the week as duplicates", () => {
    const first = review(fileText);
    const payload = buildImportPayload(
      first.candidates,
      new Set(first.candidates.map((c) => c.key))
    );
    const importedWeek = week({
      timeBlocks: payload.timeBlocks.map((input, index) => ({
        ...input,
        id: `imported-${index}`,
      })),
    });

    const second = buildImportReview({
      icsText: fileText,
      filename: "calendar.ics",
      week: importedWeek,
      now: "2026-07-19T13:00:00.000Z",
    });

    expect(second.candidates[0]).toMatchObject({
      status: "duplicate",
      reason: "Already imported into this week",
    });
  });

  it("marks a repeated identical entry within one file as a duplicate", () => {
    const doubled = ics(
      vevent(["UID:meeting", "DTSTART:20260721T100000", "DTEND:20260721T110000", "SUMMARY:Meeting"]),
      vevent(["UID:meeting", "DTSTART:20260721T100000", "DTEND:20260721T110000", "SUMMARY:Meeting"])
    );
    const result = review(doubled);
    expect(result.candidates.map((c) => c.status).sort()).toEqual(["duplicate", "importable"]);
  });
});

describe("metadata extraction", () => {
  it("preserves safe event details and provenance", () => {
    const result = review(
      ics(
        vevent([
          "UID:detailed",
          "DTSTART:20260721T140000",
          "DTEND:20260721T150000",
          "SUMMARY:Planning session",
          "LOCATION:Office 12",
          "DESCRIPTION:Agenda + join at https://meet.google.com/abc-defg-hij",
          "URL:https://example.com/event",
          "STATUS:TENTATIVE",
          "TRANSP:OPAQUE",
        ])
      )
    );

    const meta = result.candidates[0].importMeta;
    expect(meta).toMatchObject({
      source: "ics",
      sourceFilename: "calendar.ics",
      calendarName: "Personal",
      uid: "detailed",
      allDay: false,
      importedAt: "2026-07-19T12:00:00.000Z",
      status: "TENTATIVE",
      availability: "OPAQUE",
      location: "Office 12",
      url: "https://example.com/event",
      meetingLink: "https://meet.google.com/abc-defg-hij",
    });
    expect(meta.fingerprint).toBeTruthy();
    expect(meta.originalStart).toBeTruthy();
    expect(meta.notes).toContain("Agenda");
    expect(result.calendarName).toBe("Personal");
  });

  it("records the source timezone when the entry is zoned", () => {
    const result = review(
      ics(
        [
          "BEGIN:VTIMEZONE",
          "TZID:Europe/Bucharest",
          "BEGIN:DAYLIGHT",
          "DTSTART:19700329T030000",
          "TZOFFSETFROM:+0200",
          "TZOFFSETTO:+0300",
          "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
          "END:DAYLIGHT",
          "BEGIN:STANDARD",
          "DTSTART:19701025T040000",
          "TZOFFSETFROM:+0300",
          "TZOFFSETTO:+0200",
          "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
          "END:STANDARD",
          "END:VTIMEZONE",
        ].join("\r\n"),
        vevent([
          "UID:zoned",
          "DTSTART;TZID=Europe/Bucharest:20260721T100000",
          "DTEND;TZID=Europe/Bucharest:20260721T110000",
          "SUMMARY:Zoned",
        ])
      )
    );

    expect(result.candidates[0].importMeta.timezone).toBe("Europe/Bucharest");
  });
});

describe("buildImportPayload", () => {
  it("maps only selected importable candidates onto store inputs", () => {
    const result = review(
      ics(
        vevent(["UID:timed", "DTSTART:20260721T100000", "DTEND:20260721T110000", "SUMMARY:Meeting"]),
        vevent(["UID:allday", "DTSTART;VALUE=DATE:20260722", "SUMMARY:Conference"]),
        vevent(["UID:skipped", "DTSTART:20260721T070000", "DTEND:20260721T080000", "SUMMARY:Early"])
      )
    );

    const timed = result.candidates.find((c) => c.title === "Meeting")!;
    const allday = result.candidates.find((c) => c.title === "Conference")!;
    const skipped = result.candidates.find((c) => c.title === "Early")!;

    const payload = buildImportPayload(
      result.candidates,
      new Set([timed.key, allday.key, skipped.key]),
      "2026-07-19T15:00:00.000Z"
    );

    expect(payload.timeBlocks).toHaveLength(1);
    expect(payload.timeBlocks[0]).toMatchObject({
      type: "freestyle",
      dayIndex: 1,
      startSlot: 4,
      duration: 2,
      title: "Meeting",
      completed: false,
    });
    expect(payload.timeBlocks[0].importMeta?.importedAt).toBe("2026-07-19T15:00:00.000Z");

    expect(payload.dayPriorities).toHaveLength(1);
    expect(payload.dayPriorities[0]).toMatchObject({
      type: "freestyle",
      text: "Conference",
      dayIndex: 2,
      completed: false,
    });
    expect(payload.dayPriorities[0].importMeta?.fingerprint).toBe(allday.importMeta.fingerprint);
  });

  it("excludes unselected candidates", () => {
    const result = review(
      ics(vevent(["UID:timed", "DTSTART:20260721T100000", "DTEND:20260721T110000", "SUMMARY:Meeting"]))
    );
    const payload = buildImportPayload(result.candidates, new Set());
    expect(payload.timeBlocks).toHaveLength(0);
    expect(payload.dayPriorities).toHaveLength(0);
  });
});

describe("malformed input", () => {
  it("throws on unparsable ICS text (caller shows the failure state)", () => {
    expect(() => review("not a calendar")).toThrow();
  });

  it("returns an empty review for a calendar with no events", () => {
    const result = review(ics());
    expect(result.counts).toEqual({
      total: 0,
      importable: 0,
      unsupported: 0,
      conflicts: 0,
      duplicates: 0,
    });
  });
});
