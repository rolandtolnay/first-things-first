import { describe, expect, it } from "vitest";
import {
  roleArchiveUpdate,
  roleDefaultUpdatesToRow,
  roleDefaultsToInsert,
  roleRestoreUpdate,
  rowToRole,
} from "@/lib/role-mapping";

describe("role mapping", () => {
  it("maps a durable Role row to the app Role without dropping archive or timestamp fields", () => {
    expect(rowToRole({
      id: "role-1",
      user_id: "user-1",
      name: "Work",
      color: "teal",
      order_index: 2,
      archived_at: "2026-01-02T00:00:00.000Z",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-03T00:00:00.000Z",
    })).toEqual({
      id: "role-1",
      name: "Work",
      color: "teal",
      order: 2,
      archivedAt: "2026-01-02T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-03T00:00:00.000Z",
    });
  });

  it("maps canonical durable Role write payloads", () => {
    expect(roleDefaultsToInsert(
      { name: "Work", color: "teal", order: 2 },
      "user-1",
      "2026-01-01T00:00:00.000Z",
    )).toEqual({
      user_id: "user-1",
      name: "Work",
      color: "teal",
      order_index: 2,
      archived_at: null,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    });

    expect(roleDefaultUpdatesToRow(
      { name: "Deep Work", color: "violet" },
      "2026-01-03T00:00:00.000Z",
    )).toEqual({
      name: "Deep Work",
      color: "violet",
      updated_at: "2026-01-03T00:00:00.000Z",
    });

    expect(roleArchiveUpdate("2026-01-04T00:00:00.000Z")).toEqual({
      archived_at: "2026-01-04T00:00:00.000Z",
      updated_at: "2026-01-04T00:00:00.000Z",
    });
    expect(roleRestoreUpdate(
      { name: "Work", order: 3 },
      "2026-01-05T00:00:00.000Z",
    )).toEqual({
      name: "Work",
      order_index: 3,
      archived_at: null,
      updated_at: "2026-01-05T00:00:00.000Z",
    });
  });
});
