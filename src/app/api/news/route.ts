import { NextRequest, NextResponse } from "next/server";
import { Category, ContentItem, PagedResponse } from "@/lib/types";
import { generateMockItems } from "@/lib/mockData";
import { filterSearch, hasInvalidCategories, PAGE_SIZE, parseCategories, parsePage } from "@/lib/queryParams";
import { checkRateLimit, requestClientKey } from "@/lib/rateLimit";

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

function mapArticleToItem(article: NewsApiArticle, category: Category, page: number, index: number): ContentItem {
  const item: ContentItem = {
    id: article.url ?? `news-${category}-${page}-${index}`,
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

  return {
    ...item,
    moreInfo: {
      id: item.id,
      source: item.source,
      category: item.category,
      title: item.title,
      summary: item.description,
      content: `${item.description} This expanded overview adds additional context from the publisher and a summary of the wider story behind the update.`,
      url: item.url,
      imageUrl: item.imageUrl,
      author: item.author,
      publishedAt: item.publishedAt,
    },
  };
}

export async function GET(req: NextRequest) {
  const rateLimit = checkRateLimit(`news:${requestClientKey(req)}`);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }
  const { searchParams } = new URL(req.url);
  if (hasInvalidCategories(searchParams.get("categories"))) {
    return NextResponse.json({ error: "Invalid category filter." }, { status: 400 });
  }
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
    const requestedCategories = categories.length ? categories : ["technology" as Category];
    const categoriesToFetch = search ? [requestedCategories[0]] : requestedCategories;
    const responses = await Promise.all(categoriesToFetch.map(async (category) => {
      const newsApiCategory = category === "finance" ? "business" : category;
      const params = new URLSearchParams({
        apiKey,
        page: String(page),
        pageSize: String(PAGE_SIZE),
        language: "en",
      });
      if (search) params.set("q", search);
      const endpoint = search
        ? `https://newsapi.org/v2/everything?${params.toString()}`
        : `https://newsapi.org/v2/top-headlines?${params.toString()}&category=${newsApiCategory}`;
      const res = await fetch(endpoint, { next: { revalidate: 60 }, signal: AbortSignal.timeout(8_000) });
      if (!res.ok) throw new Error(`NewsAPI error ${res.status}`);
      const data = await res.json();
      return {
        category,
        totalResults: Number(data.totalResults) || 0,
        articles: (data.articles ?? []) as NewsApiArticle[],
      };
    }));
    const items = responses
      .flatMap(({ category, articles }) => articles.map((article, index) => mapArticleToItem(article, category, page, index)))
      .filter((item, index, values) => values.findIndex((candidate) => candidate.id === item.id) === index)
      .slice(0, PAGE_SIZE);
    const totalResults = responses.reduce((total, response) => total + response.totalResults, 0);

    const response: PagedResponse<ContentItem> = {
      items,
      nextPage: items.length === PAGE_SIZE ? page + 1 : null,
      totalAvailable: totalResults || items.length,
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
