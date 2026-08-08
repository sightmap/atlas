---
name: Instagram
slug: instagram
site_url: https://www.instagram.com/
domains: [instagram.com, www.instagram.com]
description: Instagram's signed-in home feed — post articles, their action rows, and the labelled icons that are the only stable navigation hooks.
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

# Instagram

One view: the signed-in home feed. 17 components, every selector counted
against the live page.

## Why this is `auth: personal-account`

There is no signed-out home feed. The posts are chosen for the account and the
content in them belongs to other people. The map bounds each post and its
controls and records nothing about who posted or what was posted — no handle,
no caption, no image, no comment. No property on this entry extracts text.

Only the author can re-verify this entry. `last_verified` means the author
re-checked with their own account; CI cannot, and neither can a reviewer.

There are no screenshots, and there could not be: every frame is other people's
photographs.

## What bites

**Nothing conventional works here.** There is no `data-testid` anywhere on the
page, no `h1` at all, and 451 distinct atomic class names of the form `x1v7wizp`
that describe styling rather than meaning. Test ids, headings and classes are
all unavailable.

**What does work is semantics and labelled icons.** `article` bounds a post, and
`svg[aria-label="…"]` names every action — Like, Comment, Share, Save,
Notifications, New post, Settings. Between them they address the whole page, and
they are the only things that do.

**The one `nav` element is the footer.** A query for `nav` returns About, Help,
Blog and Developers. The primary navigation — Home, Search, Reels, Messages —
sits in a plain `div` stack with no `nav`, no `role="navigation"`, and no
landmark of any kind. The footer nav is not inside the `contentinfo` footer
either, so it cannot be scoped under one; it is recorded in memory rather than
declared, because the only selector for it is a bare tag.

**Posts have no `header`**, so the author strip cannot be addressed that way.

**Not every post has a `time`.** Three of four did on the render mapped here, so
a timestamp is optional.

**Post permalinks outnumber posts**, since a post can carry more than one `/p/`
link. Count `article` elements to count posts.

**`svg[aria-label="Messages"]` matches twice**, so the messages icon is not a
unique address on its own.

## Coverage

17 selectors counted on the route that declares them, all matching, none dead.
One scoping guess was wrong and caught before commit: the footer nav is not
inside the `contentinfo` element.

No requests are recorded. `sightmap sel-probe` cannot attach to the browser this
was authored in, so matches were counted in-page instead.
