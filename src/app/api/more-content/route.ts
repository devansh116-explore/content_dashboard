import { NextRequest, NextResponse } from "next/server";
import { generateMockItems } from "@/lib/mockData";
import { PAGE_SIZE, filterSearch, hasInvalidCategories, parseCategories, parsePage } from "@/lib/queryParams";
import { ContentItem, ContentSource, PagedResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_SOURCES: ContentSource[] = ["news", "recommendation", "social"];
const MAX_MOCK_PAGES = 5;

function parseSources(value: string | null): ContentSource[] {
  if (!value) return VALID_SOURCES;

  return value
    .split(",")
    .map((source) => source.trim().toLowerCase())
    .filter((source): source is ContentSource => VALID_SOURCES.includes(source as ContentSource));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (hasInvalidCategories(searchParams.get("categories"))) {
    return NextResponse.json({ error: "Invalid category filter." }, { status: 400 });
  }
  const categories = parseCategories(searchParams.get("categories"));
  const page = parsePage(searchParams.get("page"));
  const search = searchParams.get("search") ?? "";
  const trending = searchParams.get("trending") === "true";
  const sources = parseSources(searchParams.get("source"));

  const allItems: ContentItem[] = sources.flatMap((source) =>
    filterSearch(generateMockItems(source, categories, 1, PAGE_SIZE * MAX_MOCK_PAGES, trending), search)
  );

  const sortedItems = allItems.sort(
    (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
  );

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const items = sortedItems.slice(start, end);
  const totalAvailable = sortedItems.length;

  const response: PagedResponse<ContentItem> = {
    items,
    nextPage: end < totalAvailable ? page + 1 : null,
    totalAvailable,
  };

  return NextResponse.json(response);
}
