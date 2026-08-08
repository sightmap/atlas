---
name: Spotify
slug: spotify
site_url: https://open.spotify.com/
domains: [open.spotify.com]
description: Spotify's web player mapped signed in — album, playlist, artist, home, search and the 404, with the playback chrome around them.
categories: [media]
author: chiplay
created: 2026-08-08
updated: 2026-08-08
last_verified: 2026-08-08
cli_version: 0.19.0
spec_version: 1
method: browser
auth: personal-account
---

# Spotify

Six views of the web player: album, playlist, artist, home, search results and
the 404. 51 components, 4 requests, every selector counted on the route that
declares it.

## Why this is `auth: personal-account`

The web player renders the same chrome signed in or out, but the signed-in build
is the one people delegate to. The library rail, the account menu and the
playback bar are documented as structure — the map records that they exist and
what shape they have, never what is in them.

Only the author can re-verify this entry. `last_verified` means the author
re-checked with their own account; CI cannot, and neither can a reviewer.

## What bites

**One endpoint serves every view.** `api-partner.spotify.com/pathfinder/v2/query`
is a POST that fetches album, artist, playlist, search and home alike. The
operation is named in the request body, so the URL alone never tells you which
view issued it — request-based view detection does not work here.

**The document title is the playing track, not the page.** Over one mapping
session it read three different things while the route never changed. Read
`[data-testid="entityTitle"]` instead.

**Album, playlist and artist do not share a shape.** Album and playlist both
carry `entityTitle` and `action-bar` but sit in different containers,
`album-page` and `playlist-page`. Artist has **no `entityTitle` at all** — its
name is a bare `h1`. Test the container, not the header.

**Search results use none of it.** Every row, whatever its type, is built from
the generic set `media`, `preTitle`, `title`, `subtitle` and `trailing` — 48 of
each on one query — so one selector set covers tracks, artists, albums and
playlists, and none of them says which type a row is.

**The 404 is not the web player.** No `data-testid` anywhere, no `main`, and
none of the global chrome — no nav rail, no top bar, no playback bar. Every
global component in this corpus is absent, which is the test that identifies the
route.

**Album artwork is not in the album.** Neither `cover-art-image` nor
`entity-image` matches inside `[data-testid="album-page"]`. All three
`cover-art-image` nodes belong to the playback widget, so reaching for the album
cover returns the playing track's art.

**The account menu is in the nav rail, not the top bar**, and the library grid is
a root-level sibling of the nav, inside neither. Carousel next and previous
controls are likewise siblings of the scroller rather than children.

**The playlist table is virtualised.** Rows outside the viewport are absent
rather than hidden, and `tracklist-row-placeholder` marks those still to render,
so a row count is what is on screen and not the playlist length.

**A hidden language dialog** ships on every page and contributes 74
`language-option-*` testids, so a testid census overcounts by that much.

## Coverage

All 51 selectors counted on their declaring route: album 17, playlist 6, artist
6, home 8, search 5, plus the globals. Three scoping mistakes were caught this
way and fixed — the library grid, the account menu, and the carousel controls,
each declared as a child of something it is actually a sibling of.

`sightmap sel-probe` cannot attach to the browser this was authored in, so
matches were counted in-page instead. No screenshots: the capture tooling
available here can display an image but cannot write one to disk.
