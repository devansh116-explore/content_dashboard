import { AiSummary, ContentItem } from "@/lib/types";

export function buildFallbackSummary(item: ContentItem): AiSummary {
  return {
    summary: item.description || `This ${item.category} item is available from ${item.source}.`,
    takeaways: [
      `Topic: ${item.category}`,
      `Source: ${item.source}`,
      `Published by: ${item.author}`,
    ],
    provider: "fallback",
  };
}

export function parseAiSummary(value: unknown, model: string): AiSummary | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as { summary?: unknown; takeaways?: unknown };
  if (
    typeof candidate.summary !== "string" ||
    candidate.summary.trim().length < 20 ||
    candidate.summary.length > 2_000 ||
    !Array.isArray(candidate.takeaways) ||
    candidate.takeaways.length > 5 ||
    !candidate.takeaways.every((takeaway) => typeof takeaway === "string" && takeaway.length <= 300)
  ) {
    return null;
  }

  return {
    summary: candidate.summary.trim(),
    takeaways: candidate.takeaways.map((takeaway) => takeaway.trim()).filter(Boolean),
    provider: "openai",
    model,
  };
}