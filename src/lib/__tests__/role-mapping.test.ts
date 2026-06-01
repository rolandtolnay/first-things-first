import { describe, expect, it } from "vitest";
import { roleToInsert, roleToUpdate, rowToRole } from "@/lib/role-mapping";
import type { Role } from "@/types";

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

  it("maps app Roles to insert and update payloads", () => {
    const appRole: Role = {
      id: "role-1",
      name: "Work",
      color: "teal",
      order: 2,
      archivedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-03T00:00:00.000Z",
    };

    expect(roleToInsert(appRole, "user-1")).toEqual({
      id: "role-1",
      user_id: "user-1",
      name: "Work",
      color: "teal",
      order_index: 2,
      archived_at: null,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-03T00:00:00.000Z",
    });

    expect(roleToUpdate(appRole)).toEqual({
      name: "Work",
      color: "teal",
      order_index: 2,
      archived_at: null,
      updated_at: "2026-01-03T00:00:00.000Z",
    });
  });
});
