---
name: Instacart
slug: instacart
site_url: https://www.instacart.com/
domains: [instacart.com, www.instacart.com]
description: Instacart mapped signed in — storefront, aisle, product, in-store search and the 404, plus the GraphQL operations behind them.
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

# Instacart

Five views: a retailer storefront, an aisle, a product, in-store search, and
the 404. 31 components and 8 requests, every selector counted on the route that
declares it.

## Why this is `auth: personal-account`

Nothing here renders without a chosen retailer and a delivery address, which
means a signed-in session. The header carries that address, the fulfilment
window and the cart count; the cart drawer carries the delivery ZIP. All of it
is mapped as structure and none of it ships.

Only the author can re-verify this entry. `last_verified` means the author
re-checked with their own account; CI cannot, and neither can a reviewer.

There are no screenshots. The header shows the account's street address in every
frame, and the rule is to drop the frame rather than retouch it.

## What bites

**The storefront never finishes loading.** Rows below the first mount as
skeletons and stay that way, and the placeholder count *rises* as more sections
mount — 38 placeholders against 5 items ten seconds in, 76 against 23 on a tab
left open. This is specific to `/storefront`: aisle, product and search pages
all resolve. Read items from a collection or a search instead.

**Scripted scrolling does not trigger the lazy load.** `window.scrollTo` moved
the viewport and mounted nothing; a real scroll event rendered the next row.
Drive this page with input events, not with injected script.

**Every view is the same endpoint.** One collection page fired 62 POSTs to
`/graphql` across 57 distinct operations. Unlike most GraphQL sites the
operation name is in the query string — `/graphql?operationName=Items` — so the
network log can be filtered by operation without reading a single body. Seven
cart operations fire on every route whether or not the cart is open.

**Item cards are addressed three different ways.** The storefront gives them a
test id that embeds the item id (`item_list_item_items_45295-<itemId>`), a
collection gives them no test id at all, and a product page's recommendation
carousels go back to the storefront's. The product link is the only handle that
works everywhere — and the anchor carries `role="button"`, so an accessibility
query for links misses every item on the page.

**Price is not addressable.** Every price is a bare `span` with a generated
class. There is no test id, and the classes change between builds.

**The cart is a drawer, not a route.** Opening it leaves the URL unchanged, and
the drawer sits in the DOM whether or not it is open, so matching it proves
nothing. Eight `[role="dialog"]` elements are present at once, most with no
label; only `aria-label="Cart"` picks it out.

**Two test ids are not what they look like.** `row-base` covers the sort list
and the facet list alike — 25 of 28 rows had a checkbox and 3 were sort
options — and `submit-button` matches twice on a single product page.

**The store search input holds the query on the `value` property, not a `value`
attribute**, so an attribute read comes back empty on every route.

## Coverage

All 31 selectors counted on their declaring route: search 6, storefront 4,
product 4, collection 3, plus the globals on each. The item-card container on a
collection page turned out not to be addressable at all — 45 `li` on the page
against 18 items — so it is documented rather than declared.

Requests were read from the page's own Resource Timing entries. The browser
extension's network capture surfaced only two third-party beacons across every
route, which is why the previous version of this entry recorded no requests.

`sightmap sel-probe` cannot attach to the browser this was authored in, so
matches were counted in-page instead.
