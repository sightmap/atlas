# Mapping report: apple.com

Notes for the sightmap team from authoring this entry, and the closing report for
this batch of eight. Site-specific facts live in `README.md` and in the corpus
`memory:` notes.

## Route ambiguity is a corpus-modelling problem the tooling could help with

Apple's marketing pages live at `/:productSlug` and its error page keeps the
requested path. So `/no-such-page` and `/macbook-air` have identical route
shapes, and coverage happily reported the 404 as `[View: ProductMarketing]` with
92 orphans — which reads as "my selectors are wrong" rather than "my routes
overlap".

I resolved it by probing the error view with a multi-segment URL and documenting
the structural tell (`#ac-localnav`). That works, but the diagnosis took a while
because nothing pointed at the route as the problem.

Two things would have shortened it:

- **Report the matched route, not just the view name.** `[View: ProductMarketing]`
  becomes obviously wrong if it reads `[View: ProductMarketing route:/:productSlug]`
  next to a URL of `/no-such-page-xyz-123`.
- **Warn when a probe URL matches a view other than the one that declares it.**
  Every view carries a `url:`. If `coverage` notices that a view's own example URL
  resolves to a different view, that is a route-overlap bug and it is detectable
  without any browser work.

## A hazard worth a skill note: locale in the path

Apple's first path segment is a locale code, and it changes the language of the
response including errors:

| URL | Title |
|---|---|
| `/zzz/such/page-xyz-123` | Page Not Found - Apple |
| `/fr/nope-xyz` | Page introuvable - Apple |
| `/no/such/page-xyz-123` | Finner ikke siden – Apple |

I found this by accident, because the throwaway path I use for probing 404s
(`/no/such/page`) begins with Norway's country code. Any agent that detects
errors by matching message text is exposed to this, and so is any mapper who
picks an unlucky probe path.

Concrete suggestion for the authoring skill: recommend a probe path that cannot
collide with a locale or a route segment — something like
`/zz-sightmap-probe-404` — rather than the natural-language `/no-such-page` the
skill currently suggests.

## Closing notes on the batch

**Eight entries shipped, four candidates rejected.** The rejections were as
informative as the entries, and each failed differently:

| Site | Failure |
|---|---|
| Instacart | full storefront in the DOM behind an `aria-modal` login dialog |
| Home Depot | homepage renders, every deep route returns "Error Page" |
| Target | never finishes loading; resolves to "Something went wrong" |
| Best Buy | product pages blank, search stuck on 400 skeleton placeholders forever |

Of 22 well-known sites gated, 9 were usable. That ratio is worth knowing before
anyone plans a seeding sprint, and the three-layer gate (curl status, then
homepage render, then deep routes plus a blocking-modal check) is what
distinguished them. Only the third layer is reliable.

**The single highest-value change to come out of this work** is a lint rule for
the two YAML prose traps — a scalar starting with a reserved indicator, and a
scalar containing `": "`. Between them they broke the build five times across
eight entries, always with an error naming a line and never a cause, and both are
statically detectable.

**The second is documenting the offline matcher's supported selector syntax.**
Two divergences turned up (`[action=...]` and the `~` combinator), each costing a
debugging round because coverage reports the component as simply not matching.
Confirmed working across the batch: `id`, `class`, tag, `role`, `name`, `type`,
`data-*`, `[attr^=]`, `[attr$=]`, `[attr*=]`, `:not()`, descendant, child, and
selector lists.

**The recurring theme across all eight entries** is that every site has at least
one way of failing silently — 200 with the wrong content, or the right content
with no way to confirm it:

| Site | Silent failure |
|---|---|
| eBay | mismatched `/b/` name and id serves an unrelated category |
| IKEA | bad category id redirects to the root catalog |
| Amazon | 404 has no text; duplicate ids in the buy box |
| Nike | discontinued product returns a full 200 page; 404 merchandises |
| Vuori | 404 has an empty `document.title` |
| Uniqlo | landing page redirects by stored gender preference |
| Airbnb | section ids carry experiment variants |
| Apple | 404 language follows the URL; marketing and store look alike |

None is discoverable from a status code and several are invisible to a text
check. This is the most valuable thing the atlas records, and it is currently
spread across `memory:` notes with no way to query for it. A `kind: hazard`
marker would let `sightmap` answer "what will silently mislead me here" and give
the gallery something to show that view counts cannot.

## Network capture

The one declared request was the search page's own document load. Capture across
four routes found ten real endpoints and confirmed what the page structure
suggested — this is the quietest site in the batch, and its marketing pages are
close to static.

The interesting result is that the traffic splits along exactly the seam the
class prefixes already showed. `globalnav-` chrome is shared; `rf-serp-` and
`rf-bfe-` belong to the store. The traffic agrees, and goes further: the two
systems request the same endpoint under different paths. Marketing pages call
`/us/shop/bag/status` with the locale in front, store pages call
`/shop/bag/status` without it. A glob anchored to either alone covers half the
site, and nothing in the markup would tell you that.

The one place the two systems meet is the price on an editorial page. It is
fetched from the store, twice — once at `/us/shop/mcm/product-price` for
consumer pricing and once at `/us-edu/shop/...` for education pricing — so the
"From $999" on screen is selected after both responses arrive rather than being
authored into the page. That is a single point of coupling between two otherwise
independent systems, and it only shows up in traffic.

This is the same two-shell structure reported as feedback on the shells
proposal, now visible in a second signal. A shell definition that could be
matched against the network side as well as the DOM would have caught it from
either direction.

### What the pass changed across all eight entries

Every request in this batch was originally declared at the file root, which
makes it global. The consumer counts global and view-scoped requests separately,
so each entry reported zero requests on every view — the corpus said the sites
made no per-page calls, which was false everywhere. Re-capturing four routes per
site took the batch from 20 requests to 106.

Five of the original 20 were the page's own document load, written up as though
fetching the search page were an API call. They existed because a non-empty
`requests:` block looked better than an absent one. An absent block is the
honest output when a route fetches nothing; a padded one costs an agent a real
lookup for no information.

### Traps worth putting in the authoring skill

**The network buffer is not cleared between navigations.** Capturing route A,
navigating to route B, and reading the buffer attributes A's traffic to B. It
looks plausible, which is what makes it dangerous — the first IKEA capture had
product-page fetches filed under search, and only the `oref` parameter on an
unrelated ad beacon gave it away. The fix is to record the highest request index
before navigating and drop anything at or below it.

**"Server-rendered" and "has no API" are different claims, and both need
evidence.** Three drafts in this pass asserted that content was fetched when it
was already in the document, or the reverse. `grep -c` counts matching lines
rather than occurrences, and minified HTML puts everything on a handful of
lines, which made a page with 24 product cards look like it had one. Fetching
the URL with no JavaScript running and counting real occurrences settles it in
one command, and should be a step rather than an inference.

**Some endpoints are conditional and will not reproduce.** eBay's below-results
carousel fired on one visit to a search URL and not on the next, from the same
profile. Its placeholder containers are in the document either way and do not
change size, so the DOM cannot be used to tell whether it loaded. Anything seen
once should be described as conditional unless a second visit confirms it.

### A schema gap this exposed

Requests attach to a view or to the file root, and several of these belong to
neither. IKEA fetches one HTML fragment per product card to fill its carousels,
which happens on the home page, category browse, and product pages but not on
search — the request belongs to the carousel, not to any of the three views. The
same happens on eBay, where search and category browse share two endpoints
because both are served by the search stack.

The only way to express that today is to declare the request once per view,
which is duplication that a reader cannot distinguish from three unrelated
endpoints that happen to share a path. This is the same shape as the shells
problem: the corpus can say "global" or "this one view", and the interesting
cases are in between.
