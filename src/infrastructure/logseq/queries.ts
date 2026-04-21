/**
 * Datalog query used to fetch tasks with a task marker and at least one date.
 * The exact attribute names may need to be aligned with the current Logseq DB schema.
 */
export const FIND_SYNCABLE_TASKS_QUERY = `
[:find
  (pull ?b [*])
 :where
  (or-join [?b]
    (and
      [?b :block/marker ?marker]
      [(contains? #{"TODO" "DOING" "NOW" "LATER" "WAITING" "WAIT" "DONE" "CANCELED"} ?marker)])
    [?b :logseq.task/status ?status])
  (or-join [?b]
    [?b :block/scheduled ?scheduled]
    [?b :block/deadline ?deadline]
    [?b :logseq.task/scheduled ?scheduled]
    [?b :logseq.task/deadline ?deadline])
]`;
