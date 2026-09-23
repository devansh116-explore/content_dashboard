"use client";

import { Moon, Sun, User, Settings } from "lucide-react";
import SearchBar from "@/components/search/SearchBar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleDarkMode } from "@/store/slices/preferencesSlice";

export default function Header({ onOpenSettings }: { onOpenSettings: () => void }) {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((s) => s.preferences.darkMode);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80 md:px-6">
      <SearchBar />

      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch(toggleDarkMode())}
          aria-label="Toggle dark mode"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          onClick={onOpenSettings}
          aria-label="Open account settings"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
        >
          <Settings size={16} />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          <User size={16} />
        </div>
      </div>
    </header>
  );
}
