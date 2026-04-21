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

/**
 * Logseq settings schema for the plugin configuration panel.
 */
function buildSettingsSchema(provider: CalendarProviderType): SettingSchemaDesc[] {
  const common: SettingSchemaDesc[] = [
    {
      key: "provider",
      type: "enum",
      title: "Calendar provider",
      description: "Select the remote calendar service to synchronize tasks to.",
      default: provider,
      enumChoices: ["google", "outlook"],
      enumPicker: "select",
    },
    {
      key: "defaultEventDurationMinutes",
      type: "number",
      title: "Default event duration (minutes)",
      description: "Fallback duration used when only one task date is available.",
      default: 60,
    },
  ];

  const google: SettingSchemaDesc[] = [
    {
      key: "google",
      type: "heading",
      title: "Google Calendar",
      description: "Settings used when Google Calendar is selected.",
      default: null,
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
  ];

  const outlook: SettingSchemaDesc[] = [
    {
      key: "outlook",
      type: "heading",
      title: "Microsoft Outlook",
      description: "Settings used when Outlook is selected.",
      default: null,
    },
    {
      key: "outlookTenantId",
      type: "string",
      title: "Outlook tenant ID",
      description: "Microsoft Entra tenant identifier for Outlook authentication.",
      default: "",
    },
    {
      key: "outlookClientId",
      type: "string",
      title: "Outlook client ID",
      description: "OAuth client ID used by the Outlook integration.",
      default: "",
    },
    {
      key: "outlookClientSecret",
      type: "string",
      title: "Outlook client secret",
      description: "OAuth client secret used by the Outlook integration.",
      default: "",
    },
    {
      key: "outlookRefreshToken",
      type: "string",
      title: "Outlook refresh token",
      description: "Token used to refresh Microsoft Graph access when needed.",
      default: "",
    },
    {
      key: "outlookCalendarId",
      type: "string",
      title: "Outlook calendar ID",
      description: "Calendar target for synchronized events.",
      default: "primary",
    },
  ];

  return provider === "google" ? [...common, ...google] : [...common, ...outlook];
}

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
export function refreshSettingsSchema(): void {
  const currentProvider = getPluginSettings().provider;
  logseq.useSettingsSchema(buildSettingsSchema(currentProvider));
  console.info(`[${PLUGIN_SETTINGS_KEY}] settings schema registered`);
}
