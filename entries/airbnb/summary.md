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
