# Mapping report: nike.com

Notes for the sightmap team from authoring this entry. Site-specific facts live
in `README.md` and in the corpus `memory:` notes.

## The YAML reserved-indicator trap is worth fixing

This is the third and fourth time it bit in one batch. A memory note beginning
with a backtick fails as:

```
parse ".sightmap/wall.yaml": yaml: line 18: found character that cannot start any token
```

It keeps happening for a structural reason: memory notes are prose *about
selectors*, and selectors are written in backticks, so starting a sentence with
one is the natural phrasing. The error names a line but not a cause.

After hitting it a third time I wrote a four-line pre-check:

```bash
grep -rnE '^[[:space:]]*-[[:space:]]*[`"'"'"'@%&*!|>]' .sightmap/*.yaml
```

It immediately found a fourth instance I had not yet run into. That is about as
strong a case as a lint rule gets: cheap to implement, catches a real and
recurring error, and the fix is a reword. Suggested message: "memory note starts
with a YAML indicator character — quote the string or reword."

## A lint false positive worth calibrating

`id-hash-selector` fired on `#embedded-messaging`:

```
warn [id-hash-selector]: EmbeddedMessaging: selector "#embedded-messaging":
  selector uses potentially auto-generated #id (brittle)
```

That id is a fixed Salesforce container, stable on every route and every load.
Meanwhile the rule stayed quiet on `#commerce-header-v2-wrapper`, `#ciclp-app`,
`#Wall`, `#pdp_product_title`, and `#__next-route-announcer__`, which suggests
the heuristic keys on shape rather than on evidence.

The genuinely unstable ids on this site look nothing like what the rule caught.
Nike mounts each feature module into a div whose id is a bare UUID:

```
#7a977deb-dae0-48d5-9b14-bf2d243dadcf   ← privacy consent module
#428b8866-35c4-4234-be4e-f8bf01a8ea7e   ← playcard module
#bcc657a7-5008-4d26-8caa-b06710c415f5   ← async chat module
```

with the module's name appearing only on the paired
`#<name>-module-script-<uuid>`. React `useId` output (`#:r0:`, `#:r1:`) is the
other real offender.

If the rule matched UUIDs, `:rN:`-style React ids, and long hex runs, it would
catch the actual hazards and stop flagging ordinary kebab-case ids.

Two things made this worse than a stray warning.

**CI and CONTRIBUTING disagree about whether warnings are allowed.**
`CONTRIBUTING.md` says `sightmap lint` passes "with any warnings justified by a
note in the README", and the authoring skill says the same. But
`scripts/validate-entry.mjs` fails the entry outright:

```
FAIL sightmap-lint — warn [id-hash-selector]: ...
sightmap lint: 1 lint warning(s)
FAIL (1 failed check(s))
```

So the documented escape hatch does not exist. Either the docs should stop
promising it or the script should accept warnings when the README explains them.
Worth deciding before outside contributors hit it, because right now the advice
in CONTRIBUTING leads to a red PR.

**The rule is bypassable by rewriting the selector.** `#embedded-messaging`
warns; `[id="embedded-messaging"]` does not. Both match the same one element,
live and offline. This entry uses the attribute form and says so plainly in the
README rather than hiding it, but a rule that a cosmetic rewrite defeats is
teaching authors to reformat rather than reconsider.

## Coverage notes

**`ProductCard` reported `(79) — exhausted, see component memory note`.** The
truncation of the T2 list is fine, but it took a moment to work out that
"exhausted" means the printer stopped rather than that something was wrong. A
clearer phrasing ("79 more, not shown") would read better.

**Two invisible live regions accounted for the last orphans on every view.**
`#__next-route-announcer__` (Next.js ships this in every app) and a Salesforce
messaging region both present as unlabeled alerts. The Next.js one in particular
will appear on every Next-based site the atlas ever maps, so it may be worth a
line in the authoring skill: if a route shows one unlabeled alert you cannot
find, look for the framework's route announcer.

## Process note

Nike is the cleanest large commerce site mapped in this batch. No bot challenge,
no interstitial, complete server-rendered content, and a real design system
(`nds-`) with stable class names. It took roughly half the iterations that Amazon
did.

The predictor was not size or category but whether the site has a published
design system. IKEA (`hnf-`/`plp-`/`pipf-`) and Nike (`nds-`) were both fast.
eBay and Amazon, which mix structural prefixes with compiled output, were slow.
Sites with no stable naming at all (Best Buy, whose product data never arrived)
were impossible. That might be a useful signal for triaging candidate sites
before committing to one.

## Rejections from this batch, for the record

Best Buy was dropped after gating. Its product pages return a bare
`www.bestbuy.com` title with zero visible elements, and its search results render
400 `skeleton-product-*` placeholders that never resolve — zero product links and
zero prices after 45 seconds of waiting. The category pages render chrome but no
prices. Nothing about a retailer is left to map.

This is a third distinct failure mode, after Instacart (content present, hidden
behind an auth modal) and Home Depot (homepage fine, deep routes refused). Worth
adding to the skill's gate: a page that renders skeletons forever looks alive to
every check except "did the data arrive".
