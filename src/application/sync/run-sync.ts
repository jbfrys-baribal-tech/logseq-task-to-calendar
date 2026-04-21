import { SyncEngine } from "../../core/use-cases/sync-engine";
import { LogseqTaskRepository } from "../../infrastructure/logseq/db-task-repository";
import { GoogleCalendarProvider } from "../../infrastructure/google/google-calendar-provider";
import type { PluginSettings } from "../../settings";
import { logError } from "../../shared/logger";

/**
 * Builds the sync engine from the current plugin settings and runs it.
 */
export async function runSync(settings: PluginSettings): Promise<void> {
  try {
    const isDbGraph = await logseq.App.checkCurrentIsDbGraph();
    if (!isDbGraph) {
      await logseq.UI.showMsg("This plugin requires a Logseq DB graph.", "warning");
      return;
    }

    if (settings.provider !== "google") {
      await logseq.UI.showMsg(
        "Outlook is not implemented yet. Google Calendar is the only active provider for now.",
        "warning",
      );
      return;
    }

    const taskRepository = new LogseqTaskRepository();
    const calendarProvider = new GoogleCalendarProvider(settings);

    const engine = new SyncEngine(taskRepository, calendarProvider);

    await engine.run();
  } catch (error) {
    logError("Failed to run synchronization", error);
    await logseq.UI.showMsg("Synchronization setup failed.", "error");
  }
}
