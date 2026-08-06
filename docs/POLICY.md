# Content policy and removal process

Not legal advice; observed best practice from long-lived public galleries, applied conservatively.

## What the atlas accepts

- **Publicly accessible surfaces** — pages reachable without an account. Default yes.
- **Auth-walled products** — default **no**. Exceptions, in order of preference:
  1. **Self-hosted / open-source software** you run yourself (`auth: self-hosted`).
  2. **Documented vendor permission** — link the permission in the entry README.
  3. **Public demo/sandbox instances** the vendor operates for evaluation — corpus YAML acceptable; screenshots only of clearly non-sensitive screens. When in doubt, ship the map without screenshots.
- Corpus YAML is treated more liberally than screenshots: structural facts about an interface (view names, selectors, request routes) are observations; pixels are expression. A screenshot-less entry is always acceptable.

## Hard rules for every entry

- No personal data anywhere — screenshots, YAML examples, memory notes, request field samples. Demo data must be obviously demo data.
- No credentials, tokens, session cookies, or internal URLs.
- Every entry credits and links the mapped site (`site_url`). Inclusion is identification, not endorsement or affiliation; all trademarks remain their owners'.
- Contributors affirm they captured content lawfully and had legitimate access to what they mapped.
- Capture tooling should be respectful: no auth bypasses, no rate hammering, no CAPTCHA circumvention.

## Removal requests

Site owners can get a map removed or corrected, no questions asked:

1. Open a **Removal request** issue (form provided) or email **atlas@sightmap.org**.
2. Acknowledgment within 72 hours.
3. Ownership verified via a domain email, a DNS TXT record, or a file at the site root.
4. On verification: entry deleted, slug tombstoned in `removed.yaml`, regenerated `index.json` published, and the sightmap.org/atlas rebuild removes the pages and assets from the CDN.

Formal DMCA notices follow the same path and are honored promptly.

## Moderation

Maintainers may remove or decline any entry for policy, quality, or legal-risk reasons. Removals are recorded in `removed.yaml`; disputes go through a GitHub issue.
