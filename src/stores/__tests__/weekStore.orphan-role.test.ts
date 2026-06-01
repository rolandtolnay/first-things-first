import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * REGRESSION — editing a Role whose snapshot id has no durable `roles` row.
 *
 * The sidebar renders Role *Snapshots* from the week JSONB (RoleList reads
 * `currentWeek.roles`) and edits call `updateRole(snapshot.id)`. Weeks created
 * before the durable `roles` table existed (and never backfilled) carry
 * snapshot ids with NO durable row. The old code ran `UPDATE … WHERE id = x
 * .single()`, which matched 0 rows → PostgREST 406 (PGRST116) → the raw
 * PostgrestError (a plain object, not an `Error`) fell through `roleErrorMessage`
 * to the literal "Failed to save role changes" and the edit was lost.
 *
 * The fix upserts the full snapshot on `id`, so the missing durable row is
 * materialized rather than 406ing. These tests pin that behavior, plus the
 * graceful path when a same-named durable role already exists (SQLSTATE 23505).
 */

class DuplicateNameError {
  code = "23505";
  details = "Key (user_id, lower(btrim(name)))=(…, work) already exists.";
  hint = null;
  message = "duplicate key value violates unique constraint";
}

// Toggled per-test: when set, the upsert mock simulates the name collision.
let rejectWithDuplicateName = false;

vi.mock("@/lib/db", () => ({
  getWeek: vi.fn(),
  saveWeek: vi.fn().mockResolvedValue("2026-W01"),
  getAllWeekIds: vi.fn().mockResolvedValue([]),
  getActiveRoles: vi.fn().mockResolvedValue([]),
  searchArchivedRoles: vi.fn().mockResolvedValue([]),
  createRole: vi.fn(),
  // Like updateRoleDefaults, archiveRole upserts on id — a missing row is
  // inserted (archived), never a 0-row 406.
  archiveRole: vi.fn().mockImplementation((role: { id: string; name: string; color: string; order: number }) => Promise.resolve({
    id: role.id,
    name: role.name,
    color: role.color,
    order: role.order,
    archivedAt: "2026-02-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  })),
  restoreRole: vi.fn(),
  persistRoleOrder: vi.fn(),
  // Faithful to the upsert contract: a missing row is inserted, an existing one
  // is updated — either way exactly one row comes back, never a 0-row 406.
  updateRoleDefaults: vi.fn().mockImplementation((role: { id: string; name: string; color: string; order: number }) => {
    if (rejectWithDuplicateName) return Promise.reject(new DuplicateNameError());
    return Promise.resolve({
      id: role.id,
      name: role.name,
      color: role.color,
      order: role.order,
      archivedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-02-01T00:00:00.000Z",
    });
  }),
}));

import { useWeekStore } from "@/stores/weekStore";
import { saveWeek } from "@/lib/db";
import type { Week, WeekId } from "@/types";

function weekWithOrphanSnapshot(): Week {
  return {
    id: "2026-W01" as WeekId,
    startDate: "2025-12-29T00:00:00.000Z",
    // This snapshot id has NO durable `roles` row — a legacy / un-backfilled week.
    roles: [{ id: "orphan-snapshot-id", name: "Work", color: "teal", order: 0 }],
    goals: [],
    dayPriorities: [],
    timeBlocks: [],
    eveningBlocks: [],
    createdAt: "2025-12-29T00:00:00.000Z",
    updatedAt: "2025-12-29T00:00:00.000Z",
  };
}

beforeEach(() => {
  rejectWithDuplicateName = false;
  useWeekStore.setState({
    currentWeek: weekWithOrphanSnapshot(),
    selectedWeekId: "2026-W01" as WeekId,
    activeRoles: [],
    error: null,
  });
  vi.clearAllMocks();
});

describe("updateRole on an orphan Role Snapshot (no durable row)", () => {
  it("materializes the durable role, applies the edit, and surfaces no error", async () => {
    await useWeekStore.getState().updateRole("orphan-snapshot-id", { color: "violet" });

    const state = useWeekStore.getState();
    expect(state.error).toBeNull();
    // Snapshot edit persisted.
    expect(state.currentWeek!.roles[0].color).toBe("violet");
    expect(saveWeek).toHaveBeenCalledTimes(1);
    // The previously-missing durable row is now tracked in activeRoles.
    expect(state.activeRoles).toEqual([
      expect.objectContaining({ id: "orphan-snapshot-id", name: "Work", color: "violet", order: 0 }),
    ]);
  });

  it("keeps the snapshot edit when a same-named durable role already exists (23505)", async () => {
    rejectWithDuplicateName = true;

    await useWeekStore.getState().updateRole("orphan-snapshot-id", { color: "violet" });

    const state = useWeekStore.getState();
    // The collision is swallowed: no scary error, snapshot edit still lands.
    expect(state.error).toBeNull();
    expect(state.currentWeek!.roles[0].color).toBe("violet");
    expect(saveWeek).toHaveBeenCalledTimes(1);
    // No durable row was adopted, so activeRoles stays untouched.
    expect(state.activeRoles).toEqual([]);
  });
});

describe("deleteRole on an orphan Role Snapshot (no durable row)", () => {
  it("archives via materialize-then-archive and removes the snapshot without error", async () => {
    await useWeekStore.getState().deleteRole("orphan-snapshot-id");

    const state = useWeekStore.getState();
    expect(state.error).toBeNull();
    // The snapshot is cascade-removed from the week.
    expect(state.currentWeek!.roles).toEqual([]);
    expect(saveWeek).toHaveBeenCalledTimes(1);
  });
});
