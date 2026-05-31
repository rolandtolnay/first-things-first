import { describe, it, expect } from "vitest";
import { weekToRow, rowToWeek, type WeekRow } from "@/lib/week-mapping";
import type { Week, WeekId } from "@/types";

const USER_ID = "11111111-1111-1111-1111-111111111111";

/**
 * A fully-populated Week touching every nested array, so round-trip fidelity
 * covers roles, goals, priorities, time blocks (goal + freestyle), and an
 * evening block — not just the empty shell.
 */
function makeWeek(): Week {
  return {
    id: "2026-W21" as WeekId,
    startDate: "2026-05-18T00:00:00.000Z",
    roles: [{ id: "role-1", name: "Work", color: "teal", order: 0 }],
    goals: [
      { id: "goal-1", roleId: "role-1", text: "Ship", notes: "by Friday", completed: false },
    ],
    dayPriorities: [
      { id: "prio-1", goalId: "goal-1", dayIndex: 1, order: 0, completed: false },
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
      },
    ],
    eveningBlocks: [
      { id: "ev-1", type: "freestyle", dayIndex: 3, title: "Read", completed: false },
    ],
    createdAt: "2026-05-18T08:00:00.000Z",
    updatedAt: "2026-05-19T09:30:00.000Z",
  };
}

describe("weekToRow", () => {
  it("promotes id, optional owner, and timestamps verbatim", () => {
    const week = makeWeek();
    const row = weekToRow(week, USER_ID);

    expect(row.id).toBe("2026-W21");
    expect(row.user_id).toBe(USER_ID);
    expect(row.created_at).toBe(week.createdAt);
    expect(row.updated_at).toBe(week.updatedAt);
  });

  it("omits ownership when no user id is supplied", () => {
    expect(weekToRow(makeWeek()).user_id).toBeUndefined();
  });

  it("promotes start_date as a plain date (drops the time component)", () => {
    const row = weekToRow(makeWeek());
    expect(row.start_date).toBe("2026-05-18");
  });

  it("carries the whole snapshot into data untouched", () => {
    const week = makeWeek();
    const row = weekToRow(week);
    expect(row.data).toEqual(week);
  });
});

describe("rowToWeek", () => {
  it("reconstructs the Week from the snapshot, keeping the id from the column", () => {
    const week = makeWeek();
    const row: WeekRow = { ...weekToRow(week), user_id: USER_ID, data: week };
    expect(rowToWeek(row)).toEqual(week);
  });
});

describe("round-trip fidelity", () => {
  it("rowToWeek(weekToRow(w)) reconstructs w exactly with an owner", () => {
    const week = makeWeek();
    expect(rowToWeek({ ...weekToRow(week), user_id: USER_ID, data: week })).toEqual(week);
  });

  it("preserves an empty Week (no roles/goals/blocks)", () => {
    const empty: Week = {
      ...makeWeek(),
      roles: [],
      goals: [],
      dayPriorities: [],
      timeBlocks: [],
      eveningBlocks: [],
    };
    expect(rowToWeek({ ...weekToRow(empty), user_id: USER_ID, data: empty })).toEqual(empty);
  });
});
