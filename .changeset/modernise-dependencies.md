---
"@mondokit/gcp-firestore-migrations": minor
"@mondokit/gcp-datastore-backups": minor
"@mondokit/gcp-firestore-backups": minor
"@mondokit/gcp-firebase-auth": minor
"@mondokit/gcp-google-auth": minor
"@mondokit/gcp-datastore": minor
"@mondokit/gcp-firestore": minor
"@mondokit/gcp-bigquery": minor
"@mondokit/gcp-storage": minor
"@mondokit/gcp-tasks": minor
"@mondokit/gcp-core": minor
"@mondokit/core": minor
---

Modernise dependencies to their latest versions and support the current framework majors — express 5, zod 4, TypeScript 6 (ES2022 target) and the Google Cloud SDK / firebase-admin majors — with source updates for firestore v8's tightened `exports` map. Peer ranges for `zod` and `google-auth-library` are widened to allow the new majors; no breaking changes to MondoKit's own API. (`@google-cloud/datastore` stays on v8, capped by the latest datastore emulator.)
