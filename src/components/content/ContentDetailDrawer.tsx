"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { BrainCircuit, Clock3, Copy, ExternalLink, LoaderCircle, RefreshCw, X } from "lucide-react";
import { ContentItem } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleReadLater } from "@/store/slices/readLaterSlice";
import { useGetAiSummaryQuery, useGetMoreInfoQuery } from "@/store/api/contentApi";
import { useToast } from "@/components/ui/ToastProvider";

export default function ContentDetailDrawer({
  item,
  open,
  onClose,
}: {
  item: ContentItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const dialogRef = useRef<HTMLElement | null>(null);
  const isReadLater = useAppSelector((state) => Boolean(item && state.readLater.items[item.id]));
  const { push } = useToast();
  const detailQuery = useGetMoreInfoQuery(open && item ? item : skipToken);
  const [summaryRequested, setSummaryRequested] = useState(false);
  const aiSummaryQuery = useGetAiSummaryQuery(summaryRequested && open && item ? item : skipToken);
  const summary = detailQuery.data?.summary ?? item?.moreInfo?.summary ?? item?.description ?? "";
  const fullContext = detailQuery.data?.content ?? item?.moreInfo?.content;

  useEffect(() => {
    setSummaryRequested(false);
  }, [item?.id, open]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )).filter((element) => !element.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    requestAnimationFrame(() => dialog?.querySelector<HTMLElement>("button")?.focus());
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open]);

  async function handleCopySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      push({ title: "Summary copied", tone: "success" });
    } catch {
      push({ title: "Could not copy summary", description: "Clipboard access is unavailable.", tone: "error" });
    }
  }

  return (
    <AnimatePresence>
      {open && item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />

          <motion.aside
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="content-detail-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  {item.source}
                </p>
                <h2 id="content-detail-title" className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Details
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close details"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-56 w-full rounded-xl object-cover"
                onError={(event) => { event.currentTarget.style.display = "none"; }}
              />

              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                <span className="rounded-full bg-neutral-100 px-2 py-1 dark:bg-neutral-800">
                  {item.category}
                </span>
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  Source: {item.source}
                </span>
                <span>{item.author}</span>
                <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
              </div>

              <h3 className="mt-4 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                {item.title}
              </h3>

              <div className="mt-3 flex items-start justify-between gap-3">
                <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">{summary}</p>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  aria-label="Copy summary"
                  title="Copy summary"
                  className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <Copy size={14} />
                </button>
              </div>

              <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Full context
                </p>
                {detailQuery.isFetching && fullContext && (
                  <p role="status" className="mt-3 inline-flex items-center gap-2 text-xs text-neutral-500">
                    <LoaderCircle size={13} className="animate-spin" />
                    Refreshing details
                  </p>
                )}
                {detailQuery.isFetching && !fullContext ? (
                  <p role="status" className="mt-3 inline-flex items-center gap-2 text-sm text-neutral-500">
                    <LoaderCircle size={14} className="animate-spin" />
                    Loading full context
                  </p>
                ) : fullContext ? (
                  <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-200">{fullContext}</p>
                ) : (
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm text-neutral-500">
                    <span>{detailQuery.isError ? "Full context could not be loaded." : "No additional context available."}</span>
                    {detailQuery.isError && (
                      <button
                        type="button"
                        onClick={() => void detailQuery.refetch()}
                        className="inline-flex shrink-0 items-center gap-1 font-medium text-neutral-800 hover:underline dark:text-neutral-100"
                      >
                        <RefreshCw size={13} />
                        Retry
                      </button>
                    )}
                  </div>
                )}
                {detailQuery.isError && fullContext && (
                  <button
                    type="button"
                    onClick={() => void detailQuery.refetch()}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    <RefreshCw size={12} />
                    Refresh full context
                  </button>
                )}
              </div>

              <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Smart summary</p>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Optional AI-assisted takeaways.</p>
                  </div>
                  {!summaryRequested && (
                    <button
                      type="button"
                      onClick={() => setSummaryRequested(true)}
                      className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
                    >
                      <BrainCircuit size={14} />
                      Generate
                    </button>
                  )}
                </div>
                {summaryRequested && aiSummaryQuery.isFetching && (
                  <p role="status" className="mt-3 inline-flex items-center gap-2 text-sm text-neutral-500">
                    <LoaderCircle size={14} className="animate-spin" />
                    Preparing summary
                  </p>
                )}
                {summaryRequested && aiSummaryQuery.data && (
                  <div className="mt-3 space-y-3">
                    <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">{aiSummaryQuery.data.summary}</p>
                    <ul className="list-disc space-y-1 pl-5 text-xs text-neutral-600 dark:text-neutral-300">
                      {aiSummaryQuery.data.takeaways.map((takeaway) => <li key={takeaway}>{takeaway}</li>)}
                    </ul>
                    <p className="text-[10px] uppercase tracking-wide text-neutral-400">
                      {aiSummaryQuery.data.provider === "openai" ? `Generated by ${aiSummaryQuery.data.model}` : "Fallback summary"}
                    </p>
                  </div>
                )}
                {summaryRequested && aiSummaryQuery.isError && (
                  <button
                    type="button"
                    onClick={() => void aiSummaryQuery.refetch()}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:underline dark:text-neutral-300"
                  >
                    <RefreshCw size={12} />
                    Retry summary
                  </button>
                )}
              </div>

              {item.metric && (
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    {item.metric.label}
                  </span>
                  <span className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {item.metric.value}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-neutral-200 p-4 dark:border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => dispatch(toggleReadLater(item))}
                  aria-pressed={isReadLater}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
                >
                  <Clock3 size={14} />
                  {isReadLater ? "Saved" : "Read later"}
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  {item.ctaLabel}
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
