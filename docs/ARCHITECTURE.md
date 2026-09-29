# Content Dashboard Architecture

## Overview

This project is a personalized content dashboard that merges content from multiple sources into a single feed. The app combines news, recommendations, and social-style posts in one searchable, reorderable interface.

## High-level flow

1. The user opens the dashboard in the browser.
2. The feed layer requests content from the app's API routes.
3. Each route normalizes a third-party or mock source into a common `ContentItem` shape.
4. The frontend merges the results from all sources and renders a unified feed.
5. The user can search, filter, favorite, and reorder cards.
6. Additional items are loaded through page-based pagination in the source RTK Query endpoints.
7. Read-later items are persisted locally and can be opened from a dedicated section.
8. Detail context is loaded on demand and falls back to the normalized card payload.
9. Smart Summary optionally sends the selected item to a server-side LLM adapter and validates its structured response.

## Folder structure

- `src/app` — route handlers and page shell
- `src/components` — UI blocks such as cards, grid, sections, sidebar, and header
- `src/hooks` — data orchestration hooks like the unified feed and ordering logic
- `src/store` — Redux slices and RTK Query API definitions
- `src/lib` — shared types, mock data, and query utilities
- `src/app/api` — server-side API entry points for fetch/proxying
- `docs` — architecture and summary documentation

## Data model

The shared data contract lives in `src/lib/types.ts` and is centered on the `ContentItem` interface.

Each content item includes:

- `id`
- `source`
- `category`
- `title`
- `description`
- `imageUrl`
- `url`
- `author`
- `publishedAt`
- `ctaLabel`
- optional `metric`
- optional `moreInfo`

This normalization keeps the frontend agnostic of which backend vendor produced the data.

## API routes

### News route
`src/app/api/news/route.ts`

- Reads categories, page, search, and trending filters.
- Uses `NEWS_API_KEY` when available.
- Falls back to deterministic mock content when the key is missing or the live API fails.
- Returns a paged response with `items`, `nextPage`, and `totalAvailable`.

### Recommendations route
`src/app/api/recommendations/route.ts`

- Reads the same feed filters.
- Uses TMDB when `TMDB_API_KEY` is configured.
- Falls back to the seeded mock generator otherwise.
- Standardizes the response into `ContentItem[]`.

### Social route
`src/app/api/social/route.ts`

- Always returns mocked social posts.
- Provides a lightweight demo source for a social feed without a paid API.

### Detail routes
`src/app/api/more-info/route.ts`

- `POST /api/more-info` validates the selected `ContentItem` and returns expanded context for that exact item.
- The detail drawer requests this payload when opened, shows loading/error states, and retains the card data as a fallback.
- `GET /api/more-info` remains available for ID-based lookups.

### AI summary route
`src/app/api/ai/summary/route.ts`

- Accepts only a validated `ContentItem`.
- Uses an OpenAI-compatible chat-completions endpoint only when `OPENAI_API_KEY` is configured.
- Requires JSON-shaped summary output and rejects oversized or malformed model responses.
- Falls back to deterministic source/category takeaways on missing keys, provider errors, timeouts, or invalid output.

### More content route
`src/app/api/more-content/route.ts`

- Aggregates deterministic mock content across multiple sources for direct API consumers.
- Supports `page`, `categories`, `search`, `source`, and `trending`.
- Returns a stable page-numbered list for additional consumers; the main feed uses the source endpoints directly so their RTK Query merge caches retain earlier pages.

## Frontend composition

### Unified feed hook
`src/hooks/useUnifiedFeed.ts`

This hook is the central orchestration layer. It:

- reads category and search state from Redux
- issues queries for all sources
- merges the returned arrays into one sorted list
- tracks whether more data is available
- exposes `loadMore()` for infinite scroll

### Content grid
`src/components/content/ContentGrid.tsx`

This component renders the cards and watches a scroll sentinel using `IntersectionObserver`.
When the sentinel enters view and `hasMore` is true, it triggers `onLoadMore()`.

### Content cards
`src/components/content/ContentCard.tsx`

Each card displays:

- source chip
- image
- category and date
- title
- summary
- author
- CTA link
- favorite toggle

## State management

The app uses Redux Toolkit and RTK Query:

- `src/store/api/contentApi.ts` contains the query endpoints and caching logic
- `src/store/slices/preferencesSlice.ts` stores selected categories and UI preferences
- `src/store/slices/favoritesSlice.ts` stores favorited content and custom ordering
- `src/store/slices/readLaterSlice.ts` stores saved-for-later content and custom ordering
- `src/store/slices/uiSlice.ts` stores the active section and search state

## Mock and fallback behavior

The app intentionally works without external keys.

`src/lib/mockData.ts` uses a seeded PRNG, so that:

- data is deterministic
- pagination is stable
- tests are reproducible
- the demo still works offline or during API outages

## Why this architecture works

This design keeps the system resilient because:

- each external API is isolated behind a server route
- the frontend never touches API keys directly
- the client always consumes one normalized format
- mock data can replace live data without frontend changes
- new data sources can be added by following the same route pattern
- provider requests have bounded timeouts and lightweight request throttling

## Future extension points

The architecture is prepared for adding more content types by following the same pattern:

1. add a source route under `src/app/api/...`
2. normalize the payload into `ContentItem`
3. register the query in the RTK Query API
4. optionally add it to the unified feed aggregation

This keeps the system scalable without turning the frontend into a source-specific data layer.
