/**
 * Datalog query used to fetch tasks with a task marker and at least one date.
 * The exact attribute names may need to be aligned with the current Logseq DB schema.
 */
export const FIND_SYNCABLE_TASKS_QUERY = `
[:find
  (pull ?b [:block/uuid :block/title :block/content :block/marker :block/scheduled :block/deadline :block/properties :logseq.task/status :logseq.task/scheduled :logseq.task/deadline])
 :where
  (or-join [?b]
    [?b :block/marker ?marker]
    [?b :logseq.task/status ?marker])
]`;
