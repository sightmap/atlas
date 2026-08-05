# Phase 5 — Launch and freshness

## P5.1 Freshness automation (before launch, not after)

- Monthly scheduled workflow: re-run `validate` + `lint` on every entry, HTTP-check every `site_url`, and `sel-probe` where a capture environment allows; label entries `stale` on failure and open one rolling issue listing them. `last_verified` only moves when a human/agent actually re-probes.
- Full-index regeneration is also exercised here — a CLI/spec upgrade that breaks parsing of old entries surfaces on the schedule, not during someone's contribution.

## P5.2 Launch content

- Blog post on sightmap.org: the Atlas story — agent-mapped structural maps of real sites, the POS-to-SDK origin, "Wappalyzer tells you the stack; a sightmap tells you the surface." Walk one seed entry end-to-end.
- README CTAs: "Add your sightmap" above the fold in both sightmap/atlas and sightmap/sightmap; entry-count badge.
- Per-entry OG images live (P4), so shared links carry their own screenshots.

## P5.3 Launch mechanics

- Show HN: "Show HN: Sightmap Atlas – community maps of real web UIs, made by agents" — post 8–9am ET; same-day Reddit (r/webdev, r/LocalLLaMA or agent-adjacent subs) + newsletter pitches.
- Seed the first external contribution before launch day (Trevor?) so the contributor count isn't 1.
- Have `map-a-site` (P2.6) polished — the top comment will be "how do I add mine."

## P5.4 Post-launch

- "Claim your site" flow for owners publishing official/verified maps (partner funnel; needs its own design pass — issue, not launch blocker).
- Consider embedding `map-a-site` into the CLI release so `sightmap skills install` ships it.
- Screenshot storage watch: if entries × figs approach ~500MB of repo, execute the migration noted in SPEC (release-asset or bucket storage, index URLs switch) — decision documented, not urgent.
