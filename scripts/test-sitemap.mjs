/**
 * Fails if any URL in /sitemap.xml does not return HTTP 200 (after redirects).
 * Usage: node scripts/test-sitemap.mjs http://127.0.0.1:3103
 */
const BASE = (process.argv[2] || "http://127.0.0.1:3103").replace(/\/$/, "");

const res = await fetch(`${BASE}/sitemap.xml`);
if (!res.ok) {
  console.error(`FAIL sitemap.xml status ${res.status}`);
  process.exit(1);
}
const xml = await res.text();
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locs.length === 0) {
  console.error("FAIL sitemap has no <loc> entries");
  process.exit(1);
}

const vercel = locs.filter((u) => u.includes("vercel.app"));
if (vercel.length) {
  console.error("FAIL sitemap contains vercel.app URLs:", vercel);
  process.exit(1);
}
const notCanonical = locs.filter((u) => !u.startsWith("https://sterlingsend.com"));
if (notCanonical.length) {
  console.error("FAIL sitemap base is not https://sterlingsend.com:", notCanonical.slice(0, 5));
  process.exit(1);
}

let fail = 0;
for (const loc of locs) {
  const path = loc.replace("https://sterlingsend.com", "") || "/";
  const probe = `${BASE}${path === "/" ? "/" : path}`;
  try {
    const r = await fetch(probe, { redirect: "follow" });
    if (r.status !== 200) {
      console.error(`FAIL ${path} → ${r.status}`);
      fail += 1;
    } else {
      console.log(`PASS ${path} → 200`);
    }
  } catch (err) {
    console.error(`FAIL ${path} → ${err.message}`);
    fail += 1;
  }
}

console.log(`\n${locs.length - fail}/${locs.length} sitemap URLs returned 200`);
process.exit(fail ? 1 : 0);
