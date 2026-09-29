export type ContentSource = "news" | "recommendation" | "social";

export type Category =
  | "technology"
  | "sports"
  | "finance"
  | "entertainment"
  | "health"
  | "science";

export interface MoreInfo {
  id: string;
  source: ContentSource;
  category: Category;
  title: string;
  summary: string;
  content: string;
  url: string;
  imageUrl: string;
  author: string;
  publishedAt: string;
}

export interface AiSummary {
  summary: string;
  takeaways: string[];
  provider: "openai" | "fallback";
  model?: string;
}

export interface ContentItem {
  id: string;
  source: ContentSource;
  category: Category;
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  author: string;
  publishedAt: string; // ISO date string
  ctaLabel: string; // "Read More" | "Play Now" | "View Post"
  isDemo?: boolean;
  metric?: {
    label: string; // "views" | "score" | "likes"
    value: number;
  };
  moreInfo?: MoreInfo;
}

export function isContentItem(value: unknown): value is ContentItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ContentItem>;
  return (
    typeof item.id === "string" && item.id.length > 0 &&
    (['news', 'recommendation', 'social'] as ContentSource[]).includes(item.source as ContentSource) &&
    ALL_CATEGORIES.includes(item.category as Category) &&
    typeof item.title === "string" &&
    typeof item.description === "string" &&
    typeof item.imageUrl === "string" &&
    typeof item.url === "string" &&
    typeof item.author === "string" &&
    typeof item.publishedAt === "string" && !Number.isNaN(Date.parse(item.publishedAt)) &&
    typeof item.ctaLabel === "string"
  );
}

export interface PagedResponse<T> {
  items: T[];
  nextPage: number | null;
  totalAvailable: number;
}

export interface ContentQueryArgs {
  categories: Category[];
  page: number;
  pageSize: number;
  search?: string;
  trending?: boolean;
}

export const ALL_CATEGORIES: Category[] = [
  "technology",
  "sports",
  "finance",
  "entertainment",
  "health",
  "science",
];
