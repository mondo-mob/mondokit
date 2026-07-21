---
"@mondokit/gcp-firestore-backups": patch
---

Do not queue BigQuery import when a Firestore export finishes with failure (`error` / `FAILED` / `CANCELLED`). Previously any `done: true` export was treated as success.
