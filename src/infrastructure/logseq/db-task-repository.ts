import type { ITaskRepository } from "../../core/ports/task-repository";
import type { TaskRecord } from "../../core/models/task-record";
import { FIND_SYNCABLE_TASKS_QUERY } from "./queries";
import { REMOTE_EVENT_ID_PROPERTY } from "../../shared/constants";

type PulledTask = Record<string, unknown> & {
  uuid?: string;
  "block/uuid"?: string;
  title?: string;
  "block/title"?: string;
  content?: string;
  "block/content"?: string;
  marker?: string;
  "block/marker"?: string;
  scheduled?: unknown;
  "block/scheduled"?: unknown;
  deadline?: unknown;
  "block/deadline"?: unknown;
  properties?: Record<string, unknown>;
  "block/properties"?: Record<string, unknown>;
  "logseq.task/status"?: string;
  "logseq.task/scheduled"?: unknown;
  "logseq.task/deadline"?: unknown;
};

/**
 * Logseq DB repository that fetches tasks using native datascript queries.
 */
export class LogseqTaskRepository implements ITaskRepository {
  /**
   * Returns tasks that have a marker and at least one date.
   */
  async findSyncableTasks(): Promise<TaskRecord[]> {
    const rows = await logseq.DB.datascriptQuery<unknown[]>(FIND_SYNCABLE_TASKS_QUERY);
    const tasks = rows
      .map((row) => this.extractPulledTask(row))
      .filter((task): task is TaskRecord => task !== null)
      .filter((task) => Boolean(task.scheduledAt || task.deadlineAt));

    return tasks;
  }

  /**
   * Persists the remote calendar event identifier on the originating block.
   */
  async persistRemoteEventId(blockId: string, remoteEventId: string): Promise<void> {
    await logseq.Editor.upsertBlockProperty(blockId, REMOTE_EVENT_ID_PROPERTY, remoteEventId, {
      reset: true,
    });
  }

  private extractPulledTask(row: unknown): TaskRecord | null {
    const pulled = this.unwrapPulledTask(row);
    if (!pulled) {
      return null;
    }

    const blockId = this.readTextValue(pulled, "uuid") ?? this.readTextValue(pulled, "block/uuid");
    const marker =
      this.readTextValue(pulled, "marker") ??
      this.readTextValue(pulled, "block/marker") ??
      this.readTextValue(pulled, "logseq.task/status");
    const title =
      this.readTextValue(pulled, "title") ??
      this.readTextValue(pulled, "block/title") ??
      this.readTextValue(pulled, "content") ??
      this.readTextValue(pulled, "block/content") ??
      "";

    if (!blockId || !marker) {
      return null;
    }

    const properties = this.readProperties(pulled);
    const scheduledAt =
      this.readDateLike(pulled, "scheduled") ??
      this.readDateLike(pulled, "block/scheduled") ??
      this.readDateLike(pulled, "logseq.task/scheduled");
    const deadlineAt =
      this.readDateLike(pulled, "deadline") ??
      this.readDateLike(pulled, "block/deadline") ??
      this.readDateLike(pulled, "logseq.task/deadline");
    const remoteEventId = this.readTextValue(properties, REMOTE_EVENT_ID_PROPERTY);

    return {
      blockId,
      status: marker,
      title,
      scheduledAt,
      deadlineAt,
      remoteEventId,
      raw: {
        ...pulled,
        properties,
      },
    };
  }

  private unwrapPulledTask(row: unknown): PulledTask | null {
    if (Array.isArray(row)) {
      const [first] = row;
      if (first && typeof first === "object") {
        return first as PulledTask;
      }
      return null;
    }

    if (row && typeof row === "object") {
      return row as PulledTask;
    }

    return null;
  }

  private readTextValue(source: Record<string, unknown> | undefined, key: string): string | undefined {
    if (!source) {
      return undefined;
    }

    const value = source[key];
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    if (value && typeof value === "object") {
      const nested = value as Record<string, unknown>;
      const candidates = ["name", "title", "ident", "value", "uuid", "fullTitle"];
      for (const candidate of candidates) {
        const nestedValue = nested[candidate];
        if (typeof nestedValue === "string") {
          return nestedValue;
        }
        if (typeof nestedValue === "number" || typeof nestedValue === "boolean") {
          return String(nestedValue);
        }
      }
    }

    return undefined;
  }

  private readDateLike(source: Record<string, unknown> | undefined, key: string): string | undefined {
    if (!source) {
      return undefined;
    }

    const value = source[key];
    if (typeof value === "number") {
      return String(value);
    }
    if (typeof value === "string") {
      return value;
    }
    if (value && typeof value === "object") {
      const nested = value as Record<string, unknown>;
      const candidates = ["value", "date", "datetime", "ident"];
      for (const candidate of candidates) {
        const nestedValue = nested[candidate];
        if (typeof nestedValue === "string") {
          return nestedValue;
        }
        if (typeof nestedValue === "number") {
          return String(nestedValue);
        }
      }
    }

    return undefined;
  }

  private readProperties(source: PulledTask): Record<string, unknown> {
    const props = source.properties ?? source["block/properties"];
    if (props && typeof props === "object") {
      return props as Record<string, unknown>;
    }
    return {};
  }
}
