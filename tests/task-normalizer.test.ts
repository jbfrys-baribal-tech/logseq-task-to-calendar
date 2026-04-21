import { describe, expect, it } from "vitest";
import { TaskNormalizer } from "../src/core/services/task-normalizer";
import type { TaskRecord } from "../src/core/models/task-record";

function makeTask(overrides: Partial<TaskRecord>): TaskRecord {
  return {
    blockId: "block-1",
    status: "Todo",
    title: "TODO Write release notes",
    scheduledAt: "20250217",
    deadlineAt: undefined,
    ...overrides,
  };
}

describe("TaskNormalizer", () => {
  it("normalizes all-day tasks to date-only ISO values", () => {
    const normalizer = new TaskNormalizer();
    const event = normalizer.normalize(makeTask({ status: ":logseq.task/status.todo" }));

    expect(event).not.toBeNull();
    expect(event?.title).toBe("Write release notes");
    expect(event?.status).toBe("TODO");
    expect(event?.startDate).toBe("2025-02-17");
    expect(event?.endDate).toBe("2025-02-18");
  });

  it("keeps timed tasks as ISO date-time strings", () => {
    const normalizer = new TaskNormalizer();
    const event = normalizer.normalize(
      makeTask({
        status: "Doing",
        title: "Doing Follow up",
        scheduledAt: "2025-02-17T09:30:00Z",
      }),
    );

    expect(event).not.toBeNull();
    expect(event?.status).toBe("DOING");
    expect(event?.startDate).toBe("2025-02-17T09:30:00.000Z");
    expect(event?.endDate).toBe("2025-02-18T09:30:00.000Z");
  });

  it("returns null when no date is available", () => {
    const normalizer = new TaskNormalizer();
    const event = normalizer.normalize(
      makeTask({
        scheduledAt: undefined,
        deadlineAt: undefined,
      }),
    );

    expect(event).toBeNull();
  });
});
