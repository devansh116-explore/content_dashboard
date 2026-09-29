"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type ToastTone = "success" | "info" | "error";

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone?: ToastTone;
}

const ToastContext = createContext<{ push: (toast: Omit<ToastItem, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = (toast: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 2600);
  };

  const value = useMemo(() => ({ push }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[70] flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              className={[
                "rounded-xl border bg-white p-3 shadow-lg dark:border-neutral-800 dark:bg-neutral-900",
                toast.tone === "success"
                  ? "border-emerald-200 dark:border-emerald-900"
                  : toast.tone === "error"
                  ? "border-red-200 dark:border-red-900"
                  : "border-neutral-200 dark:border-neutral-800",
              ].join(" ")}
            >
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {toast.title}
              </div>
              {toast.description && (
                <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {toast.description}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
