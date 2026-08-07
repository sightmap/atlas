# Mapping report: ebay.com

Notes for the sightmap team from authoring this entry. Findings about the
tooling and the process, not about eBay — site-specific facts live in
`README.md` and in the corpus `memory:` notes.

This was the first entry in the batch, so several findings here recur in later
reports.

## Tooling findings

**A memory note starting with a backtick breaks YAML parsing.**

```
sightmap validate: load corpus: parse ".sightmap/shared.yaml":
  yaml: line 21: found character that cannot start any token
```

Line 21 was `` - `#mainContent` exists on all routes… ``. Backtick is a YAML
reserved indicator, so a plain scalar cannot begin with one. This is easy to hit
because memory notes are prose about selectors and selectors are written in
backticks. The error gives the line but not the cause. A lint rule for plain
scalars opening on `` ` ``, `"`, `'`, `@`, `%`, or `&` would catch it at
authoring time.

**`gap` and `snapshot --coverage` disagree.** On the 404, `gap` printed
`✓ no orphaned interactive nodes` on two consecutive runs while
`snapshot --coverage` printed `2 orphaned T3 ✗` for the same page. Coverage's
`Unlabeled clusters` section named them (a floating help launcher and an image);
`gap` never saw them.

The skill tells authors to iterate the coverage loop until `0 orphaned ✓`, and
separately suggests `gap` for finding what is missing. Since `gap` can read
clean while the gate does not, only coverage's list was usable here.

**Late-arriving widgets make coverage look flaky.** eBay injects a floating help
launcher (`#infcontainer`) after the page settles, and ad iframes land later
still. Two runs of the same command give two numbers. Once mapped, the count
stabilized. A note in the skill that a small residual count should be confirmed
with a second run would prevent chasing a phantom.

**The browser session is keyed to the `.sightmap` directory.** Starting a session
from a scratch directory and then running `sightmap network list` from the entry
directory reports no running session at all, which is misleading — one was
running, under a different key. Naming the directory it searched would make this
self-explanatory.

**`sightmap browser fill` accepts only a component query.**

```
sightmap browser fill '#typeahead-search-field-input' 'cordless drill'
→ compquery: parse "#typeahead-search-field-input": '#index' must follow a component name
```

Exploration happens before a corpus exists, which is exactly when a raw selector
is the only thing available. The workaround was `browser eval` with a native
value setter and a manual `input` event, which is a lot of ceremony for typing
into a search box.

**A route segment that mixes a literal prefix with a parameter never matches.**

```yaml
route: /b/:categoryName/:categoryId/bn_:browseNodeId   # never matches
route: /b/:categoryName/:categoryId/:browseNode        # matches
```

With the first form, coverage reported the category page as `NotFound` — the
view simply never resolved, with no error from `validate`. If partial-segment
patterns are unsupported, saying so at validate time would save a confusing
round of debugging.

**`suggest` is unusable on listing pages.** The top 40 candidates on a product
grid were 40 spellings of `item_list_item_items_2404-<productId>`. The answer
the author needs is the shared prefix. Collapsing near-identical testids into one
suggestion with a count would fix it.

**The `deep-nesting` lint was right.** It flagged four result-card children whose
selectors composed to four levels. Promoting `ResultCard` to a sibling of the
river shortened every descendant and lost no specificity, because the
child-combinator selector already pinned the card to the results list.

## Process findings

**Bot gating has three layers, and only the third is decisive.** Ranked by how
much they misled:

1. `curl` status codes. Home Depot returned 403 to curl and rendered fine in a
   real browser. Vuori and Target looked blocked at this layer and were not.
2. A rendering homepage. Home Depot serves its landing page to automated Chrome
   and returns `Error Page` for search, category, and product alike — one
   mappable view, which cannot meet the five-view bar.
3. Deep routes. Only checking home plus search plus one detail page, before
   authoring anything, predicted which sites could actually support an entry.

Of 22 well-known sites gated this way, 9 were usable. That ratio is worth
knowing before anyone plans a seeding sprint.

**An auth wall can look exactly like a rendered page.** Instacart puts its entire
storefront in the DOM behind an `aria-modal` login dialog. Status 200, correct
title, product names present in `document.body.innerText`. It is still
auth-walled, and `docs/POLICY.md` defaults those to no. browse.sh's own Instacart
skill describes itself as routing around this modal, which is the line the atlas
policy draws.

The detection that works: a visible `[role=dialog][aria-modal=true]` larger than
roughly 150×250 whose text matches login wording. This belongs in the skill's
step 1, because discovering it after authoring means discarding the work.

## Note on eBay's proof-of-work challenge

A cold profile is served `/splashui/challenge`, which the browser answers using
`argon2.wasm` before following through to the requested URL. Nothing was
circumvented and nothing was required of the agent — Chrome executed the site's
own script and continued. Recording it here because it is the first case in this
batch where the distinction between "the site challenged us" and "we bypassed a
control" mattered, and the answer was clearly the former. It is documented in
`shared.yaml` since it otherwise presents as a redirect bug.
