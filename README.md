# Personalized Content Dashboard

A dashboard that merges news, movie recommendations, and social posts into one
personalized, searchable, favoritable feed. Built with Next.js (App Router),
TypeScript, Redux Toolkit + RTK Query, Tailwind CSS, Framer Motion, and
`@dnd-kit`.

**Live demo:** [contentdashboard-theta.vercel.app](https://contentdashboard-theta.vercel.app/)

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **No API keys are
required** — the app serves realistic, deterministic mock data out of the box
(see [Data sources](#data-sources) below).

## Project docs

- [docs/README.md](docs/README.md)
- [docs/SUMMARY.md](docs/SUMMARY.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

These explain the API structure, the unified feed flow, and the architecture of the dashboard.

### Optional: live API keys

Copy `.env.local.example` to `.env.local` and fill in either or both:

```bash
cp .env.local.example .env.local
```

| Variable        | Powers                  | Get a key at                             |
| --------------- | ------------------------ | ----------------------------------------- |
| `NEWS_API_KEY`  | News section              | https://newsapi.org                        |
| `TMDB_API_KEY`  | Recommendations section    | https://www.themoviedb.org/settings/api   |
| `OPENAI_API_KEY` | Optional Smart Summary    | https://platform.openai.com/api-keys      |

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
npm run test:e2e     # end-to-end tests (Playwright) — builds and serves automatically
```

## Architecture

```
src/
  app/
    api/{news,recommendations,social}/route.ts   # server-side source proxies
    api/{more-content,more-info}/route.ts       # aggregated/detail APIs
    page.tsx                                      # dashboard shell
    layout.tsx                                    # providers, theme sync
  components/
    layout/       Sidebar, Header
    content/       ContentCard, ContentGrid (infinite scroll + optional drag-and-drop),
                    SortableCardWrapper, Feed/Trending/Favorites/Read Later sections,
                    detail drawer, state views
    search/        Debounced SearchBar
    settings/       PreferencesPanel (category picker)
    providers/       ReduxProvider, ThemeSync
  store/
    slices/          preferences, favorites, readLater, ui
    api/contentApi.ts   RTK Query endpoints
  hooks/            useDebounce, useUnifiedFeed, useOrderedItems
  lib/                types, mock data, storage, rate limiting, query utilities
e2e/                 Playwright specs (search, favorites drag-and-drop, feed drag-and-drop)
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
  caching, loading/error state, and page-based pagination via a custom
  `merge` function per endpoint (the standard RTK Query "infinite list"
  pattern). Each endpoint's `serializeQueryArgs` includes the endpoint name
  explicitly — RTK Query does **not** automatically namespace a custom
  serializer by endpoint, so three endpoints with structurally similar args
  can otherwise collide onto the same cache entry. (This bit me once during
  development — see the note below.)
- **Redux slices** (`preferences`, `favorites`, `readLater`, `ui`) own client state:
  selected categories, dark mode, favorited and read-later items with manual
  display orders, source filters, sort mode, and the debounced search term.
  `preferences`, `favorites`, and `readLater` persist
  to `localStorage` and are hydrated client-side after mount (via a
  `hydrate` action dispatched in a `useEffect`) to avoid SSR/CSR hydration
  mismatches — the server never has access to `localStorage`.

### The unified feed

`useUnifiedFeed` (in `src/hooks/`) calls the active RTK Query hooks with the
same filter args, merges their `items`, applies source/sort preferences, and
exposes a single `{ items, isLoading, isError, hasMore, loadMore }` surface.
It also reports partial source failures so the UI can show a retryable warning
while preserving successful results. Both the Feed and Trending sections use
this hook; Trending additionally re-sorts by a mock engagement metric.

### Saved content and details

- **Read Later** stores a device-local queue with ordering, a dedicated section,
  mobile navigation, and a clear-all action.
- **ContentDetailDrawer** loads expanded context on demand through the detail
  API, supports retry and copy-summary actions, and falls back to card data if
  the request fails.
- **Smart Summary** is an optional, user-triggered OpenAI-compatible flow. It
  validates structured output, never exposes the provider key to the browser,
  and returns a labeled deterministic fallback when no key is configured.
- Search controls support source filtering and `For you` sorting based on
  selected, favorited, and saved categories plus freshness.

### Drag-and-drop reordering

`ContentGrid` takes an optional `onReorder(activeId, overId)` callback; when
provided, it wraps its cards in a `@dnd-kit` `DndContext`/`SortableContext`
with both a `PointerSensor` and a `KeyboardSensor` (drag handles are real
`<button>` elements, so they're reachable by Tab and operable with arrow
keys — not mouse/touch-only). Two call sites share this:

- **Feed** — `useOrderedItems` layers a session-local display order on top
  of the RTK-Query-fetched items: dragging a card moves it, and newly
  arriving items (from search/filter changes or "load more") are appended
  at the end rather than resetting the order. This isn't persisted to
  `localStorage`, since the underlying feed content is dynamic/paginated —
  the order applies to the current session only.
- **Favorites** — reorders `favorites.order` in Redux directly, which *is*
  persisted, since a favorites list is a stable set the user curates.

### Testing strategy

- **Unit** (Vitest): `preferencesSlice` and `favoritesSlice` reducers —
  toggling, persistence to `localStorage`, hydration from a previous
  session.
- **Component** (Vitest + React Testing Library): `SearchBar` (debounce
  timing, verified with real timers and `waitFor` rather than mocked timers,
  which proved more reliable against React's scheduler) and `ContentCard`
  (rendering, favorite toggle).
- **Integration** (Vitest + RTL, `FeedSection.integration.test.tsx`): exercises
  the real pipeline — Redux store, RTK Query's `fetchBaseQuery`, and the
  rendered component tree together — with only `fetch` mocked (routed by
  which of the three API paths it's called with). Covers the loading
  skeleton, successful render across all three merged sources, the empty
  state, and the error state. This is distinct from the component tests
  above, which exercise one component in isolation with props/mock stores;
  this suite is what actually proves the fetch → Redux → render pipeline
  works end-to-end, which is what the brief's "content renders properly
  when fetched... empty states, errors" requirement is asking for.
- **API route tests** cover detail validation and stable aggregated pagination.
- **E2E** (Playwright): debounced search, favoriting a card end-to-end
  through Redux, and drag-and-drop reordering (both keyboard and
  pointer-based) on **both** the Favorites section and the main Feed.

## Data sources

| Section | Live source (optional) | Mock fallback |
|---|---|---|
| News | NewsAPI top-headlines/everything | Deterministic seeded generator, 6 categories |
| Recommendations | TMDB popular/trending/search | Same generator, "Play Now" CTA |
| Social | — (always mocked) | Same generator, hashtag-styled titles |

Smart Summary uses `OPENAI_API_KEY`, `OPENAI_MODEL`, and optionally
`OPENAI_BASE_URL`. It is disabled by omission of the key, without disabling the
rest of the dashboard.

External provider requests use an 8-second timeout and a lightweight per-client
in-memory limiter. A multi-instance deployment should replace that limiter with
platform-level or Redis-backed throttling.

The mock generator (`src/lib/mockData.ts`) uses a seeded PRNG (not `Math.random`)
so a given page/category/source combination always produces the same items —
this made pagination and the E2E tests reproducible during development. Each
of the three sources is salted independently so they don't coincidentally
generate the same headline for the same feed position.

## Accessibility

- Card images carry the item's headline as `alt` text (they're informative
  content, not decoration).
- Sidebar nav exposes `aria-current="page"` for the active section; category
  chips and the favorite toggle expose `aria-pressed`.
- Drag-and-drop works via keyboard (Tab to a handle, arrow keys to move,
  covered by an E2E test) as well as pointer/touch.
- Settings/preferences are reachable from both the sidebar and the header
  (the header entry point matches the brief's own layout language: "top
  header with a search bar, user settings, and account info").

This isn't a full WCAG audit — no screen-reader pass or automated `axe`
scan was run — but the structural basics (semantic buttons, labelled
controls, keyboard-operable interactions) are in place.

## Self-review pass

After the initial build, I went back through the brief section-by-section
as an evaluator would and fixed what I'd actually missed rather than just
noting it:

- **Drag-and-drop was Favorites-only.** The brief says "reorder the content
  cards in **their feed**" — that's the main feed. Added (see above), with
  its own E2E coverage.
- **No integration tests.** The brief names this as a distinct category from
  unit tests ("Ensure that content is rendered properly when it is fetched
  and handle edge cases like no content, empty states, and errors"). Added
  `FeedSection.integration.test.tsx` (see Testing strategy above). Writing
  it also surfaced a couple of real bugs worth naming: `fetchBaseQuery`
  needs an absolute `baseUrl` to work under Node's `fetch`/`Request` (which,
  unlike a browser, has no document base URL to resolve a relative path
  against) — fixed by deriving it from `window.location.origin`, which is
  also just a more robust choice than a bare `"/api"` in general.
- **Accessibility gaps** — see the section above.

**Genuinely out of reach from this environment, not silently skipped:** a
recorded demo video and a hosted live link, both explicitly requested in
the brief's submission guidelines. I can't record video or deploy to a
public host from here — if you'd like, I can walk through deploying this to
Vercel, which is a couple of minutes once you have an account.

## Scope notes — what's here and what's deliberately deferred

This assignment's full spec (auth, real-time WebSocket updates, i18n, a
complete Cypress/Playwright suite covering every flow, RTK Query for *every*
piece of state) is more than a 48-hour scope realistically allows end-to-end
at production quality. Priorities, in order:

**Built:**
- Personalized feed merging 3 sources, with preferences persisted
- Debounced search across all sources
- Infinite scroll (IntersectionObserver-based)
- Drag-and-drop reordering on both the main Feed (session-local) and
  Favorites (persisted), with pointer and keyboard support
- Dark mode (CSS custom properties + Tailwind, persisted)
- Loading/empty/error states everywhere data is fetched
- Framer Motion micro-interactions (card hover, panel transitions)
- Unit, integration, component, and E2E test coverage on the highest-value
  flows

**Deliberately deferred** (would tackle next, in this order):
1. A recorded demo video and a hosted live link (see Self-review pass above)
2. Auth (NextAuth.js) and per-user saved preferences server-side
3. Real-time updates via WebSockets/SSE for the social feed
4. `react-i18next` multi-language support
5. A dedicated design system pass (current styling is a clean, consistent
   utility-first baseline rather than a fully bespoke visual identity)
6. A full automated accessibility audit (`axe`/screen-reader pass) beyond
   the structural basics described above

## Known limitations

- The mock image host (`picsum.photos`) requires outbound internet access;
  if your deployment environment blocks it, card images will 404 — content
  and functionality are unaffected.
- `NEWS_API_KEY`'s free tier restricts `top-headlines` to one category per
  request; multi-category selections use the first selected category for
  live News queries (mock data covers all selected categories evenly).
- Feed reordering is session-local (see "Drag-and-drop reordering" above) —
  refreshing the page returns the feed to its fetched order. This is a
  deliberate choice given paginated, server-driven content, not an
  oversight, but worth knowing going in.
