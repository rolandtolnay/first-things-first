import { describe, it, expect, vi, beforeEach } from "vitest";

// Minimal db mock: saveWeek is the single write path these tests count.
vi.mock("@/lib/db", () => ({
  getWeek: vi.fn(),
  saveWeek: vi.fn().mockResolvedValue("2026-W01"),
  getAllWeekIds: vi.fn().mockResolvedValue([]),
  getActiveRoles: vi.fn().mockResolvedValue([]),
  searchArchivedRoles: vi.fn().mockResolvedValue([]),
  createRole: vi.fn(),
  updateRoleDefaults: vi.fn(),
  archiveRole: vi.fn(),
  restoreRole: vi.fn(),
  persistRoleOrder: vi.fn(),
}));

import { useWeekStore } from "@/stores/weekStore";
import { saveWeek } from "@/lib/db";
import type { ImportMetadata, Week, WeekId } from "@/types";

function makeWeek(overrides: Partial<Week> = {}): Week {
  return {
    id: "2026-W01" as WeekId,
    startDate: "2025-12-29T00:00:00.000Z",
    roles: [{ id: "role-1", name: "Work", color: "teal", order: 0 }],
    goals: [{ id: "goal-1", roleId: "role-1", text: "Ship", completed: false }],
    dayPriorities: [],
    timeBlocks: [],
    eveningBlocks: [],
    createdAt: "2025-12-29T00:00:00.000Z",
    updatedAt: "2025-12-29T00:00:00.000Z",
    ...overrides,
  };
}

function seed(week: Week) {
  useWeekStore.setState({
    currentWeek: week,
    selectedWeekId: week.id,
    activeRoles: [],
    availableWeekIds: [week.id],
    isLoading: false,
    error: null,
  });
}

const meta: ImportMetadata = {
  source: "ics",
  sourceFilename: "calendar.ics",
  originalStart: "2026-01-01T10:00:00.000Z",
  allDay: false,
  importedAt: "2026-01-01T00:00:00.000Z",
  fingerprint: "abc123",
};

beforeEach(() => {
  vi.clearAllMocks();
  useWeekStore.getState().reset();
  seed(makeWeek());
  vi.clearAllMocks();
});

describe("addFreestylePriority", () => {
  it("creates an empty freestyle priority appended to the day", async () => {
    const priority = await useWeekStore.getState().addFreestylePriority(2);

    expect(priority).toMatchObject({
      type: "freestyle",
      text: "",
      dayIndex: 2,
      order: 0,
      completed: false,
    });
    expect(saveWeek).toHaveBeenCalledTimes(1);
  });

  it("returns null without persisting when the day is at capacity", async () => {
    seed(
      makeWeek({
        dayPriorities: [
          { id: "p1", type: "goal", goalId: "goal-1", dayIndex: 2, order: 0, completed: false },
          { id: "p2", type: "freestyle", text: "Errand", dayIndex: 2, order: 1, completed: false },
        ],
      })
    );
    vi.clearAllMocks();

    const priority = await useWeekStore.getState().addFreestylePriority(2);

    expect(priority).toBeNull();
    expect(saveWeek).not.toHaveBeenCalled();
  });
});

describe("updateDayPriority", () => {
  it("updates freestyle text and role assignment", async () => {
    seed(
      makeWeek({
        dayPriorities: [
          { id: "p1", type: "freestyle", text: "", dayIndex: 1, order: 0, completed: false },
        ],
      })
    );
    vi.clearAllMocks();

    await useWeekStore.getState().updateDayPriority("p1", { text: "Dentist", roleId: "role-1" });

    const priority = useWeekStore.getState().currentWeek!.dayPriorities[0];
    expect(priority).toMatchObject({ text: "Dentist", roleId: "role-1" });
    expect(saveWeek).toHaveBeenCalledTimes(1);
  });

  it("clears a role assignment", async () => {
    seed(
      makeWeek({
        dayPriorities: [
          { id: "p1", type: "freestyle", text: "Dentist", roleId: "role-1", dayIndex: 1, order: 0, completed: false },
        ],
      })
    );
    vi.clearAllMocks();

    await useWeekStore.getState().updateDayPriority("p1", { roleId: undefined });

    expect(useWeekStore.getState().currentWeek!.dayPriorities[0].roleId).toBeUndefined();
  });
});

describe("freestyle conversions", () => {
  it("converts a freestyle block into a Freestyle Day Priority keeping text/role/import metadata", async () => {
    seed(
      makeWeek({
        timeBlocks: [
          {
            id: "fb-1",
            type: "freestyle",
            roleId: "role-1",
            dayIndex: 1,
            startSlot: 4,
            duration: 2,
            title: "Deep work",
            completed: false,
            importMeta: meta,
          },
        ],
      })
    );
    vi.clearAllMocks();

    const priority = await useWeekStore.getState().convertBlockToPriority("fb-1", 1);

    expect(priority).toMatchObject({
      type: "freestyle",
      text: "Deep work",
      roleId: "role-1",
      dayIndex: 1,
    });
    expect(priority!.importMeta).toEqual(meta);
    const week = useWeekStore.getState().currentWeek!;
    expect(week.timeBlocks).toHaveLength(0);
    expect(week.dayPriorities).toHaveLength(1);
    expect(saveWeek).toHaveBeenCalledTimes(1);
  });

  it("converts a Freestyle Day Priority into a freestyle block keeping text/role", async () => {
    seed(
      makeWeek({
        dayPriorities: [
          { id: "p1", type: "freestyle", text: "Errand", roleId: "role-1", dayIndex: 1, order: 0, completed: false },
        ],
      })
    );
    vi.clearAllMocks();

    const block = await useWeekStore.getState().convertPriorityToBlock("p1", 2, 4);

    expect(block).toMatchObject({
      type: "freestyle",
      title: "Errand",
      roleId: "role-1",
      dayIndex: 2,
      startSlot: 4,
    });
    const week = useWeekStore.getState().currentWeek!;
    expect(week.dayPriorities).toHaveLength(0);
    expect(week.timeBlocks).toHaveLength(1);
  });

  it("moves a freestyle priority across days keeping its identity fields", async () => {
    seed(
      makeWeek({
        dayPriorities: [
          { id: "p1", type: "freestyle", text: "Errand", roleId: "role-1", dayIndex: 1, order: 0, completed: true, importMeta: meta },
        ],
      })
    );
    vi.clearAllMocks();

    const moved = await useWeekStore.getState().movePriorityToDay("p1", 4);

    expect(moved).toMatchObject({
      type: "freestyle",
      text: "Errand",
      roleId: "role-1",
      dayIndex: 4,
      completed: false,
    });
    expect(moved!.importMeta).toEqual(meta);
  });
});

describe("recurrence on blocks", () => {
  it("preserves recurrence when a block moves to the evening and back", async () => {
    seed(
      makeWeek({
        timeBlocks: [
          {
            id: "fb-1",
            type: "freestyle",
            dayIndex: 1,
            startSlot: 4,
            duration: 2,
            title: "Gym",
            completed: false,
            recurrence: "weekly",
          },
        ],
      })
    );
    vi.clearAllMocks();

    const evening = await useWeekStore.getState().moveBlockToEvening("fb-1", 1);
    expect(evening).toMatchObject({ recurrence: "weekly", title: "Gym" });

    const block = await useWeekStore.getState().moveEveningToBlock(evening!.id, 2, 6);
    expect(block).toMatchObject({ recurrence: "weekly", title: "Gym", dayIndex: 2 });
  });
});

describe("importWeekItems", () => {
  it("appends blocks and priorities in a single persist with sequential orders", async () => {
    seed(
      makeWeek({
        dayPriorities: [
          { id: "existing", type: "goal", goalId: "goal-1", dayIndex: 2, order: 0, completed: false },
        ],
      })
    );
    vi.clearAllMocks();

    await useWeekStore.getState().importWeekItems({
      timeBlocks: [
        {
          type: "freestyle",
          dayIndex: 1,
          startSlot: 4,
          duration: 2,
          title: "Meeting",
          completed: false,
          importMeta: meta,
        },
      ],
      dayPriorities: [
        { type: "freestyle", text: "Conference", dayIndex: 2, completed: false, importMeta: meta },
      ],
    });

    expect(saveWeek).toHaveBeenCalledTimes(1);
    const week = useWeekStore.getState().currentWeek!;
    expect(week.timeBlocks).toHaveLength(1);
    expect(week.timeBlocks[0]).toMatchObject({ title: "Meeting", importMeta: meta });
    expect(week.dayPriorities).toHaveLength(2);
    const imported = week.dayPriorities.find((p) => p.text === "Conference")!;
    expect(imported.order).toBe(1); // appended after the existing priority
    expect(imported.completed).toBe(false);
  });

  it("does nothing when there is nothing to import", async () => {
    await useWeekStore.getState().importWeekItems({ timeBlocks: [], dayPriorities: [] });
    expect(saveWeek).not.toHaveBeenCalled();
  });
});

describe("importWeekItems updates (import refresh)", () => {
  it("moves a previously imported block in place, preserving completion, role, and recurrence", async () => {
    seed(
      makeWeek({
        timeBlocks: [
          {
            id: "tb-1",
            type: "freestyle",
            dayIndex: 1,
            startSlot: 4,
            duration: 2,
            title: "Sync",
            completed: true,
            roleId: "role-1",
            recurrence: "weekly",
            importMeta: meta,
          },
        ],
      })
    );

    const refreshedMeta = { ...meta, fingerprint: "def456" };
    await useWeekStore.getState().importWeekItems({
      timeBlocks: [],
      dayPriorities: [],
      updateTimeBlocks: [
        {
          id: "tb-1",
          dayIndex: 3,
          startSlot: 12,
          duration: 3,
          title: "Sync",
          importMeta: refreshedMeta,
        },
      ],
    });

    const [block] = useWeekStore.getState().currentWeek!.timeBlocks;
    expect(block).toMatchObject({
      id: "tb-1",
      dayIndex: 3,
      startSlot: 12,
      duration: 3,
      completed: true,
      roleId: "role-1",
      recurrence: "weekly",
    });
    expect(block.importMeta?.fingerprint).toBe("def456");
    expect(useWeekStore.getState().currentWeek!.timeBlocks).toHaveLength(1);
    expect(saveWeek).toHaveBeenCalledTimes(1);
  });

  it("moves an updated priority to the end of its new day and keeps completion", async () => {
    seed(
      makeWeek({
        dayPriorities: [
          {
            id: "dp-1",
            type: "freestyle",
            text: "Offsite",
            dayIndex: 2,
            order: 0,
            completed: true,
            importMeta: meta,
          },
          {
            id: "dp-2",
            type: "freestyle",
            text: "Existing on Friday",
            dayIndex: 4,
            order: 0,
            completed: false,
          },
        ],
      })
    );

    await useWeekStore.getState().importWeekItems({
      timeBlocks: [],
      dayPriorities: [],
      updateDayPriorities: [
        { id: "dp-1", dayIndex: 4, text: "Offsite", importMeta: { ...meta, fingerprint: "x" } },
      ],
    });

    const moved = useWeekStore
      .getState()
      .currentWeek!.dayPriorities.find((p) => p.id === "dp-1")!;
    expect(moved).toMatchObject({ dayIndex: 4, order: 1, completed: true });
  });
});
