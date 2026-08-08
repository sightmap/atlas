# Mapping report: vuoriclothing.com

Notes for the sightmap team from authoring this entry. Site-specific facts live
in `README.md` and in the corpus `memory:` notes.

## A second offline/live selector divergence

The Amazon report flagged `[action="..."]` matching live and not offline. This
entry found another one, in a different category — a combinator rather than an
attribute:

```
$ sightmap sel-probe '#main-content ~ footer'
selector: #main-content ~ footer matches: 1
offline matcher: 0 matches (snapshot/coverage/capture use this)
```

The descendant combinator (`#__next footer`) and the child combinator
(`body > div:not(#a-page)`, used in the Amazon entry) both work. The general
sibling combinator does not.

Two divergences in two entries suggests the offline matcher supports a subset of
CSS that is not written down anywhere an author would find it. A short
"supported selector syntax" section in the authoring docs would prevent this
class of bug entirely. Confirmed working across this batch: `id`, `class`, tag,
`role`, `name`, `type`, `data-*`, `[attr^=]`, `[attr$=]`, `[attr*=]`, `:not()`,
descendant, child, and selector lists. Confirmed not working: `[action=...]`,
general sibling (`~`).

## Lint rules pushed back twice, both times usefully

**`broad-tag-selector` on `footer`.** Vuori's footer element has no id and no
testid, only a generic `.MuiBox-root`, so the tag name really was the only
handle. Scoping it to `#__next footer` satisfied the rule and is genuinely more
precise. Good rule, correct call.

**Contrast with `id-hash-selector`** from the Nike entry, which flagged a stable
vendor id while missing that site's real UUID mount points. Worth noting the two
together: one rule caught a real weakness, the other produced a false positive
that had to be worked around. If the lint rules get a calibration pass,
`broad-tag-selector` is the model.

## The reserved-indicator pre-check keeps paying

The grep guard written during the Nike entry stayed clean through this one
because the habit had already changed — notes now start with "The `x` element…"
rather than with the backtick. That is the shape of the fix: authors learn the
constraint once. Right now they learn it from a parse error that names a line
number and no cause. A lint rule teaches it in one step.

## Observation on entry structure

This is the fifth entry, and a pattern in the notes has firmed up. Every site so
far has at least one way of failing *silently* — returning 200 with the wrong
thing, or the right thing with no way to tell:

| Site | Silent failure |
|---|---|
| eBay | `/b/` name segment decorative; mismatched pair serves an unrelated category |
| IKEA | bad category id redirects to the root catalog |
| Amazon | 404 has no text at all; duplicate ids in the buy box |
| Nike | discontinued product returns 200 with a full page; 404 merchandises |
| Vuori | 404 has an empty `document.title`; unknown handle lands there silently |

Not one of these is discoverable from a status code, and several are invisible to
a check on page text. This is the single most valuable category of thing the
atlas records, and it is currently spread across `memory:` notes with no way to
ask for it.

Repeating the suggestion from the Amazon report with more evidence behind it: a
`kind: hazard` marker on memory notes would let `sightmap` answer "what will
silently mislead me on this route" and would give the gallery something to show
on an entry card that counts cannot convey.

## Process note

Vuori was the fastest entry in the batch despite having the most third-party
widgets (OneTrust, Klaviyo, Medallia, Algolia). Third-party widgets are cheap to
map because they announce themselves — `#onetrust-consent-sdk`,
`.klaviyo-form`, `#kampyleButtonContainer` are all obvious and stable. What
costs time is a site's *own* markup being unstable, which is the opposite of
where a mapper would expect the effort to go.

## Network capture

The one declared request was the search page's own document load. What capture
found instead is the most consequential thing in this entry, and arguably in the
batch.

Vuori is Next.js, and every route's props are addressable as JSON at
`/_next/data/<buildId>/en-US/<same path as the page>.json`. Fetching a product's
data URL with curl — no browser, no JavaScript — returns 165 KB of structured
product data. For anything an agent wants from this site, reading that beats
walking the DOM, and the DOM here is Linaria-style compiled classes plus MUI
internals, so the gap is wide.

Two details make it usable. The build id changes on every deploy and is read
from `__NEXT_DATA__.buildId` in any page's HTML. And because Next prefetches
these for links in the viewport, the set of requests a page makes enumerates
every link it offers — scrolling a collection yields the data for its products
without parsing a single card.

There is a nice loop closed here. The corpus already documented a broken skip
link whose href resolves to `/products/meta-pant-oxblood.json#main-content`
rather than to an anchor on the current page. That is this same endpoint,
arrived at from the DOM side. The bug and the API are the same fact seen twice,
and neither pass recognized the other until the traffic was captured.

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
