/** Provider-neutral Week document mapping (ADR-0004). */

import { normalizeWeek } from "@/lib/priorities";
import type { Week, WeekId } from "@/types";

export type WeekDocument = Week;

/**
 * Firestore accepts JSON-like objects but rejects `undefined`. Week is already
 * the app's JSON document boundary, so a JSON round-trip removes only absent
 * optional properties and keeps its persisted shape unchanged.
 */
export function weekToDocument(week: Week): WeekDocument {
  return JSON.parse(JSON.stringify(week)) as WeekDocument;
}

/** Normalize legacy documents while keeping the path/document id authoritative. */
export function documentToWeek(id: string, data: unknown): Week {
  const snapshot = normalizeWeek(data as Week);
  return { ...snapshot, id: id as WeekId };
}
