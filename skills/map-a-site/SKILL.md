---
name: map-a-site
description: Use when mapping a website into a Sightmap Atlas entry — checking POLICY eligibility, exploring the live site with sightmap snapshot, authoring per-route YAML, probing selectors, validating, capturing screenshots, scaffolding the entry folder, and opening a PR against sightmap/atlas. Activate when the goal is to contribute a site map to the atlas.
activation:
  - contributing a new entry to the sightmap/atlas repo
  - mapping a public website into a shareable sightmap corpus
---

# Map a site for the Sightmap Atlas

End-to-end: pick a target, map it with the Sightmap CLI against the live site,
package it as an `entries/<slug>/` folder, and open a PR against
[sightmap/atlas](https://github.com/sightmap/atlas).

Contracts you must satisfy (both live in the atlas repo):

- **`docs/SPEC.md`** — entry layout, front matter, corpus rules, screenshot rules.
- **`docs/POLICY.md`** — eligibility and hard content rules.

**This workflow requires a live browser session.** `sightmap browser start`
launches a Chrome-for-Testing instance; `snapshot`, `sel-probe`, `capture`, and
`browser screenshot` all drive it. Without a machine that can run Chrome you
cannot verify selectors or capture screenshots, and an atlas entry with
unverified selectors is not acceptable. Only `validate`, `lint`, and
`coverage --trace` (against saved snaps) work offline.

## Prerequisites

```bash
# Sightmap CLI (check first, install only if missing):
sightmap version || npm install -g @sightmap/sightmap
# or, pinned one-off via Go:
go run github.com/sightmap/sightmap/go/cmd/sightmap@main version

# GitHub CLI, authenticated:
gh auth status
```

Install the companion authoring skills if you have not already
(`sightmap skills install`) — this skill covers the atlas pipeline; the
`sightmap-authoring` skill is the deep reference for the coverage loop,
selector rules, and property extraction.

## Step 1 — POLICY gate (before any capture)

Read `docs/POLICY.md` in the atlas repo and classify the target:

| Target | Verdict | Front-matter `auth` |
|---|---|---|
| Publicly reachable without an account | yes | `none` |
| Self-hosted / OSS you run yourself | yes | `self-hosted` |
| Vendor-operated public demo/sandbox | yes, screenshots only of clearly non-sensitive screens | `demo-account` |
| Documented vendor permission | yes — link the permission in the entry README | per surface |
| Any other auth-walled product | **no — stop** | — |

Hard rules regardless of verdict: no personal data anywhere (screenshots, YAML
examples, memory notes, request samples), no credentials/tokens/cookies/internal
URLs, no auth bypasses, no rate hammering, no CAPTCHA circumvention. When in
doubt about screenshots, ship the map without them — a screenshot-less entry is
always acceptable.

## Step 2 — fork and scaffold

```bash
gh repo fork sightmap/atlas --clone && cd atlas
git checkout -b add-<slug>
mkdir -p entries/<slug>/.sightmap entries/<slug>/screenshots
```

Slug rules (`docs/SPEC.md`): kebab-case, `^[a-z0-9][a-z0-9-]{1,63}$`,
product-keyed not domain-keyed (`square-pos`, not `squareup.com`), unique
against `entries/` and `removed.yaml` (scaffolded by the atlas P2.1 PR; if
`removed.yaml` is absent, no tombstones exist yet).

Pin the spec version in `entries/<slug>/.sightmap/config.yaml`:

```yaml
version: 1
```

## Step 3 — explore the live site

Work from the entry directory — the CLI operates on the `.sightmap/` in cwd:

```bash
cd entries/<slug>
# --headless keeps Chrome off the user's screen; the window size matters for
# screenshots later (Step 7) — the default viewport is only 800px wide, below
# the 1200px minimum SPEC requires.
sightmap browser start --headless --chrome-flag=--window-size=1600,1200
sightmap browser status         # expect: running, with a content tab listed
sightmap snapshot --coverage --url 'https://<target>/'   # first look
sightmap discover               # crawl links: mapped / surveyed / unseen routes
sightmap suggest --exclude-known  # candidate selectors not yet mapped
```

Enumerate the top-level routes you will map. Async-rendered pages may need
`--wait 1` (or more); a snapshot reporting 0 interactive nodes means the page
was blank or still loading — never a finished page.

**Then map what nothing links to.** `discover` crawls links, and no page links
to its own error state, so link-following alone will always miss it. Visit a
path that cannot exist and map whatever renders:

```bash
sightmap snapshot --coverage --url 'https://<target>/no-such-page-xyz'
```

Most SPAs answer with the app shell and a client-rendered not-found view, which
means an HTTP status will not tell an agent it took a wrong turn — the view is
the only signal, and that is exactly why the map needs it. Give it a catch-all
route (`/**`); more specific views still win for their own routes. Other
surfaces links rarely reach: states behind a query string (`?q=`), and anything
that only appears after an interaction (modals, expanded menus) — reach those
with `sightmap browser click` and snapshot again.

## Step 4 — author per-route YAML

Follow the monorepo's authoring conventions —
[`spec/v1/authoring-conventions.md`](https://github.com/sightmap/sightmap/blob/main/spec/v1/authoring-conventions.md)
— and the `sightmap-authoring` skill for the mechanics. Layout:

- one file per top-level route (`/pricing` → `pricing.yaml`, `/` → `home.yaml`)
- `shared.yaml` for content reachable from more than one route (nav, footer, toasts)
- `extras.yaml` for route-less modals and third-party widgets
- `properties:` for values that vary per instance; `requests:` for observed
  traffic; `memory:` for the non-obvious facts (the notes are the product)

Atlas-specific corpus rules (`docs/SPEC.md`, CI-enforced):

- **No `source:` or `dependencies:` keys** — atlas maps are observed, not
  source-derived, even when the target's source is public.
- Any snapshots you keep must live in `.sightmap/snapshots/` so
  `sightmap lint --all-snapshots` and offline coverage find them.
- `config.yaml`'s `version` must equal the front-matter `spec_version`.

## Step 5 — probe every selector

```bash
sightmap sel-probe '[data-testid="search"]'
```

Never commit a selector you did not probe. Trust the **offline** match count
when the probe reports divergence — that is what consumers of the corpus will
see. Iterate the coverage loop until every mapped route reports
`0 orphaned ✓` (details in `sightmap-authoring`):

```bash
sightmap snapshot --coverage --url 'https://<target>/<route>'
# fix YAML, re-snap, repeat
```

Today's date goes into front-matter `last_verified` — it must be the date you
actually probed, not the date you wish you had.

## Step 6 — validate and lint

```bash
sightmap validate            # must exit 0
sightmap lint --warn-only    # any warning you keep needs a justifying note in README.md
```

Two warnings you will almost certainly meet:

- **`multi-instance-no-property`** on a prefix selector. Lint reads the YAML, not
  the page, so `[data-component^="Hero"]` looks like it could match many elements
  even when it matches exactly one. Do not silence it with `stability: unstable`
  — that marks an accepted residual, which is a different claim. Give the
  component a property that identifies the instance; when the hook is an
  attribute, extracting that attribute is both the fix and useful data:

  ```yaml
  - name: Hero
    selector: '[data-component^="Hero"]'
    properties:
      - name: component_id
        extract: attr=data-component
  ```

- **`request is missing a name`**. Requests need `name` as well as `route` —
  easy to miss when you are transcribing observed traffic rather than reading
  the schema.

## Step 7 — screenshots

`docs/SPEC.md` rules: 1–5 images, `screenshots/NN-<kebab-name>.png` (or
`.webp`) starting at `01`, each **≤300 KB** and **1200–2000 px wide**, public
non-sensitive screens only, demo data must look like demo data.

**The capture is only as wide as the browser window.** A session started without
a window size screenshots at 800px and every image fails the 1200px minimum —
silently, because the CLI has no opinion about it. If you did not start the
session as shown in Step 3, restart it now:

```bash
sightmap browser stop
sightmap browser start --headless --chrome-flag=--window-size=1600,1200
```

```bash
# still in entries/<slug>/ :
sightmap browser navigate 'https://<target>/'
sightmap browser screenshot --out screenshots/raw-home.png
```

Raw screenshots usually exceed 300 KB — compress (any one of these):

```bash
cd screenshots
magick raw-home.png -resize '1600x>' 01-home.webp        # ImageMagick → WebP
cwebp -q 82 raw-home.png -o 01-home.webp                 # libwebp → WebP
pngquant --quality 60-80 --output 01-home.png raw-home.png  # staying with PNG

# Verify (from entries/<slug>/):
ls -l screenshots/            # each ≤ 300 KB
sips -g pixelWidth screenshots/*   # width within 1200–2000 (macOS; or `identify`)
```

Delete the raw captures; commit only the final `NN-` files.

## Step 8 — front matter and README

`entries/<slug>/README.md` starts with the front matter from `docs/SPEC.md`
(every field; schema-enforced in CI):

```yaml
---
name: <Display Name>            # ≤50 chars
slug: <slug>                    # == folder name
site_url: https://<target>/
domains: [<domain>]             # 1–5
description: <what surfaces this maps>   # ≤140 chars
categories: [<one-to-three>]    # closed enum in docs/SPEC.md
author: <your-github-handle>
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
last_verified: <YYYY-MM-DD>     # the date you sel-probed
cli_version: <sightmap version>
spec_version: 1                 # == .sightmap/config.yaml version
method: browser                 # browser | hybrid
auth: none                      # none | demo-account | self-hosted
---
```

Below it, free-form notes: coverage summary, quirks, known gaps, justification
for any lint warnings, and (if applicable) the vendor-permission link. No
stats in the front matter — CI computes them.

Quality bar (from the atlas seed phase; reviewers hold you to it): ≥5 views or
a README justification; every view carries at least one `memory:` note;
requests documented wherever traffic is observable.

## Step 9 — local validation

From the atlas repo root:

```bash
node scripts/validate-entry.mjs entries/<slug>
```

(`scripts/validate-entry.mjs` lands with the atlas P2.2 scaffold PR; until it
merges, Step 6 plus a manual front-matter check against `docs/SPEC.md` is the
best available approximation.)

This is the same script CI runs — schema, slug, spec-version agreement,
screenshot rules, observed-only corpus rules, then `sightmap validate` and
`sightmap lint`. Fix everything locally; the PR bot will re-run it.

## Step 10 — open the PR

```bash
sightmap browser stop
cd <atlas-repo-root>
git add entries/<slug>
git commit -m "Add <slug> entry"
gh pr create --repo sightmap/atlas \
  --title "Add <slug>" \
  --body "New atlas entry for <site_url>. auth: <level>. <N> views, <M> screenshots. Selectors probed <YYYY-MM-DD>."
```

One entry per PR — CI rejects PRs touching more than one `entries/<slug>/`
directory. Never touch `index.json` (generated on merge). The validation bot
comments with the result; a green run plus maintainer review is the merge
path.

## Failure modes

- **Bot defenses / CAPTCHA**: do not circumvent — that is a policy violation.
  Timebox the attempt and pick another target.
- **Selector churn between loads**: real pages render differently per load;
  re-snap before declaring a selector dead, and prefer stable hooks
  (`data-testid`, `aria-label`, stable ids) over classes.
- **Screenshots of borderline screens**: leave them out. The corpus YAML is
  the valuable part; screenshots are optional garnish.
