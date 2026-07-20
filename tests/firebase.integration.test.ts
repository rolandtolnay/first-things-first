import { signInAnonymously, signOut } from "firebase/auth";
import { beforeEach, describe, expect, it } from "vitest";

import {
  archiveRole,
  createRole,
  getActiveRoles,
  getAllWeekIds,
  getAllWeeks,
  getWeek,
  persistRoleOrder,
  restoreRole,
  saveWeek,
  searchArchivedRoles,
  updateRoleDefaults,
} from "@/lib/db";
import { firebaseAuth } from "@/lib/firebase/client";
import type { Week, WeekId } from "@/types";

const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
const integrationDescribe = emulatorHost ? describe : describe.skip;

function week(id: string, title = "Plan"): Week {
  return {
    id: id as WeekId,
    startDate: "2026-07-20T00:00:00.000Z",
    roles: [{ id: "role-1", name: "Work", color: "teal", order: 0 }],
    goals: [{ id: "goal-1", roleId: "role-1", text: title, notes: "why", completed: false }],
    dayPriorities: [
      { id: "priority-1", type: "freestyle", text: "Call", dayIndex: 0, order: 0, completed: true },
    ],
    timeBlocks: [
      {
        id: "block-1",
        type: "freestyle",
        roleId: "role-1",
        dayIndex: 0,
        startSlot: 0,
        duration: 2,
        title: "Focus",
        completed: false,
        recurrence: "weekly",
      },
    ],
    eveningBlocks: [],
    dayBounds: { startHour: 7, endHour: 21 },
    reflection: "Closed deliberately.",
    createdAt: "2026-07-20T08:00:00.000Z",
    updatedAt: "2026-07-20T09:00:00.000Z",
  };
}

async function clearEmulators() {
  await fetch(
    "http://127.0.0.1:8080/emulator/v1/projects/demo-first-things-first/databases/(default)/documents",
    { method: "DELETE" },
  );
  await fetch(
    "http://127.0.0.1:9099/emulator/v1/projects/demo-first-things-first/accounts",
    { method: "DELETE" },
  );
}

integrationDescribe("Firebase persistence adapter", () => {
  beforeEach(async () => {
    if (firebaseAuth().currentUser) await signOut(firebaseAuth());
    await clearEmulators();
    await signInAnonymously(firebaseAuth());
  });

  it("round-trips complete Week documents in sorted order and isolates Users", async () => {
    const later = week("2026-W31", "Later");
    const earlier = week("2026-W30", "Earlier");
    await saveWeek(later);
    await saveWeek(earlier);

    expect(await getWeek(earlier.id)).toEqual(earlier);
    expect(await getAllWeekIds()).toEqual([earlier.id, later.id]);
    expect((await getAllWeeks()).map((item) => item.id)).toEqual([earlier.id, later.id]);

    await signOut(firebaseAuth());
    await signInAnonymously(firebaseAuth());
    expect(await getAllWeekIds()).toEqual([]);
  });

  it("serializes concurrent active-name claims and exposes the provider-neutral conflict code", async () => {
    const results = await Promise.allSettled([
      createRole({ name: "Work", color: "teal", order: 0 }),
      createRole({ name: " work ", color: "amber", order: 1 }),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((result) => result.status === "rejected");
    expect(rejected).toMatchObject({ status: "rejected", reason: { code: "23505" } });
    expect(await getActiveRoles()).toHaveLength(1);
  });

  it("materializes orphan Role defaults, then archives, searches, restores, and reorders", async () => {
    const orphan = await updateRoleDefaults({
      id: "orphan-role",
      name: "Family",
      color: "rose",
      order: 0,
    });
    const second = await createRole({ name: "Work", color: "teal", order: 1 });
    expect((await getActiveRoles()).map((role) => role.id)).toEqual([orphan.id, second.id]);

    await archiveRole({ id: orphan.id, name: orphan.name, color: orphan.color, order: orphan.order });
    expect((await searchArchivedRoles("fam"))[0].id).toBe(orphan.id);
    await restoreRole(orphan.id, { name: "Family", order: 1 });

    const reordered = await persistRoleOrder([orphan.id, second.id]);
    expect(reordered.map((role) => [role.id, role.order])).toEqual([
      [orphan.id, 0],
      [second.id, 1],
    ]);
  });
});
