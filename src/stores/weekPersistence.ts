import { getAllWeekIds, getWeek, saveWeek } from "@/lib/db";
import type { Week, WeekId } from "@/types";

export interface PersistenceEpoch {
  generation: number;
  signal: AbortSignal;
}

export type PersistenceResult<T> =
  | { ok: true; value: T }
  | { ok: false; stale: true }
  | { ok: false; stale: false; error: unknown; message: string };

function saveErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Failed to save changes";
}

/**
 * Session-scoped coordinator for Week persistence.
 *
 * Owns the mutable mechanics around Supabase I/O: ordered full-week saves,
 * aborting stale session work, and pending optimistic snapshots. The Zustand
 * store owns UI state and domain mutations; this module owns whether an async DB
 * continuation still belongs to the current Session.
 */
class WeekPersistenceCoordinator {
  private saveQueue: Promise<void> = Promise.resolve();
  private generation = 0;
  private controller = new AbortController();
  private pendingWeekSnapshots = new Map<WeekId, Week>();

  reset(): void {
    this.generation += 1;
    this.controller.abort();
    this.controller = new AbortController();
    this.pendingWeekSnapshots.clear();
    this.saveQueue = Promise.resolve();
  }

  epoch(): PersistenceEpoch {
    return {
      generation: this.generation,
      signal: this.controller.signal,
    };
  }

  isCurrent(epoch: PersistenceEpoch): boolean {
    return epoch.generation === this.generation;
  }

  pendingSnapshot(weekId: WeekId): Week | undefined {
    return this.pendingWeekSnapshots.get(weekId);
  }

  async listWeekIds(
    epoch: PersistenceEpoch = this.epoch(),
  ): Promise<PersistenceResult<WeekId[]>> {
    try {
      const weekIds = await getAllWeekIds({ signal: epoch.signal });
      if (!this.isCurrent(epoch)) return { ok: false, stale: true };
      return { ok: true, value: weekIds };
    } catch (error) {
      if (!this.isCurrent(epoch)) return { ok: false, stale: true };
      return { ok: false, stale: false, error, message: "Failed to load your weeks" };
    }
  }

  async loadWeek(
    weekId: WeekId,
    epoch: PersistenceEpoch = this.epoch(),
  ): Promise<PersistenceResult<Week | undefined>> {
    const pendingBeforeLoad = this.pendingSnapshot(weekId);
    if (pendingBeforeLoad) return { ok: true, value: pendingBeforeLoad };

    try {
      const week = await getWeek(weekId, { signal: epoch.signal });
      if (!this.isCurrent(epoch)) return { ok: false, stale: true };
      return { ok: true, value: this.pendingSnapshot(weekId) ?? week };
    } catch (error) {
      if (!this.isCurrent(epoch)) return { ok: false, stale: true };
      const pendingAfterError = this.pendingSnapshot(weekId);
      if (pendingAfterError) return { ok: true, value: pendingAfterError };
      return { ok: false, stale: false, error, message: "Failed to load week" };
    }
  }

  async commitWeek(week: Week): Promise<PersistenceResult<void>> {
    const epoch = this.epoch();
    this.pendingWeekSnapshots.set(week.id, week);

    const run = this.saveQueue.catch(() => undefined).then(async () => {
      if (!this.isCurrent(epoch) || epoch.signal.aborted) return;
      await saveWeek(week, { signal: epoch.signal });
      if (!this.isCurrent(epoch)) return;

      // Clear only if this exact queued snapshot is still the latest pending
      // version for the Week. Domain timestamps are not persistence tokens.
      if (this.pendingWeekSnapshots.get(week.id) === week) {
        this.pendingWeekSnapshots.delete(week.id);
      }
    });

    this.saveQueue = run.catch(() => undefined);

    try {
      await run;
      if (!this.isCurrent(epoch)) return { ok: false, stale: true };
      return { ok: true, value: undefined };
    } catch (error) {
      if (!this.isCurrent(epoch)) return { ok: false, stale: true };
      return { ok: false, stale: false, error, message: saveErrorMessage(error) };
    }
  }
}

export const weekPersistence = new WeekPersistenceCoordinator();
