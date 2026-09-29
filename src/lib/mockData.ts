import { ALL_CATEGORIES, Category, ContentItem, ContentSource, MoreInfo } from "./types";

export function buildMoreInfo(item: ContentItem): MoreInfo {
  const summary = item.description || item.title;
  const content = `${summary} This expanded context provides a fuller background for the item, covering the broader implications, key signals, and the latest developments in ${item.category}.`;

  return {
    id: item.id,
    source: item.source,
    category: item.category,
    title: item.title,
    summary,
    content,
    url: item.url,
    imageUrl: item.imageUrl,
    author: item.author,
    publishedAt: item.publishedAt,
  };
}

// Small deterministic PRNG so the same page number always yields the same
// "random" content — makes pagination stable and tests reproducible.
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const TOPICS: Record<Category, string[]> = {
  technology: [
    "Startup ships on-device AI model",
    "New chip promises 2x battery life",
    "Open-source framework hits 1.0",
    "Cloud provider cuts egress fees",
    "Robotics lab open-sources gripper design",
  ],
  sports: [
    "Underdog team clinches playoff spot",
    "Star player returns from injury",
    "League announces new draft rules",
    "Record broken at national championships",
    "Coach signs multi-year extension",
  ],
  finance: [
    "Markets rally on rate-cut hopes",
    "Startup closes Series B round",
    "Regulator proposes new disclosure rules",
    "Currency volatility hits exporters",
    "Index fund inflows hit yearly high",
  ],
  entertainment: [
    "Indie film wins festival top prize",
    "Studio greenlights sequel",
    "Album drops to strong reviews",
    "Streaming service adds live events",
    "Director announces next project",
  ],
  health: [
    "Study links sleep to recovery speed",
    "New guideline on daily movement",
    "Trial shows promising early results",
    "City expands community clinic hours",
    "Researchers refine screening test",
  ],
  science: [
    "Telescope captures distant galaxy cluster",
    "Team maps new protein structure",
    "Mission reaches orbital insertion",
    "Study reframes ice-age timeline",
    "Lab demonstrates room-temp experiment",
  ],
};

const AUTHORS = [
  "J. Meridian",
  "A. Okafor",
  "S. Kapoor",
  "L. Fontaine",
  "R. Ibarra",
  "M. Novak",
];

// Captured once per server process so demo timestamps stay current and stable.
const MOCK_BASE_TIME = Date.now();

function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

function imageFor(category: Category, seed: number): string {
  // picsum.photos gives stable, license-free placeholder photography by seed
  return `https://picsum.photos/seed/${category}-${seed}/480/320`;
}

export function generateMockItems(
  source: ContentSource,
  categories: Category[],
  page: number,
  pageSize: number,
  trending = false
): ContentItem[] {
  const cats = categories.length ? categories : ALL_CATEGORIES;
  const sourceSalt = source === "news" ? 0 : source === "recommendation" ? 101 : 202;
  const rnd = seededRandom(page * 1000 + (trending ? 7 : 1) + sourceSalt);
  const ctaLabel =
    source === "recommendation"
      ? "Play Now"
      : source === "social"
      ? "View Post"
      : "Read More";

  return Array.from({ length: pageSize }, (_, i) => {
    const category = cats[(page * pageSize + i) % cats.length];
    const seed = page * pageSize + i;
    const headline = pick(TOPICS[category], rnd);
    const hoursAgo = Math.floor(rnd() * 72);
    const item: ContentItem = {
      id: `${source}-${category}-${seed}`,
      source,
      category,
      title:
        source === "social"
          ? `#${category} — ${headline}`
          : headline,
      description:
        source === "recommendation"
          ? `Recommended for you based on your interest in ${category}. A closer look at what's trending this week.`
          : `${headline}. Coverage and context on the latest development in ${category}.`,
      imageUrl: imageFor(category, seed),
      url: "https://example.com",
      author: pick(AUTHORS, rnd),
      publishedAt: new Date(MOCK_BASE_TIME - (seed * 6 + hoursAgo) * 3600_000).toISOString(),
      ctaLabel,
      metric: trending
        ? { label: source === "recommendation" ? "score" : "views", value: Math.floor(rnd() * 9000) + 100 }
        : undefined,
    };

    return {
      ...item,
      moreInfo: buildMoreInfo(item),
    };
  });
}
