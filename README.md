# GAE JS

Simplify building NodeJS applications on Google App Engine (GAE)

[Official documentation](https://mondo-mob.github.io/gae-js-docs)

## Package documentation

- [gae-js-core](https://mondo-mob.github.io/gae-js-docs/packages/gae-js-core.html)
- [gae-js-firestore](https://mondo-mob.github.io/gae-js-docs/packages/gae-js-firestore.html)
- [gae-js-firestore-backups](https://mondo-mob.github.io/gae-js-docs/packages/gae-js-firestore-backups.html)
- [gae-js-datastore](https://mondo-mob.github.io/gae-js-docs/packages/gae-js-datastore.html)
- [gae-js-datastore-backups](https://mondo-mob.github.io/gae-js-docs/packages/gae-js-datastore-backups.html)
- [gae-js-storage](https://mondo-mob.github.io/gae-js-docs/packages/gae-js-storage.html)
- [gae-js-tasks](https://mondo-mob.github.io/gae-js-docs/packages/gae-js-tasks.html)
- [gae-js-bigquery](https://mondo-mob.github.io/gae-js-docs/packages/gae-js-bigquery.html)
- [gae-js-google-auth](https://mondo-mob.github.io/gae-js-docs/packages/gae-js-google-auth.html)
- [gae-js-firebase-auth](https://mondo-mob.github.io/gae-js-docs/packages/gae-js-firebase-auth.html)
- [gae-js-migrations](https://mondo-mob.github.io/gae-js-docs/packages/gae-js-migrations.html)
- [gae-js-search](https://mondo-mob.github.io/gae-js-docs/packages/gae-js-gae-search.html)

## Development

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
