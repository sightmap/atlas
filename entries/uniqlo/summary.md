# Mapping report: uniqlo.com

Notes for the sightmap team from authoring this entry. Site-specific facts live
in `README.md` and in the corpus `memory:` notes.

## Two ways a design system ruins `data-testid`, and this batch found both

Uniqlo and Vuori fail in opposite directions, and seeing them next to each other
is more useful than either alone.

| | Uniqlo | Vuori |
|---|---|---|
| Testid names | design-system primitives | page content |
| Example | `ITOTypography` | `Seaside Short 8" \| Nautical` |
| Matches | 574 on one page | exactly one, until the copy changes |
| Fails because | identifies a type, never an instance | changes with merchandising, and contains a quote |

Neither is usable as a hook. In both cases the durable identity was in the class
names — `fr-ec-product-tile` at Uniqlo, `product-card__title` at Vuori — which
inverts the usual advice to prefer test hooks over classes.

That advice appears in the authoring skill as a flat ordering (`data-testid`
first, then `aria-label`, then stable ids, then classes). Three of the eight
sites gated in this batch break it. A more accurate rule would be: prefer the
hook whose *name describes the thing*, whatever attribute it lives in, and check
the match count before trusting any of them. A testid matching 574 elements is
not a hook, and `suggest` could say so by showing counts next to candidates.

## A view that could not be probed, and what I did about it

Uniqlo's landing page has three addresses (`/us/en/`, `/us/en/men`,
`/us/en/women`) and which one you get depends on a client-side gender preference.
I first mapped `Home` at `/us/en` and `GenderHome` at `/us/en/:gender`. Once the
profile had browsed men's, `/us/en/` redirected away every time and the `/us/en`
view became unreachable — so I could not honestly `sel-probe` it or claim
`last_verified` coverage on it.

I collapsed the two into one view at `/us/en/:gender` and documented all three
addresses in its memory. Flagging the reasoning because it is a judgment an
author has to make and the docs do not cover it: a view you cannot reach is worse
than no view, since it inflates the count while quietly never matching.

Related: a route that never matches is currently invisible. `validate` accepts
it, `lint` accepts it, and coverage only tells you if you happen to probe that
exact URL. A `sightmap report` line for "views that matched nothing in this run"
would surface it.

## Coverage note

Interactive-node counts on this site are very large — 1717 on search, 1651 on a
product page — largely because the navigation renders three times (desktop,
mobile, sticky) and the design system wraps everything in primitives. The
orphan count stayed reliable throughout, but the percentages beside it are close
to meaningless when 95% of nodes are T2-scoped under a layout wrapper.

This is the third entry where I have noted that the totals are not measurements.
If the gallery ends up showing coverage percentages per entry, they will read as
a quality score and they are not one. The orphan count is the real signal, and it
is binary.

## Correction from earlier in this batch

The Vuori report suggested documenting the offline matcher's supported selector
syntax. Adding one confirmed data point from this entry: selector lists
(`a, b, c`) work in both matchers, used here for
`div[aria-label="Men carousel"], div[aria-label="Women carousel"]` in the Vuori
corpus and for the multi-host modal selectors in IKEA's.

## Process note

Uniqlo took the fewest iterations of any entry after Nike, for one reason: the
template class on the content root removed all page-type ambiguity. Every other
site in the batch required inferring page type from URL shape plus a structural
check, and two of them (Nike's discontinued product, eBay's mismatched category)
have cases where that inference is simply wrong.

If there is ever a "what makes a site agent-friendly" writeup for the atlas, a
page-type marker in the DOM is the single highest-value thing a site can do, and
Uniqlo is the example to point at.

## Network capture

The one declared request was the search page's own document load. Capture found
a versioned commerce API under `/us/api/commerce/v5/en/` that every view draws
on, and the product page alone makes eight calls.

Uniqlo repeats Nike's pattern independently. Both path parameters the product
page needs are in the URL — for `/us/en/products/E465185-000/00` the product id
is `E465185-000` and the price group is `00` — so variants, reviews, similar
products, and both photo collections are all constructible from the address bar.
Two sites out of eight doing this by coincidence is unlikely; it is worth
checking for on every product page as a matter of course.

Listing and search post to one endpoint that differs only in whether it carries
a query or a taxonomy filter, which matches the DOM finding that the two views
share a component vocabulary. Their recommendation strips, by contrast, use
different endpoints — `ranked-products` on the listing views and `products` on
the product page. The views look more alike than they are.

The existing claim that tiles arrive in the HTML held up: a fetch with no
JavaScript returns 24 product links. The search endpoint serves filtering and
paging rather than first paint.

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
