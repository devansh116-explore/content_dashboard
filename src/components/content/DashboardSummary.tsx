"use client";

import { Bookmark, Clock3, Layers3 } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { ALL_CATEGORIES } from "@/lib/types";

export default function DashboardSummary() {
  const favoritesCount = useAppSelector((s) => s.favorites.order.length);
  const readLaterCount = useAppSelector((s) => s.readLater.order.length);
  const categories = useAppSelector((s) => s.preferences.categories);

  const cards = [
    {
      label: "Selected topics",
      value: categories.length || ALL_CATEGORIES.length,
      helper: `${categories.length ? categories.length : ALL_CATEGORIES.length} active`,
      icon: Layers3,
    },
    {
      label: "Favorites",
      value: favoritesCount,
      helper: favoritesCount === 1 ? "saved highlight" : "saved highlights",
      icon: Bookmark,
    },
    {
      label: "Read later",
      value: readLaterCount,
      helper: readLaterCount === 1 ? "queued article" : "queued articles",
      icon: Clock3,
    },
  ];

  return (
    <div className="mb-5 grid gap-3 md:grid-cols-3">
      {cards.map(({ label, value, helper, icon: Icon }) => (
        <div
          key={label}
          className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              {label}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              <Icon size={16} />
            </span>
          </div>
          <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{value}</div>
          <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{helper}</div>
        </div>
      ))}
    </div>
  );
}
