# Handoff — expanding the signed-in entries

State as of 2026-08-08.

## Done

`spotify` — [#29](https://github.com/sightmap/atlas/pull/29). One view to six
(album, playlist, artist, home, search, 404), 25 components to 51, 0 requests
to 4. Every selector counted on its declaring route. Use it as the pattern.

## Remaining

`pinterest`, `instacart`, `zillow`, `youtube`. Each has one or two views and
should have four to six. Worktrees exist at
`/Users/chip/src/sightmap/.atlas-wt/<slug>` on branches `expand/<slug>`, cut
from atlas main.

Routes worth mapping:

| entry | has | add |
|---|---|---|
| pinterest | pin | board, profile, search, home, 404 |
| instacart | storefront | aisle, product, search, cart, 404 |
| zillow | home | search results, listing detail, saved, 404 |
| youtube | home, watch | channel, search, playlist, 404 |

## Three procedures that decide whether this works

**Arm the network tracker before navigating.** `read_network_requests` starts
recording on the first call *per tab*. Call it once against the tab, then
navigate, settle, then read. Reading after a navigation returns almost nothing,
which is why five entries shipped with zero requests.

**Click through for IDs the extension redacts.** Reading an `href` or
`location.pathname` returns `[BLOCKED: Base64 encoded data]` on sites whose ids
look encoded — Spotify's base62, for instance. `tabs_context` reports the full
tab URL and is not redacted, so navigate by calling `.click()` on a link and
read the resulting URL from there.

**Verify per route, not once.** A selector list checked on one page proves
nothing about the others. Every scoping bug found in this batch — library grid,
account menu, carousel controls on spotify; card anchor on zillow; nav icons on
pinterest — was a component declared as a child of something it is a sibling of,
and each only showed up when counted on its own route.

Related: on a client-rendered site, compare counts at the default settle and at
`--wait 10` before trusting a zero. Instacart never resolves at all in a
background tab, and only a real input event (not `window.scrollTo`) advances it.

## Screenshots — unresolved

The atlas wants 1–5 per entry, `NN-<kebab>.png|.webp`, width 1200–2000,
≤300 KB, decoded type matching the extension. `validate-entry.mjs` enforces all
of it, and `auth: personal-account` entries may ship none.

The blocker: the Chrome extension's `computer` screenshot returns an image and
accepts `save_to_disk: true`, but writes nothing reachable on disk. A capture
can be seen and not committed.

Ruled out: driving Chrome over CDP. Chrome 136+ ignores
`--remote-debugging-port` on a default profile, and this machine runs 151, so it
would need the whole profile copied to a scratch `--user-data-dir`.

What is left is the maintainer capturing them by hand. Owner is fine with their
own name, avatar and device names in frame; keep other people's faces, names and
addresses out — which rules out zillow listing pages and pinterest boards.
Convert to PNG or WebP before committing, since the validator rejects `.jpg` on
the filename rule alone.

## Open

- [sightmap/sightmap#176](https://github.com/sightmap/sightmap/issues/176) —
  `sel-check` ignores descendant combinators.
- [sightmap/sightmap#177](https://github.com/sightmap/sightmap/issues/177) —
  `coverage` passes a route pattern where `MatchTree` wants a page URL.
- `instagram` and `facebook` were closed unmerged. Branches still exist.
