---
"@mondokit/gcp-tasks": minor
---

Add `TaskQueueService.deleteTask(name)` to remove a previously enqueued task, and return the created
task's fully-qualified name from `enqueue` (`undefined` when a throttled duplicate is deduplicated away).
Retain the name from `enqueue` to delete the task later. Local emulation frees the tracked task name but
cannot cancel an already-dispatched task, and Cloud Tasks deletion is best-effort (a task that already
executed returns NOT_FOUND, which is ignored), so deletion must not be relied on for correctness.
