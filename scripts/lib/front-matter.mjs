// Minimal YAML front matter parser for entry README.md files.
//
// Uses the `yaml` package (YAML 1.2 core schema), so unquoted dates like
// `2026-08-05` stay strings — exactly what schema/entry.schema.json expects.

import { readFileSync } from "node:fs";
import { parse } from "yaml";

/**
 * Parses the front matter block of a README.md.
 * Returns { data } on success, { error } on failure. `data` is the parsed
 * YAML mapping between the leading `---` fence and the closing `---` fence.
 */
export function parseFrontMatter(readmePath) {
  let raw;
  try {
    raw = readFileSync(readmePath, "utf8");
  } catch (err) {
    return { error: `cannot read ${readmePath}: ${err.message}` };
  }

  if (!raw.startsWith("---\n") && !raw.startsWith("---\r\n")) {
    return { error: "README.md does not start with a `---` front matter fence" };
  }
  const fenceEnd = raw.indexOf("\n---", 3);
  if (fenceEnd === -1) {
    return { error: "front matter is never closed by a `---` fence" };
  }
  const block = raw.slice(raw.indexOf("\n") + 1, fenceEnd);

  let data;
  try {
    data = parse(block);
  } catch (err) {
    return { error: `front matter is not valid YAML: ${err.message}` };
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return { error: "front matter is not a YAML mapping" };
  }
  return { data };
}
