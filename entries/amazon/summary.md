# Mapping report: amazon.com

Notes for the sightmap team from authoring this entry. Site-specific facts live
in `README.md` and in the corpus `memory:` notes.

## The finding that matters most: offline/live selector divergence

`sel-probe` earned the entry on its own here. This selector works in a browser
and silently matches nothing in the corpus:

```
$ sightmap sel-probe 'form[action="/s"]'
selector: form[action="/s"] matches: 1
offline matcher: 0 matches (snapshot/coverage/capture use this)
⚠ offline/live divergence: live DOM matches 1, but the offline matcher sees 0.
```

`form[role="search"]` matches 1 and 1. The offline matcher does not index the
`action` attribute, and `snapshot`, `coverage`, and `capture` all use the offline
matcher.

What made this expensive is how it surfaced. Coverage reported the component as
missing:

```
[Warnings]
NotFound: RecoverySearchForm — 0 matches
NotFound: RecoverySearchInput — 0 matches
NotFound: RecoverySearchSubmit — 0 matches
```

and the elements showed up as orphans, so the page reads as "my selector is
wrong" when the selector is fine. The divergence warning only appears if you
think to run `sel-probe` on that specific selector.

Two suggestions:

1. **`lint` could flag attribute selectors the offline matcher does not
   support.** If the supported attribute set is known, an unsupported one in a
   corpus selector is a static error, catchable without a browser.
2. **The `0 matches` warning could mention divergence.** When coverage reports a
   component with zero matches and the live DOM would have matched it, saying so
   turns a debugging session into a one-line fix.

Which attributes are supported would be worth documenting either way. Confirmed
working on this site: `id`, `class`, `role`, `name`, `type`, `data-*`, `id$=`,
`id^=`, `:not()`, and the child combinator. Confirmed not working: `action`.

## Other tooling notes

**Attribute-suffix and `:not()` selectors work, and are worth advertising.**
`[id$="_feature_div"]` collapsed 541 elements into one component, and
`body > div:not(#a-page)` captured 14 sentinel divs. Neither is obvious from the
authoring docs, and on a page with hundreds of generated ids they are the
difference between a corpus and a transcription.

**Coverage's `Unlabeled clusters` list remains the most useful output in the
tool.** It names elements by role and accessible name ("button Go", "textbox
Search"), which is enough to find them in the DOM. `gap` printed only
`3× generic (no text)` for the same page.

**Live counts drift between runs on ad-heavy pages.** Amazon search reported 1042
interactive nodes on one run and 1185 on the next with no corpus change, because
ad slots and lazy rails settle at different times. Coverage percentages move with
it. The orphan count was stable once the corpus was right, so the gate itself
holds; the totals beside it just should not be read as measurements.

## Process notes

**Amazon was the least defended of the large retailers tested.** No challenge, no
interstitial, no rate limiting across roughly 40 navigations. Walmart, Target,
Home Depot, Lowes, Macy's, Kohl's, Sephora, Crate & Barrel, Wayfair, Costco, and
Dick's all refused. That is worth knowing when planning which sites to seed:
being the largest target does not predict being the hardest one.

**Every duplicate id observed was a hidden variant of a visible element.** Both
Amazon (buy box) and, in the IKEA entry, the five preloaded modal hosts point at
the same underlying pattern: large sites ship several variants of a block and
hide all but one. A generic recommendation for the authoring skill would be to
filter by visibility whenever a selector that should be unique returns more than
one match, rather than reaching for `:first-of-type`.

## Suggestion for the entry format

Three entries in, the most valuable notes are consistently about how a site
*misleads* an agent — a URL that resolves to the wrong thing, an id that matches
twice, a page with no text. These sit in `memory:` today, which is right, but
there is no way to ask the corpus for them.

A `severity` or `kind` marker on memory notes (say `hazard` versus `context`)
would let `sightmap` surface just the traps for a route, and would give the
gallery something concrete to show on an entry card beyond counts. Offered as an
observation from authoring, not a request.

## Network capture

The four declared requests were mostly right about being global, but the cart
calls are not — they fire only where an add-to-cart control exists, which is
search and the product page, not the home page or bestsellers. More usefully,
each of the four routes has a content loader of its own that had not been
recorded at all.

The clearest error was `LazyWidgetContent`, matched as `/acp/*/getAjaxContentHTML`.
The real path grammar is `/acp/<widget-name>/<instance-id>/<operation>`, and
three different operations appeared across four routes, so the old pattern caught
roughly a third of the family. The widget name is the readable part and names
the page region; the instance id repeats that name with a uuid and a timestamp
and is per-render, so it is never worth matching on. This is a good argument for
capturing more than one route before writing a glob — a single route makes a
one-off look like the whole pattern.

The pass also corrected a claim written during it. A draft said reviews are
absent from the initial HTML; a fetch with no JavaScript returns eight of them.
The lazy stream lengthens that section rather than creating it, and the original
wording would have sent an agent hunting for something already on the page.

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
