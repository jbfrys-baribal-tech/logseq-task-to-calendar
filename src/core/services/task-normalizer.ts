import type { SyncEvent } from "../models/sync-event";
import type { TaskRecord } from "../models/task-record";
import { REMOTE_EVENT_ID_PROPERTY } from "../../shared/constants";

/**
 * Normalizes raw Logseq task records into synchronization events.
 */
export class TaskNormalizer {
  /**
   * Converts a raw Logseq task record into a sync event when it has a usable date.
   *
   * @param task - The raw task record returned by the Logseq repository.
   * @returns A normalized event or `null` when no syncable date is available.
   */
  normalize(task: TaskRecord): SyncEvent | null {
    const title = this.normalizeTitle(task.title);
    const status = this.normalizeStatus(task.status);
    const scheduled = this.readDateValue(task, "scheduledAt");
    const deadline = this.readDateValue(task, "deadlineAt");

    const dateValue = scheduled ?? deadline;
    if (!dateValue) {
      return null;
    }

    const startDate = this.toIsoDate(dateValue);
    const endDate = this.toIsoDate(this.addDays(dateValue, 1));

    return {
      logseqBlockId: task.blockId,
      title,
      startDate,
      endDate,
      status,
      remoteEventId:
        task.remoteEventId ?? this.readProperty(task, REMOTE_EVENT_ID_PROPERTY),
    };
  }

  private normalizeTitle(title: string): string {
    const trimmed = title.trim();
    const taskMarkers = [
      "TODO",
      "DOING",
      "NOW",
      "LATER",
      "WAITING",
      "WAIT",
      "DONE",
      "CANCELED",
    ];

    for (const marker of taskMarkers) {
      const prefix = `${marker} `;
      if (trimmed.startsWith(prefix)) {
        return trimmed.slice(prefix.length).trim();
      }
    }

    return trimmed;
  }

  private normalizeStatus(status: string): string {
    const trimmed = status.trim();
    const tail = trimmed.split(/[./]/).pop() ?? trimmed;
    return tail.replace(/^:/, "").trim().toUpperCase();
  }

  private readDateValue(task: TaskRecord, key: "scheduledAt" | "deadlineAt"): string | undefined {
    const value = task[key];
    if (value) {
      return value;
    }

    const rawKey = key === "scheduledAt" ? "block/scheduled" : "block/deadline";
    const taskRawKey = key === "scheduledAt" ? "logseq.task/scheduled" : "logseq.task/deadline";
    return this.readProperty(task, rawKey) ?? this.readProperty(task, taskRawKey);
  }

  private readProperty(task: TaskRecord, key: string): string | undefined {
    const value = task.raw?.[key];
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number") {
      return String(value);
    }
    return undefined;
  }

  private toIsoDate(value: string): string {
    const normalized = String(value).trim();
    if (/^\d{8}$/.test(normalized)) {
      const year = Number(normalized.slice(0, 4));
      const month = Number(normalized.slice(4, 6)) - 1;
      const day = Number(normalized.slice(6, 8));
      return this.formatDateOnly(new Date(Date.UTC(year, month, day)));
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      return normalized;
    }

    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      return normalized;
    }

    return date.toISOString();
  }

  private addDays(value: string, days: number): string {
    const normalized = String(value).trim();
    if (/^\d{8}$/.test(normalized)) {
      const year = Number(normalized.slice(0, 4));
      const month = Number(normalized.slice(4, 6)) - 1;
      const day = Number(normalized.slice(6, 8));
      return this.formatDateOnly(new Date(Date.UTC(year, month, day + days)));
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      const date = new Date(`${normalized}T00:00:00Z`);
      if (!Number.isNaN(date.getTime())) {
        date.setUTCDate(date.getUTCDate() + days);
        return this.formatDateOnly(date);
      }
      return normalized;
    }

    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      return normalized;
    }

    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString();
  }

  private formatDateOnly(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
