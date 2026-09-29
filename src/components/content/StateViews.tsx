import { Inbox, AlertTriangle } from "lucide-react";

export function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="h-36 w-full bg-neutral-200 dark:bg-neutral-800" />
      <div className="space-y-2 p-4">
        <div className="h-2.5 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3.5 w-5/6 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function EmptyState({ message = "No content yet" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 py-16 text-center dark:border-neutral-800">
      <Inbox size={28} className="text-neutral-300 dark:text-neutral-700" />
      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{message}</p>
      <p className="max-w-xs text-xs text-neutral-400">
        Try adjusting your preferences or search terms.
      </p>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-red-200 py-16 text-center dark:border-red-900/40">
      <AlertTriangle size={28} className="text-red-300 dark:text-red-800" />
      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
        Something went wrong loading this content.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function PartialErrorNotice({ sources, rateLimitedSources = [], onRetry }: { sources: string[]; rateLimitedSources?: string[]; onRetry?: () => void }) {
  const isRateLimited = rateLimitedSources.length > 0;
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
      <span>{isRateLimited ? `${rateLimitedSources.join(", ")} reached its request limit. Please wait before retrying.` : `${sources.join(", ")} ${sources.length === 1 ? "source is" : "sources are"} temporarily unavailable. Showing the rest of your feed.`}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-semibold underline underline-offset-2">
          Retry
        </button>
      )}
    </div>
  );
}

export function SourceStatus({ items }: { items: { source: string; isDemo?: boolean }[] }) {
  if (!items.length) return null;
  const demoCount = items.filter((item) => item.isDemo).length;
  const liveCount = items.length - demoCount;
  const label = liveCount === 0 ? "Demo mode · Mock content" : demoCount === 0 ? "Live sources" : "Mixed live + demo sources";
  const style = liveCount === 0
    ? "border-neutral-200 bg-neutral-100 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
    : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200";

  return <div className={`mb-4 inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${style}`}>{label}</div>;
}
