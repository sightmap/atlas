# Mapping report: ikea.com

Notes for the sightmap team from authoring this entry. Findings about the
tooling and the process, not about IKEA — site-specific facts live in
`README.md` and in the corpus `memory:` notes.

## Tooling findings

**A memory note that starts with a reserved YAML character fails with an opaque
error.** Two notes broke parsing during this run:

```
sightmap validate: load corpus: parse ".sightmap/shared.yaml":
  yaml: line 21: found character that cannot start any token
```

Line 21 was `` - `#mainContent` exists on all routes… ``. The same thing happened
in `product.yaml` with a note opening on a double quote. Both are natural things
to write, because notes are prose about selectors and selectors start with
backticks in Markdown. The error names the line but not the cause, and the fix
(quote the scalar, or reword) is not discoverable from the message.

Worth considering: a lint rule that catches a plain scalar starting with `` ` ``,
`"`, `'`, `@`, `%`, or `&` and says what to do about it. That would turn a
parse-time mystery into an authoring-time hint.

**`gap` and `snapshot --coverage` report different orphan counts on the same
page.** On the eBay 404, `gap` said `✓ no orphaned interactive nodes` twice in a
row while `snapshot --coverage` said `2 orphaned T3 ✗`. The two disagreed on
IKEA pages as well. Coverage's `Unlabeled clusters` list turned out to be the
useful one — it named the elements, and `gap` did not see them at all.

This matters because the skill tells authors to iterate until `gap` is clean,
and `gap` can be clean while the gate the skill actually names (`0 orphaned ✓`)
is not. Either they should agree, or the skill should point at coverage alone.

**Late-loading widgets read as flaky coverage.** eBay's floating help launcher
and IKEA's recommendation fragment both arrive after the page settles, so two
runs of the same command give two answers. An author who does not suspect this
concludes the tool is unreliable. A `--wait` on `gap`/`coverage`, or a note in
the skill that coverage should be run twice before believing a small count,
would save the confusion.

**The browser session is keyed to the `.sightmap` directory, and the failure is
confusing.** Running `sightmap network list` from an entry directory whose
session was started elsewhere gives:

```
sightmap network: no running session — start one with 'sightmap browser start'
```

A session was running the whole time, just keyed to a different directory. The
skill does say to work from the entry directory; the message could say which
directory it looked in.

**`sightmap browser fill` takes a component query, not a CSS selector.**

```
sightmap browser fill '#typeahead-search-field-input' 'cordless drill'
→ compquery: parse "#typeahead-search-field-input": '#index' must follow a component name
```

During exploration there is no corpus yet, which is exactly when you want to
drive a raw selector. A `--selector` escape hatch would remove the need to fall
back to `browser eval` with a hand-rolled React value setter.

**A route segment mixing a literal prefix with a parameter does not match.**
`route: /b/:categoryName/:categoryId/bn_:browseNodeId` silently fell through to
the `/**` catch-all, and coverage reported the category page as `NotFound`.
Changing it to a bare `:browseNode` matched. If partial-segment patterns are not
supported, `validate` could say so rather than letting the view quietly never
match.

**`suggest` is swamped by per-instance testids.** On a product grid, the top 40
candidates were 40 variations of `item_list_item_items_2404-<productId>`. The
useful answer was the shared prefix. Collapsing runs of near-identical testids
into one suggestion with a count would make the command usable on listing pages.

**The `deep-nesting` lint earned its keep.** It fired twice and was right both
times — promoting the nested component out one level produced a genuinely better
corpus, not just a quieter linter.

## Process findings

**The policy gate needs a blocking-modal check, and it needs to run before any
mapping.** Instacart renders its full storefront into the DOM behind an
`aria-modal` login dialog. Every naive check passes: the HTTP status is 200, the
title is right, `document.body.innerText` contains the product names. It is
still an auth wall, and `docs/POLICY.md` defaults auth-walled products to no.

The check that catches it is a visible `[role=dialog][aria-modal=true]` larger
than roughly 150×250 whose text matches login wording. Worth adding to the skill
as step 1, because the cost of discovering it late is a fully authored corpus
that has to be thrown away.

**A homepage that renders proves nothing about the deep routes.** Home Depot
serves its landing page to automated Chrome and returns `Error Page` for search,
category, and product alike. Gating on the homepage alone would have started a
map that could never reach five views. Gating home plus search plus one detail
page, before authoring anything, is what the skill should recommend.

## Site notes worth generalizing

**Decorative URL slugs are common and dangerous, and each site fails
differently.** Both entries mapped so far resolve a browse URL from an id and
ignore the human-readable slug:

| Site | Bad slug, good id | Bad id |
|---|---|---|
| eBay | rewrites to canonical name | serves an unrelated category, 200, no warning |
| IKEA | rewrites to canonical name | redirects to the root catalog |

Neither returns an error. An agent that constructs a browse URL from a product
name and trusts the response silently reads the wrong catalog. This may be worth
a standing prompt in the skill: after loading a browse page, confirm the landing
category from the page heading rather than from the requested path.

**Sites preload closed modal hosts.** IKEA ships five on every route, from five
different frontends, each with a `--close` modifier and a paired backdrop. Any
heuristic along the lines of "a dialog exists, so something is open" is wrong
here. The corpus documents testing for the absence of the modifier instead.
