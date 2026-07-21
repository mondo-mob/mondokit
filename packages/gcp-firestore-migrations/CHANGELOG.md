# @mondokit/gcp-firestore-migrations

## 3.0.0-rc.0

### Patch Changes

- Updated dependencies [ae253fa]
- Updated dependencies [bb50c0c]
  - @mondokit/gcp-core@3.0.0-rc.0
  - @mondokit/gcp-firestore@3.0.0-rc.0

## 2.0.0

### Major Changes

- Release as a major version. The build now targets TypeScript 6 / ES2022 and the libraries are compiled and validated against the current framework majors — express 5, zod 4, and the latest Google Cloud SDK / firebase-admin releases. The published output uses ES2022 syntax (Node 22+, already the `engines` floor), firestore v8's tightened `exports` map is accommodated, and peer ranges for `zod` and `google-auth-library` are widened to the new majors. Bumped to a major so consumers consciously re-verify against the updated targets and peers.

### Patch Changes

- Updated dependencies
  - @mondokit/gcp-firestore@2.0.0
  - @mondokit/gcp-core@2.0.0

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
