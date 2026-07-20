import { describe, expect, it } from "vitest";

import {
  archiveRoleDocument,
  createRoleDocument,
  documentToRole,
  restoreRoleDocument,
  updateRoleDocument,
} from "@/lib/role-mapping";

describe("Role document mapping", () => {
  it("creates the durable Role shape used by the domain", () => {
    expect(
      createRoleDocument(
        "role-1",
        { name: "Work", color: "teal", order: 2 },
        "2026-01-01T00:00:00.000Z",
      ),
    ).toEqual({
      id: "role-1",
      name: "Work",
      color: "teal",
      order: 2,
      archivedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("materializes an orphan on update and archive with a full payload", () => {
    const updated = updateRoleDocument(
      null,
      { id: "orphan", name: "Work", color: "teal", order: 0 },
      "2026-01-02T00:00:00.000Z",
    );
    expect(documentToRole("orphan", updated)).toEqual(updated);
    expect(
      archiveRoleDocument(
        null,
        { id: "orphan", name: "Work", color: "teal", order: 0 },
        "2026-01-03T00:00:00.000Z",
      ),
    ).toMatchObject({ id: "orphan", name: "Work", archivedAt: "2026-01-03T00:00:00.000Z" });
  });

  it("preserves identity and creation time across update, archive, and restore", () => {
    const created = createRoleDocument(
      "role-1",
      { name: "Work", color: "teal", order: 0 },
      "2026-01-01T00:00:00.000Z",
    );
    const updated = updateRoleDocument(
      created,
      { id: "role-1", name: "Deep Work", color: "violet", order: 1 },
      "2026-01-02T00:00:00.000Z",
    );
    const archived = archiveRoleDocument(
      updated,
      { id: "role-1", name: updated.name, color: updated.color, order: updated.order },
      "2026-01-03T00:00:00.000Z",
    );
    const restored = restoreRoleDocument(
      archived,
      { name: "Deep Work", order: 2 },
      "2026-01-04T00:00:00.000Z",
    );
    expect(restored).toMatchObject({
      id: "role-1",
      createdAt: created.createdAt,
      archivedAt: null,
      order: 2,
    });
  });
});
