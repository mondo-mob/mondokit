# MondoKit

A helpful toolkit to simplify building NodeJS applications on the cloud. The most mature set of libraries is currently focussed on Google Cloud Platform (GCP).

Built for ESM only.

[Official documentation](https://mondokit.dev)

## Package documentation

- [gcp-core](https://mondokit.dev/packages/gcp-core.html)
- [gcp-firestore](https://mondokit.dev/packages/gcp-firestore.html)
- [gcp-firestore-backups](https://mondokit.dev/packages/gcp-firestore-backups.html)
- [gcp-firestore-migrations](https://mondokit.dev/packages/gcp-migrations.html) 
- [gcp-datastore](https://mondokit.dev/packages/gcp-datastore.html)
- [gcp-datastore-backups](https://mondokit.dev/packages/gcp-datastore-backups.html)
- [gcp-storage](https://mondokit.dev/packages/gcp-storage.html)
- [gcp-tasks](https://mondokit.dev/packages/gcp-tasks.html)
- [gcp-bigquery](https://mondokit.dev/packages/gcp-bigquery.html)
- [gcp-google-auth](https://mondokit.dev/packages/gcp-google-auth.html)
- [gcp-firebase-auth](https://mondokit.dev/packages/gcp-firebase-auth.html)

## History

These libraries have most recently evolved from [GAE JS](https://github.com/mondo-mob/gae-js), authored by the same team. They have been re-branded,
given they are not just useful for Google App Engine, updated for ESM, and cleaned up with deprecations removed.


## Contributing

This is a mono-repo using npm workspaces.
Publishing is done using Atlassian Changesets (https://github.com/changesets/changesets).
This helps be consistent with versioning and auto-generates changelogs.

Here's the basic flow:

1. Create one or more changesets

- Once you've made your changes, create a changeset. You can create more than one changeset for a single version.

```
npx changeset
```

- From the cli tool, choose which packages to update and if major/minor/patch update
- Enter summary for changes
- Review and commit files

2. Update package versions

- Based on the changeset configuration - this will automatically version the packages.

```
npx changeset version
```

- Commit changes

3. Build and publish

Would be nice if this was done from CI but for now we do this locally.

- Check you're running a suitable version of node/npm. If not switch and clear out old node_modules.
- Build and publish

```
npm run publish-libs
```

### Adding new packages

There's nothing automated to do this. Essentially you just need to add a new package to `/packages` folder but
these steps should save some time:

- Create new folder in `/packages`. e.g. `/packages/gcp-new-thing`, `/packages/aws-new-thing`, `/packages/azure-new-thing`
- Copy `package.json`, `tsconfig.json`, `tsconfig.prod.json`, `jest.config.json` from one of the existing packages
- Update `package.json` to match desired name, version, dependencies, etc
- Update `tsconfig.json` to match desired project references.
- Create file `src/index.ts` and export some constant
- Run `npm install` from root folder
- Run `npm run build` from project folder


### Merging fixes from gae-js
Feel free to change:
 - the name of your local branch in the first step
 - the name of the branch you are merging from in `gae-js` in the last step

```shell
git checkout -b feature/gae-js-merge
git remote add gae-js https://github.com/mondo-mob/gae-js.git
git remote update
git merge gae-js/main

```
