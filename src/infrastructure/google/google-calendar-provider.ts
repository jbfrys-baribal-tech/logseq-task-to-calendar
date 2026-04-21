import type { ICalendarProvider } from "../../core/ports/calendar-provider";
import type { SyncEvent } from "../../core/models/sync-event";
import type { PluginSettings } from "../../settings";

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

/**
 * Google Calendar REST adapter using a refresh-token based OAuth flow.
 */
export class GoogleCalendarProvider implements ICalendarProvider {
  private accessToken: string | null = null;
  private accessTokenExpiresAt = 0;

  constructor(private readonly settings: PluginSettings) {}

  /**
   * Ensures that a valid Google access token is available.
   */
  async authenticate(): Promise<boolean> {
    if (this.hasValidAccessToken()) {
      return true;
    }

    if (!this.settings.googleClientId || !this.settings.googleClientSecret || !this.settings.googleRefreshToken) {
      return false;
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.settings.googleClientId,
        client_secret: this.settings.googleClientSecret,
        refresh_token: this.settings.googleRefreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      throw new Error(`Google OAuth refresh failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as GoogleTokenResponse;
    this.accessToken = payload.access_token;
    this.accessTokenExpiresAt = Date.now() + payload.expires_in * 1000 - 30_000;
    return true;
  }

  /**
   * Creates a Google Calendar event from a normalized Logseq task.
   */
  async createEvent(eventData: SyncEvent): Promise<string> {
    const response = await this.requestJson<{ id: string }>(`/events`, {
      method: "POST",
      body: JSON.stringify(this.toGoogleEventPayload(eventData)),
    });

    return response.id;
  }

  /**
   * Updates a Google Calendar event from a normalized Logseq task.
   */
  async updateEvent(eventId: string, eventData: SyncEvent): Promise<void> {
    await this.requestJson(`/events/${encodeURIComponent(eventId)}`, {
      method: "PUT",
      body: JSON.stringify(this.toGoogleEventPayload(eventData)),
    });
  }

  /**
   * Deletes a Google Calendar event.
   */
  async deleteEvent(eventId: string): Promise<void> {
    await this.request(`/events/${encodeURIComponent(eventId)}`, {
      method: "DELETE",
    });
  }

  private hasValidAccessToken(): boolean {
    return Boolean(this.accessToken && Date.now() < this.accessTokenExpiresAt);
  }

  private async request(path: string, init: RequestInit): Promise<Response> {
    await this.authenticate();

    if (!this.accessToken) {
      throw new Error("Google access token is unavailable.");
    }

    const response = await fetch(this.buildUrl(path), {
      ...init,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Google Calendar request failed (${response.status}): ${body}`);
    }

    return response;
  }

  private async requestJson<T>(path: string, init: RequestInit): Promise<T> {
    const response = await this.request(path, init);
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }

  private buildUrl(path: string): string {
    const calendarId = encodeURIComponent(this.settings.googleCalendarId || "primary");
    return `https://www.googleapis.com/calendar/v3/calendars/${calendarId}${path}`;
  }

  private toGoogleEventPayload(eventData: SyncEvent): Record<string, unknown> {
    const allDay = this.isDateOnly(eventData.startDate) && this.isDateOnly(eventData.endDate);
    const descriptionLines = [
      `Synced from Logseq block ${eventData.logseqBlockId}`,
      `Status: ${eventData.status}`,
    ];

    return {
      summary: eventData.title,
      description: descriptionLines.join("\n"),
      start: allDay
        ? {
            date: eventData.startDate,
          }
        : {
            dateTime: eventData.startDate,
          },
      end: allDay
        ? {
            date: eventData.endDate,
          }
        : {
            dateTime: eventData.endDate,
          },
    };
  }

  private isDateOnly(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
  }
}
