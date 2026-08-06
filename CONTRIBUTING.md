# Contributing a map

Thanks for mapping the web. This guide is the human path to adding an entry;
coding agents should use the [`map-a-site` skill](skills/map-a-site/SKILL.md),
which walks the same process end to end.

Contracts live in two documents. Read them before anything else:

- [docs/SPEC.md](docs/SPEC.md) covers the entry format: directory layout, front matter,
  corpus rules, screenshot rules.
- [docs/POLICY.md](docs/POLICY.md) covers what the atlas accepts, the hard content
  rules, and the removal process.

## Step 0: the policy gate

Before you map anything, check the target against
[docs/POLICY.md](docs/POLICY.md):

- **Publicly accessible surfaces** (no account needed): default yes.
- **Auth-walled products**: default **no**, with three exceptions, in order of
  preference: self-hosted/open-source software you run yourself
  (`auth: self-hosted`), documented vendor permission (linked in your entry
  README), or a public demo/sandbox instance the vendor operates.
- No personal data anywhere. No credentials, tokens, session cookies, or
  internal URLs. Capture respectfully: no auth bypasses, no rate hammering, no
  CAPTCHA circumvention.

If the target fails the gate, stop here. If you are unsure, open a
[Request a map](https://github.com/sightmap/atlas/issues/new?template=request-a-map.yml)
issue and ask before investing the work.

## Step 1: fork and scaffold

```bash
gh repo fork sightmap/atlas --clone
cd atlas
git checkout -b add-<slug>
mkdir -p entries/<slug>/.sightmap entries/<slug>/screenshots
```

Pick the slug per [docs/SPEC.md](docs/SPEC.md): kebab-case, product-keyed (not
domain-keyed: `square-pos`, not `squareup.com`), matching
`^[a-z0-9][a-z0-9-]{1,63}$`, and unique against both `entries/` and
`removed.yaml`.

## Step 2: author the entry

Follow [docs/SPEC.md](docs/SPEC.md) exactly. In short:

- `entries/<slug>/README.md` holds the front matter (the metadata source of truth)
  plus free-form notes on coverage, quirks, and known gaps.
- `entries/<slug>/.sightmap/` holds the corpus, authored per the monorepo's
  [authoring conventions](https://github.com/sightmap/sightmap/blob/main/spec/v1/authoring-conventions.md):
  `config.yaml` pinning the spec version, one YAML file per top-level route,
  `shared.yaml` / `extras.yaml` as needed. Any snapshots must live inside
  `.sightmap/snapshots/`.
- `entries/<slug>/screenshots/` holds 1–5 images, `NN-<kebab-name>.png` (or
  `.webp`), each ≤300 KB and 1200–2000 px wide. Public, non-sensitive screens
  only. A screenshot-less entry is always acceptable.

Atlas maps are **observed, not source-derived**: no `source:` or
`dependencies:` keys in the corpus, and every selector verified against the
live site with `sightmap sel-probe` at authoring time (record the date in
`last_verified`).

You will need the [Sightmap CLI](https://github.com/sightmap/sightmap):

```bash
npm install -g @sightmap/sightmap && sightmap version
# or, without installing:
go run github.com/sightmap/sightmap/go/cmd/sightmap@main version
```

## Step 3: validate locally

From the repo root:

```bash
node scripts/validate-entry.mjs entries/<slug>
```

> `scripts/validate-entry.mjs`, `schema/entry.schema.json`, `entries/`, and
> `removed.yaml` land with the P2.1/P2.2 scaffold PRs (see
> [plan/phases/phase-2-repo-scaffold.md](plan/phases/phase-2-repo-scaffold.md)).
> Until they merge, run `sightmap validate` and `sightmap lint` from
> `entries/<slug>/` and check your front matter against
> [docs/SPEC.md](docs/SPEC.md) by hand.

The script checks the front matter against the schema, the slug, spec-version
agreement, screenshot rules, and the observed-only corpus rules, then shells
`sightmap validate` and `sightmap lint`. CI runs exactly the same script, so a
green local run means a green PR check.

## Step 4: open the PR

```bash
git add entries/<slug>
git commit -m "Add <slug> entry"
gh pr create --repo sightmap/atlas --title "Add <slug>" \
  --body "New atlas entry for <site>. auth: <level per POLICY.md>."
```

What to expect:

- **One entry per PR.** The validation workflow rejects PRs touching more than
  one `entries/<slug>/` directory.
- A bot comment posts the validation result and labels the PR
  `ready-for-review` or `validation-failed`. (Validation workflows land with
  P2.3, see
  [plan/phases/phase-2-repo-scaffold.md](plan/phases/phase-2-repo-scaffold.md).)
- A maintainer reviews for policy and quality. Maintainers may decline any
  entry for policy, quality, or legal-risk reasons (see
  [docs/POLICY.md](docs/POLICY.md)).
- Never edit `index.json`. It is generated on merge.

## The quality bar

Entries are held to the bar set for the seed entries
([plan/phases/phase-3-seeds.md](plan/phases/phase-3-seeds.md)):

- **≥5 views**, or a README justification for fewer (some excellent sites are
  legitimately small).
- **Every view has at least one `memory:` note** capturing something
  non-obvious. The notes are the product.
- **Requests documented** wherever traffic is observable.
- **`last_verified` is the date you actually probed the selectors.** Be honest about it.
- `sightmap validate` passes; `sightmap lint` passes, with any warnings
  justified by a note in the README body.

## Updating or removing an entry

- To update someone's entry (selector rot, new views), open a PR bumping
  `updated` and `last_verified` in the front matter.
- Site owners who want a map removed or corrected should use the
  [Removal request](https://github.com/sightmap/atlas/issues/new?template=removal-request.yml)
  issue form. The process in [docs/POLICY.md](docs/POLICY.md) is no-questions-asked.

## Licensing

By submitting an entry you license your contribution under
[CC BY 4.0](LICENSE-CONTENT): anyone may copy, adapt, and use it, including
commercially, as long as they credit you. Your GitHub handle in the entry's
front matter is that credit, and it travels with the entry into `index.json`
and the gallery.

Screenshots are the exception. They depict a third-party interface you don't
own and can't license, so they're included for identification and commentary
only, with all rights remaining with the interface's owner. That is why
[docs/POLICY.md](docs/POLICY.md) keeps a no-questions-asked removal process.
Submit only screenshots you captured yourself from publicly accessible pages.

Repository tooling (`scripts/`, `schema/`, workflows) is [MIT](LICENSE).
