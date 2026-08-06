# Content policy and removal process

This is not legal advice. It follows what long-lived public galleries do, applied conservatively.

## What the atlas accepts

- **Publicly accessible surfaces**, meaning pages reachable without an account. Default yes.
- **Auth-walled products**, default **no**. Exceptions, in order of preference:
  1. **Self-hosted or open-source software** you run yourself (`auth: self-hosted`).
  2. **Documented vendor permission**, linked in the entry README.
  3. **Public demo or sandbox instances** the vendor operates for evaluation. Corpus YAML is acceptable; screenshots only of clearly non-sensitive screens. When in doubt, ship the map without screenshots.
- Corpus YAML is treated more liberally than screenshots. Structural facts about an interface (view names, selectors, request routes) are observations, while pixels are expression. An entry with no screenshots is always acceptable.

## Hard rules for every entry

- No personal data in screenshots, YAML examples, memory notes, or request field samples. Demo data must look like demo data.
- No credentials, tokens, session cookies, or internal URLs.
- Every entry credits and links the mapped site (`site_url`). Inclusion identifies the site rather than endorsing it or claiming affiliation, and all trademarks remain their owners'.
- Contributors affirm they captured content lawfully and had legitimate access to what they mapped.
- Capture tooling should be respectful: no auth bypasses, no rate hammering, no CAPTCHA circumvention.

## Removal requests

Site owners can get a map removed or corrected, no questions asked:

1. Open a **Removal request** issue (form provided) or email **atlas@sightmap.org**.
2. Acknowledgment within 72 hours.
3. Ownership verified via a domain email, a DNS TXT record, or a file at the site root.
4. Once ownership checks out, we delete the entry, tombstone the slug in `removed.yaml`, publish a regenerated `index.json`, and rebuild sightmap.org/atlas so the pages and assets leave the CDN.

Formal DMCA notices follow the same path and are honored promptly.

## Moderation

Maintainers may remove or decline any entry for policy, quality, or legal-risk reasons. Removals are recorded in `removed.yaml`, and disputes go through a GitHub issue.
