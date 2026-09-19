# Personalized Content Dashboard

A dashboard that merges news, movie recommendations, and social posts into one
personalized, searchable, favoritable feed. Built with Next.js (App Router),
TypeScript, Redux Toolkit + RTK Query, Tailwind CSS, Framer Motion, and
`@dnd-kit`.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **No API keys are
required** — the app serves realistic, deterministic mock data out of the box
(see [Data sources](#data-sources) below).

### Optional: live API keys

Copy `.env.local.example` to `.env.local` and fill in either or both:

```bash
cp .env.local.example .env.local
```

| Variable        | Powers                  | Get a key at                             |
| --------------- | ------------------------ | ----------------------------------------- |
| `NEWS_API_KEY`  | News section              | https://newsapi.org                        |
| `TMDB_API_KEY`  | Recommendations section    | https://www.themoviedb.org/settings/api   |

If a key is missing, or the live call fails for any reason (rate limit,
network), that section transparently falls back to mock data — the app never
shows a broken or empty screen because of an API outage.

The Social section is always mocked. Twitter/X's API has no viable free tier
and Instagram's requires app review, both incompatible with a take-home
assignment timeline — the brief explicitly allows a mock here.

## Scripts

```bash
npm run dev          # start the dev server
npm run build        # production build
npm run start        # run the production build
npm run lint         # eslint
npm run test         # unit + component tests (Vitest + React Testing Library)
npm run test:watch   # unit tests in watch mode
npm run test:e2e     # end-to-end tests (Playwright) — builds & serves automatically
```

## Architecture

```
src/
  app/
    api/{news,recommendations,social}/route.ts   # server-side proxy routes
    page.tsx                                      # dashboard shell
    layout.tsx                                    # providers, theme sync
  components/
    layout/       Sidebar, Header
    content/       ContentCard, ContentGrid (infinite scroll), Feed/Trending/Favorites sections, state views
    search/        Debounced SearchBar
    settings/       PreferencesPanel (category picker)
    providers/       ReduxProvider, ThemeSync
  store/
    slices/          preferences, favorites, ui
    api/contentApi.ts   RTK Query endpoints
  hooks/            useDebounce, useUnifiedFeed
  lib/                types, mock data generator, localStorage helper
e2e/                 Playwright specs
```

### Why API routes proxy the external APIs

The browser never calls NewsAPI/TMDB directly. `NEWS_API_KEY`/`TMDB_API_KEY`
are server-only env vars, read inside Next.js Route Handlers
(`src/app/api/*/route.ts`), which fetch the external API and return a
normalized `ContentItem[]` shape. This keeps API keys out of client bundles
entirely and gives one consistent response shape to the frontend regardless
of source.

### State management

- **RTK Query** owns all server data (news/recommendations/social), including
  caching, loading/error state, and cursor-based pagination via a custom
  `merge` function per endpoint (the standard RTK Query "infinite list"
  pattern). Each endpoint's `serializeQueryArgs` includes the endpoint name
  explicitly — RTK Query does **not** automatically namespace a custom
  serializer by endpoint, so three endpoints with structurally similar args
  can otherwise collide onto the same cache entry. (This bit me once during
  development — see the note below.)
- **Redux slices** (`preferences`, `favorites`, `ui`) own client state:
  selected categories, dark mode, favorited items with a manual display
  order, and the debounced search term. `preferences` and `favorites` persist
  to `localStorage` and are hydrated client-side after mount (via a
  `hydrate` action dispatched in a `useEffect`) to avoid SSR/CSR hydration
  mismatches — the server never has access to `localStorage`.

### The unified feed

`useUnifiedFeed` (in `src/hooks/`) calls all three RTK Query hooks with the
same filter args, merges their `items`, sorts by recency, and exposes a
single `{ items, isLoading, isError, hasMore, loadMore }` surface. Both the
Feed and Trending sections use this hook (Trending additionally re-sorts by
a mock engagement metric) — the pagination, loading, and error-handling logic
is written once and shared.

### Testing strategy

- **Unit** (Vitest): `preferencesSlice` and `favoritesSlice` reducers —
  toggling, persistence to `localStorage`, hydration from a previous
  session.
- **Component** (Vitest + React Testing Library): `SearchBar` (debounce
  timing, verified with real timers and `waitFor` rather than mocked timers,
  which proved more reliable against React's scheduler) and `ContentCard`
  (rendering, favorite toggle).
- **E2E** (Playwright): search-then-filter, and the two flows most likely to
  hide integration bugs — favoriting a card end-to-end through Redux, and
  drag-and-drop reordering via `@dnd-kit`'s pointer-based sensor. Running the
  E2E suite is also what surfaced the RTK Query cache-key bug mentioned
  above: it initially failed because three sources were rendering as
  duplicated "News" cards.

## Data sources

| Section | Live source (optional) | Mock fallback |
|---|---|---|
| News | NewsAPI top-headlines/everything | Deterministic seeded generator, 6 categories |
| Recommendations | TMDB popular/trending/search | Same generator, "Play Now" CTA |
| Social | — (always mocked) | Same generator, hashtag-styled titles |

The mock generator (`src/lib/mockData.ts`) uses a seeded PRNG (not `Math.random`)
so a given page/category/source combination always produces the same items —
this made pagination and the E2E tests reproducible during development. Each
of the three sources is salted independently so they don't coincidentally
generate the same headline for the same feed position.

## Scope notes — what's here and what's deliberately deferred

This assignment's full spec (auth, real-time WebSocket updates, i18n, a
complete Cypress/Playwright suite covering every flow, RTK Query for *every*
piece of state) is more than a 48-hour scope realistically allows end-to-end
at production quality. Priorities, in order:

**Built:**
- Personalized feed merging 3 sources, with preferences persisted
- Debounced search across all sources
- Infinite scroll (IntersectionObserver-based)
- Favorites with drag-and-drop reordering
- Dark mode (CSS custom properties + Tailwind, persisted)
- Loading/empty/error states everywhere data is fetched
- Framer Motion micro-interactions (card hover, panel transitions)
- Unit, component, and E2E test coverage on the highest-value flows

**Deliberately deferred** (would tackle next, in this order):
1. Broader Playwright coverage (currently the two highest-value flows are
   covered; an auth flow doesn't apply since there's no auth in this build)
2. Auth (NextAuth.js) and per-user saved preferences server-side
3. Real-time updates via WebSockets/SSE for the social feed
4. `react-i18next` multi-language support
5. A dedicated design system pass (current styling is a clean, consistent
   utility-first baseline rather than a fully bespoke visual identity)

## Known limitations

- The mock image host (`picsum.photos`) requires outbound internet access;
  if your deployment environment blocks it, card images will 404 — content
  and functionality are unaffected.
- `NEWS_API_KEY`'s free tier restricts `top-headlines` to one category per
  request; multi-category selections use the first selected category for
  live News queries (mock data covers all selected categories evenly).
