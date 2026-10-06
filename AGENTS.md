# PD-L1 AP Tool: instructions for Claude and Codex

Single-file HTML/JS tool for PD-L1 IHC evaluation in pathology (clone selection, scoring method, cutoff comparison, structured report). No build step, no runtime dependencies. Logic is in `engine.js`, UI in `index.html`, tests in `tests/run.mjs` (`npm test`; the tests use jsdom, so run `npm install` if `node_modules` is missing).

## Rules
- Diagnostic content (indications, clones, cutoffs, scoring rules, report wording) is curated by Filippo. Change it only on his instruction or from a cited source, never from memory. If code and source disagree, report it; do not choose.
- Before changing anything that can alter an output: plan first, state which outputs change, add or update tests with at least one input per affected class, and run `npm test` before closing.
- After such a change, get an independent review against the agreed spec: `/verify-agent` in Claude Code, or a separate review pass against the cited source.
- Keep `CHANGELOG.md` and `README.md` (including regulatory documentation) aligned with any change in behavior.
- Keep logic in `engine.js` separate from the UI. No fake precision: show uncertainty and equivocal results.
- Offline-first: no external script, stylesheet or fetch URLs. On the Mac a local pre-commit hook enforces this; elsewhere check by hand. Never bypass hooks with `--no-verify`.
- No patient data in code, tests, fixtures, docs or commit messages.
- `AGENTS.md` is a copy of this file for Codex: keep the two aligned when you edit either.

## Note for Codex
- `/verify-agent` exists only in Claude Code. For the independent review, do a separate review pass against the cited source and report the result and any open items.
