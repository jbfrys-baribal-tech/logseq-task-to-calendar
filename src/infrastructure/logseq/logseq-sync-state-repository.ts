import { REMOTE_EVENT_ID_PROPERTY } from "../../shared/constants";

/**
 * Thin Logseq property writer used by the sync engine to persist remote ids.
 */
export class LogseqSyncStateRepository {
  /**
   * Persists the remote event identifier on the given block.
   */
  async saveRemoteEventId(blockId: string, remoteEventId: string): Promise<void> {
    await logseq.Editor.upsertBlockProperty(blockId, REMOTE_EVENT_ID_PROPERTY, remoteEventId, {
      reset: true,
    });
  }
}
