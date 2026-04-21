import type { TaskRecord } from "../models/task-record";

/**
 * Repository abstraction for fetching Logseq tasks that should be synchronized.
 */
export interface ITaskRepository {
  /**
   * Returns all tasks that have a marker and at least one date attribute.
   *
   * @returns A promise resolving to the list of sync-eligible tasks.
   */
  findSyncableTasks(): Promise<TaskRecord[]>;

  /**
   * Persists the remote calendar event identifier on the originating Logseq block.
   *
   * @param blockId - The Logseq block UUID.
   * @param remoteEventId - The remote calendar event identifier.
   */
  persistRemoteEventId(blockId: string, remoteEventId: string): Promise<void>;
}
