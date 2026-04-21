import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ICalendarProvider } from "../src/core/ports/calendar-provider";
import type { ITaskRepository } from "../src/core/ports/task-repository";
import type { TaskRecord } from "../src/core/models/task-record";
import { TaskNormalizer } from "../src/core/services/task-normalizer";
import { SyncEngine } from "../src/core/use-cases/sync-engine";

function makeTask(overrides: Partial<TaskRecord>): TaskRecord {
  return {
    blockId: "block-1",
    status: "TODO",
    title: "TODO Write release notes",
    scheduledAt: "20250217",
    deadlineAt: undefined,
    ...overrides,
  };
}

function makeRepository(tasks: TaskRecord[]): ITaskRepository {
  return {
    findSyncableTasks: vi.fn().mockResolvedValue(tasks),
    persistRemoteEventId: vi.fn().mockResolvedValue(undefined),
    removeRemoteEventId: vi.fn().mockResolvedValue(undefined),
  };
}

function makeProvider(): ICalendarProvider {
  return {
    authenticate: vi.fn().mockResolvedValue(true),
    createEvent: vi.fn().mockResolvedValue("remote-created"),
    updateEvent: vi.fn().mockResolvedValue(undefined),
    deleteEvent: vi.fn().mockResolvedValue(undefined),
  };
}

describe("SyncEngine", () => {
  beforeEach(() => {
    vi.stubGlobal("logseq", {
      UI: {
        showMsg: vi.fn().mockResolvedValue("ok"),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates remote events for active tasks without a remote id", async () => {
    const repository = makeRepository([makeTask({ blockId: "block-1", remoteEventId: undefined })]);
    const provider = makeProvider();
    const engine = new SyncEngine(repository, provider, new TaskNormalizer(), "update");

    await engine.run();

    expect(provider.createEvent).toHaveBeenCalledTimes(1);
    expect(provider.updateEvent).not.toHaveBeenCalled();
    expect(repository.persistRemoteEventId).toHaveBeenCalledWith("block-1", "remote-created");
  });

  it("deletes completed tasks when configured to delete", async () => {
    const repository = makeRepository([
      makeTask({
        blockId: "block-2",
        status: "DONE",
        title: "DONE Finish release notes",
        remoteEventId: "remote-123",
      }),
    ]);
    const provider = makeProvider();
    const engine = new SyncEngine(repository, provider, new TaskNormalizer(), "delete");

    await engine.run();

    expect(provider.deleteEvent).toHaveBeenCalledWith("remote-123");
    expect(repository.removeRemoteEventId).toHaveBeenCalledWith("block-2");
    expect(provider.updateEvent).not.toHaveBeenCalled();
  });
});
