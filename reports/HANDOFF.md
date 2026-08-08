# Handoff — seed batch review complete, two blockers left for a local session

State as of 2026-08-08, after the cloud review session. Everything described
here is pushed. Pick up from a machine with a real browser (the cloud
runtime resets browser TLS handshakes; CLI tools work, browsers do not —
verified against proxy and direct egress in two environment configurations).

## Where things stand

| PR | Entry | Verdict |
|---|---|---|
| #7 | ebay | Merge-ready |
| #8 | ikea | Merge-ready; screenshot retake recommended (cookie banner on both shots) |
| #9 | amazon | Merge-ready (404 screenshot is deliberate — see PR comment) |
| #10 | nike | Merge-ready |
| #11 | vuori | **Hold: both screenshots covered by the Klaviyo newsletter modal** |
| #12 | uniqlo | **Hold: both screenshots covered by the $5-off SMS modal** |
| #13 | airbnb | Merge-ready (single screenshot is policy-correct) |
| #14 | apple | Merge-ready |

**Merge order:** #1 (schema + scripts) first — the seven later seed branches
each carry a byte-identical copy of its tooling, and merging #1 first
collapses their diffs to entries-only. Then #2 (workflows), then seeds.

Every entry re-validated with CLI 0.19.0: `sightmap validate`, `sightmap
lint`, and `scripts/validate-entry.mjs` all pass on all eight.

## What the review changed (one commit per seed branch)

- `entries/<slug>/summary.md` removed — mapping reports addressed to the
  team, not entry content per docs/SPEC.md. Full text preserved under
  `reports/` on this branch; tooling asks distilled into issue #15.
- `## What bites` → `## Hazards`; uniqlo's `## What's good here` →
  `## Reliable signals`; airbnb's 404 section retitled.
- Cross-entry and self-ranking copy removed (entries must stand alone as the
  atlas grows): airbnb's "one travel entry" framing and its four-entry 404
  comparison; uniqlo's "only error page in this atlas" description and its
  Vuori reference; vuori's "useful contrast to the big-box entries" intro.
- `updated:` bumped to 2026-08-08 everywhere.

## Blocker 1 — screenshot retakes (vuori, uniqlo, ikea)

From a checkout of each seed branch, on a machine with Chrome:

    node reports/retake/retake-screenshots.mjs vuori uniqlo ikea

The script (this branch, `reports/retake/`) dismisses each overlay using the
selector from that entry's own corpus, captures 1600×1057, and writes
≤300 KB webp over the existing files (`npm i sharp playwright` first; falls
back to PNG with a warning if sharp is missing). Then per entry:
`node scripts/validate-entry.mjs entries/<slug>`, bump `updated:` in the
README, commit with sign-off, push to the seed branch.

## Blocker 2 — the next batch of entries

Requested: 4–5 new entries. Gate results and the recommended slate:

- **Rejected candidates:** Target (previous batch: never finishes loading;
  from a datacenter IP it also serves bot-block markup), X (login wall —
  an `auth: none` map would be a header and a wall; a signed-in map needs an
  atlas policy decision first, since the auth enum has no personal-account
  value), Stack Overflow (403 from datacenter IPs), IMDb (bot challenge).
- **Recommended slate: Reddit, Wikipedia, Hacker News, Open Library, MDN.**
  All five pass the curl gate signed-out. Reddit still needs the render
  gate (its no-JS response is an 8 KB shell) — run the three-layer check
  from the batch report before committing to it: curl status, homepage
  render, deep routes + blocking-modal check. Only the third layer is
  reliable.
- Method notes from the last batch worth rereading before mapping:
  `reports/apple.md` (batch closing report) — probe-path locale collision,
  network-buffer clearing between navigations, conditional endpoints,
  the `grep -c` undercount trap.

New entries follow docs/SPEC.md: kebab-case product-keyed slug, front matter
against `schema/entry.schema.json`, corpus passing validate + lint with a
`Hazards` section in the README, 1–5 screenshots ≤300 KB at 1200–2000 px
wide, requests captured per view (not file-root), selectors `sel-probe`d
live with `last_verified` set. One PR per entry, branch `seed/<slug>`,
DCO sign-off.

## Reference

- Tooling/skill asks from the batch: sightmap/atlas#15
- Mapping reports: `reports/*.md` on this branch
- Review threads with per-entry verdicts: PR #7–#14 comments
- The sightmap.org gallery (phase 4) is live on sightmap/sightmap#172 and
  renders whatever index.json the publish workflow ships — no site work is
  needed when entries merge.
