/**
 * First Things First persistence adapter (Firebase Auth + Cloud Firestore).
 *
 * The browser talks directly to Firestore. Documents live below the current
 * User path and checked-in Security Rules enforce that ownership. Weeks remain
 * whole-snapshot documents; durable Roles remain separately queryable defaults.
 * The public function surface is unchanged so the Zustand store and its
 * ordered optimistic persistence coordinator do not know which provider backs it.
 */

import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  setDoc,
  type DocumentReference,
} from "firebase/firestore/lite";

import { firebaseAuth, firestoreDb } from "@/lib/firebase/client";
import {
  archiveRoleDocument,
  createRoleDocument,
  documentToRole,
  restoreRoleDocument,
  updateRoleDocument,
  type RoleDocument,
} from "@/lib/role-mapping";
import { documentToWeek, weekToDocument } from "@/lib/week-mapping";
import type { Role, RoleColor, Week, WeekId } from "@/types";

export interface DbRequestOptions {
  signal?: AbortSignal;
}

export interface CreateRoleInput {
  name: string;
  color: RoleColor;
  order: number;
}

interface RoleNameClaim {
  roleId: string;
  normalizedName: string;
}

class DuplicateRoleNameError extends Error {
  readonly code = "23505";

  constructor() {
    super("A role with that name already exists");
    this.name = "DuplicateRoleNameError";
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException("The request was aborted", "AbortError");
}

async function abortable<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  throwIfAborted(signal);
  if (!signal) return promise;
  return await Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      signal.addEventListener(
        "abort",
        () => reject(new DOMException("The request was aborted", "AbortError")),
        { once: true },
      );
    }),
  ]);
}

async function currentUserId(): Promise<string> {
  const auth = firebaseAuth();
  await auth.authStateReady();
  if (!auth.currentUser) throw new Error("You are not signed in");
  return auth.currentUser.uid;
}

function userCollection(uid: string, name: "weeks" | "roles" | "roleNames") {
  return collection(firestoreDb(), "users", uid, name);
}

function weekRef(uid: string, weekId: WeekId) {
  return doc(userCollection(uid, "weeks"), weekId);
}

function roleRef(uid: string, roleId: string): DocumentReference<RoleDocument> {
  return doc(userCollection(uid, "roles"), roleId) as DocumentReference<RoleDocument>;
}

function normalizedRoleName(name: string): string {
  return name.trim().toLocaleLowerCase("en-US");
}

function roleNameKey(name: string): string {
  return encodeURIComponent(normalizedRoleName(name));
}

function roleNameRef(uid: string, name: string): DocumentReference<RoleNameClaim> {
  return doc(userCollection(uid, "roleNames"), roleNameKey(name)) as DocumentReference<RoleNameClaim>;
}

export async function getWeek(
  weekId: WeekId,
  options: DbRequestOptions = {},
): Promise<Week | undefined> {
  const uid = await currentUserId();
  const snapshot = await abortable(getDoc(weekRef(uid, weekId)), options.signal);
  return snapshot.exists() ? documentToWeek(snapshot.id, snapshot.data()) : undefined;
}

export async function saveWeek(
  week: Week,
  options: DbRequestOptions = {},
): Promise<WeekId> {
  const uid = await currentUserId();
  await abortable(setDoc(weekRef(uid, week.id), weekToDocument(week)), options.signal);
  return week.id;
}

export async function getAllWeekIds(
  options: DbRequestOptions = {},
): Promise<WeekId[]> {
  const uid = await currentUserId();
  const weeks = query(userCollection(uid, "weeks"), orderBy(documentId(), "asc"));
  const snapshot = await abortable(getDocs(weeks), options.signal);
  return snapshot.docs.map((item) => item.id as WeekId);
}

export async function getAllWeeks(
  options: DbRequestOptions = {},
): Promise<Week[]> {
  const uid = await currentUserId();
  const weeks = query(userCollection(uid, "weeks"), orderBy(documentId(), "asc"));
  const snapshot = await abortable(getDocs(weeks), options.signal);
  return snapshot.docs.map((item) => documentToWeek(item.id, item.data()));
}

async function allRoles(uid: string, signal?: AbortSignal): Promise<Role[]> {
  const snapshot = await abortable(getDocs(userCollection(uid, "roles")), signal);
  return snapshot.docs.map((item) => documentToRole(item.id, item.data()));
}

export async function getActiveRoles(
  options: DbRequestOptions = {},
): Promise<Role[]> {
  const uid = await currentUserId();
  const roles = await allRoles(uid, options.signal);
  return roles
    .filter((role) => role.archivedAt === null)
    .sort((left, right) => left.order - right.order);
}

export async function searchArchivedRoles(
  queryText: string,
  options: DbRequestOptions = {},
): Promise<Role[]> {
  const needle = normalizedRoleName(queryText);
  if (!needle) return [];
  const uid = await currentUserId();
  const roles = await allRoles(uid, options.signal);
  return roles
    .filter(
      (role) =>
        role.archivedAt !== null && normalizedRoleName(role.name).includes(needle),
    )
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 5);
}

export async function createRole(
  input: CreateRoleInput,
  options: DbRequestOptions = {},
): Promise<Role> {
  throwIfAborted(options.signal);
  const uid = await currentUserId();
  const ref = doc(userCollection(uid, "roles")) as DocumentReference<RoleDocument>;
  const claimRef = roleNameRef(uid, input.name);
  const role = createRoleDocument(ref.id, input);

  await abortable(
    runTransaction(firestoreDb(), async (transaction) => {
      const claim = await transaction.get(claimRef);
      if (claim.exists() && claim.data().roleId !== ref.id) throw new DuplicateRoleNameError();
      transaction.set(ref, role);
      transaction.set(claimRef, {
        roleId: ref.id,
        normalizedName: normalizedRoleName(input.name),
      });
    }),
    options.signal,
  );
  return role;
}

export async function updateRoleDefaults(
  input: CreateRoleInput & { id: string },
  options: DbRequestOptions = {},
): Promise<Role> {
  throwIfAborted(options.signal);
  const uid = await currentUserId();
  const ref = roleRef(uid, input.id);
  let result: RoleDocument | null = null;

  await abortable(
    runTransaction(firestoreDb(), async (transaction) => {
      const existingSnapshot = await transaction.get(ref);
      const existing = existingSnapshot.exists() ? existingSnapshot.data() : null;
      const nextClaimRef = roleNameRef(uid, input.name);
      const nextClaim = await transaction.get(nextClaimRef);
      const oldClaimRef =
        existing && existing.archivedAt === null ? roleNameRef(uid, existing.name) : null;
      const oldClaim =
        oldClaimRef && oldClaimRef.path !== nextClaimRef.path
          ? await transaction.get(oldClaimRef)
          : null;

      if (nextClaim.exists() && nextClaim.data().roleId !== input.id) {
        throw new DuplicateRoleNameError();
      }

      result = updateRoleDocument(existing, input);
      transaction.set(ref, result);
      if (oldClaimRef && oldClaim?.exists() && oldClaim.data().roleId === input.id) {
        transaction.delete(oldClaimRef);
      }
      transaction.set(nextClaimRef, {
        roleId: input.id,
        normalizedName: normalizedRoleName(input.name),
      });
    }),
    options.signal,
  );
  return result as unknown as Role;
}

export async function archiveRole(
  input: CreateRoleInput & { id: string },
  options: DbRequestOptions = {},
): Promise<Role> {
  throwIfAborted(options.signal);
  const uid = await currentUserId();
  const ref = roleRef(uid, input.id);
  let result: RoleDocument | null = null;

  await abortable(
    runTransaction(firestoreDb(), async (transaction) => {
      const existingSnapshot = await transaction.get(ref);
      const existing = existingSnapshot.exists() ? existingSnapshot.data() : null;
      const claimRef = roleNameRef(uid, existing?.name ?? input.name);
      const claim = await transaction.get(claimRef);
      result = archiveRoleDocument(existing, input);
      transaction.set(ref, result);
      if (claim.exists() && claim.data().roleId === input.id) transaction.delete(claimRef);
    }),
    options.signal,
  );
  return result as unknown as Role;
}

export async function restoreRole(
  roleId: string,
  updates: Pick<Role, "name" | "order">,
  options: DbRequestOptions = {},
): Promise<Role> {
  throwIfAborted(options.signal);
  const uid = await currentUserId();
  const ref = roleRef(uid, roleId);
  const claimRef = roleNameRef(uid, updates.name);
  let result: RoleDocument | null = null;

  await abortable(
    runTransaction(firestoreDb(), async (transaction) => {
      const existingSnapshot = await transaction.get(ref);
      if (!existingSnapshot.exists()) throw new Error("Role not found");
      const claim = await transaction.get(claimRef);
      if (claim.exists() && claim.data().roleId !== roleId) throw new DuplicateRoleNameError();
      result = restoreRoleDocument(existingSnapshot.data(), updates);
      transaction.set(ref, result);
      transaction.set(claimRef, {
        roleId,
        normalizedName: normalizedRoleName(updates.name),
      });
    }),
    options.signal,
  );
  return result as unknown as Role;
}

export async function persistRoleOrder(
  roleIds: readonly string[],
  options: DbRequestOptions = {},
): Promise<Role[]> {
  throwIfAborted(options.signal);
  const uid = await currentUserId();
  let ordered: Role[] = [];

  await abortable(
    runTransaction(firestoreDb(), async (transaction) => {
      const snapshots = await Promise.all(
        roleIds.map((roleId) => transaction.get(roleRef(uid, roleId))),
      );
      if (snapshots.some((snapshot) => !snapshot.exists())) throw new Error("Role not found");
      const now = new Date().toISOString();
      ordered = snapshots.map((snapshot, order) => {
        if (!snapshot.exists()) throw new Error("Role not found");
        return { ...snapshot.data(), order, updatedAt: now };
      });
      ordered.forEach((role) => transaction.set(roleRef(uid, role.id), role));
    }),
    options.signal,
  );
  return ordered;
}
