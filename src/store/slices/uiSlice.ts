import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { ContentSource } from "@/lib/types";

export type Section = "feed" | "trending" | "favorites" | "readLater";
export type SortMode = "newest" | "trending" | "relevance" | "forYou";
export type SourceFilter = "all" | ContentSource;

export interface UiState {
  searchTerm: string;
  activeSection: Section;
  sortMode: SortMode;
  sourceFilter: SourceFilter;
}

const initialState: UiState = {
  searchTerm: "",
  activeSection: "feed",
  sortMode: "newest",
  sourceFilter: "all",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
    setActiveSection(state, action: PayloadAction<Section>) {
      state.activeSection = action.payload;
    },
    setSortMode(state, action: PayloadAction<SortMode>) {
      state.sortMode = action.payload;
    },
    setSourceFilter(state, action: PayloadAction<SourceFilter>) {
      state.sourceFilter = action.payload;
    },
  },
});

export const { setSearchTerm, setActiveSection, setSortMode, setSourceFilter } = uiSlice.actions;
export default uiSlice.reducer;
