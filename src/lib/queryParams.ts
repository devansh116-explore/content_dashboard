import { ALL_CATEGORIES, Category } from "@/lib/types";

export const PAGE_SIZE = 12;

export function parsePage(value: string | null): number {
  const page = Number(value ?? "1");
  return Number.isInteger(page) && page >= 1 && page <= 100 ? page : 1;
}

export function parseCategories(param: string | null): Category[] {
  if (!param) return [];
  return param
    .split(",")
    .map((category) => category.trim())
    .filter((category): category is Category => (ALL_CATEGORIES as string[]).includes(category));
}

export function filterSearch<T extends { title: string }>(items: T[], search: string): T[] {
  const normalized = search.trim().toLowerCase();
  return normalized ? items.filter((item) => item.title.toLowerCase().includes(normalized)) : items;
}

export function hasInvalidCategories(param: string | null): boolean {
  if (!param) return false;
  const values = param.split(",").map((category) => category.trim());
  return values.length === 0 || values.some((category) => !(ALL_CATEGORIES as string[]).includes(category));
}