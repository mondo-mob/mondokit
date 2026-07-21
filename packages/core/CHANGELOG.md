# @mondokit/core

## 3.0.0-rc.0

### Major Changes

- bb50c0c: Fully update to Express 5

  - Require `express` `>= 5` as a peer of `@mondokit/core`
  - fix Express 5 static/`sendFile` behaviour that ignores absolute paths containing hidden directory segments unless `dotfiles` is opted in. `serveStaticWithEtag` and `serveFallbackWithEtag` now pass `dotfiles: "allow"` by default. `StaticEtagOptions` exposes an optional `dotfiles` override.
  - fix static middleware calling `next()` after a successful send — now only calls `next` on error.
  - `@mondokit/gcp-core`'s `startServer` handles the Express 5 `listen` error callback.
  - Deprecate `asyncHandler` and `asyncMiddleware`. Express 5 forwards rejected promises from async handlers/middleware natively.

- d933393: Enforce zod 4 as a peer dependency

## 2.0.0

### Major Changes

- Release as a major version. The build now targets TypeScript 6 / ES2022 and the libraries are compiled and validated against the current framework majors — express 5, zod 4, and the latest Google Cloud SDK / firebase-admin releases. The published output uses ES2022 syntax (Node 22+, already the `engines` floor), firestore v8's tightened `exports` map is accommodated, and peer ranges for `zod` and `google-auth-library` are widened to the new majors. Bumped to a major so consumers consciously re-verify against the updated targets and peers.

## 1.1.0

### Minor Changes

- b61ab9e: Modernise dependencies to their latest versions and support the current framework majors — express 5, zod 4, TypeScript 6 (ES2022 target) and the Google Cloud SDK / firebase-admin majors — with source updates for firestore v8's tightened `exports` map. Peer ranges for `zod` and `google-auth-library` are widened to allow the new majors; no breaking changes to MondoKit's own API. (`@google-cloud/datastore` stays on v8, capped by the latest datastore emulator.)

### Patch Changes

- dbbd580: Upgrade dev dependencies

## 1.0.0

We are excited to announce the ESM-only library release of our cloud libraries, with a fun new name of [MondoKit](https://mondokit.dev/).

Libraries migrated from [gae-js](https://github.com/mondo-mob/gae-js).

See the [Migration Guide from GAE JS](https://mondokit.dev/migration-from-gae-js) for steps to migrate.
