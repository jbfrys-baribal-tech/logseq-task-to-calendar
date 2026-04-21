/**
 * Normalized task representation used by the synchronization engine.
 * This model intentionally stays independent from Logseq and calendar provider specifics.
 */
export interface SyncEvent {
  /**
   * The unique identifier of the originating Logseq block.
   */
  logseqBlockId: string;

  /**
   * The title to send to the remote calendar provider.
   * It should be cleaned from task markers and other Logseq-specific decorations.
   */
  title: string;

  /**
   * The event start date in ISO 8601 format.
   */
  startDate: string;

  /**
   * The event end date in ISO 8601 format.
   * Some providers require an explicit end, even for all-day events.
   */
  endDate: string;

  /**
   * The current task status as reported by Logseq.
   */
  status: string;

  /**
   * The remote calendar event identifier, when one has already been created.
   */
  remoteEventId?: string;
}
