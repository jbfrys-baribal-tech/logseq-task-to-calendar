import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleCalendarProvider } from "../src/infrastructure/google/google-calendar-provider";
import type { PluginSettings } from "../src/settings";
import type { SyncEvent } from "../src/core/models/sync-event";

function makeSettings(): PluginSettings {
  return {
    provider: "google",
    completedTaskAction: "update",
    googleClientId: "client-id",
    googleClientSecret: "client-secret",
    googleRefreshToken: "refresh-token",
    googleCalendarId: "primary",
    outlookTenantId: "",
    outlookClientId: "",
    outlookClientSecret: "",
    outlookRefreshToken: "",
    outlookCalendarId: "primary",
    defaultEventDurationMinutes: 60,
  };
}

function mockFetchSequence(...responses: Response[]): ReturnType<typeof vi.fn> {
  return vi.fn().mockImplementation(() => {
    const response = responses.shift();
    if (!response) {
      throw new Error("Unexpected fetch call");
    }
    return Promise.resolve(response);
  });
}

describe("GoogleCalendarProvider", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses all-day date payloads when the event is date-only", async () => {
    const fetchMock = mockFetchSequence(
      new Response(JSON.stringify({ access_token: "token", expires_in: 3600, token_type: "Bearer" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
      new Response(JSON.stringify({ id: "event-1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const provider = new GoogleCalendarProvider(makeSettings());
    const eventId = await provider.createEvent({
      logseqBlockId: "block-1",
      title: "Write release notes",
      startDate: "2025-02-17",
      endDate: "2025-02-18",
      status: "TODO",
    });

    expect(eventId).toBe("event-1");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [url, init] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(url).toContain("/calendar/v3/calendars/primary/events");

    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.start).toEqual({ date: "2025-02-17" });
    expect(body.end).toEqual({ date: "2025-02-18" });
  });

  it("uses dateTime payloads when the event has a time component", async () => {
    const fetchMock = mockFetchSequence(
      new Response(JSON.stringify({ access_token: "token", expires_in: 3600, token_type: "Bearer" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
      new Response(JSON.stringify({ id: "event-2" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const provider = new GoogleCalendarProvider(makeSettings());
    const eventId = await provider.createEvent({
      logseqBlockId: "block-2",
      title: "Call with team",
      startDate: "2025-02-17T09:30:00.000Z",
      endDate: "2025-02-17T10:00:00.000Z",
      status: "DOING",
    });

    expect(eventId).toBe("event-2");
    const [, init] = fetchMock.mock.calls[1] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.start).toEqual({ dateTime: "2025-02-17T09:30:00.000Z" });
    expect(body.end).toEqual({ dateTime: "2025-02-17T10:00:00.000Z" });
  });
});
