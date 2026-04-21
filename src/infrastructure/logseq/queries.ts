/**
 * Datalog query used to fetch tasks with a task marker and at least one date.
 * The exact attribute names may need to be aligned with the current Logseq DB schema.
 */
export const FIND_SYNCABLE_TASKS_QUERY = `
[:find
  (pull ?b [:block/uuid :block/marker :block/content :block/scheduled :block/deadline :block/properties])
 :where
  [?b :block/marker ?marker]
  [(contains? #{"TODO" "DOING" "NOW" "LATER" "WAITING" "WAIT" "DONE" "CANCELED"} ?marker)]
  (or
    [?b :block/scheduled ?scheduled]
    [?b :block/deadline ?deadline])
]`;
