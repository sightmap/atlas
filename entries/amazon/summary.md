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
