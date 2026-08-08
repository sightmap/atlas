#!/usr/bin/env node
// validate-entry — validates one atlas entry directory against docs/SPEC.md.
//
//   node scripts/validate-entry.mjs <entry-dir> [--json]
//
// Checks, in order (all independent checks run even after a failure, so one
// run reports every distinct problem):
//
//   front-matter        README.md exists and its front matter parses as YAML
//   layout              the entry dir holds only what docs/SPEC.md names:
//                       README.md, .sightmap/, screenshots/
//   schema              front matter validates against schema/entry.schema.json
//   slug-matches-folder front-matter slug == entry folder name
//   slug-unique         slug collides with no other entries/<slug> and no
//                       removed.yaml tombstone (removed slugs are never reused)
//   spec-version        front-matter spec_version == .sightmap/config.yaml version
//   screenshots         1-5 files named NN-<kebab>.png|.webp starting at 01,
//                       each <=300 KB and 1200-2000 px wide, decodable as
//                       PNG/WebP matching its extension
//   corpus-pure         no `source:` / `dependencies:` keys anywhere in the
//                       corpus — atlas maps are observed, not source-derived
//   sightmap-validate   `sightmap validate` exits 0
//   sightmap-lint       `sightmap lint` exits 0
//
// Output: one human-readable line per check; with --json, a single JSON
// object { ok, checks: [{ name, ok, detail }] } on stdout instead.
// Exit code: 0 when every check passes, 1 otherwise (2 for usage errors).
//
// The sightmap CLI is taken from $SIGHTMAP_BIN, else `go run <module>@<pin>`
// — see scripts/lib/sightmap-cli.mjs for the pin and its bump procedure.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { parse as parseYaml } from "yaml";
import { imageSize } from "image-size";
import { parseFrontMatter } from "./lib/front-matter.mjs";
import { runSightmap, sightmapCommandDescription } from "./lib/sightmap-cli.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ── CLI arguments ────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const positional = args.filter((a) => a !== "--json");
if (positional.length !== 1) {
  console.error("usage: node scripts/validate-entry.mjs <entry-dir> [--json]");
  process.exit(2);
}
const entryDir = resolve(positional[0]);
if (!existsSync(entryDir) || !statSync(entryDir).isDirectory()) {
  console.error(`validate-entry: not a directory: ${entryDir}`);
  process.exit(2);
}

const checks = [];
function check(name, ok, detail = "") {
  checks.push({ name, ok, detail });
}

// ── front-matter ─────────────────────────────────────────────────────────────

const fmResult = parseFrontMatter(join(entryDir, "README.md"));
const fm = fmResult.data ?? null;
check("front-matter", !fmResult.error, fmResult.error ?? "README.md front matter parsed");

// ── layout ───────────────────────────────────────────────────────────────────
// docs/SPEC.md's directory layout is closed: anything else in the entry dir is
// something `sightmap atlas add` will never install and a reviewer should not
// have to read (the seed batch shipped seven stray mapping reports this way).

{
  const allowed = new Set(["README.md", ".sightmap", "screenshots"]);
  const strays = readdirSync(entryDir).filter((name) => !allowed.has(name));
  check(
    "layout",
    strays.length === 0,
    strays.length === 0
      ? "entry holds only README.md, .sightmap/, screenshots/"
      : `unexpected file(s) in the entry dir: ${strays.join(", ")} — docs/SPEC.md names only README.md, .sightmap/, screenshots/`,
  );
}

// ── schema ───────────────────────────────────────────────────────────────────

if (fm) {
  const schema = JSON.parse(
    readFileSync(join(repoRoot, "schema", "entry.schema.json"), "utf8"),
  );
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  if (validate(fm)) {
    check("schema", true, "front matter conforms to schema/entry.schema.json");
  } else {
    const msgs = validate.errors.map((e) => {
      const where = e.instancePath || "(root)";
      const extra = e.keyword === "enum" ? ` (${JSON.stringify(e.params.allowedValues)})` : "";
      return `${where} ${e.message}${extra}`;
    });
    check("schema", false, msgs.join("; "));
  }
}

// ── slug-matches-folder ──────────────────────────────────────────────────────

const folderName = basename(entryDir);
if (fm && typeof fm.slug === "string") {
  check(
    "slug-matches-folder",
    fm.slug === folderName,
    fm.slug === folderName
      ? `slug "${fm.slug}" matches folder name`
      : `front-matter slug "${fm.slug}" != folder name "${folderName}"`,
  );
}

// ── slug-unique ──────────────────────────────────────────────────────────────

if (fm && typeof fm.slug === "string") {
  const conflicts = [];

  const entriesDir = join(repoRoot, "entries");
  const conflictDir = join(entriesDir, fm.slug);
  if (existsSync(conflictDir) && resolve(conflictDir) !== entryDir) {
    conflicts.push(`entries/${fm.slug}/ already exists`);
  }

  const removedPath = join(repoRoot, "removed.yaml");
  if (existsSync(removedPath)) {
    const removed = parseYaml(readFileSync(removedPath, "utf8")) ?? [];
    if (Array.isArray(removed)) {
      for (const tomb of removed) {
        if (tomb && tomb.slug === fm.slug) {
          conflicts.push(`slug is tombstoned in removed.yaml (removed slugs are never reused)`);
        }
      }
    }
  }

  check(
    "slug-unique",
    conflicts.length === 0,
    conflicts.length === 0 ? `slug "${fm.slug}" is unique` : conflicts.join("; "),
  );
}

// ── spec-version ─────────────────────────────────────────────────────────────

const sightmapDir = join(entryDir, ".sightmap");
if (fm) {
  const configPath = join(sightmapDir, "config.yaml");
  if (!existsSync(configPath)) {
    check("spec-version", false, ".sightmap/config.yaml is missing (it must pin `version`)");
  } else {
    let cfg;
    try {
      cfg = parseYaml(readFileSync(configPath, "utf8"));
    } catch (err) {
      cfg = null;
      check("spec-version", false, `.sightmap/config.yaml is not valid YAML: ${err.message}`);
    }
    if (cfg !== null && typeof cfg === "object") {
      check(
        "spec-version",
        cfg.version === fm.spec_version,
        cfg.version === fm.spec_version
          ? `spec_version ${fm.spec_version} matches .sightmap/config.yaml`
          : `front-matter spec_version ${JSON.stringify(fm.spec_version)} != .sightmap/config.yaml version ${JSON.stringify(cfg?.version)}`,
      );
    } else if (cfg === null || typeof cfg !== "object") {
      if (!checks.some((c) => c.name === "spec-version")) {
        check("spec-version", false, ".sightmap/config.yaml is not a YAML mapping");
      }
    }
  }
}

// ── screenshots ──────────────────────────────────────────────────────────────

const MAX_SCREENSHOT_BYTES = 300 * 1024;
const SCREENSHOT_NAME = /^(\d{2})-[a-z0-9][a-z0-9-]*\.(png|webp)$/;

{
  const problems = [];
  const shotsDir = join(entryDir, "screenshots");
  // docs/SPEC.md: a signed-in entry may ship no screenshots at all. Every frame
  // of one carries account chrome, and the rule there is to drop the shot rather
  // than retouch it — so requiring one would force the doctored screenshot the
  // spec forbids. Screenshots that ARE present still face every rule below.
  const screenshotsOptional = fm?.auth === "personal-account";
  if (!existsSync(shotsDir)) {
    if (!screenshotsOptional) {
      problems.push("screenshots/ directory is missing (1-5 screenshots required)");
    }
  } else {
    const files = readdirSync(shotsDir).filter((f) => !f.startsWith("."));
    if (files.length < 1 || files.length > 5) {
      problems.push(`found ${files.length} screenshot(s); need 1-5`);
    }
    const numbers = [];
    for (const f of files.sort()) {
      const m = SCREENSHOT_NAME.exec(f);
      if (!m) {
        problems.push(`${f}: name must match NN-<kebab-name>.png|.webp`);
        continue;
      }
      numbers.push(Number(m[1]));
      const path = join(shotsDir, f);
      const bytes = statSync(path).size;
      if (bytes > MAX_SCREENSHOT_BYTES) {
        problems.push(`${f}: ${bytes} bytes exceeds the 300 KB cap`);
      }
      let dim;
      try {
        dim = imageSize(readFileSync(path));
      } catch (err) {
        problems.push(`${f}: cannot decode image: ${err.message}`);
        continue;
      }
      if (dim.type !== m[2]) {
        problems.push(`${f}: extension .${m[2]} but decoded type is ${dim.type}`);
      }
      if (dim.width < 1200 || dim.width > 2000) {
        problems.push(`${f}: width ${dim.width}px outside 1200-2000px`);
      }
    }
    if (numbers.length > 0) {
      if (Math.min(...numbers) !== 1) problems.push("numbering must start at 01");
      if (new Set(numbers).size !== numbers.length) problems.push("duplicate NN prefixes");
    }
  }
  check(
    "screenshots",
    problems.length === 0,
    problems.length === 0 ? "screenshot rules satisfied" : problems.join("; "),
  );
}

// ── corpus-pure ──────────────────────────────────────────────────────────────

/** Recursively collects paths of forbidden keys inside parsed YAML. */
function findForbiddenKeys(node, path, hits) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => findForbiddenKeys(item, `${path}[${i}]`, hits));
  } else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      const keyPath = path ? `${path}.${key}` : key;
      if (key === "source" || key === "dependencies") hits.push(keyPath);
      findForbiddenKeys(value, keyPath, hits);
    }
  }
}

function* walkFiles(dir) {
  for (const ent of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) yield* walkFiles(p);
    else yield p;
  }
}

{
  const problems = [];
  if (!existsSync(sightmapDir)) {
    problems.push(".sightmap/ directory is missing");
  } else {
    for (const file of walkFiles(sightmapDir)) {
      if (!/\.ya?ml$/.test(file)) continue;
      let doc;
      try {
        doc = parseYaml(readFileSync(file, "utf8"));
      } catch {
        continue; // sightmap validate reports YAML errors with better context
      }
      const hits = [];
      findForbiddenKeys(doc, "", hits);
      for (const hit of hits) {
        problems.push(`${relative(entryDir, file)}: forbidden key at ${hit}`);
      }
    }
  }
  check(
    "corpus-pure",
    problems.length === 0,
    problems.length === 0
      ? "no source:/dependencies: keys in the corpus"
      : `atlas maps are observed, not source-derived — ${problems.join("; ")}`,
  );
}

// ── sightmap validate + lint ─────────────────────────────────────────────────

if (existsSync(sightmapDir)) {
  for (const [checkName, verb] of [
    ["sightmap-validate", "validate"],
    ["sightmap-lint", "lint"],
  ]) {
    const res = runSightmap([verb, "--sightmap-dir", sightmapDir]);
    const output = (res.stderr + res.stdout).trim();
    check(
      checkName,
      res.status === 0,
      res.status === 0 ? output.split("\n").at(-1) : output,
    );
  }
} else {
  check("sightmap-validate", false, "skipped: .sightmap/ directory is missing");
  check("sightmap-lint", false, "skipped: .sightmap/ directory is missing");
}

// ── report ───────────────────────────────────────────────────────────────────

const ok = checks.every((c) => c.ok);

if (jsonOutput) {
  console.log(JSON.stringify({ ok, checks }, null, 2));
} else {
  console.log(`validate-entry: ${entryDir}`);
  console.log(`sightmap CLI: ${sightmapCommandDescription()}`);
  for (const c of checks) {
    const mark = c.ok ? "ok  " : "FAIL";
    console.log(`  ${mark} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
  }
  console.log(ok ? "PASS" : `FAIL (${checks.filter((c) => !c.ok).length} failed check(s))`);
}

process.exit(ok ? 0 : 1);
