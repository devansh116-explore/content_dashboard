import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ContentItem, isContentItem } from "@/lib/types";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";

export interface ReadLaterState {
  items: Record<string, ContentItem>;
  order: string[];
  hydrated: boolean;
}

const defaultState: ReadLaterState = {
  items: {},
  order: [],
  hydrated: false,
};

const readLaterSlice = createSlice({
  name: "readLater",
  initialState: defaultState,
  reducers: {
    hydrate(state) {
      const saved = getHydratedReadLater();
      state.items = saved.items;
      state.order = saved.order;
      state.hydrated = true;
    },
    toggleReadLater(state, action: PayloadAction<ContentItem>) {
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
    clearReadLater(state) {
      state.items = {};
      state.order = [];
      persist(state);
    },
  },
});

function persist(state: ReadLaterState) {
  writeStorage(STORAGE_KEYS.readLater, { items: state.items, order: state.order });
}

function getHydratedReadLater(): Pick<ReadLaterState, "items" | "order"> {
  const saved = readStorage<unknown>(STORAGE_KEYS.readLater, null);
  if (!saved || typeof saved !== "object") return { items: {}, order: [] };

  const candidate = saved as { items?: unknown; order?: unknown };
  const items: Record<string, ContentItem> = {};
  if (candidate.items && typeof candidate.items === "object" && !Array.isArray(candidate.items)) {
    for (const [id, value] of Object.entries(candidate.items)) {
      if (isContentItem(value) && value.id === id) items[id] = value;
    }
  }
  const order = Array.isArray(candidate.order)
    ? candidate.order.filter((id): id is string => typeof id === "string" && Boolean(items[id]))
    : [];

  return { items, order };
}

export const { hydrate: hydrateReadLater, toggleReadLater, clearReadLater } = readLaterSlice.actions;
export default readLaterSlice.reducer;
