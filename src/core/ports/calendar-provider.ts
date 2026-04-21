import type { SyncEvent } from "../models/sync-event";

/**
 * Contract for calendar providers used by the synchronization engine.
 * Implementations may target Google Calendar, Microsoft Outlook, or future providers.
 */
export interface ICalendarProvider {
  /**
   * Performs provider authentication and prepares the client for API calls.
   *
   * @returns A promise resolving to `true` when authentication succeeds.
   */
  authenticate(): Promise<boolean>;

  /**
   * Creates a remote calendar event from the normalized Logseq task payload.
   *
   * @param eventData - The task data to publish to the remote calendar.
   * @returns A promise resolving to the generated remote event identifier.
   */
  createEvent(eventData: SyncEvent): Promise<string>;

  /**
   * Updates an existing remote calendar event.
   *
   * @param eventId - The remote event identifier to update.
   * @param eventData - The latest normalized task data.
   */
  updateEvent(eventId: string, eventData: SyncEvent): Promise<void>;

  /**
   * Deletes an existing remote calendar event.
   *
   * @param eventId - The remote event identifier to delete.
   */
  deleteEvent(eventId: string): Promise<void>;
}
