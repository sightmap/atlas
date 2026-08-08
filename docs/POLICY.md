# Content policy and removal process

Not legal advice; observed best practice from long-lived public galleries, applied conservatively.

## What the atlas accepts

- **Publicly accessible surfaces** — pages reachable without an account. Default yes.
- **Auth-walled products** — accepted, in this order of preference:
  1. **Self-hosted / open-source software** you run yourself (`auth: self-hosted`).
  2. **Documented vendor permission** — link the permission in the entry README.
  3. **Public demo/sandbox instances** the vendor operates for evaluation — corpus YAML acceptable; screenshots only of clearly non-sensitive screens. When in doubt, ship the map without screenshots.
  4. **Your own account** (`auth: personal-account`) — see below.
- **Signed-in with your own account** (`auth: personal-account`). The products people most want to hand to an agent are almost all behind a login, and a gallery that refuses them describes a web nobody uses. So this is allowed, on the condition that the entry describes the product and never the account. The mapper's identity and the account's contents — name, email, avatar, addresses, payment details, order, watch and listening history, saved items, messages, contacts, notifications, balances — must appear nowhere in the entry. `properties` name what a selector extracts, never a value it extracted. Prefer frames with no account chrome; drop a screenshot rather than retouch one. Two consequences worth stating plainly: only the author can re-verify such an entry, so `last_verified` means the author re-checked; and signing into your own account is ordinary use, while automating past a bot check or CAPTCHA is not, and remains forbidden however the session was obtained. Full rules in docs/SPEC.md.
- Corpus YAML is treated more liberally than screenshots: structural facts about an interface (view names, selectors, request routes) are observations; pixels are expression. A screenshot-less entry is always acceptable.

## Hard rules for every entry

- No personal data anywhere — screenshots, YAML examples, memory notes, request field samples. Demo data must be obviously demo data.
- No credentials, tokens, session cookies, or internal URLs.
- Every entry credits and links the mapped site (`site_url`). Inclusion is identification, not endorsement or affiliation; all trademarks remain their owners'.
- Contributors affirm they captured content lawfully and had legitimate access to what they mapped.
- Capture tooling should be respectful: no auth bypasses, no rate hammering, no CAPTCHA circumvention.

## Removal requests

Site owners can get a map removed or corrected, no questions asked:

1. Open a **Removal request** issue (form provided) or email **TBD@sightmap.org**.
2. Acknowledgment within 72 hours.
3. Ownership verified via a domain email, a DNS TXT record, or a file at the site root.
4. On verification: entry deleted, slug tombstoned in `removed.yaml`, regenerated `index.json` published, and the sightmap.org/atlas rebuild removes the pages and assets from the CDN.

Formal DMCA notices follow the same path and are honored promptly.

## Moderation

Maintainers may remove or decline any entry for policy, quality, or legal-risk reasons. Removals are recorded in `removed.yaml`; disputes go through a GitHub issue.
