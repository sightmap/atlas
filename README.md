# Sightmap Atlas

A community atlas of [sightmaps](https://sightmap.org) — structured, machine-readable maps of real websites (views, components, properties, network requests), authored by agents browsing the live site with the [Sightmap CLI](https://github.com/sightmap/sightmap). No source access required.

Wappalyzer tells you what a site is built with. A sightmap tells you what its surface *is* — named views and components an agent can navigate, drive, and build against.

## Status

Pre-launch. The repo is being built out phase by phase — see [plan/IMPLEMENTATION.md](plan/IMPLEMENTATION.md). Entry format and policies are specified in [docs/SPEC.md](docs/SPEC.md) and [docs/POLICY.md](docs/POLICY.md).

## Using a map

```
sightmap add <slug>
```

installs an entry's `.sightmap/` corpus into your project (CLI ≥ the version noted on each entry). Browse entries at sightmap.org/atlas (coming with launch) or under [entries/](entries/).

## Contributing a map

Coming with launch: a `map-a-site` agent skill that walks any coding agent through mapping a site and opening the PR, plus a human guide in CONTRIBUTING.md. Until then, see [docs/SPEC.md](docs/SPEC.md) for the entry format.

## Removal requests

Site owner and want a map removed or corrected? See [docs/POLICY.md](docs/POLICY.md).
