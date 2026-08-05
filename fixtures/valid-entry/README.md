---
name: Example Shop
slug: valid-entry
site_url: https://shop.example.com/
domains: [shop.example.com]
description: Checkout and dashboard surfaces of the Example Shop demo storefront.
categories: [commerce, other]
author: atlas-fixtures
created: 2026-08-05
updated: 2026-08-05
last_verified: 2026-08-05
cli_version: 0.1.0
spec_version: 1
method: browser
auth: none
---

# Example Shop

CI fixture: a complete, passing atlas entry. The corpus is adapted from the
sightmap spec's `multi-file` example (source-derived keys stripped, per atlas
corpus rules — maps here are observed, not source-derived).

## Coverage

- `/checkout` — cart summary and payment form, including the order request.
- `/dashboard` — layout chrome and the activity feed.
- Shared chrome (navigation, footer) and the current-user request live in
  `shared.yaml`.

## Known gaps

- No snapshots are committed; selectors were verified against the demo
  storefront on the `last_verified` date.
