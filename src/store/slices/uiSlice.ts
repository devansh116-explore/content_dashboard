import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Section = "feed" | "trending" | "favorites";

export interface UiState {
  searchTerm: string;
  activeSection: Section;
}

const initialState: UiState = {
  searchTerm: "",
  activeSection: "feed",
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
  },
});

export const { setSearchTerm, setActiveSection } = uiSlice.actions;
export default uiSlice.reducer;
