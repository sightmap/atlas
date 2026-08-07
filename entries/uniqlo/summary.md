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
