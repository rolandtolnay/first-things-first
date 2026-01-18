/**
 * First Things First - Dexie Database
 *
 * IndexedDB persistence layer using Dexie.js.
 * Implements the week snapshot model where each week is stored independently.
 */

import Dexie, { type Table } from "dexie";
import type { Week, WeekId } from "@/types";

// ============================================================================
// Database Class
// ============================================================================

/**
 * FirstThingsFirst database extending Dexie.
 * Single 'weeks' table stores complete week snapshots.
 */
class FirstThingsFirstDB extends Dexie {
  weeks!: Table<Week, WeekId>;

  constructor() {
    super("FirstThingsFirst");

    // Version 1 schema
    // Index: id (primary), startDate, createdAt for queries
    this.version(1).stores({
      weeks: "id, startDate, createdAt",
    });
  }
}

// ============================================================================
// Database Instance
// ============================================================================

/**
 * Singleton database instance.
 * Import this in stores and components.
 */
export const db = new FirstThingsFirstDB();

// ============================================================================
// Storage Persistence
// ============================================================================

/**
 * Request persistent storage from the browser.
 *
 * Critical for Safari: IndexedDB data may be evicted after 7 days of inactivity
 * unless persistent storage is granted. Call this on first app use.
 *
 * @returns Promise resolving to:
 *   - true: Storage is persistent (won't be evicted)
 *   - false: Storage may be evicted under storage pressure
 *   - null: API not available (very old browsers)
 */
export async function requestPersistentStorage(): Promise<boolean | null> {
  // Check if the Storage API is available
  if (!navigator.storage || !navigator.storage.persist) {
    console.warn(
      "[DB] Storage persistence API not available. Data may be evicted."
    );
    return null;
  }

  try {
    // Check if already persisted
    const isPersisted = await navigator.storage.persisted();
    if (isPersisted) {
      console.log("[DB] Storage already persistent.");
      return true;
    }

    // Request persistence
    const granted = await navigator.storage.persist();
    if (granted) {
      console.log("[DB] Persistent storage granted.");
    } else {
      console.warn(
        "[DB] Persistent storage denied. Data may be evicted under storage pressure."
      );
    }
    return granted;
  } catch (error) {
    console.error("[DB] Error requesting persistent storage:", error);
    return null;
  }
}

/**
 * Get storage usage estimate.
 * Useful for debugging and showing users their data usage.
 *
 * @returns Storage estimate with usage and quota in bytes, or null if unavailable
 */
export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
} | null> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage ?? 0;
    const quota = estimate.quota ?? 0;
    const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;

    return { usage, quota, percentUsed };
  } catch (error) {
    console.error("[DB] Error getting storage estimate:", error);
    return null;
  }
}

// ============================================================================
// Database Initialization
// ============================================================================

let initialized = false;

/**
 * Initialize the database and request persistent storage.
 * Call this once on app startup (e.g., in root layout or provider).
 *
 * Safe to call multiple times - will only initialize once.
 */
export async function initializeDatabase(): Promise<void> {
  if (initialized) {
    return;
  }

  try {
    // Open the database (creates if doesn't exist)
    await db.open();
    console.log("[DB] Database opened successfully.");

    // Request persistent storage for Safari
    await requestPersistentStorage();

    // Log storage estimate for debugging
    const estimate = await getStorageEstimate();
    if (estimate) {
      console.log(
        `[DB] Storage: ${(estimate.usage / 1024 / 1024).toFixed(2)} MB used of ${(estimate.quota / 1024 / 1024).toFixed(2)} MB (${estimate.percentUsed.toFixed(1)}%)`
      );
    }

    initialized = true;
  } catch (error) {
    console.error("[DB] Failed to initialize database:", error);
    throw error;
  }
}

// ============================================================================
// Week Operations (Low-level)
// ============================================================================

/**
 * Get a week by ID.
 * @param weekId - ISO week format (e.g., "2026-W03")
 */
export async function getWeek(weekId: WeekId): Promise<Week | undefined> {
  return db.weeks.get(weekId);
}

/**
 * Save a week (create or update).
 * @param week - Complete week data
 */
export async function saveWeek(week: Week): Promise<WeekId> {
  return db.weeks.put(week);
}

/**
 * Delete a week.
 * @param weekId - ISO week format (e.g., "2026-W03")
 */
export async function deleteWeek(weekId: WeekId): Promise<void> {
  return db.weeks.delete(weekId);
}

/**
 * Get all weeks, optionally sorted.
 * @param limit - Maximum number of weeks to return
 * @param order - Sort order: "newest" or "oldest"
 */
export async function getAllWeeks(
  limit?: number,
  order: "newest" | "oldest" = "newest"
): Promise<Week[]> {
  let collection = db.weeks.orderBy("createdAt");

  if (order === "newest") {
    collection = collection.reverse();
  }

  if (limit) {
    return collection.limit(limit).toArray();
  }

  return collection.toArray();
}

/**
 * Check if a week exists.
 * @param weekId - ISO week format (e.g., "2026-W03")
 */
export async function weekExists(weekId: WeekId): Promise<boolean> {
  const count = await db.weeks.where("id").equals(weekId).count();
  return count > 0;
}
