import { describe, expect, it } from "vitest";

import { documentToWeek, weekToDocument } from "@/lib/week-mapping";
import type { Week, WeekId } from "@/types";

function makeWeek(): Week {
  return {
    id: "2026-W21" as WeekId,
    startDate: "2026-05-18T00:00:00.000Z",
    roles: [{ id: "role-1", name: "Work", color: "teal", order: 0 }],
    goals: [
      { id: "goal-1", roleId: "role-1", text: "Ship", notes: "by Friday", completed: false },
    ],
    dayPriorities: [
      { id: "prio-1", type: "goal", goalId: "goal-1", dayIndex: 1, order: 0, completed: false },
    ],
    timeBlocks: [
      {
        id: "block-1",
        type: "goal",
        goalId: "goal-1",
        roleId: "role-1",
        dayIndex: 1,
        startSlot: 0,
        duration: 2,
        title: "Ship",
        completed: false,
      },
      {
        id: "block-2",
        type: "freestyle",
        dayIndex: 2,
        startSlot: 4,
        duration: 1,
        title: "Gym",
        completed: true,
        recurrence: "weekly",
      },
    ],
    eveningBlocks: [
      { id: "ev-1", type: "freestyle", dayIndex: 3, title: "Read", completed: false },
    ],
    dayBounds: { startHour: 7, endHour: 21 },
    reflection: "Protected what mattered.",
    createdAt: "2026-05-18T08:00:00.000Z",
    updatedAt: "2026-05-19T09:30:00.000Z",
  };
}

describe("Week document mapping", () => {
  it("round-trips the complete Week document without provider metadata", () => {
    const week = makeWeek();
    const document = weekToDocument(week);
    expect(document).toEqual(week);
    expect(documentToWeek(week.id, document)).toEqual(week);
  });

  it("removes absent optional properties that Firestore rejects as undefined", () => {
    const week = makeWeek();
    week.goals[0] = { ...week.goals[0], notes: undefined };
    expect(weekToDocument(week).goals[0]).not.toHaveProperty("notes");
  });

  it("normalizes a legacy goal priority at the read boundary", () => {
    const week = makeWeek();
    const legacy = {
      ...week,
      dayPriorities: [{ ...week.dayPriorities[0], type: undefined }],
    };
    expect(documentToWeek(week.id, legacy).dayPriorities[0].type).toBe("goal");
  });
});
