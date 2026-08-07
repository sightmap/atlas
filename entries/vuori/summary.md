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
