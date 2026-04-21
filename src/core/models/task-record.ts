/**
 * Raw task projection returned by the Logseq DB query layer.
 * This is intentionally close to the database shape so it can be normalized later.
 */
export interface TaskRecord {
  /**
   * The Logseq block UUID.
   */
  blockId: string;

  /**
   * The task marker as stored by Logseq DB.
   */
  status: string;

  /**
   * Optional scheduled date in ISO 8601 or Logseq-compatible date format.
   */
  scheduledAt?: string;

  /**
   * Optional deadline date in ISO 8601 or Logseq-compatible date format.
   */
  deadlineAt?: string;

  /**
   * The display title or content associated with the task.
   */
  title: string;

  /**
   * Existing remote calendar event identifier, if already persisted on the block.
   */
  remoteEventId?: string;

  /**
   * Optional raw DB payload attached to the record for provider-independent normalization.
   */
  raw?: Record<string, unknown>;
}
