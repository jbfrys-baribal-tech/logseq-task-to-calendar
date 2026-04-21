import type { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";
import type { CalendarProviderType } from "./shared/types";
import { PLUGIN_SETTINGS_KEY } from "./shared/constants";

/**
 * Plugin settings persisted by Logseq.
 */
export interface PluginSettings {
  provider: CalendarProviderType;
  googleClientId: string;
  googleClientSecret: string;
  googleRefreshToken: string;
  googleCalendarId: string;
  defaultEventDurationMinutes: number;
}

/**
 * Default settings used when the user has not configured the plugin yet.
 */
export const defaultSettings: PluginSettings = {
  provider: "google",
  googleClientId: "",
  googleClientSecret: "",
  googleRefreshToken: "",
  googleCalendarId: "primary",
  defaultEventDurationMinutes: 60,
};

/**
 * Logseq settings schema for the plugin configuration panel.
 */
export const settingsSchema: SettingSchemaDesc[] = [
  {
    key: "provider",
    type: "enum",
    title: "Calendar provider",
    description: "Select the remote calendar service to synchronize tasks to.",
    default: "google",
    enumChoices: ["google", "outlook"],
    enumPicker: "select",
  },
  {
    key: "googleClientId",
    type: "string",
    title: "Google client ID",
    description: "OAuth client ID used by the Google Calendar integration.",
    default: "",
  },
  {
    key: "googleClientSecret",
    type: "string",
    title: "Google client secret",
    description: "OAuth client secret used by the Google Calendar integration.",
    default: "",
  },
  {
    key: "googleRefreshToken",
    type: "string",
    title: "Google refresh token",
    description: "Token used to refresh Google API access when needed.",
    default: "",
  },
  {
    key: "googleCalendarId",
    type: "string",
    title: "Google calendar ID",
    description: "Calendar target for synchronized events. Use 'primary' for the default calendar.",
    default: "primary",
  },
  {
    key: "defaultEventDurationMinutes",
    type: "number",
    title: "Default event duration (minutes)",
    description: "Fallback duration used when only one task date is available.",
    default: 60,
  },
];

/**
 * Returns the current plugin settings merged with defaults.
 */
export function getPluginSettings(): PluginSettings {
  const settings = (logseq.settings ?? {}) as Partial<PluginSettings>;

  return {
    ...defaultSettings,
    ...settings,
  };
}

/**
 * Registers the plugin settings schema with Logseq.
 */
export function registerSettingsSchema(): void {
  logseq.useSettingsSchema(settingsSchema);
  console.info(`[${PLUGIN_SETTINGS_KEY}] settings schema registered`);
}
