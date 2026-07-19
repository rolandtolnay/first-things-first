#!/usr/bin/env node
/**
 * Generate `.ics` fixture files pinned to a target week for exercising the
 * manual calendar import flow (Import Review classifications: importable,
 * skipped, conflict, duplicate).
 *
 * Usage:
 *   node scripts/make-import-fixtures.mjs [YYYY-MM-DD]
 *
 * The optional argument is the Monday of the target week; it defaults to the
 * Monday of the current week. Files are written to .agents/goal-work/fixtures/
 * (ignored transient output).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function mondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

const monday = process.argv[2] ? mondayOf(new Date(`${process.argv[2]}T12:00:00`)) : mondayOf(new Date());

function dayDate(offset) {
  const d = new Date(monday);
  d.setDate(d.getDate() + offset);
  return d;
}

function ymd(date) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
}

function dt(offset, hhmm) {
  return `${ymd(dayDate(offset))}T${hhmm}00`;
}

function vevent(lines) {
  return ["BEGIN:VEVENT", ...lines, "END:VEVENT"].join("\r\n");
}

function calendar(name, events) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//first-things-first//import-fixtures//EN",
    `X-WR-CALNAME:${name}`,
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

// Fixture 1 — clean, importable content (plus a recurring series).
const basic = calendar("Fixture Basic", [
  vevent([
    "UID:fx-team-meeting",
    `DTSTART:${dt(1, "1000")}`,
    `DTEND:${dt(1, "1100")}`,
    "SUMMARY:Team meeting",
    "LOCATION:Office 12",
    "DESCRIPTION:Weekly sync. Join: https://meet.google.com/abc-defg-hij",
  ]),
  vevent([
    "UID:fx-client-call",
    `DTSTART:${dt(3, "1400")}`,
    `DTEND:${dt(3, "1530")}`,
    "SUMMARY:Client call",
    "URL:https://example.com/agenda",
  ]),
  vevent([
    "UID:fx-conference-day",
    `DTSTART;VALUE=DATE:${ymd(dayDate(2))}`,
    "SUMMARY:Conference day",
  ]),
  // Recurring standup that started three weeks before the target week.
  vevent([
    "UID:fx-standup",
    `DTSTART:${ymd(new Date(monday.getTime() - 21 * 86400000))}T090000`,
    `DTEND:${ymd(new Date(monday.getTime() - 21 * 86400000))}T093000`,
    "RRULE:FREQ=WEEKLY;BYDAY=MO,FR",
    "SUMMARY:Standup",
  ]),
]);

// Fixture 2 — every skip/conflict classification.
const edge = calendar("Fixture Edge Cases", [
  vevent([
    "UID:fx-early",
    `DTSTART:${dt(1, "0700")}`,
    `DTEND:${dt(1, "0800")}`,
    "SUMMARY:Too early (out of grid)",
  ]),
  vevent([
    "UID:fx-late",
    `DTSTART:${dt(1, "1930")}`,
    `DTEND:${dt(1, "2030")}`,
    "SUMMARY:Too late (out of grid)",
  ]),
  vevent([
    "UID:fx-misaligned",
    `DTSTART:${dt(2, "1015")}`,
    `DTEND:${dt(2, "1115")}`,
    "SUMMARY:Misaligned start",
  ]),
  vevent([
    "UID:fx-cancelled",
    `DTSTART:${dt(2, "1200")}`,
    `DTEND:${dt(2, "1300")}`,
    "STATUS:CANCELLED",
    "SUMMARY:Cancelled meeting",
  ]),
  vevent([
    "UID:fx-overlap-a",
    `DTSTART:${dt(5, "1000")}`,
    `DTEND:${dt(5, "1100")}`,
    "SUMMARY:Overlap A",
  ]),
  vevent([
    "UID:fx-overlap-b",
    `DTSTART:${dt(5, "1030")}`,
    `DTEND:${dt(5, "1130")}`,
    "SUMMARY:Overlap B (conflicts with A)",
  ]),
  vevent([
    "UID:fx-allday-1",
    `DTSTART;VALUE=DATE:${ymd(dayDate(6))}`,
    "SUMMARY:All-day one",
  ]),
  vevent([
    "UID:fx-allday-2",
    `DTSTART;VALUE=DATE:${ymd(dayDate(6))}`,
    "SUMMARY:All-day two",
  ]),
  vevent([
    "UID:fx-allday-3",
    `DTSTART;VALUE=DATE:${ymd(dayDate(6))}`,
    "SUMMARY:All-day three (over the cap)",
  ]),
]);

const outDir = join(process.cwd(), ".agents", "goal-work", "fixtures");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "import-basic.ics"), basic);
writeFileSync(join(outDir, "import-edge-cases.ics"), edge);
console.log(`Wrote fixtures for week of ${monday.toDateString()} to ${outDir}`);
