---
name: Zillow
slug: zillow
site_url: https://www.zillow.com/
domains: [zillow.com, www.zillow.com]
description: Zillow mapped signed in — landing page, search results, listing detail, saved homes and the 404, with the three incompatible card conventions between them.
categories: [commerce]
author: chiplay
created: 2026-08-08
updated: 2026-08-08
last_verified: 2026-08-08
cli_version: 0.19.0
spec_version: 1
method: browser
auth: personal-account
---

# Zillow

Five views: the signed-in landing page, search results, a listing, saved homes,
and the 404. 59 components and 4 requests, every selector counted on the route
that declares it.

## Personal data

An earlier version of this entry stopped at the landing page, because listing
pages carry home addresses and agent contact details. Listing detail is mapped
here, under a narrower rule that fits the rest of the atlas: selectors and what
they mean are recorded, values are not. The agent block is declared as
structure with an explicit note that everything inside it is a named person's
contact details. No address, price, phone number or agent name appears anywhere
in the corpus, and the one listing URL present is a public for-sale listing.

## Why this is `auth: personal-account`

The landing carousel is a set of homes recommended to the account, and saved
homes is the account's own list. Both are mapped as structure and neither is
recorded.

Only the author can re-verify this entry. `last_verified` means the author
re-checked with their own account; CI cannot, and neither can a reviewer.

There are no screenshots. Every frame of every route shows real homes.

## What bites

**Three routes, three card conventions.** Landing recommendations are
`home-rec-card-N`, search results are `property-card`, saved homes are
`PropertyListCard-wrapper`. No card selector works across all three — and on a
listing page `property-card` matches five *other* homes, the similar-homes rail,
not the listing being viewed.

**The two facts you want on a listing have no test id.** Nothing matches
address at all, and `price` matches only history-table cells and a filter
button. Read them from the `h1` and the document title.

**`data-price-row` is not a row.** It is a `span` holding one price. The real
row is a `tr` with no test id, so `data-price-row`, `price-money-cell` and
`date-info` are three flat lists that have to be zipped by index.

**Half the page renders twice.** `bed-bath-sqft-text__container` matches six for
three facts, once inline and once in the sticky bar, and the media tab strip
ships two copies of itself. `footer` matches two on search results and three on
a listing.

**The search bar is on the landing page only.** Search results, listing detail,
saved homes and the 404 have none, so its absence is not a failed load.

**A sign-in control does not mean signed out.** `reg-login` renders on search
results and on the 404 in a signed-in session.

**Search filters are path segments, not query parameters.** `for_sale`,
`fore_lt` and `1_open` stack into the path and the location ends in `_rb`, so a
search is composed as a URL. The list holds nine cards whatever the heading
claims, and pages rather than scrolls.

**The 404's title is the empty string** — the only route where that is true, and
the cheapest test for it. Its `h1` reads "Uh oh, something broke."

## Coverage

All 59 selectors counted on their declaring route: listing 24, search 15, saved
10, landing 6, 404 2, plus the globals. Two mistakes were caught this way and
fixed — the price-history cells are not descendants of `data-price-row`, and the
search bar is not global. Two earlier claims were corrected against a second
load: the landing carousel's card count varies by session, and so does the badge
overcount.

`sightmap sel-probe` cannot attach to the browser this was authored in, so
matches were counted in-page instead. Requests were read from the page's own
Resource Timing entries.
