import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { collection, collectionGroup, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
const rulesDescribe = emulatorHost ? describe : describe.skip;

rulesDescribe("Firestore ownership rules", () => {
  let environment: RulesTestEnvironment;

  beforeAll(async () => {
    const [host, portText] = emulatorHost!.split(":");
    environment = await initializeTestEnvironment({
      projectId: "demo-first-things-first",
      firestore: {
        host,
        port: Number(portText),
        rules: readFileSync(resolve("firestore.rules"), "utf8"),
      },
    });
  });

  beforeEach(async () => environment.clearFirestore());
  afterAll(async () => environment.cleanup());

  it("allows an owner to round-trip their Week, Role, and name claim", async () => {
    const db = environment.authenticatedContext("user-a").firestore();
    await assertSucceeds(setDoc(doc(db, "users/user-a/weeks/2026-W30"), { id: "2026-W30" }));
    await assertSucceeds(
      setDoc(doc(db, "users/user-a/roles/role-1"), {
        id: "role-1",
        name: "Work",
        color: "teal",
        order: 0,
        archivedAt: null,
        createdAt: "2026-07-20T00:00:00.000Z",
        updatedAt: "2026-07-20T00:00:00.000Z",
      }),
    );
    await assertSucceeds(
      setDoc(doc(db, "users/user-a/roleNames/work"), {
        roleId: "role-1",
        normalizedName: "work",
      }),
    );
    expect((await assertSucceeds(getDoc(doc(db, "users/user-a/weeks/2026-W30")))).exists()).toBe(true);
  });

  it("denies every signed-out read and write", async () => {
    const db = environment.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "users/user-a/weeks/2026-W30")));
    await assertFails(setDoc(doc(db, "users/user-a/weeks/2026-W30"), { id: "2026-W30" }));
  });

  it("denies cross-User gets, lists, writes, and forged document ids", async () => {
    await environment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "users/user-a/weeks/2026-W30"), { id: "2026-W30" });
    });
    const db = environment.authenticatedContext("user-b").firestore();
    await assertFails(getDoc(doc(db, "users/user-a/weeks/2026-W30")));
    await assertFails(getDocs(collection(db, "users/user-a/weeks")));
    await assertFails(setDoc(doc(db, "users/user-a/weeks/2026-W30"), { id: "2026-W30" }));
    await assertFails(setDoc(doc(db, "users/user-b/weeks/2026-W30"), { id: "forged-id" }));
  });

  it("denies User-root, unexpected-path, and collection-group access", async () => {
    const db = environment.authenticatedContext("user-a").firestore();
    await assertFails(setDoc(doc(db, "users/user-a"), { admin: true }));
    await assertFails(setDoc(doc(db, "users/user-a/private/value"), { value: true }));
    await assertFails(getDocs(collectionGroup(db, "weeks")));
  });
});
