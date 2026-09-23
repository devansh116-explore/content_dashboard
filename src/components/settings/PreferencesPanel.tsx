"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";
import { ALL_CATEGORIES } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleCategory } from "@/store/slices/preferencesSlice";

export default function PreferencesPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((s) => s.preferences.categories);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Preferences
              </h2>
              <button
                onClick={onClose}
                aria-label="Close preferences"
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
              Content categories
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((category) => {
                const active = categories.includes(category);
                return (
                  <button
                    key={category}
                    onClick={() => dispatch(toggleCategory(category))}
                    aria-pressed={active}
                    className={clsx(
                      "rounded-full border px-3 py-1.5 text-sm capitalize transition-colors",
                      active
                        ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                        : "border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-400"
                    )}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <p className="mt-6 text-xs text-neutral-400">
              Selections are saved automatically and used to filter your feed and
              trending sections.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
