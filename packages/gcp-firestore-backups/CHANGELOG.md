# @mondokit/gcp-firestore-backups

## 1.1.0

### Minor Changes

- b61ab9e: Modernise dependencies to their latest versions and support the current framework majors — express 5, zod 4, TypeScript 6 (ES2022 target) and the Google Cloud SDK / firebase-admin majors — with source updates for firestore v8's tightened `exports` map. Peer ranges for `zod` and `google-auth-library` are widened to allow the new majors; no breaking changes to MondoKit's own API. (`@google-cloud/datastore` stays on v8, capped by the latest datastore emulator.)

### Patch Changes

- dbbd580: Upgrade dev dependencies

## 1.0.1

### Patch Changes

- 8ab5e2c: Add keywords to npm published libs and tidy readmes

## 1.0.0

We are excited to announce the ESM-only library release of our cloud libraries, with a fun new name of [MondoKit](https://mondokit.dev/).

Libraries migrated from [gae-js](https://github.com/mondo-mob/gae-js).

See the [Migration Guide from GAE JS](https://mondokit.dev/migration-from-gae-js) for steps to migrate.
