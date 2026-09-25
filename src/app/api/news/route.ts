import { NextRequest, NextResponse } from "next/server";
import { Category, ContentItem, PagedResponse } from "@/lib/types";
import { generateMockItems } from "@/lib/mockData";
import { filterSearch, PAGE_SIZE, parseCategories, parsePage } from "@/lib/queryParams";

export const dynamic = "force-dynamic";

interface NewsApiArticle {
  url?: string;
  title?: string;
  description?: string;
  content?: string;
  urlToImage?: string;
  author?: string;
  source?: { name?: string };
  publishedAt?: string;
}

function mapArticleToItem(article: NewsApiArticle, category: Category, index: number): ContentItem {
  return {
    id: article.url ?? `news-${category}-${index}`,
    source: "news",
    category,
    title: article.title ?? "Untitled",
    description: article.description ?? article.content ?? "",
    imageUrl: article.urlToImage ?? `https://picsum.photos/seed/news-${category}-${index}/480/320`,
    url: article.url ?? "https://example.com",
    author: article.author ?? article.source?.name ?? "Unknown",
    publishedAt: article.publishedAt ?? new Date().toISOString(),
    ctaLabel: "Read More",
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categories = parseCategories(searchParams.get("categories"));
  const page = parsePage(searchParams.get("page"));
  const search = searchParams.get("search") ?? "";
  const trending = searchParams.get("trending") === "true";

  const apiKey = process.env.NEWS_API_KEY;

  // No key configured -> serve deterministic mock data so the app
  // is fully demoable out of the box without any setup.
  if (!apiKey) {
    const items = generateMockItems("news", categories, page, PAGE_SIZE, trending);
    const filtered = filterSearch(items, search);
    const response: PagedResponse<ContentItem> = {
      items: filtered,
      nextPage: page < 5 ? page + 1 : null,
      totalAvailable: 5 * PAGE_SIZE,
    };
    return NextResponse.json(response);
  }

  try {
    const category = categories[0] ?? "technology";
    const params = new URLSearchParams({
      apiKey,
      page: String(page),
      pageSize: String(PAGE_SIZE),
      language: "en",
    });
    if (search) params.set("q", search);
    const endpoint = search
      ? `https://newsapi.org/v2/everything?${params.toString()}`
      : `https://newsapi.org/v2/top-headlines?${params.toString()}&category=${category}`;

    const res = await fetch(endpoint, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`NewsAPI error ${res.status}`);
    const data = await res.json();
    const articles: NewsApiArticle[] = data.articles ?? [];
    const items: ContentItem[] = articles.map((a, i) => mapArticleToItem(a, category, i));

    const response: PagedResponse<ContentItem> = {
      items,
      nextPage: items.length === PAGE_SIZE ? page + 1 : null,
      totalAvailable: data.totalResults ?? items.length,
    };
    return NextResponse.json(response);
  } catch {
    // Live API failed (rate limit, network, bad key) — degrade to mock
    // data rather than showing a broken dashboard.
    const items = filterSearch(generateMockItems("news", categories, page, PAGE_SIZE, trending), search);
    const response: PagedResponse<ContentItem> = {
      items,
      nextPage: page < 5 ? page + 1 : null,
      totalAvailable: 5 * PAGE_SIZE,
    };
    return NextResponse.json(response);
  }
}
