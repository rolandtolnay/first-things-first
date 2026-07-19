/**
 * ICS Import — pure engine for manual `.ics` calendar import.
 *
 * Owns parsing, week filtering, recurrence expansion, timed/all-day
 * classification, conflict/duplicate detection, and Import Metadata extraction
 * (see etc/prd/manual-ics-calendar-import.md). The UI only renders the review
 * this module produces and forwards the selection to the store's
 * `importWeekItems`.
 *
 * Timed entries become unassigned Freestyle Block candidates when they fit the
 * viewed Week's Slot grid (its configured day bounds; default 8:00–20:00) on
 * 30-minute boundaries without overlaps. All-day
 * entries become Freestyle Day Priority candidates under the per-day cap.
 * Everything else stays visible in review with a reason and defaults to
 * skipped. Nothing here mutates the Week.
 */

import ICAL from "ical.js";
import type {
  DayOfWeek,
  DayPriority,
  ImportMetadata,
  TimeSlotIndex,
  Week,
  CreateTimeBlockInput,
} from "@/types";
import {
  MINUTES_PER_SLOT,
  MAX_BLOCK_SLOTS,
  weekDayBounds,
} from "@/lib/time-model";
import { MAX_PRIORITIES_PER_DAY } from "@/lib/constants";
import { DAY_NAMES_SHORT, parseWeekId } from "@/lib/utils";

// ============================================================================
// Public shapes
// ============================================================================

export type ImportCandidateStatus =
  | "importable"
  | "update"
  | "unsupported"
  | "conflict"
  | "duplicate";

/**
 * How an "update" candidate maps onto the already-planned item it refreshes
 * (matched by ICS UID + recurrence id).
 */
export interface ImportUpdateTarget {
  targetKind: "timeBlock" | "dayPriority";
  targetId: string;
  /** What the planned item currently says, e.g. "Mon 10:00–11:30". */
  previousLabel: string;
  /** Time/day moved (defaults to selected) vs title-only (defaults to unselected). */
  change: "time" | "title";
}

export interface ImportCandidate {
  /** Stable key for selection state in the review UI. */
  key: string;
  kind: "timed" | "allday";
  title: string;
  dayIndex: DayOfWeek;
  /** Grid placement (timed candidates only). */
  startSlot?: TimeSlotIndex;
  duration?: number;
  status: ImportCandidateStatus;
  /** Present when status is "update": the planned item this refreshes. */
  update?: ImportUpdateTarget;
  /** Customer-facing reason when not importable. */
  reason?: string;
  /** Customer-facing time label, e.g. "10:00–11:30" or "All day". */
  timeLabel: string;
  details: {
    notes?: string;
    location?: string;
    url?: string;
    meetingLink?: string;
  };
  importMeta: ImportMetadata;
}

export interface ImportReviewCounts {
  total: number;
  importable: number;
  updates: number;
  unsupported: number;
  conflicts: number;
  duplicates: number;
}

export interface ImportReview {
  candidates: ImportCandidate[];
  counts: ImportReviewCounts;
  calendarName?: string;
}

export interface BuildImportReviewInput {
  icsText: string;
  filename: string;
  /** The currently viewed Week — provides the date window and existing content. */
  week: Week;
  /** Injected clock for determinism in tests. */
  now?: string;
}

// ============================================================================
// Small pure helpers
// ============================================================================

const MS_PER_DAY = 86_400_000;
/** Recurrence iteration guard: a weekly rule spanning ~40 years. */
const MAX_RECURRENCE_ITERATIONS = 2000;

/** Stable non-cryptographic string hash (djb2, hex). */
function hashFingerprint(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(16);
}

/** Local-date key (UTC-free) used to diff calendar days. */
function localDayValue(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function formatClock(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour}:${minute.toString().padStart(2, "0")}`;
}

const MEETING_LINK_PATTERN =
  /https?:\/\/[^\s<>"']*(?:zoom\.us|meet\.google\.com|teams\.microsoft\.com|webex\.com|whereby\.com|meet\.jit\.si)[^\s<>"']*/i;

function extractMeetingLink(
  ...sources: Array<string | undefined>
): string | undefined {
  for (const source of sources) {
    const match = source?.match(MEETING_LINK_PATTERN);
    if (match) return match[0];
  }
  return undefined;
}

interface UpdateTargetEntry {
  kind: "timeBlock" | "dayPriority" | "evening";
  id: string;
  dayIndex: DayOfWeek;
  title: string;
  fingerprint: string;
  /** Planned span in minutes-of-day (time blocks only). */
  startMin?: number;
  endMin?: number;
}

function uidKeyOf(uid: string | undefined, recurrenceId: string | undefined): string | null {
  return uid ? `${uid}|${recurrenceId ?? ""}` : null;
}

/**
 * Index of previously imported items by UID + recurrence id, so a re-import can
 * recognize a moved or renamed event and refresh the planned item in place.
 */
function existingUpdateTargets(
  week: Week,
  dayStartMin: number
): Map<string, UpdateTargetEntry> {
  const targets = new Map<string, UpdateTargetEntry>();

  for (const block of week.timeBlocks) {
    const key = uidKeyOf(block.importMeta?.uid, block.importMeta?.recurrenceId);
    if (!key || targets.has(key)) continue;
    const startMin = dayStartMin + block.startSlot * MINUTES_PER_SLOT;
    targets.set(key, {
      kind: "timeBlock",
      id: block.id,
      dayIndex: block.dayIndex,
      title: block.title,
      fingerprint: block.importMeta!.fingerprint,
      startMin,
      endMin: startMin + block.duration * MINUTES_PER_SLOT,
    });
  }
  for (const priority of week.dayPriorities) {
    const key = uidKeyOf(priority.importMeta?.uid, priority.importMeta?.recurrenceId);
    if (!key || targets.has(key)) continue;
    targets.set(key, {
      kind: "dayPriority",
      id: priority.id,
      dayIndex: priority.dayIndex,
      title: priority.text ?? "",
      fingerprint: priority.importMeta!.fingerprint,
    });
  }
  for (const block of week.eveningBlocks) {
    const key = uidKeyOf(block.importMeta?.uid, block.importMeta?.recurrenceId);
    if (!key || targets.has(key)) continue;
    // Converted to the evening surface: recognized, but not auto-updatable.
    targets.set(key, {
      kind: "evening",
      id: block.id,
      dayIndex: block.dayIndex,
      title: block.title,
      fingerprint: block.importMeta!.fingerprint,
    });
  }
  return targets;
}

/** Fingerprints of everything previously imported into this Week. */
function existingFingerprints(week: Week): Set<string> {
  const fingerprints = new Set<string>();
  const collect = (meta: ImportMetadata | undefined) => {
    if (meta?.fingerprint) fingerprints.add(meta.fingerprint);
  };
  week.timeBlocks.forEach((block) => collect(block.importMeta));
  week.eveningBlocks.forEach((block) => collect(block.importMeta));
  week.dayPriorities.forEach((priority) => collect(priority.importMeta));
  return fingerprints;
}

// ============================================================================
// Occurrence extraction (ical.js boundary)
// ============================================================================

interface Occurrence {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  uid?: string;
  recurrenceId?: string;
  timezone?: string;
  status?: string;
  availability?: string;
  notes?: string;
  location?: string;
  url?: string;
  meetingLink?: string;
}

function stringProp(component: ICAL.Component, name: string): string | undefined {
  const value = component.getFirstPropertyValue(name);
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

function occurrenceFrom(
  event: ICAL.Event,
  start: ICAL.Time,
  end: ICAL.Time,
  recurrenceId?: string
): Occurrence {
  const component = event.component;
  const url = stringProp(component, "url");
  const location = event.location?.trim() || undefined;
  const notes = event.description?.trim() || undefined;
  const conference = stringProp(component, "x-google-conference");

  return {
    title: event.summary?.trim() || "Untitled event",
    start: start.toJSDate(),
    end: end.toJSDate(),
    allDay: start.isDate,
    uid: event.uid ?? undefined,
    recurrenceId,
    timezone: start.zone?.tzid === "floating" ? undefined : start.zone?.tzid,
    status: stringProp(component, "status"),
    availability: stringProp(component, "transp"),
    notes,
    location,
    url,
    meetingLink: extractMeetingLink(conference, url, location, notes),
  };
}

/**
 * Parse the file and expand every occurrence that intersects the window.
 * Returns occurrences plus the calendar display name.
 */
function extractOccurrences(
  icsText: string,
  windowStart: Date,
  windowEnd: Date
): { occurrences: Occurrence[]; calendarName?: string } {
  const component = new ICAL.Component(ICAL.parse(icsText));

  // Register embedded timezones so TZID references resolve.
  for (const vtimezone of component.getAllSubcomponents("vtimezone")) {
    try {
      ICAL.TimezoneService.register(new ICAL.Timezone(vtimezone));
    } catch {
      // An unparsable VTIMEZONE falls back to floating-time interpretation.
    }
  }

  const calendarName = stringProp(component, "x-wr-calname");

  const events = component
    .getAllSubcomponents("vevent")
    .map((vevent) => new ICAL.Event(vevent));
  const parents = events.filter((event) => !event.isRecurrenceException());
  const exceptions = events.filter((event) => event.isRecurrenceException());
  for (const exception of exceptions) {
    const parent = parents.find((candidate) => candidate.uid === exception.uid);
    parent?.relateException(exception);
  }

  const windowStartValue = windowStart.getTime();
  const windowEndValue = windowEnd.getTime();
  const inWindow = (date: Date) =>
    date.getTime() >= windowStartValue && date.getTime() < windowEndValue;

  const occurrences: Occurrence[] = [];
  const seenRecurrenceIds = new Set<string>();

  for (const event of parents) {
    if (!event.startDate) continue;

    if (!event.isRecurring()) {
      const start = event.startDate.toJSDate();
      const end = event.endDate?.toJSDate() ?? start;
      // All-day multi-day events intersect the window even when they start
      // before it; timed events are anchored to their start day.
      const intersects = event.startDate.isDate
        ? end.getTime() > windowStartValue && start.getTime() < windowEndValue
        : inWindow(start);
      if (intersects) {
        occurrences.push(occurrenceFrom(event, event.startDate, event.endDate ?? event.startDate));
      }
      continue;
    }

    const iterator = event.iterator();
    let next: ICAL.Time | null;
    let iterations = 0;
    while ((next = iterator.next()) && iterations < MAX_RECURRENCE_ITERATIONS) {
      iterations++;
      const occurrenceStart = next.toJSDate();
      if (occurrenceStart.getTime() >= windowEndValue) break;
      if (occurrenceStart.getTime() < windowStartValue) continue;

      const details = event.getOccurrenceDetails(next);
      const start = details.startDate.toJSDate();
      // An exception may have moved this instance outside the viewed week.
      if (!inWindow(start)) continue;

      const recurrenceId = details.recurrenceId.toString();
      seenRecurrenceIds.add(`${event.uid}|${recurrenceId}`);
      occurrences.push(
        occurrenceFrom(details.item, details.startDate, details.endDate, recurrenceId)
      );
    }

    // Exceptions moved INTO the window from an occurrence outside it are not
    // yielded by the window scan above; include them directly.
    for (const exception of exceptions) {
      if (exception.uid !== event.uid || !exception.startDate) continue;
      const recurrenceKey = `${event.uid}|${exception.recurrenceId?.toString()}`;
      if (seenRecurrenceIds.has(recurrenceKey)) continue;
      const start = exception.startDate.toJSDate();
      if (!inWindow(start)) continue;
      occurrences.push(
        occurrenceFrom(
          exception,
          exception.startDate,
          exception.endDate ?? exception.startDate,
          exception.recurrenceId?.toString()
        )
      );
    }
  }

  return { occurrences, calendarName };
}

// ============================================================================
// Review construction
// ============================================================================

interface CandidateSeed {
  occurrence: Occurrence;
  kind: "timed" | "allday";
  dayIndex: DayOfWeek;
  startMin?: number;
  endMin?: number;
}

function metaFor(
  occurrence: Occurrence,
  filename: string,
  calendarName: string | undefined,
  now: string
): ImportMetadata {
  const fingerprintSource = [
    occurrence.uid ?? occurrence.title,
    occurrence.recurrenceId ?? "",
    occurrence.start.toISOString(),
    occurrence.end.toISOString(),
    occurrence.allDay ? "allday" : "timed",
  ].join("|");

  return {
    source: "ics",
    sourceFilename: filename,
    calendarName,
    uid: occurrence.uid,
    recurrenceId: occurrence.recurrenceId,
    originalStart: occurrence.start.toISOString(),
    originalEnd: occurrence.end.toISOString(),
    allDay: occurrence.allDay,
    timezone: occurrence.timezone,
    importedAt: now,
    fingerprint: hashFingerprint(fingerprintSource),
    status: occurrence.status,
    availability: occurrence.availability,
    notes: occurrence.notes,
    location: occurrence.location,
    url: occurrence.url,
    meetingLink: occurrence.meetingLink,
  };
}

/**
 * Build the full review for a `.ics` file against the viewed Week.
 * Throws on unparsable ICS text; the caller presents the failure state.
 */
export function buildImportReview({
  icsText,
  filename,
  week,
  now = new Date().toISOString(),
}: BuildImportReviewInput): ImportReview {
  // The week window in local time, derived from the canonical week id. Never
  // derive it from `startDate`: that ISO string is produced by local-midnight
  // math, so in a positive-UTC-offset timezone its date component is the
  // Sunday BEFORE the week — which shifted every import one day forward and
  // dropped the week's own Sunday from review entirely.
  const monday = parseWeekId(week.id);
  const windowStart = new Date(
    monday.getUTCFullYear(),
    monday.getUTCMonth(),
    monday.getUTCDate(),
    0, 0, 0, 0
  );
  const windowEnd = new Date(
    monday.getUTCFullYear(),
    monday.getUTCMonth(),
    monday.getUTCDate() + 7,
    0, 0, 0, 0
  );
  const mondayValue = localDayValue(windowStart);

  // Grid classification uses the viewed Week's configured planning-day window.
  const bounds = weekDayBounds(week);
  const dayStartMin = bounds.startHour * 60;
  const dayEndMin = bounds.endHour * 60;

  const { occurrences, calendarName } = extractOccurrences(
    icsText,
    windowStart,
    windowEnd
  );

  const dayIndexOf = (date: Date): number =>
    Math.floor((localDayValue(date) - mondayValue) / MS_PER_DAY);

  // Explode occurrences into per-day candidate seeds.
  const seeds: CandidateSeed[] = [];
  for (const occurrence of occurrences) {
    if (occurrence.allDay) {
      // DTEND is exclusive for all-day entries; cover each day in the window.
      const startValue = localDayValue(occurrence.start);
      const endValue = Math.max(
        localDayValue(occurrence.end),
        startValue + MS_PER_DAY
      );
      for (let value = startValue; value < endValue; value += MS_PER_DAY) {
        const dayIndex = (value - mondayValue) / MS_PER_DAY;
        if (dayIndex < 0 || dayIndex > 6) continue;
        seeds.push({
          occurrence,
          kind: "allday",
          dayIndex: dayIndex as DayOfWeek,
        });
      }
      continue;
    }

    const dayIndex = dayIndexOf(occurrence.start);
    if (dayIndex < 0 || dayIndex > 6) continue;
    seeds.push({
      occurrence,
      kind: "timed",
      dayIndex: dayIndex as DayOfWeek,
      startMin: minutesOfDay(occurrence.start),
      endMin:
        minutesOfDay(occurrence.start) +
        Math.round((occurrence.end.getTime() - occurrence.start.getTime()) / 60_000),
    });
  }

  // Deterministic review order: by day, then time; same-day all-day entries
  // keep file order (stable sort), so cap rejection drops the literal later
  // entry rather than a title-alphabetical one.
  seeds.sort(
    (left, right) =>
      left.dayIndex - right.dayIndex ||
      (left.startMin ?? -1) - (right.startMin ?? -1)
  );

  // Classification state: existing Week content plus earlier accepted seeds.
  const knownFingerprints = existingFingerprints(week);
  const updateTargets = existingUpdateTargets(week, dayStartMin);
  const seenFingerprints = new Set<string>();
  const occupiedSpans = new Map<number, Array<{ start: number; end: number; blockId?: string }>>();
  for (const block of week.timeBlocks) {
    const spans = occupiedSpans.get(block.dayIndex) ?? [];
    const start = dayStartMin + block.startSlot * MINUTES_PER_SLOT;
    spans.push({ start, end: start + block.duration * MINUTES_PER_SLOT, blockId: block.id });
    occupiedSpans.set(block.dayIndex, spans);
  }
  const prioritiesPerDay = new Map<number, number>();
  for (const priority of week.dayPriorities) {
    prioritiesPerDay.set(
      priority.dayIndex,
      (prioritiesPerDay.get(priority.dayIndex) ?? 0) + 1
    );
  }

  const candidates: ImportCandidate[] = seeds.map((seed, index) => {
    const { occurrence, kind, dayIndex } = seed;
    const meta = metaFor(occurrence, filename, calendarName, now);

    const base: Omit<ImportCandidate, "status" | "reason"> = {
      key: `${meta.fingerprint}-${index}`,
      kind,
      title: occurrence.title,
      dayIndex,
      timeLabel:
        kind === "allday"
          ? "All day"
          : `${formatClock(seed.startMin!)}–${formatClock(seed.endMin!)}`,
      details: {
        notes: occurrence.notes,
        location: occurrence.location,
        url: occurrence.url,
        meetingLink: occurrence.meetingLink,
      },
      importMeta: meta,
    };

    const reject = (
      status: ImportCandidateStatus,
      reason: string
    ): ImportCandidate => ({ ...base, status, reason });

    if (occurrence.status?.toUpperCase() === "CANCELLED") {
      return reject("unsupported", "Cancelled in the source calendar");
    }

    // Refresh matching: the same UID (+ recurrence id) already planned in this
    // week means this entry describes an item we imported before. A different
    // fingerprint is a moved/resized event; the same fingerprint with a
    // different title is a rename. Everything is only ever applied through the
    // explicit review confirmation.
    const uidKey = uidKeyOf(meta.uid, meta.recurrenceId);
    const target = uidKey ? updateTargets.get(uidKey) : undefined;
    const previousLabel = target
      ? target.kind === "timeBlock"
        ? `${DAY_NAMES_SHORT[target.dayIndex]} ${formatClock(target.startMin!)}–${formatClock(target.endMin!)}`
        : `${DAY_NAMES_SHORT[target.dayIndex]} · ${target.kind === "dayPriority" ? "all day" : "evening"}`
      : "";
    const asUpdate = (
      entry: UpdateTargetEntry,
      change: "time" | "title",
      extras: Partial<ImportCandidate> = {}
    ): ImportCandidate => ({
      ...base,
      status: "update",
      update: {
        targetKind: entry.kind as "timeBlock" | "dayPriority",
        targetId: entry.id,
        previousLabel,
        change,
      },
      ...extras,
    });

    if (target) {
      const changed = target.fingerprint !== meta.fingerprint;
      const renamed = !changed && target.title.trim() !== occurrence.title.trim();

      if (!changed && !renamed) {
        return reject("duplicate", "Already imported into this week");
      }
      if (target.kind === "evening") {
        return reject(
          "unsupported",
          `Changed in the source calendar, but you moved it to the evening (${previousLabel}) — adjust it there`
        );
      }
      if (changed && target.kind === "dayPriority" && kind === "timed") {
        return reject(
          "unsupported",
          `Now a timed event, but it's planned as a day priority (${previousLabel}) — delete it to re-import`
        );
      }
      if (changed && target.kind === "timeBlock" && kind === "allday") {
        return reject(
          "unsupported",
          `Now an all-day event, but it's planned on the calendar (${previousLabel}) — delete it to re-import`
        );
      }

      updateTargets.delete(uidKey!);
      seenFingerprints.add(meta.fingerprint);

      if (renamed) {
        // Title-only difference could also be the user's own rename of the
        // planned item, so it never applies by default. Position comes from the
        // PLANNED item (the user may have moved it since import) — a title
        // refresh must never relocate anything.
        return asUpdate(target, "title", {
          reason: `Was “${target.title}” — updates the title`,
          dayIndex: target.dayIndex,
          ...(target.kind === "timeBlock"
            ? {
                startSlot: ((target.startMin! - dayStartMin) / MINUTES_PER_SLOT) as TimeSlotIndex,
                duration: (target.endMin! - target.startMin!) / MINUTES_PER_SLOT,
              }
            : {}),
        });
      }

      // Moved/resized: the new placement must fit the grid like any import.
      if (kind === "allday") {
        if (target.dayIndex !== dayIndex) {
          const used = prioritiesPerDay.get(dayIndex) ?? 0;
          if (used >= MAX_PRIORITIES_PER_DAY) {
            return reject("conflict", "This day's priorities are already full");
          }
          prioritiesPerDay.set(dayIndex, used + 1);
        }
        return asUpdate(target, "time", {
          reason: `Was ${previousLabel} — updates the planned priority`,
        });
      }

      const startMin = seed.startMin!;
      const endMin = seed.endMin!;
      const durationMin = endMin - startMin;
      if (durationMin <= 0) {
        return reject("unsupported", "Has no duration");
      }
      if (startMin < dayStartMin || endMin > dayEndMin) {
        return reject(
          "unsupported",
          `Moved outside the ${formatClock(dayStartMin)}–${formatClock(dayEndMin)} planner day`
        );
      }
      if (startMin % MINUTES_PER_SLOT !== 0 || durationMin % MINUTES_PER_SLOT !== 0) {
        return reject("unsupported", "Doesn't align to 30-minute slots");
      }
      if (durationMin / MINUTES_PER_SLOT > MAX_BLOCK_SLOTS) {
        return reject("unsupported", "Longer than the 8-hour block limit");
      }
      const spans = occupiedSpans.get(dayIndex) ?? [];
      // The planned block's own span doesn't collide with its update. Its old
      // span stays reserved for later candidates, so a deselected update can
      // never leave a confirmed overlap behind.
      const overlaps = spans.some(
        (span) =>
          span.blockId !== target.id && startMin < span.end && endMin > span.start
      );
      if (overlaps) {
        return reject("conflict", "Overlaps a block already on this day");
      }
      spans.push({ start: startMin, end: endMin });
      occupiedSpans.set(dayIndex, spans);

      return asUpdate(target, "time", {
        reason: `Was ${previousLabel} — updates the planned event`,
        startSlot: ((startMin - dayStartMin) / MINUTES_PER_SLOT) as TimeSlotIndex,
        duration: durationMin / MINUTES_PER_SLOT,
      });
    }

    if (knownFingerprints.has(meta.fingerprint)) {
      return reject("duplicate", "Already imported into this week");
    }
    if (kind === "timed" && seenFingerprints.has(meta.fingerprint)) {
      return reject("duplicate", "Duplicate entry in this file");
    }

    if (kind === "allday") {
      const used = prioritiesPerDay.get(dayIndex) ?? 0;
      if (used >= MAX_PRIORITIES_PER_DAY) {
        return reject("conflict", "This day's priorities are already full");
      }
      prioritiesPerDay.set(dayIndex, used + 1);
      seenFingerprints.add(meta.fingerprint);
      return { ...base, status: "importable" };
    }

    const startMin = seed.startMin!;
    const endMin = seed.endMin!;
    const durationMin = endMin - startMin;

    if (durationMin <= 0) {
      return reject("unsupported", "Has no duration");
    }
    if (startMin < dayStartMin || endMin > dayEndMin) {
      return reject(
        "unsupported",
        `Outside the ${formatClock(dayStartMin)}–${formatClock(dayEndMin)} planner day`
      );
    }
    if (startMin % MINUTES_PER_SLOT !== 0 || durationMin % MINUTES_PER_SLOT !== 0) {
      return reject("unsupported", "Doesn't align to 30-minute slots");
    }
    const durationSlots = durationMin / MINUTES_PER_SLOT;
    if (durationSlots > MAX_BLOCK_SLOTS) {
      return reject("unsupported", "Longer than the 8-hour block limit");
    }

    const spans = occupiedSpans.get(dayIndex) ?? [];
    const overlaps = spans.some(
      (span) => startMin < span.end && endMin > span.start
    );
    if (overlaps) {
      return reject("conflict", "Overlaps a block already on this day");
    }

    spans.push({ start: startMin, end: endMin });
    occupiedSpans.set(dayIndex, spans);
    seenFingerprints.add(meta.fingerprint);

    return {
      ...base,
      status: "importable",
      startSlot: ((startMin - dayStartMin) / MINUTES_PER_SLOT) as TimeSlotIndex,
      duration: durationSlots,
    };
  });

  const counts: ImportReviewCounts = {
    total: candidates.length,
    importable: candidates.filter((candidate) => candidate.status === "importable").length,
    updates: candidates.filter((candidate) => candidate.status === "update").length,
    unsupported: candidates.filter((candidate) => candidate.status === "unsupported").length,
    conflicts: candidates.filter((candidate) => candidate.status === "conflict").length,
    duplicates: candidates.filter((candidate) => candidate.status === "duplicate").length,
  };

  return { candidates, counts, calendarName };
}

// ============================================================================
// Confirmation payload
// ============================================================================

/** In-place refresh of a previously imported Freestyle Block. */
export interface ImportTimeBlockUpdate {
  id: string;
  dayIndex: DayOfWeek;
  startSlot: TimeSlotIndex;
  duration: number;
  title: string;
  importMeta: ImportMetadata;
}

/** In-place refresh of a previously imported Freestyle Day Priority. */
export interface ImportDayPriorityUpdate {
  id: string;
  dayIndex: DayOfWeek;
  text: string;
  importMeta: ImportMetadata;
}

export interface ImportPayload {
  timeBlocks: CreateTimeBlockInput[];
  dayPriorities: Omit<DayPriority, "id" | "order">[];
  updateTimeBlocks: ImportTimeBlockUpdate[];
  updateDayPriorities: ImportDayPriorityUpdate[];
}

/**
 * Map the selected importable + update candidates onto store inputs. The
 * confirmation time replaces the review-time `importedAt` so metadata records
 * when the items actually entered (or last refreshed in) the Week.
 */
export function buildImportPayload(
  candidates: ImportCandidate[],
  selectedKeys: ReadonlySet<string>,
  importedAt: string = new Date().toISOString()
): ImportPayload {
  const selected = candidates.filter(
    (candidate) =>
      candidate.status === "importable" && selectedKeys.has(candidate.key)
  );
  const selectedUpdates = candidates.filter(
    (candidate) =>
      candidate.status === "update" && selectedKeys.has(candidate.key)
  );

  return {
    timeBlocks: selected
      .filter((candidate) => candidate.kind === "timed")
      .map((candidate) => ({
        type: "freestyle" as const,
        dayIndex: candidate.dayIndex,
        startSlot: candidate.startSlot!,
        duration: candidate.duration!,
        title: candidate.title,
        completed: false,
        importMeta: { ...candidate.importMeta, importedAt },
      })),
    dayPriorities: selected
      .filter((candidate) => candidate.kind === "allday")
      .map((candidate) => ({
        type: "freestyle" as const,
        text: candidate.title,
        dayIndex: candidate.dayIndex,
        completed: false,
        importMeta: { ...candidate.importMeta, importedAt },
      })),
    updateTimeBlocks: selectedUpdates
      .filter((candidate) => candidate.update?.targetKind === "timeBlock")
      .map((candidate) => ({
        id: candidate.update!.targetId,
        dayIndex: candidate.dayIndex,
        startSlot: candidate.startSlot!,
        duration: candidate.duration!,
        title: candidate.title,
        importMeta: { ...candidate.importMeta, importedAt },
      })),
    updateDayPriorities: selectedUpdates
      .filter((candidate) => candidate.update?.targetKind === "dayPriority")
      .map((candidate) => ({
        id: candidate.update!.targetId,
        dayIndex: candidate.dayIndex,
        text: candidate.title,
        importMeta: { ...candidate.importMeta, importedAt },
      })),
  };
}
