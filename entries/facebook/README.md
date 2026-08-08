---
name: Facebook
slug: facebook
site_url: https://www.facebook.com/
domains: [facebook.com, www.facebook.com]
description: Facebook's signed-in home route — the three labelled navigation regions, search, and the ARIA roles that are the only usable hooks.
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

# Facebook

One view: the signed-in home route. 8 components, every selector counted against
the live page.

This is a deliberately small entry. What it maps is the durable chrome, and what
it records is why more than that could not be mapped honestly in this session.

## Why this is `auth: personal-account`

There is no signed-out home route. Everything the page shows is either the
account's own notifications or other people's posts, so the map bounds regions
and records nothing inside them. No property on this entry extracts text from
content.

Only the author can re-verify this entry. `last_verified` means the author
re-checked with their own account; CI cannot, and neither can a reviewer.

There are no screenshots, and there could not be.

## What bites

**No test ids, and 688 atomic class names.** Nothing on the page is addressable
by test id or class. ARIA roles and labels are the only usable hooks, and this
entry is built entirely from them.

**There is no `article` element.** Posts and notification rows are
`div[role="article"]`. The element selector matches zero; the role selector
works.

**Navigation is three separate regions, not one.** `div[role="navigation"]`
returns all three, and the `aria-label` — `Facebook`, `Shortcuts`, `Account
Controls and Settings` — is the part that disambiguates.

**There is no `role="search"` landmark.** Search is an `input[type="search"]`
carrying `role="combobox"`. Six inputs exist on the page and one is visible, so
an unfiltered input query returns five that cannot be typed into.

**Timestamps are `aria-label` strings** such as `3 hours ago`, on links. There
are no `time` elements and no `datetime` attributes, so only a relative string
is available.

**The banner region is invisible.** `div[role="banner"]` matches but measures
zero, so it will pass a presence check and fail a visibility one.

**The home route does not always show the feed.** On the render mapped here it
showed the notifications panel, and the two `div[role="article"]` matches were
notification rows with no image, no action buttons, and no post permalink. Test
what the main region actually holds rather than assuming.

## Coverage

8 selectors counted on the route that declares them, all matching. One was
wrong on the first pass and caught before commit: `[role="search"]` matches
nothing, and an earlier probe that appeared to confirm it had combined two
selectors so the input matched while the role did not.

No feed rendered while the tab was in the background, so counts from this route
are a floor rather than a total. No requests are recorded.
