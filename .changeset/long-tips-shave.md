---
"@mondokit/core": minor
---

Fix static middleware calling next() after successful send. Now will only call next on error.
