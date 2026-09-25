import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ContentItem } from "@/lib/types";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";

export interface FavoritesState {
  items: Record<string, ContentItem>;
  order: string[]; // ids, in user-chosen display order (drag-and-drop target)
  hydrated: boolean;
}

const defaultState: FavoritesState = {
  items: {},
  order: [],
  hydrated: false,
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: defaultState,
  reducers: {
    hydrate(state) {
      const saved = getHydratedFavorites();
      state.items = saved.items;
      state.order = saved.order;
      state.hydrated = true;
    },
    toggleFavorite(state, action: PayloadAction<ContentItem>) {
      const item = action.payload;
      if (state.items[item.id]) {
        delete state.items[item.id];
        state.order = state.order.filter((id) => id !== item.id);
      } else {
        state.items[item.id] = item;
        state.order.push(item.id);
      }
      persist(state);
    },
    reorderFavorites(state, action: PayloadAction<string[]>) {
      state.order = action.payload;
      persist(state);
    },
  },
});

function persist(state: FavoritesState) {
  writeStorage(STORAGE_KEYS.favorites, { items: state.items, order: state.order });
}

function getHydratedFavorites(): Pick<FavoritesState, "items" | "order"> {
  const saved = readStorage<unknown>(STORAGE_KEYS.favorites, null);
  if (!saved || typeof saved !== "object") return { items: {}, order: [] };

  const candidate = saved as { items?: unknown; order?: unknown };
  const items = candidate.items && typeof candidate.items === "object" && !Array.isArray(candidate.items)
    ? candidate.items as Record<string, ContentItem>
    : {};
  const order = Array.isArray(candidate.order)
    ? candidate.order.filter((id): id is string => typeof id === "string" && Boolean(items[id]))
    : [];

  return { items, order };
}

export const { hydrate: hydrateFavorites, toggleFavorite, reorderFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
