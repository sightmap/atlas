---
name: YouTube
slug: youtube
site_url: https://www.youtube.com/
domains: [youtube.com, www.youtube.com]
description: YouTube mapped signed in — home, watch, search, channel, playlist and the 404, and the attribute that tells three of them apart.
categories: [media]
author: chiplay
created: 2026-08-08
updated: 2026-08-10
last_verified: 2026-08-08
cli_version: 0.19.0
spec_version: 1
method: browser
auth: personal-account
---

# YouTube

Six views: home, watch, search results, a channel, a playlist, and the 404. 47
components and 5 requests, every selector counted on the route that declares it.

## Why this is `auth: personal-account`

The home feed is assembled entirely for the account, and the watch page's
related column is too. Both are mapped as structure. Nothing about the account
ships: no watch history, no subscriptions, no recommendations, no identity.
Where a container holds account data, the map says the container exists and its
memory note says what is inside belongs to the account.

Only the author can re-verify this entry. `last_verified` means the author
re-checked with their own account; CI cannot, and neither can a reviewer.

Three screenshots ship — home, watch, channel — captured signed in. They show
the account's recommended feed, which is the point of a signed-in map, plus
published videos and their creators' own channel names and thumbnails. None of
them was retouched.

## What bites

**Three routes share one element.** Home, channel and playlist are all
`ytd-browse`. Only its `page-subtype` attribute — `home`, `channels`,
`playlist` — separates them. Search is the exception that uses its own renderer,
`ytd-search`.

**The search field is a `textarea`, not an `input`.** It is
`textarea[role="combobox"]` inside `form[action="/results"]`. The selector
everyone reaches for, `input[name="search_query"]`, matches nothing. There are
only two `<input>` elements on the whole home page, both hidden checkboxes.

**Video rows use two renderers at once.** Search results carry both
`ytd-video-renderer` and `yt-lockup-view-model` on the same page, so counting
either alone undercounts. On a playlist the legacy
`ytd-playlist-video-renderer` matches nothing at all — the rows are
`yt-lockup-view-model`, the same element home and search use — so an old
playlist selector silently returns an empty list.

**Subscribe is two different elements.** A channel page uses
`yt-subscribe-button-view-model`; a watch page uses
`ytd-subscribe-button-renderer`. Neither matches on the other route.

**Ids are not unique.** `#content` matched 46 elements on home and 12 on a watch
page. `getElementById` returns an arbitrary one. The icon sprite also owns
generic ids — `#add`, `#alarm`, `#accessibility` and dozens more resolve to
invisible sprite symbols rather than controls.

**The watch page renders two or three copies of its own controls** — title, like
button, description, comments — and hides all but one. For the like button the
*first* match in document order is the hidden one, so an unscoped
`querySelector` returns the wrong element. Scope to `#above-the-fold`. A
playlist does the same thing with its title, in three `h1` elements.

**Headings identify almost nothing.** Every `h1` is empty on home and on search.
A channel's name is a non-empty `h1` but not the first one in document order.

**Comments start at zero.** `ytd-comment-thread-renderer` matches nothing until
the page is scrolled to the comment section. An empty count means not loaded,
not a video without comments.

**The 404 is not the app.** No `ytd-app`, no masthead, no `ytd-` or `yt-`
element of any kind, eleven elements in the whole document, and no body text or
heading. Only the title says "404 Not Found". Testing for `ytd-app` is the
cheapest way to tell a 404 from a route that has not finished rendering.

**Nothing fetches the first page.** On a fresh load only `guide`, `player`,
`log_event` and the stats endpoints appear — no browse or search call — because
the first page of results is already in the document.

**Two mastheads exist.** The variant seen through this mapping carries a Back
button and no avatar button at all, at a 1768px viewport on every route; a
variant with `#avatar-btn` appeared once and could not be reproduced. No account
control is declared here as a result.

## Coverage

All 47 selectors counted on their declaring route: watch 13, search 9, channel
8, playlist 6, home 5, 404 1, plus the globals. Requests were read from the
page's own Resource Timing entries.

`sightmap sel-probe` cannot attach to the browser this was authored in, so
matches were counted in-page instead. Feed counts settle slowly and vary by
viewport: the home grid read 42 items in one session and 3 in another, so treat
item counts as viewport- and session-dependent rather than fixed.
