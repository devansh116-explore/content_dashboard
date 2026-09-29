"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSearchTerm, setSortMode, setSourceFilter, SortMode, SourceFilter } from "@/store/slices/uiSlice";
import { useDebounce } from "@/hooks/useDebounce";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "forYou", label: "For you" },
  { value: "newest", label: "Newest" },
  { value: "trending", label: "Trending" },
  { value: "relevance", label: "Relevance" },
];

export default function SearchBar() {
  const dispatch = useAppDispatch();
  const sortMode = useAppSelector((s) => s.ui.sortMode);
  const sourceFilter = useAppSelector((s) => s.ui.sourceFilter);
  const [input, setInput] = useState("");
  const debounced = useDebounce(input, 350);

  useEffect(() => {
    dispatch(setSearchTerm(debounced));
  }, [debounced, dispatch]);

  return (
    <div className="flex min-w-0 w-full items-center gap-2">
      <div className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search news, recommendations, posts…"
          aria-label="Search content"
          className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-8 text-sm
                     outline-none transition focus:border-neutral-400 focus:bg-white
                     dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-600"
        />
        {input && (
          <button
            onClick={() => setInput("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <label className="relative block">
        <span className="sr-only">Sort by</span>
        <select
          value={sortMode}
          onChange={(event) => dispatch(setSortMode(event.target.value as SortMode))}
          className="appearance-none rounded-full border border-neutral-200 bg-white px-3 py-2 pr-8 text-sm text-neutral-700 outline-none transition focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="relative hidden sm:block">
        <span className="sr-only">Filter by source</span>
        <select
          value={sourceFilter}
          onChange={(event) => dispatch(setSourceFilter(event.target.value as SourceFilter))}
          className="appearance-none rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none transition focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
        >
          <option value="all">All sources</option>
          <option value="news">News</option>
          <option value="recommendation">Recommendations</option>
          <option value="social">Social</option>
        </select>
      </label>
    </div>
  );
}
