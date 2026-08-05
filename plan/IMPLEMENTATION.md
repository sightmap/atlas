# Atlas implementation plan

End-to-end build plan for the Sightmap Atlas: this content repo, two CLI verbs in the monorepo, a gallery at sightmap.org/atlas, intake automation, and launch. Written to be executed by independent agents, one task per PR.

## Working agreement for agents

- One phase task = one PR, reviewed independently. Reference the task ID (e.g. `P2.3`) in the PR title.
- Every task's brief lists acceptance criteria — verify them with actual command output before claiming completion.
- Contracts live in [../docs/SPEC.md](../docs/SPEC.md) (entry format, index.json) and [../docs/POLICY.md](../docs/POLICY.md). Do not drift from them; if a contract must change, change the spec in the same PR and say so loudly.
- Monorepo work follows sightmap/sightmap conventions: read its AGENTS.md and CONTRIBUTING.md first, match commit style, include a changeset.

## Phases

| Phase | What | Repo | Status | Depends on |
|---|---|---|---|---|
| [P1](phases/phase-1-cli.md) | CLI verbs: `stats --json`, `add` | sightmap/sightmap | PRs in flight | — |
| [P2](phases/phase-2-repo-scaffold.md) | Atlas repo scaffold: schema, CI, intake skill | sightmap/atlas | ready to start | spec (done) |
| [P3](phases/phase-3-seeds.md) | Seed entries: sightmap.org, subtext.fullstory.com, + public sites | sightmap/atlas | blocked | P1, P2 |
| [P4](phases/phase-4-frontend.md) | Gallery at sightmap.org/atlas | sightmap/sightmap `web/` | blocked | P2 (index schema fixed), P3 (real data) |
| [P5](phases/phase-5-launch.md) | Launch + freshness automation | both | blocked | P3, P4 |

P2 can proceed in parallel with P1. P4's scaffolding (routes, components) can start against fixture data once P2 lands; final wiring needs P3's real index.

## Provisioning needed from a maintainer (not agent work)

- Takedown contact email (POLICY.md placeholder `TBD@sightmap.org`).
- `ATLAS_BOT_TOKEN` secret in this repo: fine-grained PAT (or GitHub App) with contents+PR write on sightmap/sightmap, for the vendoring bot PR (P2.4).
- Branch protection on `main` here: require the validate workflow, no force pushes.

## Architecture invariants (why the plan looks like this)

- **sightmap.org's build stays fully local.** Atlas data reaches the site via a bot PR that vendors `index.json` + screenshots into `web/` — never a network fetch at build time. A broken community merge must not brick a marketing deploy.
- **All corpus semantics come from the Go CLI.** CI shells out to `sightmap validate|lint|stats`; nothing reimplements YAML traversal ($ref expansion and global-component dedupe live in the loader).
- **Stats and file lists are generated, never hand-authored.** They exist only in `index.json`.
- **Takedowns must fully propagate**: repo delete → tombstone → index regen → site rebuild purges pages and assets. No CDN that caches removed content indefinitely (this ruled out jsDelivr).
