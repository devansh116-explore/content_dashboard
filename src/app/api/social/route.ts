import { NextRequest, NextResponse } from "next/server";
import { ALL_CATEGORIES, Category, ContentItem, PagedResponse } from "@/lib/types";
import { generateMockItems } from "@/lib/mockData";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

function parseCategories(param: string | null): Category[] {
  if (!param) return [];
  return param
    .split(",")
    .map((c) => c.trim())
    .filter((c): c is Category => (ALL_CATEGORIES as string[]).includes(c));
}

// Social platforms' free tiers don't realistically support a take-home
// assignment (Twitter/X API is paid-only; Instagram requires app review),
// so this route mocks hashtag-style posts as the assignment explicitly
// allows ("this can be a mock API if necessary").
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categories = parseCategories(searchParams.get("categories"));
  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";
  const trending = searchParams.get("trending") === "true";

  const items = generateMockItems("social", categories, page, PAGE_SIZE, trending);
  const filtered = search
    ? items.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()))
    : items;

  const response: PagedResponse<ContentItem> = {
    items: filtered,
    nextPage: page < 5 ? page + 1 : null,
    totalAvailable: 5 * PAGE_SIZE,
  };

  // Simulate light network latency so loading states are visible in the demo.
  await new Promise((r) => setTimeout(r, 250));

  return NextResponse.json(response);
}
