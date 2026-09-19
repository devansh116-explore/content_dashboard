"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store/store";
import { hydrate as hydratePreferences } from "@/store/slices/preferencesSlice";
import { hydrateFavorites } from "@/store/slices/favoritesSlice";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  // Lazy-initialized once per component instance (not per render) — the
  // recommended pattern for creating a stable, non-serializable value like
  // a Redux store, without touching refs during render.
  const [store] = useState(() => makeStore());

  useEffect(() => {
    // Runs once on the client after first mount — reads localStorage and
    // syncs it into the store. Doing this in an effect (rather than as the
    // slice's initial state) avoids a server/client hydration mismatch,
    // since the server has no access to the browser's localStorage.
    store.dispatch(hydratePreferences());
    store.dispatch(hydrateFavorites());
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
