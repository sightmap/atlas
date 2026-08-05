# Phase 3 — Seed entries

Five high-quality entries before any public CTA (the gallery must show the quality bar, not promise it). Each seed is one PR through the real P2.3 validation — seeding doubles as CI dogfooding.

## Targets

| Slug | Site | Why | Notes |
|---|---|---|---|
| `sightmap-org` | sightmap.org | We own it; marketing + blog surfaces | Corpus may already exist in monorepo `web/.sightmap/` — the atlas entry must still be authored as an *observed* map (strip `source:`/`dependencies:`, re-verify selectors live) |
| `subtext-fullstory` | subtext.fullstory.com | We own it; real product depth | Check with maintainers which surfaces are public enough for screenshots |
| `instacart` | instacart.com | Recognizable commerce; the marketing hook | Attempt-and-substitute: likely bot defenses. Timebox; if capture fights back, take a fallback |
| `hacker-news` | news.ycombinator.com | Agent-friendly, tiny stable DOM, beloved by the target audience | Near-guaranteed win; good "small but perfect" exemplar |
| `discourse-meta` | meta.discourse.org | Public instance of self-hostable OSS — models the `auth: self-hosted` story POS maps need | Rich views: topics, search, composer (public parts) |

Fallbacks if Instacart (or any target) fails capture: wikipedia.org, openlibrary.org, any public Discourse/Ghost instance.

## Authoring workflow (per entry, agent-executable)

1. POLICY.md check on the target; record `auth` level.
2. Explore with `sightmap snapshot --coverage --url <url>`; enumerate top-level routes.
3. Author per-route YAML per the monorepo's authoring conventions (`spec/v1/authoring-conventions.md`): one file per route, `shared.yaml` for cross-route nav/toasts, `extras.yaml` for modals; `properties` for live values; `requests` from observed traffic; `memory` for quirks.
4. `sightmap sel-probe` every selector; `validate` + `lint` clean.
5. Screenshots per SPEC rules (1–5, compressed); front matter; README notes on coverage and gaps.
6. PR; the validation bot must pass green with zero human fixups.

## Quality bar

- ≥5 views or a README justification (Hacker News legitimately has few).
- Every view has ≥1 `memory` note capturing something non-obvious — the notes are the product.
- Requests documented wherever traffic is observable.
- `last_verified` = authoring date, honestly.

## Timebox

One agent-session per entry (~half a day equivalent). If a target exceeds it, file what blocked it and substitute a fallback. Do not let one hostile site stall the phase.
