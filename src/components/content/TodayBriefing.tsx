"use client";

import { useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { ContentItem } from "@/lib/types";
import { useUnifiedFeed } from "@/hooks/useUnifiedFeed";
import ContentDetailDrawer from "./ContentDetailDrawer";

export default function TodayBriefing() {
  const { items, isLoading } = useUnifiedFeed();
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const picks = items.slice(0, 3);

  if (isLoading || !picks.length) return null;

  return (
    <section className="mb-6 border-b border-neutral-200 pb-5 dark:border-neutral-800">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
          <Sparkles size={15} />
        </span>
        <div>
          <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Today&apos;s briefing</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Three quick picks from your current feed.</p>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {picks.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedItem(item)}
            className="group flex min-w-0 items-start gap-3 rounded-lg border border-neutral-200 bg-white p-3 text-left transition hover:border-neutral-400 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
          >
            <span className="text-lg font-semibold text-neutral-300 dark:text-neutral-700">0{index + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">{item.category} · {item.source}</span>
              <span className="mt-1 block line-clamp-2 text-sm font-medium text-neutral-800 dark:text-neutral-100">{item.title}</span>
            </span>
            <ArrowUpRight size={14} className="mt-1 shrink-0 text-neutral-400 transition group-hover:text-neutral-900 dark:group-hover:text-white" />
          </button>
        ))}
      </div>
      <ContentDetailDrawer item={selectedItem} open={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} />
    </section>
  );
}