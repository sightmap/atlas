#!/usr/bin/env node
// Regenerates fixtures/valid-entry/screenshots/01-example.png deterministically.
//
// The fixture screenshot must satisfy the rules in docs/SPEC.md: PNG, width
// 1200-2000 px, <=300 KB. This script draws a fixed 1400x900 mock storefront
// (no timestamps, no randomness) so the committed binary is reproducible:
//
//   node scripts/dev/make-screenshot.mjs [out.png]
//
// Defaults to fixtures/valid-entry/screenshots/01-example.png relative to the
// repo root.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const out =
  process.argv[2] ??
  resolve(repoRoot, "fixtures", "valid-entry", "screenshots", "01-example.png");

const W = 1400;
const H = 900;
const png = new PNG({ width: W, height: H, colorType: 6 });

function put(x, y, r, g, b, a = 255) {
  const i = (W * y + x) << 2;
  png.data[i] = r;
  png.data[i + 1] = g;
  png.data[i + 2] = b;
  png.data[i + 3] = a;
}

function rect(x0, y0, w, h, r, g, b) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      if (x >= 0 && x < W && y >= 0 && y < H) put(x, y, r, g, b);
    }
  }
}

// Background: vertical gradient (compresses well, stays far under 300 KB).
for (let y = 0; y < H; y++) {
  const t = y / (H - 1);
  const r = Math.round(244 - 24 * t);
  const g = Math.round(246 - 18 * t);
  const b = Math.round(250 - 8 * t);
  for (let x = 0; x < W; x++) put(x, y, r, g, b);
}

// Top navigation bar.
rect(0, 0, W, 72, 26, 32, 44);
rect(32, 24, 160, 24, 94, 234, 212); // "logo"
for (let i = 0; i < 4; i++) rect(W - 480 + i * 110, 28, 84, 16, 148, 163, 184);

// Sidebar.
rect(0, 72, 280, H - 72, 226, 232, 240);
for (let i = 0; i < 8; i++) rect(24, 112 + i * 64, 232, 28, 165, 180, 203);

// Main content: header, cards, table rows.
rect(320, 112, 760, 36, 51, 65, 85);
const cardColors = [
  [59, 130, 246],
  [16, 185, 129],
  [249, 115, 22],
];
for (let i = 0; i < 3; i++) {
  const [r, g, b] = cardColors[i];
  rect(320 + i * 360, 180, 328, 140, 255, 255, 255);
  rect(344 + i * 360, 204, 96, 20, r, g, b);
  rect(344 + i * 360, 240, 200, 44, 71, 85, 105);
}
rect(320, 360, 1048, 44, 226, 232, 240);
for (let i = 0; i < 9; i++) {
  const shade = i % 2 === 0 ? 255 : 248;
  rect(320, 404 + i * 48, 1048, 48, shade, shade, shade);
  rect(344, 420 + i * 48, 280, 14, 148, 163, 184);
  rect(700, 420 + i * 48, 160, 14, 148, 163, 184);
  rect(920, 420 + i * 48, 120, 14, 203, 213, 225);
  rect(1180, 416 + i * 48, 120, 22, 224, 242, 254);
}

mkdirSync(dirname(out), { recursive: true });
const buf = PNG.sync.write(png, { deflateLevel: 9, deflateStrategy: 0 });
writeFileSync(out, buf);
console.log(`${out}: ${W}x${H} PNG, ${buf.length} bytes`);
