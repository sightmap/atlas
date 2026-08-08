---
name: Pinterest
slug: pinterest
site_url: https://www.pinterest.com/
domains: [pinterest.com, www.pinterest.com]
description: Pinterest mapped signed in — home feed, search, board, pin detail, profile and what a dead path renders instead of a 404.
categories: [social]
author: chiplay
created: 2026-08-08
updated: 2026-08-08
last_verified: 2026-08-08
cli_version: 0.19.0
spec_version: 1
method: browser
auth: personal-account
---

# Pinterest

Six views: home, search, board, pin detail, profile, and the path that resolves
to nothing. 59 components and 12 requests, every selector counted on the route
that declares it.

## Why this is `auth: personal-account`

Every feed here is assembled for the account, and the header carries its avatar
and notification badge. All of it is mapped as structure — the entry records
that the containers exist and what shape they have, never what is in them.

Only the author can re-verify this entry. `last_verified` means the author
re-checked with their own account; CI cannot, and neither can a reviewer.

There are no screenshots: a Pinterest feed is other people's photographs end to
end.

## What bites

**Half the site does not render in a background tab.** Home and search ship
their feeds inside the document and populate fine. Everything fetched
afterwards does not: the profile body stays empty past thirteen seconds, a
board's pin grid past thirty, the related grid on a pin past nineteen. The
containers all render, which is what makes it dangerous — the page looks
loaded and has no content. Foreground the tab, or navigate to a board from
inside the app rather than by URL.

**There is no 404.** A missing board redirects to the home feed at
`/?show_error=true` and says nothing else, so an agent following a stale link
reads home as the board. A missing user renders the same chrome-only page as a
real profile — same title shape, same empty body, same test ids — so "no such
account" and "did not render" are indistinguishable from the DOM.

**The settle marker is gone.** `closeup-data-loaded` was present in an earlier
build of the pin page and no longer exists. Nothing replaced it.

**`/resource/ApiResource/get/` is a proxy for the v3 REST API.** The real path
and the exact field list ride inside the `data=` parameter as `options.url` and
`options.data.fields`, so the request URL says nothing about what was asked
for. Every `/resource/` call does carry `source_url=<path>`, which makes the
issuing route readable — unusual, and useful.

**A hidden `fb.html` iframe posts account identifiers to Meta.** The query
string on `facebook.com/tr/` carries email, first name, last name and country,
hashed and also partially masked. A route to recognise and never a payload to
read.

**Card type is a test id, not an attribute.** Each card holds exactly one
`pincard-<type>-with-link` or `-without-link`; `oneTap` marks a promoted card.
The promoted share swings hard — 3 of 25 cards on one home render and 13 of 25
on the next, and 14 of 18 on a search.

**Two nested elements carry save-button test ids**, `pin-better-save-button`
and `PinBetterSaveButton`, so a census counts one control twice. Two board
controls carry their visible label as the test id: `Organize` and
`More ideas`, spaces and capitals included.

## Coverage

All 59 selectors counted on their declaring route: pin detail 15, board 13,
search 8, home 6, plus the globals on each. Two scoping mistakes were caught
this way and fixed — `board-tools` sits beside the board header rather than
inside it, and the search refinement pills are a sibling of the results
container rather than a descendant. The left rail turned out to have no test id
or aria-label at all, so its entries are addressed individually.

`sightmap sel-probe` cannot attach to the browser this was authored in, so
matches were counted in-page instead.
