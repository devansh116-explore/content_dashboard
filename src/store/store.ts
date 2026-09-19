import { configureStore } from "@reduxjs/toolkit";
import { contentApi } from "./api/contentApi";
import preferencesReducer from "./slices/preferencesSlice";
import favoritesReducer from "./slices/favoritesSlice";
import uiReducer from "./slices/uiSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      preferences: preferencesReducer,
      favorites: favoritesReducer,
      ui: uiReducer,
      [contentApi.reducerPath]: contentApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(contentApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
