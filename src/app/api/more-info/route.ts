import { NextRequest, NextResponse } from "next/server";
import { buildMoreInfo, generateMockItems } from "@/lib/mockData";
import { Category, ContentItem, ContentSource, MoreInfo, isContentItem } from "@/lib/types";

const VALID_SOURCES: ContentSource[] = ["news", "recommendation", "social"];
const VALID_CATEGORIES: Category[] = [
  "technology",
  "sports",
  "finance",
  "entertainment",
  "health",
  "science",
];

function normalizeSource(value: string | null): ContentSource | null {
  return value === null ? "news" : VALID_SOURCES.includes(value as ContentSource) ? (value as ContentSource) : null;
}

function normalizeCategory(value: string | null): Category | null {
  return value === null ? "technology" : VALID_CATEGORIES.includes(value as Category) ? (value as Category) : null;
}

function getFallbackItem(source: ContentSource, category: Category, id: string): ContentItem {
  const [generated] = generateMockItems(source, [category], 1, 1, false);
  return {
    ...generated,
    id,
    source,
    category,
    title: generated.title,
    description: generated.description,
    author: generated.author,
    publishedAt: generated.publishedAt,
    url: generated.url,
    imageUrl: generated.imageUrl,
    ctaLabel: generated.ctaLabel,
    moreInfo: {
      id,
      source,
      category,
      title: generated.title,
      summary: generated.description,
      content: `${generated.description} This expanded context explains the broader market, editorial relevance, and likely next steps for ${category}.`,
      url: generated.url,
      imageUrl: generated.imageUrl,
      author: generated.author,
      publishedAt: generated.publishedAt,
    },
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const source = normalizeSource(searchParams.get("source"));
  const category = normalizeCategory(searchParams.get("category"));
  const id = searchParams.get("id") ?? `${source}-${category}-0`;

  if (!source || !category || !id || id.length > 500) {
    return NextResponse.json({ error: "Invalid detail lookup parameters." }, { status: 400 });
  }

  const item = getFallbackItem(source, category, id);
  const moreInfo: MoreInfo = item.moreInfo ?? {
    id: item.id,
    source: item.source,
    category: item.category,
    title: item.title,
    summary: item.description,
    content: `${item.description} This expanded context explains the background, significance, and likely next steps for ${item.category}.`,
    url: item.url,
    imageUrl: item.imageUrl,
    author: item.author,
    publishedAt: item.publishedAt,
  };

  return NextResponse.json({
    id: item.id,
    source: item.source,
    category: item.category,
    title: item.title,
    description: item.description,
    summary: moreInfo.summary,
    url: item.url,
    imageUrl: item.imageUrl,
    author: item.author,
    publishedAt: item.publishedAt,
    moreInfo,
    content: moreInfo.content,
  });
}

export async function POST(req: NextRequest) {
  const body: unknown = await req.json().catch(() => null);
  if (!isContentItem(body)) {
    return NextResponse.json({ error: "A valid content item is required." }, { status: 400 });
  }

  const moreInfo = buildMoreInfo(body);
  return NextResponse.json({
    id: body.id,
    summary: moreInfo.summary,
    content: moreInfo.content,
    moreInfo,
  });
}
