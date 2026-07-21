---
"@mondokit/gcp-core": patch
"@mondokit/gcp-tasks": patch
"@mondokit/gcp-google-auth": patch
"@mondokit/gcp-firebase-auth": patch
"@mondokit/gcp-datastore": patch
"@mondokit/gcp-firestore": patch
"@mondokit/gcp-storage": patch
"@mondokit/gcp-bigquery": patch
"@mondokit/gcp-datastore-backups": patch
"@mondokit/gcp-firestore-backups": patch
---

Declare missing peer/runtime dependencies that production code already imports:

- `express` `>= 5` peer where middleware/routes are exported
- `zod` `>= 4` peer where configuration/request schemas are defined
- `lodash-es` dependency in packages that import it but did not declare it
