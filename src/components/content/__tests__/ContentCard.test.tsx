import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "@/store/slices/favoritesSlice";
import readLaterReducer from "@/store/slices/readLaterSlice";
import { ContentItem } from "@/lib/types";
import { ToastProvider } from "@/components/ui/ToastProvider";
import ContentCard from "../ContentCard";

const item: ContentItem = {
  id: "news-1",
  source: "news",
  category: "technology",
  title: "A test headline about frontend engineering",
  description: "A short description of the article.",
  imageUrl: "https://example.com/img.jpg",
  url: "https://example.com/article",
  author: "Jane Doe",
  publishedAt: new Date().toISOString(),
  ctaLabel: "Read More",
};

function renderCard() {
  const store = configureStore({ reducer: { favorites: favoritesReducer, readLater: readLaterReducer } });
  render(
    <ToastProvider>
      <Provider store={store}>
        <ContentCard item={item} />
      </Provider>
    </ToastProvider>
  );
  return store;
}

describe("ContentCard", () => {
  it("renders the title, description, and CTA", () => {
    renderCard();
    expect(screen.getByText(item.title)).toBeInTheDocument();
    expect(screen.getByText(item.description)).toBeInTheDocument();
    expect(screen.getByText("Read More")).toBeInTheDocument();
  });

  it("shows the favorite button as not pressed by default", () => {
    renderCard();
    expect(screen.getByLabelText(/add to favorites/i)).toHaveAttribute("aria-pressed", "false");
  });

  it("adds the item to favorites when the heart button is clicked", async () => {
    const user = userEvent.setup();
    const store = renderCard();

    await user.click(screen.getByLabelText(/add to favorites/i));

    expect(store.getState().favorites.order).toEqual(["news-1"]);
    expect(screen.getByLabelText(/remove from favorites/i)).toHaveAttribute("aria-pressed", "true");
  });

  it("removes the item from favorites on a second click", async () => {
    const user = userEvent.setup();
    const store = renderCard();

    await user.click(screen.getByLabelText(/add to favorites/i));
    await user.click(screen.getByLabelText(/remove from favorites/i));

    expect(store.getState().favorites.order).toEqual([]);
  });

  it("saves the item to read later", async () => {
    const user = userEvent.setup();
    const store = renderCard();

    await user.click(screen.getByLabelText(/save for later/i));

    expect(store.getState().readLater.order).toEqual(["news-1"]);
    expect(screen.getByLabelText(/remove from read later/i)).toHaveAttribute("aria-pressed", "true");
  });
});
