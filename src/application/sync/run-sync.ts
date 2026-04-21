import { SyncEngine } from "../../core/use-cases/sync-engine";
import { LogseqTaskRepository } from "../../infrastructure/logseq/db-task-repository";
import { LogseqSyncStateRepository } from "../../infrastructure/logseq/logseq-sync-state-repository";
import { GoogleCalendarProvider } from "../../infrastructure/google/google-calendar-provider";
import type { PluginSettings } from "../../settings";
import { logError } from "../../shared/logger";

/**
 * Builds the sync engine from the current plugin settings and runs it.
 */
export async function runSync(settings: PluginSettings): Promise<void> {
  try {
    const taskRepository = new LogseqTaskRepository();
    const syncStateRepository = new LogseqSyncStateRepository();
    const calendarProvider = new GoogleCalendarProvider(settings);

    const engine = new SyncEngine(taskRepository, calendarProvider);

    await engine.run();

    void syncStateRepository;
  } catch (error) {
    logError("Failed to run synchronization", error);
    await logseq.UI.showMsg("Synchronization setup failed.", "error");
  }
}
