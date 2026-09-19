import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "@/store/slices/uiSlice";
import SearchBar from "../SearchBar";

function renderWithStore() {
  const store = configureStore({ reducer: { ui: uiReducer } });
  render(
    <Provider store={store}>
      <SearchBar />
    </Provider>
  );
  return store;
}

describe("SearchBar", () => {
  it("renders an accessible search input", () => {
    renderWithStore();
    expect(screen.getByLabelText(/search content/i)).toBeInTheDocument();
  });

  it("updates the visible input immediately on keystroke", async () => {
    const user = userEvent.setup();
    renderWithStore();
    const input = screen.getByLabelText(/search content/i) as HTMLInputElement;

    await user.type(input, "react");
    expect(input.value).toBe("react");
  });

  it("does not dispatch the search term until after the debounce delay, then dispatches it", async () => {
    const user = userEvent.setup();
    const store = renderWithStore();
    const input = screen.getByLabelText(/search content/i);

    await user.type(input, "react");
    // Right after typing, the debounced value should not have propagated yet.
    expect(store.getState().ui.searchTerm).toBe("");

    // After the debounce window elapses, Redux should reflect the typed term.
    await waitFor(() => expect(store.getState().ui.searchTerm).toBe("react"), { timeout: 1000 });
  });

  it("clears the input when the clear button is clicked", async () => {
    const user = userEvent.setup();
    renderWithStore();
    const input = screen.getByLabelText(/search content/i) as HTMLInputElement;

    await user.type(input, "hello");
    await user.click(screen.getByLabelText(/clear search/i));
    expect(input.value).toBe("");
  });
});
