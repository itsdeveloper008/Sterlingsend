import { PAGE_ENTRIES, urlsetResponse } from "@/lib/sitemap";

export const dynamic = "force-static";

export function GET() {
  return urlsetResponse(PAGE_ENTRIES);
}
