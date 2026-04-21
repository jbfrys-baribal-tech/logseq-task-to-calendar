import { logError, logInfo } from "./shared/logger";
import { getPluginSettings, registerSettingsSchema } from "./settings";
import { runSync } from "./application/sync/run-sync";
import { PLUGIN_NAME } from "./shared/constants";

declare global {
  interface Window {
    __logseqTaskToCalendarSync?: () => Promise<void>;
  }
}

/**
 * Initializes the plugin runtime, settings, and future command registrations.
 */
export async function bootstrapPlugin(): Promise<void> {
  try {
    registerSettingsSchema();
    window.__logseqTaskToCalendarSync = async () => {
      await runSync(getPluginSettings());
    };

    logseq.App.registerCommandPalette(
      {
        key: "logseq-task-to-calendar-sync",
        label: "Sync tasks to calendar",
      },
      async () => {
        await runSync(getPluginSettings());
      },
    );

    logseq.App.registerUIItem("toolbar", {
      key: "logseq-task-to-calendar-toolbar",
      template:
        '<a class="button" title="Sync tasks to calendar" onclick="window.__logseqTaskToCalendarSync?.()">⟳</a>',
    });

    logInfo("Plugin initialized");
    await logseq.UI.showMsg(`${PLUGIN_NAME} is ready.`, "success");
  } catch (error) {
    logError("Failed to initialize plugin", error);
    logseq.UI.showMsg("Logseq Task to Calendar failed to initialize.", "error");
  }
}
