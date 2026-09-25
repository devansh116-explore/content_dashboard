import { NextRequest, NextResponse } from "next/server";
import { ContentItem, PagedResponse } from "@/lib/types";
import { generateMockItems } from "@/lib/mockData";
import { filterSearch, PAGE_SIZE, parseCategories, parsePage } from "@/lib/queryParams";

export const dynamic = "force-dynamic";

// Social platforms' free tiers don't realistically support a take-home
// assignment (Twitter/X API is paid-only; Instagram requires app review),
// so this route mocks hashtag-style posts as the assignment explicitly
// allows ("this can be a mock API if necessary").
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categories = parseCategories(searchParams.get("categories"));
  const page = parsePage(searchParams.get("page"));
  const search = searchParams.get("search") ?? "";
  const trending = searchParams.get("trending") === "true";

  const items = generateMockItems("social", categories, page, PAGE_SIZE, trending);
  const filtered = filterSearch(items, search);

  const response: PagedResponse<ContentItem> = {
    items: filtered,
    nextPage: page < 5 ? page + 1 : null,
    totalAvailable: 5 * PAGE_SIZE,
  };

  // Simulate light network latency so loading states are visible in the demo.
  await new Promise((r) => setTimeout(r, 250));

  return NextResponse.json(response);
}
