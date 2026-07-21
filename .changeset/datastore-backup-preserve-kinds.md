---
"@mondokit/gcp-datastore-backups": patch
---

Preserve `kinds` (and other start-of-export fields) when merging sparse export status metadata, so `EXPORT_TO_BIGQUERY` does not lose the kind list mid-poll.
