import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ALL_CATEGORIES, Category } from "@/lib/types";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";

export interface PreferencesState {
  categories: Category[];
  darkMode: boolean;
  hydrated: boolean;
}

const defaultState: PreferencesState = {
  categories: ["technology", "finance", "entertainment"],
  darkMode: false,
  hydrated: false,
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState: defaultState,
  reducers: {
    // Called once on the client after mount to load anything saved from a
    // previous session, without causing a server/client hydration mismatch.
    hydrate(state) {
      const saved = getHydratedPreferences();
      state.categories = saved.categories;
      state.darkMode = saved.darkMode;
      state.hydrated = true;
    },
    toggleCategory(state, action: PayloadAction<Category>) {
      const category = action.payload;
      state.categories = state.categories.includes(category)
        ? state.categories.filter((c) => c !== category)
        : [...state.categories, category];
      persist(state);
    },
    setCategories(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload;
      persist(state);
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      persist(state);
    },
  },
});

function persist(state: PreferencesState) {
  writeStorage(STORAGE_KEYS.preferences, {
    categories: state.categories,
    darkMode: state.darkMode,
  });
}

function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (ALL_CATEGORIES as string[]).includes(value);
}

function getHydratedPreferences(): Pick<PreferencesState, "categories" | "darkMode"> {
  const saved = readStorage<unknown>(STORAGE_KEYS.preferences, null);
  if (!saved || typeof saved !== "object") {
    return { categories: defaultState.categories, darkMode: defaultState.darkMode };
  }

  const candidate = saved as { categories?: unknown; darkMode?: unknown };
  const categories = Array.isArray(candidate.categories)
    ? candidate.categories.filter(isCategory)
    : defaultState.categories;

  return {
    categories: categories.length ? categories : defaultState.categories,
    darkMode: typeof candidate.darkMode === "boolean" ? candidate.darkMode : defaultState.darkMode,
  };
}

export const { hydrate, toggleCategory, setCategories, toggleDarkMode } = preferencesSlice.actions;
export default preferencesSlice.reducer;
export { ALL_CATEGORIES };
