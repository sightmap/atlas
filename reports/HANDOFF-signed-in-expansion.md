# Handoff — expanding the signed-in entries

State as of 2026-08-08. All five are done.

## Result

| entry | views | components | requests | PR |
|---|---|---|---|---|
| spotify | 1 → 6 | 25 → 51 | 0 → 4 | [#29](https://github.com/sightmap/atlas/pull/29) |
| pinterest | 1 → 6 | 19 → 59 | 6 → 12 | [#32](https://github.com/sightmap/atlas/pull/32) |
| instacart | 1 → 5 | 10 → 31 | 0 → 8 | [#33](https://github.com/sightmap/atlas/pull/33) |
| zillow | 1 → 5 | 9 → 59 | 0 → 4 | [#34](https://github.com/sightmap/atlas/pull/34) |
| youtube | 2 → 6 | 25 → 47 | 0 → 5 | [#35](https://github.com/sightmap/atlas/pull/35) |

## Four procedures that decide whether this works

**Read requests from the page, not from the extension.**
`performance.getEntriesByType('resource')` sees everything the page fetched.
`read_network_requests` does not: on Instacart it surfaced two third-party
beacons while the page had made 62 POSTs to `/graphql`, which is why that entry
originally shipped with no requests at all. Resource Timing also carries the
query string, and that is where operation names live —
`/graphql?operationName=Items` on Instacart, `source_url=<path>` on Pinterest.

Extract named fields with a narrow regex rather than returning whole URLs. The
extension redacts anything that looks base64 or like cookie data, so
`/operationName=([A-Za-z0-9_]+)/` returns the name while the full URL comes back
as `[BLOCKED]`.

**Count every selector on its declaring route, and check the parent too.** Every
scoping bug in this batch was a component declared as a child of something it is
a sibling of, and each only surfaced when counted on its own route:
`board-tools` beside the Pinterest board header rather than inside it; the
search refinement pills beside the results container; Zillow's price-history
cells, which are not descendants of `data-price-row` at all. Watch for the
inverse too — a zero can mean your first `querySelector` picked a parent that
happens not to contain the child, as with Instacart's `row-base`, where 25 of 28
rows do hold the checkbox.

**A background tab renders less than you think.** Server-rendered feeds populate
(Pinterest home and search, YouTube everywhere). Anything fetched afterwards
does not: Pinterest's profile body stays empty past 13s, a board's grid past
30s, the related grid on a pin past 19s, and Instacart's storefront never
resolves at all. The containers render either way, so the page looks loaded and
has no content. Check `document.hidden` before believing a zero, and compare a
direct load against arriving by clicking through.

**Click through for ids the extension redacts.** Reading an `href` or
`location.pathname` returns `[BLOCKED: Base64 encoded data]` on sites whose ids
look encoded. `tabs_context` reports the full tab URL unredacted, so navigate by
calling `.click()` on a link and read the resulting URL from there.

## Screenshots

Now unblocked on the spec side: `.jpg` and `.jpeg` pass validation alongside
`.png` and `.webp` ([#31](https://github.com/sightmap/atlas/pull/31)). The
decoded type still has to match the extension.

Capture is still manual. The Chrome extension's `computer` screenshot returns an
image and accepts `save_to_disk: true` but writes nothing reachable on disk, and
driving Chrome over CDP is out — 136+ ignores `--remote-debugging-port` on a
default profile and this machine runs 151.

None of the five entries ship screenshots. Every one of them is a wall of other
people's content: pins, listings, feeds, an account's delivery address.

## Open

- [sightmap/sightmap#176](https://github.com/sightmap/sightmap/issues/176) —
  `sel-check` ignores descendant combinators.
- [sightmap/sightmap#177](https://github.com/sightmap/sightmap/issues/177) —
  `coverage` passes a route pattern where `MatchTree` wants a page URL.
- `instagram` and `facebook` were closed unmerged. Branches still exist.
- YAML: a memory note may not begin with a backtick. It is a reserved indicator
  and the parser rejects the document. Two entries hit this.
