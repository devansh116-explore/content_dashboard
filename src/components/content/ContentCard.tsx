"use client";

import { motion } from "framer-motion";
import { Heart, ExternalLink } from "lucide-react";
import clsx from "clsx";
import { ContentItem } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleFavorite } from "@/store/slices/favoritesSlice";

const SOURCE_LABEL: Record<ContentItem["source"], string> = {
  news: "News",
  recommendation: "Recommendation",
  social: "Social",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ContentCard({ item }: { item: ContentItem }) {
  const dispatch = useAppDispatch();
  const isFavorite = useAppSelector((s) => Boolean(s.favorites.items[item.id]));

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="relative h-36 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
          {SOURCE_LABEL[item.source]}
        </span>
        <button
          onClick={() => dispatch(toggleFavorite(item))}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
        >
          <Heart size={14} className={clsx(isFavorite && "fill-current text-red-400")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-[11px] font-medium capitalize text-neutral-400">
          {item.category} · {timeAgo(item.publishedAt)}
        </span>
        <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {item.title}
        </h3>
        <p className="line-clamp-2 flex-1 text-xs text-neutral-500 dark:text-neutral-400">
          {item.description}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-neutral-400">{item.author}</span>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:underline dark:text-neutral-100"
          >
            {item.ctaLabel}
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
