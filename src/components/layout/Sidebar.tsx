"use client";

import { LayoutGrid, Flame, Star, Settings } from "lucide-react";
import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveSection, Section } from "@/store/slices/uiSlice";

const NAV_ITEMS: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: "feed", label: "Feed", icon: LayoutGrid },
  { key: "trending", label: "Trending", icon: Flame },
  { key: "favorites", label: "Favorites", icon: Star },
];

export default function Sidebar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const dispatch = useAppDispatch();
  const active = useAppSelector((s) => s.ui.activeSection);
  const favoritesCount = useAppSelector((s) => s.favorites.order.length);

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-neutral-200 bg-white px-3 py-6 dark:border-neutral-800 dark:bg-neutral-950 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900">
          C
        </div>
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Content Dashboard
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => dispatch(setActiveSection(key))}
            className={clsx(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active === key
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
            )}
          >
            <span className="flex items-center gap-2">
              <Icon size={16} />
              {label}
            </span>
            {key === "favorites" && favoritesCount > 0 && (
              <span
                className={clsx(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  active === key ? "bg-white/20" : "bg-neutral-200 dark:bg-neutral-800"
                )}
              >
                {favoritesCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <button
        onClick={onOpenSettings}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
      >
        <Settings size={16} />
        Preferences
      </button>
    </aside>
  );
}
