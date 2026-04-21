import { logError, logInfo } from "./shared/logger";
import {
  getPluginSettings,
  refreshSettingsSchema,
  setPluginSettingsSnapshotFromLogseq,
} from "./settings";
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
    setPluginSettingsSnapshotFromLogseq((logseq.settings ?? {}) as Record<string, unknown>);
    refreshSettingsSchema();

    logseq.onSettingsChanged((nextSettings) => {
      setPluginSettingsSnapshotFromLogseq((nextSettings ?? {}) as Record<string, unknown>);
      refreshSettingsSchema(getPluginSettings().provider);
    });

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
        '<a class="button" title="Sync tasks to calendar" style="display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;width:18px;height:18px;line-height:0;padding:0;margin:0 0 0 2px;" onclick="window.__logseqTaskToCalendarSync?.()"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false" style="display:block;flex:0 0 auto;"><path d="M20 12a8 8 0 1 1-2.34-5.66" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M20 4v6h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>',
    });

    logInfo("Plugin initialized");
    await logseq.UI.showMsg(`${PLUGIN_NAME} is ready.`, "success");
  } catch (error) {
    logError("Failed to initialize plugin", error);
    logseq.UI.showMsg("Logseq Task to Calendar failed to initialize.", "error");
  }
}
