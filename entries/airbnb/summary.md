# Mapping report: airbnb.com

Notes for the sightmap team from authoring this entry. Site-specific facts live
in `README.md` and in the corpus `memory:` notes.

## A third YAML trap, and the guard that catches it

The reserved-indicator problem reported in the Nike entry has a sibling. This
note failed to parse:

```yaml
- ... the body says "Error code: 404". Path, title, and text all agree.
```

```
parse ".sightmap/not-found.yaml": yaml: line 11: mapping values are not allowed in this context
```

A plain scalar containing `": "` is read as a mapping. Quoting a phrase inside a
memory note is completely natural, and the error message points at a line number
with no hint about the colon.

So there are now two distinct ways prose breaks YAML in this corpus format, both
hit repeatedly across one batch of eight sites:

1. a scalar starting with a reserved indicator (`` ` ``, `"`, `'`, `@`, `%`, `&`)
2. a scalar containing `": "` anywhere

Both are catchable statically without a browser and both have a one-line fix
(quote or reword). Combined, they cost more time in this batch than any other
single issue. A lint rule covering both would be the highest-value small change
to come out of this work.

The pre-check I ended up with is in the batch scratch notes; the second pattern
needs care, since the naive version matches the `file:line:` prefix of its own
grep output and every legitimate `- name:` key.

## An attribute worth teaching the skill about

Airbnb puts page *structure* in `data-section-id` and interactive *controls* in
`data-testid`. A listing page's outline — TITLE, HERO, OVERVIEW, DESCRIPTION,
AMENITIES, LOCATION, REVIEWS, POLICIES, BOOK_IT — exists only in the former.
Querying only `data-testid`, which is what the authoring skill's selector
ordering leads you to do, returns the buttons and misses the document.

`suggest` has the same blind spot. Its output on this site was dominated by
`linaria-injector` (31 matches, a CSS injection point with no content) while the
section attributes never appeared. A `--attr` flag, or simply including
`data-section-id` and `data-*` attributes that partition the page, would help.

Generalizing across the batch, the sites split into three groups by where
identity lives:

| Where identity lives | Sites |
|---|---|
| `data-testid`, well-named | Amazon (`data-cy`), Nike, Airbnb (controls) |
| Class names, prefixed | IKEA, eBay, Uniqlo, Vuori |
| A separate structural attribute | Airbnb (`data-section-id`) |

The skill currently teaches one ordering for all of them.

## Coverage note

The 404 here scored `0 direct T1 (0%) · 8 scoped T2 (100%) · 0 orphaned ✓`. Zero
percent T1 with a passing gate is correct — every interactive node is inside a
mapped container and nothing needed naming individually — but "0%" next to a
green check reads like a failure at a glance. Another reason the percentages
beside the orphan count should not be surfaced as a score.

## Policy note

This is the first entry in the batch where the screenshot decision was not
automatic. Listing pages carry host names, host photos, and guest reviews, all of
which are personal data under `docs/POLICY.md`. Search results do not — they show
property titles, neighbourhoods, prices, and interior photos.

The entry ships one screenshot of search results and none of the listing page,
and the README says why. Flagging it because `docs/POLICY.md` covers this case
correctly but the authoring skill's screenshot step does not mention it, and the
natural instinct is to screenshot the most detailed page. For any site with
user-generated content, the detail page is exactly the one to leave out.

## Process note

Airbnb was the slowest entry after Amazon, and for an unusual reason: the
`anchors` heuristic used throughout this batch (find large visible regions, take
their most stable hook) returned literally one result on the search page. Every
container is a Linaria class, so there was nothing for a structural heuristic to
grab. The site is well instrumented, just not in a way that a
class-and-id-oriented pass discovers.

If the authoring skill ever gains a "how to explore an unfamiliar site" section,
"enumerate the `data-*` attribute vocabulary first, before looking at structure"
would have saved the most time here — and would have worked on every other site
in this batch too.

## Network capture

The one declared request was the search page's own document load. Capture found
that every call the site makes goes through
`/api/v3/<OperationName>/<sha256hash>`, which is Apollo persisted queries.

This is the inverse of the usual problem. The DOM here is the least legible in
the batch — Linaria class hashes that carry no meaning, plus 31 elements whose
testid is `linaria-injector` — while the traffic is the most legible anywhere in
the batch. `StaysPdpReviewsQuery`, `PlaceListingPolygonQuery`, and
`HostRecommendedPoisQuery` say what they do. On this site, reading the request
path is a faster route to understanding a page than reading its markup, and the
corpus now says so.

Two things to get right when matching them. The trailing hash pins a query
version rather than identifying a resource, so it changes on deploy and belongs
as a wildcard. And both GET and POST are in use for the same style of call, so a
method filter silently drops part of the family.

The unexpected result was the SEO city landing page. It issues one GraphQL call,
for consent flags, against nine on search and eleven on a listing page — no
header call, no client configs, no announcements, everything already in the
document. It is the cheapest surface on the site to read and the most likely to
survive a slow connection, which is worth knowing before choosing a route to
scrape. That is recorded on the view.

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
