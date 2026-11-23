# Railway Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (recommended) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and serve the existing static site as a Railway web service.

**Architecture:** Keep `build.mjs` as the asset generator. Add a dependency-free Node HTTP server for `dist/`, npm build/start scripts, and Railway config-as-code commands.

**Tech Stack:** Node.js built-ins, Railway `railway.json`.

**Spec:** Approved in conversation: Node static server, npm build/start scripts, Railway build/start config, and README update; preserve generated pages and translations.

## Global Constraints

- No runtime dependencies.
- Bind to `0.0.0.0` and `process.env.PORT`.
- Keep the generated multilingual routes `/`, `/pt/`, `/en/`, and `/es/` available.
- Do not edit `i18n/*.json`.

## Review Focus

- Missing build output should fail clearly rather than crash the process.
- URL paths must not allow reading files outside `dist/`.
- Requests to `/` and language routes should serve the generated HTML.
- Railway's health check must receive a successful response.

---

### Task 1: Configure Railway static serving

**Files:**
- Create: `package.json`
- Create: `server.mjs`
- Create: `railway.json`
- Test: `test/server.test.mjs`
- Modify: `README.md`

**Interfaces:**
- `npm run build` runs `node build.mjs`.
- `npm start` runs `node server.mjs`.
- The server serves files from `dist/` over HTTP using the Railway `PORT`.
- Railway runs the build and start commands and checks `/`.

- [x] Write and run failing tests for root/language routes, static assets, and traversal rejection.
- [x] Add package scripts, Railway commands, and a dependency-free static server with safe path resolution and common static MIME types.
- [x] Update README with local build/serve instructions and Railway deployment behavior.
- [x] Run `npm run build` and smoke-test `/`, `/pt/`, `/en/`, `/es/`, and an asset over the local server.