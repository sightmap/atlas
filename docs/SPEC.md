# Atlas entry specification

Normative for this repo. CI enforces everything marked **enforced**.

## Directory layout

```
entries/<slug>/
  README.md              # front matter (metadata source of truth) + free-form notes
  .sightmap/             # the corpus, per the sightmap authoring conventions
    config.yaml          #   pins spec version
    <route>.yaml …       #   one file per top-level route
    shared.yaml          #   cross-route components (as needed)
    extras.yaml          #   route-less modals, third-party widgets (as needed)
    snapshots/           #   optional .snap + .snap.tree.json pairs — MUST live inside
                         #   .sightmap/ so `sightmap lint --all-snapshots` and offline
                         #   coverage find them
  screenshots/
    01-<name>.png …      # see screenshot rules
removed.yaml             # tombstones; removed slugs may never be reused
index.json               # GENERATED on merge — never edit by hand
schema/entry.schema.json # JSON Schema for the front matter below
```

## Slug rules (enforced)

- Free-form product slug, kebab-case, `^[a-z0-9][a-z0-9-]{1,63}$`. Folder name must equal front-matter `slug`.
- Product-keyed, not domain-keyed: one domain may host many products, one product may span domains. `square-pos`, not `squareup.com`.
- Unique against `entries/` and `removed.yaml`.

## Front matter (enforced against schema/entry.schema.json)

```yaml
---
name: Square POS                # display name, ≤50 chars
slug: square-pos                # == folder name
site_url: https://squareup.com/us/en/point-of-sale
domains: [squareup.com]         # 1–5 domains the map covers
description: Register, inventory, and reporting surfaces of Square's point of sale.  # ≤140 chars
categories: [pos, commerce]     # 1–3 from the closed enum below
author: trevor-handle           # GitHub handle of the mapper
created: 2026-08-05
updated: 2026-08-05             # bump on any content change
last_verified: 2026-08-05       # last date selectors were probed against the live site
cli_version: 0.1.0              # sightmap CLI used
spec_version: 1                 # sightmap spec version (must match .sightmap/config.yaml)
method: browser                 # browser | hybrid
auth: none                      # none | demo-account | self-hosted | personal-account  (see POLICY.md)
---
```

Body below the front matter is free-form: coverage notes, quirks, known gaps. No stats in front matter — counts are computed by CI (`sightmap stats --json`) and live only in `index.json`.

**Category enum** (closed; CI rejects anything else): `commerce`, `pos`, `saas`, `devtools`, `docs`, `finance`, `travel`, `media`, `social`, `government`, `education`, `other`.

## Corpus rules (enforced)

- `sightmap validate` passes; `sightmap lint` exits clean — CI requires a zero exit. Where a lint rule misfires on a stable selector, rewrite the selector to an equivalent form the rule accepts and justify the workaround in the README body.
- `config.yaml` pins `version` and matches front-matter `spec_version`.
- No `source:` / `dependencies:` keys — atlas maps are observed, not source-derived.
- Selectors verified against the live site at authoring time (`sightmap sel-probe`); record the date in `last_verified`.

## Memory notes (reviewed)

`memory` is the only field written for the agent rather than about the page. A
sightmap-aware browsing tool surfaces these as guide bullets, so the whole set
loads before the agent acts, competing with the task for room in the context
window.

Write the rule. Leave out the investigation that found it.

- **Apply the delete test.** If an agent would do the same thing having never
  read the note, the note does not belong in the entry. The common failure is
  a note restating what the component's name and selector already say.
- **State the finding, drop the evidence.** "Ids ending `_feature_div` are
  template slots; most render empty" is the rule. How many were empty on the
  page you happened to map is how you learned it, and it belongs in the PR
  body if anywhere.
- **Include the fix.** A note saying a selector is unreliable leaves the agent
  stuck. Name the working approach: filter by visibility, prefer the module
  prefix, read `alt_text`.
- **One quirk per note.** Two unrelated facts in one note means the agent that
  needs the second still pays for the first.
- **Record what the page hides.** Memory is for what is invisible, surprising,
  or wrong-looking-but-correct — a selector that resolves to the wrong thing, a
  route that serves two different pages, an id that looks stable and is not, a
  page with no `h1`. Anything a fresh look would tell you does not need a note.

An entry with no memory notes records that something exists but not how to work
it. An entry whose notes read like a report charges every agent that loads it
for detail it cannot use.

## Screenshot rules (enforced)

- `screenshots/NN-<kebab-name>.png`, NN starting at `01`; 1–5 images per entry.
- ≤300 KB each, width 1200–2000 px, PNG or WebP.
- Public, non-sensitive screens only; no personal data, no real customer records (see POLICY.md). Demo/sandbox data must look like demo data.

## Signed-in entries (`auth: personal-account`)

Most products worth delegating to an agent are behind a login, so a map of only
public pages cannot describe them. `auth: personal-account` covers an entry the
mapper authored while signed in with an account of their own.

The map documents the product's structure. It must not document the account.

- **The mapper's identity never ships.** No real name, email, handle, avatar,
  postal address, phone number, or payment detail — in screenshots, YAML,
  memory notes, or property samples.
- **Nor does the account's contents.** Order history, watch and listening
  history, saved items, playlists, direct messages, contacts, friend lists,
  notifications, and balances are all the account, not the product.
- **`properties` name what a selector extracts, never what it extracted.** A
  property is `order_total`, not `$142.68`.
- **Prefer frames with no account chrome**, and drop a screenshot rather than
  edit one. A screenshot-less entry is always acceptable; a doctored one is not.
- **Only the author can re-verify it.** `last_verified` on these entries means
  the author re-checked with their own account. CI cannot, and neither can a
  reviewer. Say so in the README body.
- **A challenge is a stop sign.** A person signing into their own account and
  clicking through their own product is ordinary use. Automating past a bot
  check or CAPTCHA is not, and is still forbidden however the session was
  obtained.

Nothing here weakens the rules above it: `auth: personal-account` widens what
may be mapped, not what may be published.

## index.json (generated)

Built on every merge to `main` by CI; consumed by sightmap.org/atlas and by `sightmap add`. Schema:

```json
{
  "schema_version": 1,
  "generated_at": "2026-08-05T00:00:00Z",
  "entries": [
    {
      "slug": "square-pos",
      "name": "Square POS",
      "site_url": "https://…",
      "domains": ["squareup.com"],
      "description": "…",
      "categories": ["pos", "commerce"],
      "author": "trevor-handle",
      "created": "2026-08-05",
      "updated": "2026-08-05",
      "last_verified": "2026-08-05",
      "cli_version": "0.1.0",
      "spec_version": 1,
      "method": "browser",
      "auth": "none",
      "stats": { "views": 12, "components": 87, "requests": 23, "properties": 31, "memory": 9 },
      "per_view": [ { "name": "Register", "route": "/register", "components": 14, "requests": 4 } ],
      "screenshots": ["screenshots/01-register.png"],
      "files": [".sightmap/config.yaml", ".sightmap/register.yaml"],
      "commit": "<sha of last commit touching this entry>"
    }
  ]
}
```

Contracts that must not drift:
- `files[]` lists every corpus file relative to the entry dir, `.sightmap/`-prefixed. (`sightmap atlas add` installs the entry's published `<slug>.tar.gz`, built from the same tree — `files[]` is the readable manifest of what that archive holds.)
- `stats` / `per_view` come from `sightmap stats --json`, never hand-computed.
- `commit` records the last commit that touched the entry, for provenance.

## removed.yaml

```yaml
- slug: acme-pos
  removed: 2026-09-01
  reason: owner-request        # owner-request | policy | superseded-by:<slug>
```
