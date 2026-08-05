---
name: Broken Example
slug: Invalid_Entry
site_url: https://broken.example.com/
domains: [broken.example.com]
description: This description is deliberately far too long for the atlas front-matter rules, which cap the description field at one hundred and forty characters flat.
categories: [commerce, arcade]
author: atlas-fixtures
created: 2026-08-05
updated: 2026-08-05
last_verified: 2026-08-05
cli_version: 0.1.0
spec_version: 1
method: browser
auth: none
---

# Broken Example

CI fixture: an entry that must FAIL validation for multiple distinct reasons:

1. `slug` is not kebab-case (schema pattern) and does not equal the folder
   name (`invalid-entry`).
2. `description` exceeds the 140-character cap.
3. `categories` contains `arcade`, which is not in the closed enum.
4. No `screenshots/` directory — every entry needs 1-5 screenshots.
5. The corpus uses forbidden `source:` / `dependencies:` keys — atlas maps
   are observed, not source-derived.
