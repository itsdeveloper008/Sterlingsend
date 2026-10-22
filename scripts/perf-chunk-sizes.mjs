/**
 * List largest JS chunks under .next/static/chunks for a quick inventory.
 */
import { readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), ".next", "static", "chunks");
const files = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (name.endsWith(".js")) {
      files.push({
        file: path.relative(path.join(process.cwd(), ".next"), full),
        bytes: st.size,
        kb: Number((st.size / 1024).toFixed(1)),
      });
    }
  }
}

walk(root);
files.sort((a, b) => b.bytes - a.bytes);
const top = files.slice(0, 25);
mkdirSync(path.join(process.cwd(), ".perf"), { recursive: true });
writeFileSync(
  path.join(process.cwd(), ".perf", "chunk-sizes.json"),
  JSON.stringify({ top, totalJsKb: Number((files.reduce((s, f) => s + f.bytes, 0) / 1024).toFixed(1)) }, null, 2),
);
console.log("| file | KB |");
console.log("|------|---:|");
for (const f of top) console.log(`| ${f.file} | ${f.kb} |`);
