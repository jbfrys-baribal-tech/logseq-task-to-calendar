import type { ICalendarProvider } from "../ports/calendar-provider";
import type { ITaskRepository } from "../ports/task-repository";
import { TaskNormalizer } from "../services/task-normalizer";
import { logError, logInfo } from "../../shared/logger";

/**
 * Orchestrates the synchronization between Logseq and the remote calendar provider.
 */
export class SyncEngine {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly calendarProvider: ICalendarProvider,
    private readonly taskNormalizer: TaskNormalizer = new TaskNormalizer(),
  ) {}

  /**
   * Executes a one-way synchronization from Logseq to the calendar provider.
   */
  async run(): Promise<void> {
    try {
      const authenticated = await this.calendarProvider.authenticate();
      if (!authenticated) {
        throw new Error("Calendar provider authentication failed.");
      }

      const tasks = await this.taskRepository.findSyncableTasks();
      logInfo(`Found ${tasks.length} candidate task(s) in Logseq.`);

      let created = 0;
      let updated = 0;
      let skipped = 0;

      for (const task of tasks) {
        const event = this.taskNormalizer.normalize(task);
        if (!event) {
          skipped += 1;
          continue;
        }

        try {
          if (!event.remoteEventId) {
            const remoteEventId = await this.calendarProvider.createEvent(event);
            await this.taskRepository.persistRemoteEventId(task.blockId, remoteEventId);
            created += 1;
          } else {
            await this.calendarProvider.updateEvent(event.remoteEventId, event);
            updated += 1;
          }
        } catch (error) {
          logError(`Failed to sync block ${task.blockId}`, error);
        }
      }

      await logseq.UI.showMsg(
        `Sync complete: ${created} created, ${updated} updated, ${skipped} skipped.`,
        "success",
      );
    } catch (error) {
      logError("Synchronization failed", error);
      await logseq.UI.showMsg("Synchronization failed. Check the console for details.", "error");
    }
  }
}
