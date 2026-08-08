#!/usr/bin/env node
// Retakes the seed-batch screenshots that shipped with overlays baked in
// (vuori: Klaviyo newsletter modal on both; uniqlo: $5-off SMS modal on both;
// ikea: OneTrust cookie banner on both). Run from a machine with normal
// browser egress, from a checkout of the entry's seed branch:
//
//   node reports/retake/retake-screenshots.mjs vuori [uniqlo ikea ...]
//
// Uses your installed Chrome (channel: "chrome") so pages render with a real
// profile-less browser. Dismissal selectors come from each entry's own
// .sightmap corpus. Output overwrites entries/<slug>/screenshots/*.webp when
// `sharp` is importable (npm i sharp), else writes .png next to them and says
// so — delete the stale .webp and rename NN accordingly if that happens.
//
// After retaking: verify with  node scripts/validate-entry.mjs entries/<slug>
// and bump `updated:` in the entry README.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const SITES = {
  vuori: {
    dismiss: async (page) => {
      // NewsletterOverlay (.klaviyo-form) — close via its X, fall back to Escape.
      await page
        .locator('[aria-label="Close dialog"], .klaviyo-close-form, form [role="button"][aria-label*="Close"]')
        .first()
        .click({ timeout: 8000 })
        .catch(() => page.keyboard.press("Escape"));
      await page.waitForTimeout(800);
    },
    shots: [
      { url: "https://vuoriclothing.com/collections/mens-shorts", out: "entries/vuori/screenshots/01-collection.webp" },
      { url: "https://vuoriclothing.com/products/benton-twill-elastic-waist-short-8-ink", out: "entries/vuori/screenshots/02-product-detail.webp" },
    ],
  },
  uniqlo: {
    dismiss: async (page) => {
      // PromoModal ([data-testid="modal-form-container"]) — "DECLINE OFFER" or the X.
      const modal = page.locator('[data-testid="modal-form-container"]');
      if (await modal.count()) {
        await page
          .getByText("DECLINE OFFER", { exact: false })
          .first()
          .click({ timeout: 8000 })
          .catch(async () => modal.locator('[aria-label*="lose"], button:has-text("×")').first().click({ timeout: 5000 }).catch(() => {}));
      }
      await page.waitForTimeout(800);
    },
    shots: [
      { url: "https://www.uniqlo.com/us/en/men/t-shirts-and-sweats", out: "entries/uniqlo/screenshots/01-category-listing.webp" },
      { url: "https://www.uniqlo.com/us/en/products/E465185-000/00", out: "entries/uniqlo/screenshots/02-product-detail.webp" },
    ],
  },
  ikea: {
    dismiss: async (page) => {
      // CookieConsent (#onetrust-consent-sdk) — accept, or hide the host if the
      // buttons are variant-gated. Hiding chrome we're not documenting is fine;
      // fabricating content would not be.
      await page
        .locator("#onetrust-accept-btn-handler, #onetrust-consent-sdk button.ot-pc-refuse-all-handler")
        .first()
        .click({ timeout: 8000 })
        .catch(() => page.addStyleTag({ content: "#onetrust-consent-sdk{display:none!important}" }));
      await page.waitForTimeout(800);
    },
    shots: [
      { url: "https://www.ikea.com/us/en/search/?q=desk%20chair", out: "entries/ikea/screenshots/01-search-results.webp" },
      { url: "https://www.ikea.com/us/en/p/goersnygg-storage-case-white-clear-40504193/", out: "entries/ikea/screenshots/02-product-detail.webp" },
    ],
  },
};

const MAX_BYTES = 300 * 1024;

async function toWebp(png, outPath) {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    return null;
  }
  for (const quality of [82, 72, 60, 45]) {
    const buf = await sharp(png).webp({ quality }).toBuffer();
    if (buf.length <= MAX_BYTES) {
      const { writeFileSync } = await import("node:fs");
      writeFileSync(outPath, buf);
      return buf.length;
    }
  }
  return null;
}

const targets = process.argv.slice(2);
if (!targets.length || targets.some((t) => !SITES[t])) {
  console.error(`usage: node retake-screenshots.mjs <${Object.keys(SITES).join("|")}> ...`);
  process.exit(2);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const slug of targets) {
  const site = SITES[slug];
  const page = await browser.newPage({ viewport: { width: 1600, height: 1057 }, deviceScaleFactor: 1 });
  for (const shot of site.shots) {
    await page.goto(shot.url, { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForTimeout(2500); // let late overlays fire so we dismiss them, not race them
    await site.dismiss(page);
    const png = await page.screenshot({ type: "png" });
    const out = resolve(shot.out);
    mkdirSync(dirname(out), { recursive: true });
    const webpBytes = await toWebp(png, out);
    if (webpBytes) {
      console.log(`${shot.out}: ${(webpBytes / 1024) | 0} KB webp`);
    } else {
      const pngOut = out.replace(/\.webp$/, ".png");
      const { writeFileSync } = await import("node:fs");
      writeFileSync(pngOut, png);
      console.log(`${pngOut}: wrote PNG (${(png.length / 1024) | 0} KB) — sharp unavailable or webp too large; check <=300 KB and remove the stale .webp`);
    }
  }
  await page.close();
}
await browser.close();
