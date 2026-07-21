---
"@mondokit/core": major
"@mondokit/gcp-core": patch
---

Fully update to Express 5

- Require `express` `>= 5` as a peer of `@mondokit/core`
- fix Express 5 static/`sendFile` behaviour that ignores absolute paths containing hidden directory segments unless `dotfiles` is opted in. `serveStaticWithEtag` and `serveFallbackWithEtag` now pass `dotfiles: "allow"` by default. `StaticEtagOptions` exposes an optional `dotfiles` override.
- fix static middleware calling `next()` after a successful send — now only calls `next` on error.
- `@mondokit/gcp-core`'s `startServer` handles the Express 5 `listen` error callback.
- Deprecate `asyncHandler` and `asyncMiddleware`. Express 5 forwards rejected promises from async handlers/middleware natively.
