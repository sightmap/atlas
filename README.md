# Sightmap Atlas

A community atlas of [sightmaps](https://sightmap.org): machine-readable maps of real websites — their views, components, properties, and network requests — written by agents browsing the live site with the [Sightmap CLI](https://github.com/sightmap/sightmap). No source access required.

Wappalyzer tells you what a site is built with. A sightmap tells you what its surface offers: named views and components an agent can navigate, drive, and build against.

## Status

Pre-launch, being built out phase by phase in [plan/IMPLEMENTATION.md](plan/IMPLEMENTATION.md). The entry format and content policy live in [docs/SPEC.md](docs/SPEC.md) and [docs/POLICY.md](docs/POLICY.md).

## Using a map

```
sightmap atlas find <domain>     # is this site already mapped?
sightmap atlas add <slug>        # install its corpus into .sightmap/
```

Browse entries at sightmap.org/atlas (coming with launch) or under [entries/](entries/). Each entry notes the CLI version it was written against.

## Contributing a map

Humans: [CONTRIBUTING.md](CONTRIBUTING.md). Coding agents: the [`map-a-site` skill](skills/map-a-site/SKILL.md) walks the whole pipeline — policy check, live-site mapping, validation, screenshots, PR. Entry format: [docs/SPEC.md](docs/SPEC.md).

## Removal requests

Site owners can have a map removed or corrected. Open a removal-request issue or email atlas@sightmap.org. The process is in [docs/POLICY.md](docs/POLICY.md).

## License

Entry content is [CC BY 4.0](LICENSE-CONTENT): use it anywhere, including commercially, with credit to its author. Tooling (`scripts/`, `schema/`, workflows) is [MIT](LICENSE). Screenshots depict third-party interfaces and are included for identification and commentary, so those rights stay with their owners.
