---
"@mondokit/gcp-firebase-auth": major
---

`verifyFirebaseUser()`: Move `firebaseApp` param into options argument (avoids needing to pass `undefined` as the first argument). Also fix unnecessary call to `next()` after token validation error.
