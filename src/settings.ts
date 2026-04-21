import type { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";
import type { CalendarProviderType, CompletedTaskAction } from "./shared/types";
import { PLUGIN_SETTINGS_KEY } from "./shared/constants";

/**
 * Plugin settings persisted by Logseq.
 */
export interface PluginSettings {
  provider: CalendarProviderType;
  completedTaskAction: CompletedTaskAction;
  googleClientId: string;
  googleClientSecret: string;
  googleRefreshToken: string;
  googleCalendarId: string;
  outlookTenantId: string;
  outlookClientId: string;
  outlookClientSecret: string;
  outlookRefreshToken: string;
  outlookCalendarId: string;
  defaultEventDurationMinutes: number;
}

/**
 * Default settings used when the user has not configured the plugin yet.
 */
export const defaultSettings: PluginSettings = {
  provider: "google",
  completedTaskAction: "update",
  googleClientId: "",
  googleClientSecret: "",
  googleRefreshToken: "",
  googleCalendarId: "primary",
  outlookTenantId: "",
  outlookClientId: "",
  outlookClientSecret: "",
  outlookRefreshToken: "",
  outlookCalendarId: "primary",
  defaultEventDurationMinutes: 60,
};

let currentSettings: PluginSettings = defaultSettings;

/**
 * Extracts only the plugin-owned settings keys from a generic Logseq settings payload.
 */
function pickPluginSettings(settings: Record<string, unknown>): Partial<PluginSettings> {
  return {
    provider: settings.provider as CalendarProviderType | undefined,
    completedTaskAction: settings.completedTaskAction as CompletedTaskAction | undefined,
    googleClientId: settings.googleClientId as string | undefined,
    googleClientSecret: settings.googleClientSecret as string | undefined,
    googleRefreshToken: settings.googleRefreshToken as string | undefined,
    googleCalendarId: settings.googleCalendarId as string | undefined,
    outlookTenantId: settings.outlookTenantId as string | undefined,
    outlookClientId: settings.outlookClientId as string | undefined,
    outlookClientSecret: settings.outlookClientSecret as string | undefined,
    outlookRefreshToken: settings.outlookRefreshToken as string | undefined,
    outlookCalendarId: settings.outlookCalendarId as string | undefined,
    defaultEventDurationMinutes: settings.defaultEventDurationMinutes as number | undefined,
  };
}

/**
 * Logseq settings schema for the plugin configuration panel.
 *
 * The schema is intentionally static because Logseq's settings UI does not
 * reliably support live conditional field rendering. Keeping all provider
 * sections visible avoids delayed re-renders and shifting layouts.
 */
export const settingsSchema: SettingSchemaDesc[] = [
  {
    key: "provider",
    type: "enum",
    title: "Calendar provider",
    description:
      "Select the remote calendar service to synchronize tasks to. All provider sections stay visible to keep the settings UI stable.",
    default: defaultSettings.provider,
    enumChoices: ["google", "outlook"],
    enumPicker: "select",
  },
  {
    key: "defaultEventDurationMinutes",
    type: "number",
    title: "Default event duration (minutes)",
    description: "Fallback duration used when only one task date is available.",
    default: defaultSettings.defaultEventDurationMinutes,
  },
  {
    key: "completedTaskAction",
    type: "enum",
    title: "Completed task action",
    description: "Choose whether completed tasks should update the calendar event or delete it.",
    default: defaultSettings.completedTaskAction,
    enumChoices: ["update", "delete"],
    enumPicker: "select",
  },
  {
    key: "google",
    type: "heading",
    title: "Google Calendar",
    description: "Fields used when Google Calendar is the active provider.",
    default: null,
  },
  {
    key: "googleClientId",
    type: "string",
    title: "Google client ID",
    description: "OAuth client ID used by the Google Calendar integration.",
    default: defaultSettings.googleClientId,
  },
  {
    key: "googleClientSecret",
    type: "string",
    title: "Google client secret",
    description: "OAuth client secret used by the Google Calendar integration.",
    default: defaultSettings.googleClientSecret,
  },
  {
    key: "googleRefreshToken",
    type: "string",
    title: "Google refresh token",
    description: "Token used to refresh Google API access when needed.",
    default: defaultSettings.googleRefreshToken,
  },
  {
    key: "googleCalendarId",
    type: "string",
    title: "Google calendar ID",
    description: "Calendar target for synchronized events. Use 'primary' for the default calendar.",
    default: defaultSettings.googleCalendarId,
  },
  {
    key: "outlook",
    type: "heading",
    title: "Microsoft Outlook",
    description: "Fields used when Microsoft Outlook is the active provider.",
    default: null,
  },
  {
    key: "outlookTenantId",
    type: "string",
    title: "Outlook tenant ID",
    description: "Microsoft Entra tenant identifier for Outlook authentication.",
    default: defaultSettings.outlookTenantId,
  },
  {
    key: "outlookClientId",
    type: "string",
    title: "Outlook client ID",
    description: "OAuth client ID used by the Outlook integration.",
    default: defaultSettings.outlookClientId,
  },
  {
    key: "outlookClientSecret",
    type: "string",
    title: "Outlook client secret",
    description: "OAuth client secret used by the Outlook integration.",
    default: defaultSettings.outlookClientSecret,
  },
  {
    key: "outlookRefreshToken",
    type: "string",
    title: "Outlook refresh token",
    description: "Token used to refresh Microsoft Graph access when needed.",
    default: defaultSettings.outlookRefreshToken,
  },
  {
    key: "outlookCalendarId",
    type: "string",
    title: "Outlook calendar ID",
    description: "Calendar target for synchronized events.",
    default: defaultSettings.outlookCalendarId,
  },
];

export function setPluginSettingsSnapshot(settings: Partial<PluginSettings>): void {
  currentSettings = {
    ...defaultSettings,
    ...settings,
  };
}

/**
 * Updates the plugin settings snapshot from a raw Logseq settings payload.
 */
export function setPluginSettingsSnapshotFromLogseq(settings: Record<string, unknown>): void {
  setPluginSettingsSnapshot(pickPluginSettings(settings));
}

/**
 * Returns the latest settings snapshot seen by the plugin.
 */
export function getPluginSettings(): PluginSettings {
  return currentSettings;
}

/**
 * Registers the plugin settings schema with Logseq.
 */
export function registerSettingsSchema(): void {
  logseq.useSettingsSchema(settingsSchema);
  console.info(`[${PLUGIN_SETTINGS_KEY}] settings schema registered`);
}
