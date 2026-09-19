export type ContentSource = "news" | "recommendation" | "social";

export type Category =
  | "technology"
  | "sports"
  | "finance"
  | "entertainment"
  | "health"
  | "science";

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
  metric?: {
    label: string; // "views" | "score" | "likes"
    value: number;
  };
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
