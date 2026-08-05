# Phase 4 — Gallery frontend (sightmap/sightmap `web/`)

Routes at sightmap.org/atlas, built from data vendored into the monorepo by P2.4's bot PR. The site build stays fully local — no network fetches. Budget this as a real feature: prerendering is hand-rolled, not framework magic.

## Files that must change (verified against the monorepo)

- `web/src/App.tsx` (~line 15): route table currently `/`, `/blog`, `/blog/:slug` — add `/atlas`, `/atlas/:slug`.
- `web/scripts/prerender.tsx`: enumerates routes for static generation (blog slugs are the precedent — atlas slugs come from the vendored index.json) and stamps per-route OG/meta.
- OG image generation (`og/render.mjs` path): per-entry OG images — screenshot + name + stats line — so every entry is self-sharing.
- `web/src/data/atlas/`: vendored `index.json` + `screenshots/<slug>/*` (written by the P2.4 bot PR; commit a hand-copied snapshot to unblock development before P2.4 lands).

## P4.1 Card grid (`/atlas`)

Card: screenshot, favicon (of `site_url` domain), name, description, method pill, `N views · M components · K requests` (from `stats`), author avatar (GitHub), `updated`. Client-side category filter + text search, state in URL params. Empty/loading states irrelevant — fully static.

## P4.2 Entry detail (`/atlas/:slug`)

Spec-sheet anatomy (adapted from browse.sh):
- Domain eyebrow (favicon + domain, external-link) over a display title.
- INSTALLATION copy-block: `sightmap add <slug>` (until P1.2 ships in a release, render the sparse-checkout fallback snippet behind the same copy button).
- Summary (front-matter description + README body rendered below).
- FIG. 01–05 screenshot carousel with captions from filenames.
- Per-view table from `per_view`: view, route, components, requests. (Full component-tree rendering is v2 — requires vendoring corpora; `per_view` covers the spec-sheet need without the payload.)
- Monospace `<dl>` sidebar: CAPTURE METHOD / AUTH / LAST VERIFIED / CLI VERSION / SPEC VERSION / AUTHOR.

## P4.3 Machine twins

- `/atlas/index.json` served verbatim (copy into `web/public/` at build).
- Per-entry markdown twin at `/atlas/<slug>.md` (front matter + README body + stats block).
- Extend the site's `llms.txt` with one line per entry.

## P4.4 Design + verification

- Match the existing site's design system; borrow the spec-sheet flavor (mono uppercase micro-labels, FIG numbering) only where it doesn't fight the brand.
- Verify with the real dev server: cards render from fixture data, detail pages prerender for every slug in the index, OG images generate, Lighthouse on `/atlas` ≥90 perf.

## Sequencing

P4.1/P4.2 can start on fixture data as soon as P2.1 fixes the schema. P4.3 and the bot-PR wiring land after P2.4. Final content pass after P3 merges real seeds.
