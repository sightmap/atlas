#!/usr/bin/env node
// gen-index — regenerates the repo-root index.json from entries/*/,
// exactly per the "index.json (generated)" contract in docs/SPEC.md.
//
//   node scripts/gen-index.mjs [--allow-missing-stats] [--out <path>]
//
// Per entry it:
//   - parses the README.md front matter (metadata source of truth),
//   - shells `sightmap stats --json` for `stats` + `per_view` — NEVER
//     hand-computes them. REQUIRES a sightmap build with the `stats` verb
//     (sightmap/sightmap PR #167, branch feat/stats-verb). If the verb is
//     missing the script fails with a clear message; pass
//     --allow-missing-stats to emit the index without `stats`/`per_view`
//     (local dry runs only — CI must always produce full stats),
//   - lists files[] from a .sightmap/** walk (paths relative to the entry
//     dir, `.sightmap/`-prefixed — `sightmap add` fetches exactly these),
//   - lists screenshots[] from screenshots/,
//   - records commit = `git log -1 --format=%H -- <entry>` (null with a
//     warning when the entry has no committed history yet).
//
// Entries are sorted by slug; key order inside each entry is fixed to the
// SPEC example so regenerating the index never produces spurious diffs.
// Exit code: 0 on success, 1 on any failure.
//
// The sightmap CLI is taken from $SIGHTMAP_BIN, else `go run <module>@<pin>`
// — see scripts/lib/sightmap-cli.mjs for the pin and its bump procedure.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontMatter } from "./lib/front-matter.mjs";
import {
  runSightmap,
  isUnknownVerb,
  sightmapCommandDescription,
} from "./lib/sightmap-cli.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ── CLI arguments ────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let allowMissingStats = false;
let outPath = join(repoRoot, "index.json");
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--allow-missing-stats") allowMissingStats = true;
  else if (args[i] === "--out" && args[i + 1]) outPath = resolve(args[++i]);
  else {
    console.error("usage: node scripts/gen-index.mjs [--allow-missing-stats] [--out <path>]");
    process.exit(2);
  }
}

function fail(msg) {
  console.error(`gen-index: ${msg}`);
  process.exit(1);
}

// ── helpers ──────────────────────────────────────────────────────────────────

function walkFiles(dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkFiles(p));
    else out.push(p);
  }
  return out;
}

/** `sightmap stats --json` for one corpus; returns { stats, per_view } or null. */
function statsFor(sightmapDir, entryLabel) {
  const res = runSightmap(["stats", "--json", "--sightmap-dir", sightmapDir]);
  if (isUnknownVerb(res, "stats")) {
    const msg =
      `the sightmap CLI (${sightmapCommandDescription()}) has no \`stats\` verb. ` +
      "gen-index requires sightmap/sightmap PR #167 (branch feat/stats-verb); " +
      "until it merges, point $SIGHTMAP_BIN at a binary built from that branch.";
    if (!allowMissingStats) fail(msg);
    console.error(`gen-index: warning: ${msg}`);
    console.error(`gen-index: warning: emitting ${entryLabel} without stats/per_view`);
    return null;
  }
  if (res.status !== 0) {
    fail(`sightmap stats failed for ${entryLabel}:\n${(res.stderr + res.stdout).trim()}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(res.stdout);
  } catch (err) {
    fail(`sightmap stats emitted unparseable JSON for ${entryLabel}: ${err.message}`);
  }
  return {
    stats: {
      views: parsed.views,
      components: parsed.components,
      requests: parsed.requests,
      properties: parsed.properties,
      memory: parsed.memory,
    },
    per_view: (parsed.per_view ?? []).map((v) => ({
      name: v.name,
      route: v.route,
      components: v.components,
      requests: v.requests,
    })),
  };
}

// ── walk entries/ ────────────────────────────────────────────────────────────

const entriesDir = join(repoRoot, "entries");
const slugs = existsSync(entriesDir)
  ? readdirSync(entriesDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
  : [];

const entries = [];
for (const slug of slugs) {
  const entryDir = join(entriesDir, slug);
  const entryRel = relative(repoRoot, entryDir);

  const fmResult = parseFrontMatter(join(entryDir, "README.md"));
  if (fmResult.error) fail(`${entryRel}: ${fmResult.error}`);
  const fm = fmResult.data;
  if (fm.slug !== slug) {
    fail(`${entryRel}: front-matter slug "${fm.slug}" != folder name (run validate-entry)`);
  }

  const sightmapDir = join(entryDir, ".sightmap");
  if (!existsSync(sightmapDir)) fail(`${entryRel}: .sightmap/ directory is missing`);
  const computed = statsFor(sightmapDir, entryRel);

  const files = walkFiles(sightmapDir)
    .map((f) => relative(entryDir, f))
    .sort();

  const shotsDir = join(entryDir, "screenshots");
  const screenshots = existsSync(shotsDir)
    ? readdirSync(shotsDir)
        .filter((f) => !f.startsWith("."))
        .sort()
        .map((f) => `screenshots/${f}`)
    : [];

  let commit = null;
  const sha = execFileSync("git", ["log", "-1", "--format=%H", "--", entryRel], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  if (sha) {
    commit = sha;
  } else {
    console.error(`gen-index: warning: ${entryRel} has no committed history; commit=null`);
  }

  // Key order mirrors the SPEC example exactly — do not reorder.
  const entry = {
    slug: fm.slug,
    name: fm.name,
    site_url: fm.site_url,
    domains: fm.domains,
    description: fm.description,
    categories: fm.categories,
    author: fm.author,
    created: fm.created,
    updated: fm.updated,
    last_verified: fm.last_verified,
    cli_version: fm.cli_version,
    spec_version: fm.spec_version,
    method: fm.method,
    auth: fm.auth,
    ...(computed ? { stats: computed.stats, per_view: computed.per_view } : {}),
    screenshots,
    files,
    commit,
  };
  entries.push(entry);
}

// ── assemble + write ─────────────────────────────────────────────────────────

const index = {
  schema_version: 1,
  generated_at: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
  entries,
};

writeFileSync(outPath, JSON.stringify(index, null, 2) + "\n");
console.log(`gen-index: wrote ${relative(repoRoot, outPath) || outPath} (${entries.length} entr${entries.length === 1 ? "y" : "ies"})`);
