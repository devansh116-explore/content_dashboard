import { NextRequest, NextResponse } from "next/server";
import { Category, ContentItem, PagedResponse } from "@/lib/types";
import { generateMockItems } from "@/lib/mockData";
import { filterSearch, hasInvalidCategories, PAGE_SIZE, parseCategories, parsePage } from "@/lib/queryParams";
import { checkRateLimit, requestClientKey } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

interface TmdbMovie {
  id?: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  release_date?: string;
  vote_average?: number;
}

function mapMovieToItem(movie: TmdbMovie, index: number): ContentItem {
  const item: ContentItem = {
    id: `tmdb-${movie.id ?? index}`,
    source: "recommendation",
    category: "entertainment",
    title: movie.title ?? movie.name ?? "Untitled",
    description: movie.overview ?? "",
    imageUrl: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : `https://picsum.photos/seed/tmdb-${index}/480/320`,
    url: `https://www.themoviedb.org/movie/${movie.id ?? ""}`,
    author: "TMDB",
    publishedAt: movie.release_date ? new Date(movie.release_date).toISOString() : new Date().toISOString(),
    ctaLabel: "Play Now",
    metric: movie.vote_average ? { label: "score", value: Math.round(movie.vote_average * 10) } : undefined,
  };

  return {
    ...item,
    moreInfo: {
      id: item.id,
      source: item.source,
      category: item.category,
      title: item.title,
      summary: item.description,
      content: `${item.description} This expanded profile gives a fuller view of the title's tone, pacing, and why it fits the recommendation profile.`,
      url: item.url,
      imageUrl: item.imageUrl,
      author: item.author,
      publishedAt: item.publishedAt,
    },
  };
}

export async function GET(req: NextRequest) {
  const rateLimit = checkRateLimit(`recommendations:${requestClientKey(req)}`);
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

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    const items = generateMockItems("recommendation", categories, page, PAGE_SIZE, trending);
    const filtered = filterSearch(items, search);
    const response: PagedResponse<ContentItem> = {
      items: filtered,
      nextPage: page < 5 ? page + 1 : null,
      totalAvailable: 5 * PAGE_SIZE,
    };
    return NextResponse.json(response);
  }

  if (categories.length > 0 && !categories.includes("entertainment")) {
    return NextResponse.json({ items: [], nextPage: null, totalAvailable: 0 } satisfies PagedResponse<ContentItem>);
  }

  try {
    const endpoint = search
      ? `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
          search
        )}&page=${page}`
      : trending
      ? `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&page=${page}`
      : `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}`;

    const res = await fetch(endpoint, { next: { revalidate: 300 }, signal: AbortSignal.timeout(8_000) });
    if (!res.ok) throw new Error(`TMDB error ${res.status}`);
    const data = await res.json();
    const results: TmdbMovie[] = data.results ?? [];
    const items: ContentItem[] = results.map(mapMovieToItem);

    const response: PagedResponse<ContentItem> = {
      items,
      nextPage: data.page < data.total_pages ? data.page + 1 : null,
      totalAvailable: data.total_results ?? items.length,
    };
    return NextResponse.json(response);
  } catch {
    const items = filterSearch(generateMockItems("recommendation", categories, page, PAGE_SIZE, trending), search);
    const response: PagedResponse<ContentItem> = {
      items,
      nextPage: page < 5 ? page + 1 : null,
      totalAvailable: 5 * PAGE_SIZE,
    };
    return NextResponse.json(response);
  }
}
