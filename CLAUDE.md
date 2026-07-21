# MondoKit

Monorepo of ESM-only NodeJS toolkit libraries for building on the cloud (currently focused on GCP),
published to npm under the `@mondokit/*` scope. Evolved from [gae-js](https://github.com/mondo-mob/gae-js).
Docs: https://mondokit.dev

## Layout

npm **workspaces** monorepo; every package lives in `packages/*` and publishes only its `/dist`.

| Package | Runtime deps that ship | Notes |
|---|---|---|
| `core` | bunyan, lodash-es | express + zod are peers |
| `gcp-core` | @google-cloud/logging-bunyan, @google-cloud/secret-manager | foundation for all gcp-* |
| `gcp-datastore` / `gcp-datastore-backups` | dataloader, lodash-es, p-limit / luxon, nanoid | |
| `gcp-firestore` / `gcp-firestore-backups` / `gcp-firestore-migrations` | dataloader, lodash-es / luxon, nanoid | |
| `gcp-storage`, `gcp-tasks`, `gcp-bigquery`, `gcp-google-auth`, `gcp-firebase-auth` | mostly peer-only | |

The heavy Google Cloud SDKs (`@google-cloud/*`, `firebase-admin`, `google-gax`) are **peer + dev**
dependencies, never bundled — consumers bring their own. Peer ranges are deliberately wide (`>= X`).

## Commands (from repo root)

- `npm run build` — `tsc --build` across all workspaces (project references).
- `npm run test:ci` — runs each workspace's `test:ci` (see Testing).
- `npm run lint` — eslint (flat config, `eslint.config.js`).
- `npm run clean` — wipe `dist/` + tsbuildinfo per workspace (build artifacts only; used by `prepublish-libs`).
- `npm run clean:deps` — remove every `node_modules` (root + all workspaces). Follow with `npm ci` (from lockfile) or `npm install`.
- `npm run reinstall` — nuke all `node_modules` **and** `package-lock.json`, then `npm install` from scratch. Use this for a truly clean re-resolve (it's what fixes a corrupted lockfile).

Requires **node >=22, npm >=10** (`engines`). Use `lts/latest` (`.node-version`).

## Testing topology

Vitest. Two kinds of package:

- **Pure unit** (`core`, `gcp-core`, `gcp-tasks`, `gcp-bigquery`, `gcp-google-auth`): plain `vitest run`,
  no external services. Run these directly, they're fast.
- **Emulator-backed** — need a live emulator and will hang/fail without one:
  - `gcp-datastore` → `test:ci` uses `vitest-ci.config.ts` which spawns
    `gcloud beta emulators datastore` on a **hardcoded port 8081**; needs the gcloud
    `beta` + `cloud-datastore-emulator` components + a JDK.
    (`npm run datastore:start` starts one manually for the non-CI `vitest.config.ts`.)
  - `gcp-firestore`, `gcp-firestore-migrations`, `gcp-firebase-auth`, `gcp-storage` → `test:ci` wraps
    vitest in `firebase-tools emulators:exec`. Current firebase-tools needs **JDK 21+**.

Running the emulator tests locally requires **JDK 21+** (both the gcloud datastore emulator and
firebase-tools now refuse older Java), the datastore emulator **port 8081** free, and no other firebase
emulator suite holding ports 4000/8080/9099/9199. CI installs JDK 21 explicitly (`actions/setup-java`)
because the ubuntu-latest default JDK is older than 21.

The repo pins Java via `.java-version` (jenv) to a 21+ release; without it, jenv falls back to its global
default and an older global (e.g. 16) makes every emulator test fail with an opaque error.

## Publishing — Atlassian Changesets

Versioning + changelogs via [changesets](https://github.com/changesets/changesets) (`.changeset/config.json`:
restricted access, `commit: false`, base branch `main`). Done **locally, not from CI**.

1. **Add a changeset** for your change: `npx changeset` → pick packages + bump level (patch/minor/major),
   write a summary. Commit the generated `.changeset/*.md`. (One PR can have several.)
   Bump level = the change's public API impact: new API → minor, breaking → major, fix → patch.
2. **Version**: `npx changeset version` — applies bumps + writes changelogs. Commit.
3. **Build + publish**: on a suitable node/npm (clean `node_modules` if switching), run
   `npm run publish-libs` (= `changeset publish && git push --follow-tags`). `prepublish-libs`
   (clean + build) must succeed first.

Internal `@mondokit/*` cross-deps use `updateInternalDependencies: patch`, so a bump ripples to dependents.

## Dependency gotchas (learned the hard way)

- **firestore v8** removed its deep-import subpaths from the package `exports` map. Don't import
  `@google-cloud/firestore/types/v1/...` or `/build/protos/...`; reach types via the public
  `firestore.v1` namespace (see `gcp-firestore/src/firestore/connect.ts`) or model them locally.
  (`@google-cloud/datastore` still has no `exports` map, so its `/build/src/...` deep imports still work.)
- **express 5**: `path-to-regexp` v8 rejects unnamed wildcard routes (`app.use("/*", …)`). Use a
  pathless `app.use(mw)` for catch-alls (valid on express 4 and 5) or a named `"/*splat"`.
- **zod 4**: `ZodTypeDef` is gone and `ZodType` is now `ZodType<Output, Input>`. Use `ZodType<T>`.
- **jest-extended matchers aren't typed for vitest.** `expect.extend` registers them at runtime, but their
  types only augment jest's namespace, and vitest 4's global `expect` has its own `ExpectStatic` that
  module augmentation doesn't cleanly reach. So `expect.toBeWithin(...)` etc. work at runtime but fail
  `tsc` (which `build:watch` runs over tests). Prefer built-in matchers (`toBeGreaterThanOrEqual`, …).
- **`build` vs `build:watch`**: `build` uses each package's `tsconfig.prod.json` (excludes `*.test.ts`);
  `build:watch` uses `tsconfig.packages.json` which **does** type-check tests. A green `build` can still
  have test type errors that only `build:watch` (or the IDE) surfaces.

## npm audit

`npm audit` reports **0 vulnerabilities**, held there by a `uuid` override in the root `package.json`:

```json
"overrides": { "uuid": "^11.1.1" }
```

Every advisory we ever saw rooted in `uuid@9` (pulled in by `gaxios` / `google-gax@4` /
`teeny-request` under `@google-cloud/logging` and `@google-cloud/storage`). Everything else that was
flagged was flagged only because it *depends on* uuid, so forcing the patched leaf clears the whole
tree. `npm audit fix` can't do this — its only "fix" is to downgrade `@google-cloud/storage` to an
ancient major.

`@google-cloud/datastore` v10 (and most other current `@google-cloud/*`) already use `google-gax@5`,
which dropped `uuid` entirely — the override remains only for packages still on gax@4 / gaxios@6.
These overrides only affect **this repo's** install (npm ignores a dependency's overrides), so they're
CI/dev hygiene — a consumer of `@mondokit/gcp-core` would need their own override until Google's
`@google-cloud/logging` moves to `google-gax@5`. **Revisit/remove the override** once upstream ships
the fix. The daily `.github/workflows/npm-audit.yml` runs a full `npm audit` and must stay green.
