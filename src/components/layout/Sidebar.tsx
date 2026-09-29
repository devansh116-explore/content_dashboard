"use client";

import { LayoutGrid, Flame, Star, Settings, Clock3 } from "lucide-react";
import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveSection, Section } from "@/store/slices/uiSlice";

const NAV_ITEMS: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: "feed", label: "Feed", icon: LayoutGrid },
  { key: "trending", label: "Trending", icon: Flame },
  { key: "favorites", label: "Favorites", icon: Star },
  { key: "readLater", label: "Read later", icon: Clock3 },
];

export default function Sidebar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const dispatch = useAppDispatch();
  const active = useAppSelector((s) => s.ui.activeSection);
  const favoritesCount = useAppSelector((s) => s.favorites.order.length);
  const readLaterCount = useAppSelector((s) => s.readLater.order.length);

  function getCount(key: Section) {
    if (key === "favorites") return favoritesCount;
    if (key === "readLater") return readLaterCount;
    return 0;
  }

  function renderNavigationItem({ key, label, icon: Icon }: (typeof NAV_ITEMS)[number]) {
    const count = getCount(key);
    return (
      <button
        key={key}
        onClick={() => dispatch(setActiveSection(key))}
        aria-current={active === key ? "page" : undefined}
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
        {count > 0 && (
          <span className={clsx("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", active === key ? "bg-white/20" : "bg-neutral-200 dark:bg-neutral-800")}>
            {count}
          </span>
        )}
      </button>
    );
  }

  return (
    <>
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
          {NAV_ITEMS.map(renderNavigationItem)}
        </nav>

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
        >
          <Settings size={16} />
          Preferences
        </button>
      </aside>
      <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-neutral-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95 md:hidden">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => dispatch(setActiveSection(key))}
            aria-current={active === key ? "page" : undefined}
            className={clsx("flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] font-medium", active === key ? "text-neutral-900 dark:text-white" : "text-neutral-500")}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
