// Shared sightmap CLI acquisition for atlas scripts.
//
// Resolution order:
//   1. $SIGHTMAP_BIN        — path to a prebuilt sightmap binary (CI caches one;
//                             also the way to test unmerged CLI branches).
//   2. `go run github.com/sightmap/sightmap/go/cmd/sightmap@<ref>` — requires a
//      Go toolchain; <ref> is $SIGHTMAP_REF if set, else PINNED_SIGHTMAP_REF.
//
// Bump procedure for the pin: change PINNED_SIGHTMAP_REF below to a new tag or
// commit SHA of sightmap/sightmap, run both scripts against fixtures/ locally
// (`node scripts/validate-entry.mjs fixtures/valid-entry`), and land the bump
// as its own PR so entry validation changes are attributable to the CLI bump.
export const PINNED_SIGHTMAP_REF = "main";

import { spawnSync } from "node:child_process";

const MODULE_PATH = "github.com/sightmap/sightmap/go/cmd/sightmap";

/** Human-readable description of how the CLI is being acquired (for logs). */
export function sightmapCommandDescription() {
  if (process.env.SIGHTMAP_BIN) return process.env.SIGHTMAP_BIN;
  const ref = process.env.SIGHTMAP_REF || PINNED_SIGHTMAP_REF;
  return `go run ${MODULE_PATH}@${ref}`;
}

/**
 * Runs `sightmap <args>` synchronously.
 * Returns { status, stdout, stderr }; status is null if the spawn itself failed.
 */
export function runSightmap(args) {
  let cmd, argv;
  if (process.env.SIGHTMAP_BIN) {
    cmd = process.env.SIGHTMAP_BIN;
    argv = args;
  } else {
    const ref = process.env.SIGHTMAP_REF || PINNED_SIGHTMAP_REF;
    cmd = "go";
    argv = ["run", `${MODULE_PATH}@${ref}`, ...args];
  }
  const res = spawnSync(cmd, argv, { encoding: "utf8" });
  if (res.error) {
    return {
      status: null,
      stdout: "",
      stderr: `failed to spawn ${cmd}: ${res.error.message}`,
    };
  }
  return { status: res.status, stdout: res.stdout, stderr: res.stderr };
}

/** True when the CLI reported that a verb does not exist in this build. */
export function isUnknownVerb(result, verb) {
  return (
    result.status !== 0 &&
    typeof result.stderr === "string" &&
    result.stderr.includes(`unknown command "${verb}"`)
  );
}
