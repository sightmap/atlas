# Phase 2 — Atlas repo scaffold (this repo)

Turns the empty repo into a contributable one. Tasks are one PR each unless noted.

## P2.1 Schema + fixtures

- `schema/entry.schema.json`: JSON Schema (draft 2020-12) for the front matter in docs/SPEC.md — every field, types, regexes (slug), enums (categories, method, auth), length caps (name ≤50, description ≤140, domains 1–5, categories 1–3).
- `entries/.gitkeep`, empty `removed.yaml` with a schema comment.
- A `fixtures/valid-entry/` and `fixtures/invalid-entry/` pair used by CI tests (NOT under `entries/`).
- Acceptance: `ajv validate` (or equivalent) passes/fails the fixtures correspondingly.

## P2.2 Validation scripts

`scripts/` (Node or Go — pick one, stay consistent):
- `validate-entry <dir>`: front matter parses; schema-valid; slug == folder name; slug unique vs entries/ + removed.yaml; spec_version == corpus config version; screenshot rules (count 1–5, ≤300KB, width 1200–2000, PNG/WebP); corpus contains no `source:`/`dependencies:` keys; then shells `sightmap validate` and `sightmap lint`.
- `gen-index`: walks entries/, shells `sightmap stats --json` per entry, assembles index.json exactly per docs/SPEC.md (files[] from a `.sightmap/**` walk, commit from `git log -1 --format=%H -- <entry>`), deterministic ordering (by slug).
- CLI acquisition: `go run github.com/sightmap/sightmap/go/cmd/sightmap@<pinned-ref>` or a pinned release binary — pin explicitly, document the bump procedure.
- Acceptance: both scripts run green against the fixture entry locally and in CI.

## P2.3 PR validation workflows

- `.github/workflows/validate.yml` — `pull_request`, unprivileged, no secrets: enforce exactly one `entries/<slug>/` touched (plus optionally docs); run `validate-entry` on the changed entry only (changed-paths detection — do not validate the world per PR); upload a structured result artifact.
- `.github/workflows/comment.yml` — `workflow_run` on validate completion: post/update a single sticky PR comment with ❌/⚠️/✅ results and label `ready-for-review` or `validation-failed`. (Two-workflow split because fork PRs get a read-only token.)
- Acceptance: open a test PR from a fork adding the fixture entry (temporarily under entries/); bot comment appears; then close and remove.

## P2.4 Publish workflow

- `.github/workflows/publish.yml` — on push to `main`, `concurrency: publish` group: run `gen-index`; commit `index.json` (`[skip ci]`); then open/update a vendoring PR against sightmap/sightmap that copies `index.json` + all `entries/*/screenshots/*` into `web/src/data/atlas/` (auth: `ATLAS_BOT_TOKEN` secret — see IMPLEMENTATION.md provisioning). One rolling bot PR, force-updated, never auto-merged.
- Acceptance: merge a fixture entry; index.json regenerates; vendoring PR opens on the monorepo with the right paths.

## P2.5 Contribution surface

- `CONTRIBUTING.md`: the human path (fork → scaffold folder → author per SPEC → PR), the quality bar, review expectations, link to POLICY.md.
- `.github/ISSUE_TEMPLATE/`: `request-a-map.yml` (site suggestion form), `removal-request.yml` (owner takedown form per POLICY.md), config.yml disabling blank issues.
- `LICENSE`: CC-BY-4.0 for entry content + MIT for scripts (dual, stated in README), unless maintainers decide otherwise — flag in PR for explicit approval.
- Acceptance: forms render on GitHub; links resolve.

## P2.6 `map-a-site` skill

- `skills/map-a-site/SKILL.md` following the monorepo's `skills/<name>/SKILL.md` convention (frontmatter: name, description, activation — copy the format from sightmap/sightmap `skills/`, where they're embedded into the CLI via `go/skills/embed.go` and installed with `sightmap skills install`).
- Walks an agent through: pick target site (POLICY check first) → `sightmap snapshot --coverage --url` exploration → author per-route YAML per authoring conventions → `sel-probe` selectors → `validate` + `lint` → capture + compress screenshots → scaffold entry folder → front matter → `gh pr create` against this repo.
- Coordinate embedding it in the CLI binary as a follow-up monorepo PR (same format makes that a file copy).
- Acceptance: an agent given only the skill + a target site produces a PR that passes P2.3 validation without human edits.
