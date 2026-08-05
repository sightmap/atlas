# Phase 1 — CLI verbs (sightmap/sightmap)

Two independent PRs against the monorepo. Both are in flight (branches `feat/stats-verb`, `feat/add-verb`); this brief records the contracts so reviewers and downstream phases have one reference.

## P1.1 `sightmap stats [--sightmap-dir DIR] [--json]`

Counts a corpus using the loader's semantics ($ref expansion, global-component first-seen-name dedupe — `go/sightmap/corpus.go`). Never a standalone YAML walk.

- Human mode: totals (views, components, requests, properties, memory) + per-view table.
- `--json` (consumed by atlas CI — field names are a contract):
  `{"views":N,"components":N,"requests":N,"properties":N,"memory":N,"per_view":[{"name","route","components","requests"}]}`
- Acceptance: correct dedupe on a fixture where a global component is also `$ref`'d from views; clitest case coverage; changeset.

## P1.2 `sightmap add <slug> [--index URL] [--target DIR] [--force]`

Installs a published entry's corpus from this repo into `./.sightmap`.

- Default index: `https://raw.githubusercontent.com/sightmap/atlas/main/index.json`; entry lookup by slug with close-match suggestions on miss.
- Fetches exactly the entry's `files[]` (`.sightmap/`-prefixed paths only) at the entry's `commit` when present, else `main`.
- Fail-closed path safety (no `..`, absolute paths, backslashes); HTTPS-only except localhost; refuses non-empty target without `--force`.
- Acceptance: httptest-backed happy path, slug-miss suggestions, traversal rejection, overwrite refusal; changeset.

## Follow-ups (small, post-merge)

- P1.3 — Mention both verbs in CLI docs/README where verbs are enumerated.
- P1.4 — After P2 publishes a real `index.json`, run `sightmap add` end-to-end against it once and file any friction as issues.
