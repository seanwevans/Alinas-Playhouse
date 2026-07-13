// Resolves the local (relative) import graph starting from playhouse.js and
// fails if any relative import points at a file that does not exist. Bare
// specifiers (three, cannon-es, miniplex, ...) are resolved in the browser via
// the import map in index.html, so they are intentionally skipped here.
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const seen = new Set();
const problems = [];

function walk(file) {
  if (seen.has(file)) return;
  seen.add(file);
  if (!existsSync(file)) {
    problems.push(`missing file: ${file}`);
    return;
  }
  const src = readFileSync(file, "utf8");
  // Fresh regex per file so the shared lastIndex is never carried across the
  // recursive calls below.
  const re = /\bfrom\s*["']([^"']+)["']|^\s*import\s*["']([^"']+)["']/gm;
  for (const match of src.matchAll(re)) {
    const spec = match[1] || match[2];
    if (!spec || spec.startsWith("http") || !spec.startsWith(".")) continue;
    const target = resolve(dirname(file), spec);
    if (!existsSync(target)) {
      problems.push(`${file}: unresolved import '${spec}'`);
    } else {
      walk(target);
    }
  }
}

walk(resolve("playhouse.js"));

if (problems.length > 0) {
  console.error("Broken local imports:\n" + problems.map((p) => "  " + p).join("\n"));
  process.exit(1);
}
console.log(
  `OK: ${seen.size} local modules reachable from playhouse.js, all relative imports resolve.`
);
