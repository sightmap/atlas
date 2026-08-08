# Handoff — atlas launch batch

State as of 2026-08-08. Supersedes the cloud-review handoff of the same date,
whose two blockers are both resolved; its mapping reports under `reports/*.md`
are still current and worth reading before mapping anything.

Everything described here is pushed unless marked otherwise.

---

## 1. What changed since the last handoff

**Both prior blockers are closed.** Screenshots retaken on vuori, uniqlo and
ikea; the next batch is gated and chosen.

**Retaking the screenshots turned up real corpus defects**, which matters more
than the screenshots did. Two entries documented components their own view
URLs do not have. Neither failed `validate` or `lint` — the selectors resolved
to *something*, or to nothing, without erroring.

- **uniqlo**: `ProductTile` selected `.fr-ec-product-tile` on both
  CategoryListing and SearchResults. On search that matches 30 elements, which
  is why it looked right, but none are results — they are tiles inside the
  `.fr-ec-carousel` recommendation strips, all outside
  `.fr-ec-product-collection`. On the category page it matched nothing. Fixed:
  results on both views are `.product-tile` inside `.fr-ec-product-collection`.
- **ikea**: `/us/en/cat/:categorySlug` serves two different pages and nothing
  in the URL says which. A hub (`/cat/tables-chairs-fu002/`, the exemplar the
  view used) has the subcategory carousel and no products at all. A leaf
  (`/cat/desk-chairs-20654/`) has the grid and filters and no carousel. Also
  `CardPrice` used a search-only class; search renders
  `.plp-grid-product-card__*` and a category renders `.plp-mastercard__*`.
  Fixed, and the README hazard that claimed the opposite was corrected.
- **ikea also had 906 committed `node_modules/` files** plus a stray
  `package-lock.json` on its tip commit. Amended out; the branch was
  force-pushed. Its tree now matches the other seeds.

**ebay has the same class of defect and is NOT fixed.** See §6.

---

## 2. Branch state

| Branch | Head | PR | State |
|---|---|---|---|
| `p2/schema-scripts` | `ce71535` | [#1](https://github.com/sightmap/atlas/pull/1) | tooling — **merge first** |
| `p2/workflows` | — | [#2](https://github.com/sightmap/atlas/pull/2) | merge second |
| `p2/contrib-skill` | — | [#3](https://github.com/sightmap/atlas/pull/3) | |
| `docs/licensing-and-contact` | — | [#4](https://github.com/sightmap/atlas/pull/4) | |
| `seed/sightmap-org` | `2499e4b` | [#5](https://github.com/sightmap/atlas/pull/5) | |
| `seed/ebay` | `723fd99` | [#7](https://github.com/sightmap/atlas/pull/7) | **defect open — §6** |
| `seed/ikea` | `d0341f2` | [#8](https://github.com/sightmap/atlas/pull/8) | fixed, force-pushed |
| `seed/amazon` | `b95391f` | [#9](https://github.com/sightmap/atlas/pull/9) | clean |
| `seed/nike` | `f814b85` | [#10](https://github.com/sightmap/atlas/pull/10) | clean |
| `seed/vuori` | `f510171` | [#11](https://github.com/sightmap/atlas/pull/11) | fixed |
| `seed/uniqlo` | `e785de1` | [#12](https://github.com/sightmap/atlas/pull/12) | fixed |
| `seed/airbnb` | `a9c91b0` | [#13](https://github.com/sightmap/atlas/pull/13) | clean |
| `seed/apple` | `ad646d7` | [#14](https://github.com/sightmap/atlas/pull/14) | clean |
| `seed/github` | `54b9b65` | **no PR yet** | new, validates 9/9 |
| `spec/auth-personal-account` | `1db8c0c` | **no PR yet** | new, see §3 |

Merge order: #1 first — the seven older seed branches each carry a
byte-identical copy of its tooling, and merging #1 collapses their diffs to
entries-only. Then #2, then seeds.

---

## 3. The spec change: `auth: personal-account`

**Branch `spec/auth-personal-account`, commit `1db8c0c`, pushed, no PR yet.**

The atlas exists to show agents the products people actually delegate to, and
almost all of those are behind a login. The `auth` enum had no honest value for
"the mapper signed in with an account of their own" — `none`, `demo-account`
and `self-hosted` are all false in that case — so such an entry either failed
the schema check or shipped a false claim.

Three files change:

- `schema/entry.schema.json` — enum gains `personal-account`.
- `docs/POLICY.md` — auth-walled products move from "default **no**" to an
  ordered list of accepted paths, with the mapper's own account fourth.
- `docs/SPEC.md` — new section with the rules that make such entries
  publishable.

Verified both directions: `auth: personal-account` passes the schema check, and
a bogus value still fails with the new enum listed. Fixtures untouched.

**The rules, because every signed-in entry must follow them:**

- The map documents the product. It must never document the account.
- Identity never ships — name, email, handle, avatar, postal address, phone,
  payment detail.
- Nor do account contents — order, watch and listening history, saved items,
  playlists, direct messages, contacts, friend lists, notifications, balances.
- `properties` name what a selector extracts, never what it extracted.
  `order_total`, not `$142.68`.
- Prefer frames with no account chrome. **Drop a screenshot rather than
  retouch one** — a screenshot-less entry is always acceptable, a doctored one
  never is.
- Only the author can re-verify these. `last_verified` means the author
  re-checked; CI cannot, and neither can a reviewer. Say so in the README body.
- **A bot challenge is a stop sign.** A person signing into their own account
  and clicking through their own product is ordinary use. Automating past a
  challenge or CAPTCHA is not, and stays forbidden however the session was
  obtained.

---

## 4. The authoring stack — decided

Two tools, one rule: **the sightmap CLI does the authoring and verification;
Claude in Chrome supplies DOM access the CLI's own browser cannot get.** No
hand-rolled Playwright.

**sightmap CLI — the default for everything.** The previous session authored
and verified with ad-hoc Playwright scripts, reinventing `sel-probe`,
`inspect`, `suggest`, `discover` and `coverage` badly. Do not repeat this. If
a job seems to need a script, check the verb table below first; it is almost
certainly already a verb. If it genuinely is not, that is a product gap worth
filing against the CLI rather than papering over locally.

**Claude in Chrome — only for DOM the CLI cannot reach.** The CLI's own browser
starts a clean profile, so it is signed out and it trips the same bot
protection that blocks any automation. A human-driven Chrome is signed in and
is not challenged. Use it for exactly two things:

- authoring `auth: personal-account` entries, and
- reaching interaction-gated state on public sites — filter panels with facets
  applied, sort menus, drawers, expanded accordions, a PR's Files-changed tab.
  That state is where the uniqlo and ikea defects lived: components documented
  from a page nobody had actually put into that state.

Notes that will save time:

- The extension only sees tabs inside **its own tab group**. An already-open
  tab is not visible until it is adopted into the group; a fresh group starts
  with one blank tab.
- `javascript_tool` is a REPL — write **top-level `await`**, not an async IIFE.
  An IIFE serialises as `{}`.
- **Always settle before reading.** Running JS immediately after `navigate`
  reports zero matches on client-rendered pages. Poll for a known selector
  before counting. A no-wait read produced a false "signed-in breaks the issues
  list" finding that evaporated on re-check.
- Prefer `browser_batch` for multi-step sequences.

**The supported bridge between the two** is `sel-probe -addr host:port`. Start
Chrome with `--remote-debugging-port` against a profile that is logged in, then
point the CLI at it. That gets real CLI verification against a human-driven
session without any bespoke code.

### Verb table

Everything below is a real verb.

| Job | Verb |
|---|---|
| scaffold a corpus | `sightmap init` |
| start a session | `sightmap browser start --headless --port N --url URL` |
| find route shapes | `sightmap discover --all` |
| raw DOM for authoring | `sightmap inspect --url URL` |
| candidate selectors | `sightmap suggest --exclude-known` |
| **check a selector against every view** | `sightmap sel-probe --all --wait 3 -- 'sel'` |
| offline selector check | `sightmap sel-check 'sel' FILE.snap` |
| persist captures | `sightmap capture --all` |
| coverage tiers T1/T2/T3 | `sightmap coverage`, `sightmap multi-coverage` |
| per-view health table | `sightmap report` |
| orphaned interactive nodes | `sightmap gap` |
| structure + style | `sightmap validate`, `sightmap lint` |
| counts | `sightmap stats --json` |

Gotchas learned the hard way:

- `browser start` runs in the **foreground** and needs `--url` to open a tab.
  Without a tab every other verb reports "no content tab open". Run it with
  `nohup … &`, then `sightmap browser status` to confirm.
- The session is keyed to the `.sightmap` directory — **run verbs from the
  entry directory**, not the repo root. Each profile gets its own CDP port.
- `sel-probe` takes `-addr host:port`, so it can attach to an already-running
  Chrome started with `--remote-debugging-port`. That is the supported bridge
  for authoring against a browser a human is driving.
- The network buffer is never cleared between navigations. Record the highest
  request index before navigating and keep only entries above it, or the
  previous route's traffic gets attributed to the current one.

**Nobody has ever run `capture --all` + `coverage` on any entry.** The nine
existing corpora have never been checked against the T1/T2/T3 gate or `gap`.
`validate-entry.mjs` does not run them, so CI never caught it. Do this for
every entry, old and new.

---

## 4b. What "comprehensive" means

An entry is not done when it validates. `validate` and `lint` check structure
and style; they cannot tell that a corpus is thin. A finished entry carries all
five dimensions, and `sightmap stats --json` should show a non-trivial number
in each:

- **views** — every distinct page type, not just the ones a homepage links to.
  Include the 404. Where one route serves two different pages (ikea `/cat/`,
  and probably ebay `/b/`), say so and give the test that tells them apart.
- **components** — the view's real structure, nested where the DOM nests. Not
  just a page wrapper.
- **properties** — what each component yields. A component with no properties
  documents that something exists but not what it says. For
  `auth: personal-account` entries, properties name what a selector extracts,
  **never a value it extracted**.
- **requests** — captured live, scoped to the view that fetches them. Global
  only for site-wide chrome (header, cart, chat, analytics, consent). See the
  per-view REQUESTS note in §7.
- **memory** — the reason the entry is worth reading. Record what would mislead
  someone: a selector that resolves but returns the wrong thing, a route that
  serves two pages, an id that looks stable and is not, a page with no `h1`.
  A corpus of selectors with no memory is a DOM dump.

The first batch was thin on requests — all 20 sat at file root, which made the
gallery's per-view REQUESTS column structurally zero. Re-scoping took them to
106. Expect a similar gap on memory if nobody looks for it.

---

## 4c. Prose standards and PII

**Every piece of public prose goes through `no-ai-slop`.** Entry READMEs,
hazard sections, commit messages, PR bodies, issue text. These are the artifact
people read; the corpus is what agents read. Both matter, and the README is the
one a human judges the atlas by.

**PII removal is a hard gate, and it is mechanical, not a vibe check.** Before
committing any entry:

- Grep the corpus and README for email patterns and real names. The only
  identifier that belongs in an entry is the `author:` front-matter handle.
- For each screenshot, scan **what is actually inside the captured viewport**,
  not the whole document — text below the fold is not in the picture. Check for
  emails, real names, and avatars whose bounding box intersects the viewport.
- If a frame is dirty, **re-frame it**: scroll to a clean viewport, or narrow
  the browser so the offending panel falls below the fold. Do not retouch, blur
  or crop-to-hide. A doctored screenshot is worse than no screenshot, and a
  screenshot-less entry is always acceptable.
- Contributor handles and avatars on a **public** repository are self-published
  public identity and are fine in frame. A person's name, email, address,
  payment detail, or private account contents never are.

---

## 5. Site slate

### Confirmed, signed-out — fan these out to sub-agents

| Slug | Entry point | Why |
|---|---|---|
| `rijksmuseum` | `rijksmuseum.nl/en` | Hero image. Object numbers are shortlinks: `/en/collection/SK-C-5` rewrites to `/en/collection/object/The-Night-Watch-…`. Two collection shapes — `/collection/object/:titleSlug` for artworks, `/collection/node/:slug` for terms. Locale prefix `nl/en/de/fr`. Has a real sitemap. |
| `steam` | `store.steampowered.com` | `/app/:appId/:slug`, `/search?term=`, `/charts`, `/explore`, `/news`. An `snr` tracking param rides nearly every internal link; `?l=` switches locale. No sitemap in robots.txt. |
| `nasa-images` | `images.nasa.gov` | `/`, `/search?q=`, `/details/:nasaId`. Angular SPA; search is JS-driven. nasaId formats are heterogeneous — `KSC-20260805-PH-CSH01_0098`, `NHQ202608060007`, `iss075e0002041`. Zero personal-data question. |
| `bandcamp` | `bandcamp.com` | `/`, `/discover`, `/tag/:tag`, and **per-tenant subdomains** — `:artist.bandcamp.com` and `:artist.bandcamp.com/album/:slug`. Old-style unhashed ids: `#track_table`, `#tralbumArt`. **Do not map `/search`** — it serves a Client Challenge CAPTCHA. Record that as the reason it is absent. |
| `browse-sh` | `browse.sh` | Shape is `/skills/:domain/:slug` — a catalog of per-site automation skills, including ones for amazon.com and airbnb.com. Same idea as the atlas, keyed by domain instead of product. |

### Confirmed viable only with `auth: personal-account`

Do these **in the main thread**, one at a time, through a logged-in browser —
sub-agents cannot share one tab group without colliding.

`youtube`, `spotify`, `instagram`, `facebook`, `pinterest`, `instacart`,
`zillow`.

YouTube and Spotify also have rich signed-out surfaces (`/watch`, `/@channel`,
`/results`; `open.spotify.com/album|artist|track/:id`) and could ship as
`auth: none` instead. Spotify has not been gated yet.

### Rejected, with reasons — do not revisit without new evidence

| Site | Reason |
|---|---|
| Reddit | `Reddit - Prove your humanity` on the homepage, "blocked by network security" on every deep route |
| Zillow, Trulia | 403 `Press & Hold to confirm you are a human` on every route; identical reference id per site, so IP-level. Listing pages also carry home addresses and agent phone numbers |
| Atlas Obscura, Unsplash, Art Institute of Chicago, Letterboxd | Cloudflare / BotShield challenge pages |
| **Windy** | **Not a canvas-tool mismatch — a sightmap mismatch.** 2 canvases covering 101% of the viewport, 0 headings, 5 anchors. The weather is pixels; selectors and text extraction have nothing to bite on |
| Target, Best Buy, Home Depot, Instacart *(signed-out)* | bot detection or blocked deep routes, from the earlier batch |

**Adopt the canvas test as a gate.** Before mapping, measure canvas area as a
share of viewport and count headings. Windy scores 101% / 0. Every good entry
scores 0% / many. If the content is canvas, sightmap cannot describe it.

---

## 6. Open defect: ebay `CategoryBrowse`

On `seed/ebay`, `CategoryBrowse` declares `#brw-refinement-root`,
`#brw-controls-root`, and a whole `.brw-river` subtree (`.brwrvr__item-card`
and its two children) that match **nothing** on the view's own URL
`/b/Toys-Hobbies/220/bn_1865497`. Sibling selectors on the same view —
`.brw-category-nav`, `.brw-product-carousel`, `.brw-product-card`, `.brw-uep` —
do match. Almost certainly the same hub-versus-leaf split found on ikea.

Confirming needs a deeper `/b/` category, and **eBay began serving
"Please verify yourself to continue" during probing**, so this needs a later
session with slow pacing.

Also check `[data-testid="x-volume-pricing"]` under `ItemDetail`, which matched
nowhere and is probably conditional on the listing.

Verified clean by the same audit: amazon, nike, apple, airbnb.

---

## 7. Per-entry checklist for a sub-agent

One agent per entry, one branch per entry, `seed/<slug>`, branched from
`origin/p2/schema-scripts` (it carries `.gitignore`, `schema/`, `scripts/`,
`fixtures/`).

1. **Gate.** Load home plus 3 deep routes in a real browser. Reject on any
   challenge text. Run the canvas test. Only the deep-route layer is decisive —
   a site can return 200 at the root and challenge every route worth mapping.
2. **Discover routes.** `sightmap discover --all`; check `robots.txt` for a
   sitemap and prefer it when one exists.
3. **Scaffold.** `sightmap init` in `entries/<slug>/`.
4. **Author.** `sightmap inspect` and `sightmap suggest` for selectors. Prefer
   `aria-label`ed landmarks, `data-testid`, and semantic/microdata attributes
   over classes. Where a framework hashes class names, a substring on the
   stable module prefix survives rebuilds — use `[class*="Prefix-module__Name___"]`,
   and prefer `class*=` to `class^=`, since `^=` matches the start of the whole
   attribute and silently depends on class order.
5. **Verify every selector.** `sightmap sel-probe --all --wait 3 -- '<sel>'` for
   each one. A selector that matches on no view is a false claim. A selector
   that matches on views other than the one declaring it is usually a
   mis-scoped component — that is exactly how the uniqlo and ikea bugs looked.
6. **Coverage.** `sightmap capture --all`, then `sightmap coverage` and
   `sightmap gap`. Gate is 0 orphaned per route. Captures are an authoring aid
   and are **not** committed.
7. **Requests.** Scope each request to the view that fetches it; leave at file
   root only what serves site-wide chrome (header, cart, chat, analytics,
   consent). `stats` counts global + view-scoped; `per_view[].requests` counts
   only view-scoped, which is why a corpus with everything at file root shows
   an empty per-view REQUESTS column in the gallery.
8. **Screenshots.** 1–5, `NN-<kebab-name>.webp`, ≤300 KB, width 1200–2000 px.
   Capture at 1600×1057 to match the rest of the atlas. Dismiss overlays
   through their own control; hide only as a fallback and say so in the commit.
   Never fabricate content.
9. **PII scan** — §4c. Grep corpus and README; scan each screenshot's captured
   viewport. Re-frame anything dirty rather than retouching it.
10. **Prose pass** — run `no-ai-slop` over the README and the commit message
    before committing.
11. **Validate.** `node scripts/validate-entry.mjs entries/<slug>` — must be
    9/9. Confirm `sightmap stats` shows all five dimensions populated (§4b).
12. **Commit** with `git commit -s` (DCO required — every commit). One PR per
    entry, branch `seed/<slug>`. Do not open the PR without checking §9 first.

### YAML traps that cost real time

The corpus parser rejects both of these, and they are easy to write:

- A bullet containing `: ` in an unquoted scalar — `diverge: search renders`.
  Use an em dash instead.
- A bullet **starting** with a backtick — `` - `.foo` is … ``. Backtick is a
  reserved YAML indicator. Reword so the line starts with a word.
- `memory:` is not valid on a **property**. It belongs on a component or a view.

Run `sightmap validate` after every edit, not at the end.

---

## 8. What the github entry established

`seed/github` (`54b9b65`) is done and validates 9/9 — 8 views, 38 components —
and is the worked example for the rest. Its headline finding is the kind of
thing these entries exist to record:

`/pulls` and `/issues` render near-identical pages from **two different
frontends**, and neither one's selectors match the other.

```
.js-issue-row                      PullList 7   IssueList  0   (6 other views 0)
[data-testid=issue-pr-title-link]  PullList 0   IssueList 10   (6 other views 0)
```

`sel-probe --all` produces exactly that table in one command.

It also records: ids like `#_R_2qbd_` and classes like
`.Primer_Brand__Text-module__Text___XeGJJ` are generated and change between
renders or deploys; the CSS-module prefix is stable where the full class is
not; `/:org` and `/:user` are one URL shape distinguished only by
`nav[aria-label="Organization"]`; and the 404 page has no `h1` at all, so
"no heading yet" reads as "still loading" forever.

`GlobalHeader` is the one component that does not survive a session — verified
against a real signed-in browser, where `nav[aria-label="Global"]` matches
nothing and the header is `header[aria-label="Global navigation menu"]`.
Every other selector matched identically signed in and signed out.

---

## 9. Decisions waiting on the maintainer

1. **Open the PR for `spec/auth-personal-account`?** Branch is pushed. Nothing
   signed-in can ship until it merges.
2. **Open the PR for `seed/github`?** Branch is pushed, validates 9/9.
3. **Name check on `personal-account`.** Chosen to pair with the existing
   `demo-account`. Rename now if another word is wanted — cheap before merge,
   expensive after.
4. **Order of work** — start the five signed-out sub-agents, or walk the
   logged-in products first?
5. Carried over and still unresolved: branch protection on atlas `main`;
   `.github/workflows/web.yml` runs `pnpm build` but never `pnpm test`;
   CI fails on any lint warning while CONTRIBUTING promises justified warnings
   are acceptable.

## 10. Reference

- Mapping reports from the first batch: `reports/*.md` on this branch.
  `reports/apple.md` is the closing report and has the method notes worth
  rereading — probe-path locale collision, network-buffer clearing, conditional
  endpoints, and the `grep -c` undercount trap.
- Tooling asks: [sightmap/atlas#15](https://github.com/sightmap/atlas/issues/15)
- The gallery ([sightmap/sightmap#172](https://github.com/sightmap/sightmap/pull/172))
  renders whatever `index.json` the publish workflow ships. No site work is
  needed when entries merge.
