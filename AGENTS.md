# AGENTS.md — TemplateJs

Canonical instructions for coding agents. Human-facing docs are in `README.md`.

## Quick facts
- Minimal single-page web app (static HTML + modular JS)
- Entrypoint: `index.html` (+ static pages in `pages/`)
- Source in `src/` with colocated tests
- Deploy via GitHub Pages from `main` (static assets)
- Preferred dev env: Codespaces (optional)

## Runbook
- Before commit: `npm run check:all` then `npm test`
- Before PR/release: `npm run validate:all` (tests + checks + mutation)
- Always run commands in a real terminal and include actual output in notes/PRs.

## Build/Serve
- Static app; serve `index.html` with a simple static server (e.g., VS Code Live Server)

## Tests
- Run all tests: `npm test`
- Tests live near code: `src/**/foo.test.js`, `*.property.test.js`
- Keep tests deterministic and fast; avoid E2E unless asked

Failure loop
1) Prefer the simplest fix
2) Make minimal, focused changes
3) Re-run failing tests immediately and include real output
4) Iterate until green

## Coding guidelines
- Small, focused modules in `src/` (`components/`, `utils/`)
- Keep public HTML under `pages/` stable; don’t break URLs
- Use existing lint/format scripts if present

## Commits & PRs
- Commits: concise; Conventional Commits preferred (e.g., `feat: add person card`); don’t churn history for formatting
- PRs: small, scoped diffs; explain what you ran (install/tests/validation); add/update tests for changed behavior

Checklist
- [ ] `npm ci` and `npm run validate:all` pass locally
- [ ] Tests added/updated for new behavior
- [ ] No unrelated refactors/drive-bys
- [ ] PR description includes summary, commands run, brief test output

## Safety & guardrails
- No secrets (.env/tokens/creds)
- No deploy changes (Pages/release flows)
- Least privilege: prefer read-only changes

## File map (read before changing code)
- `README.md`
- `package.json` source of truth for commands
- `index.html`, `pages/` static entry points
- `src/` — app code and tests

## When in doubt — ask before
- Large refactors
- Changing public URLs or Pages config

## Feature development process (for agents)

Follow this lightweight spec-first flow before coding:

1) Requirements gathering
- Ask one question at a time and iterate until requirements are complete.
- Build each question on previous answers; prefer numbered response options to keep it structured.

2) Specification development
- Major features: capture functional requirements, architecture choices/integration points, data handling (I/O, validation), error handling and edge cases, testing strategy (unit, property-based, integration), and any UI/performance considerations.
- Smaller changes: clearly state what changes, how it integrates, and key edge cases.

3) Final specification
- Compile a concise developer-ready spec markdown next to new components if any were added

## Implementation guidelines
- Only change code directly related to the current task; keep diffs small
- Preserve existing comments/docs; add concise, long-lived docs where useful and avoid narrating changes via comments

## Quality checks
- During development: run frequently
  - `npm run check:all`
  - `npm test`
- Before PR: `npm run validate:all` (tests + checks + mutation)

Test structure
- `*.test.js` — unit
- `*.property.test.js` — property-based (fast-check)
- Mutation: `npm run mutation` (CI too); aim >50%

Failure triage loop
1. Simplest fix first
2. Minimal changes
3. Re-run the specific failing scope
4. Iterate until green

Verification discipline
- Only claim pass/fail with real command output

## Dependencies & no-build approach

This project follows a no-build, static workflow:
- Use native ES modules and `<script type="importmap">` to map bare specifiers when needed.
- Then load your entry/module scripts with `<script type="module">` and import using the mapped specifiers.
- Prefer CDN URLs from unpkg.com for third-party modules compatible with ESM.
- Do not add bundlers/build chains unless explicitly requested in an issue/PR.