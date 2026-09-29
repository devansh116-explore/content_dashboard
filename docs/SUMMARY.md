# Content Dashboard Summary

## What the app does

The dashboard presents a unified content experience by combining multiple sources into a single stream. Users can browse content, search across it, save favorites, and reorder items in the main feed.

## Key features

- Feed with multiple content sources
- Search across the merged content
- Category filtering
- Dark mode support
- Favorite toggling
- Read Later queue with local persistence and clear-all controls
- On-demand content details with retry and copy-summary actions
- Drag-and-drop card reordering
- Infinite scroll / pagination
- Source filtering and For You sorting
- Partial-source failure notices with retry
- Optional validated Smart Summary through an OpenAI-compatible provider
- Mock fallback when APIs are unavailable

## How the content pipeline works

1. A user request enters the dashboard UI.
2. `useUnifiedFeed` gathers data from all active sources.
3. Each source route normalizes data into `ContentItem` entries.
4. The UI merges and sorts results by recency.
5. Pagination loads more content when the intersection observer reaches the sentinel.
6. The app keeps the experience stable even when external APIs are down by falling back to local mock data.
7. Partial provider failures are reported without hiding successful sources.

## Why the project is structured this way

The design separates concerns:

- API routes handle server-side fetching and normalization
- the Redux store handles cache state and query lifecycle
- the hooks combine and sort the content for display
- the UI components render whatever the state layer provides

This separation makes the code easier to extend and keeps live data, mock data, and presentation logic independent.

## Current source model

The app currently supports:

- News
- Recommendations
- Social-style posts

Each source is normalized to the same contract so the feed rendering code only needs to understand one shape.

## Extension point

The system is designed so more sources can be added in the same pattern:

- add a route handler
- normalize to `ContentItem`
- register the endpoint in RTK Query
- include it in the unified feed aggregator

That is the cleanest way to add new data types without disrupting the UI.
