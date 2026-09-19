"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { setSearchTerm } from "@/store/slices/uiSlice";
import { useDebounce } from "@/hooks/useDebounce";

export default function SearchBar() {
  const dispatch = useAppDispatch();
  const [input, setInput] = useState("");
  const debounced = useDebounce(input, 350);

  useEffect(() => {
    dispatch(setSearchTerm(debounced));
  }, [debounced, dispatch]);

  return (
    <div className="relative w-full max-w-md">
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
  );
}
