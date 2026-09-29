import { NextRequest, NextResponse } from "next/server";
import { buildFallbackSummary, parseAiSummary } from "@/lib/aiSummary";
import { ContentItem, isContentItem } from "@/lib/types";
import { checkRateLimit, requestClientKey } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

function promptFor(item: ContentItem) {
  return [
    "Summarize the content item below for a busy reader.",
    "Return JSON only with this exact shape: {\"summary\": string, \"takeaways\": string[] }.",
    "Do not invent facts that are not present in the supplied content.",
    "Keep the summary under 120 words and provide at most 3 takeaways.",
    `Title: ${item.title}`,
    `Description: ${item.description}`,
    `Source: ${item.source}`,
    `Category: ${item.category}`,
    `Author: ${item.author}`,
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(`ai-summary:${requestClientKey(req)}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many summary requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const body: unknown = await req.json().catch(() => null);
  const item = body && typeof body === "object" && "item" in body ? (body as { item?: unknown }).item : null;
  if (!isContentItem(item)) {
    return NextResponse.json({ error: "A valid content item is required." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const fallback = buildFallbackSummary(item);
  if (!apiKey) return NextResponse.json(fallback);

  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 300,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You produce concise, factual summaries from supplied content." },
          { role: "user", content: promptFor(item) },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`AI provider error ${response.status}`);
    const payload: unknown = await response.json();
    const content =
      payload && typeof payload === "object" && "choices" in payload && Array.isArray(payload.choices)
        ? (payload.choices[0] as { message?: { content?: unknown } } | undefined)?.message?.content
        : null;
    if (typeof content !== "string") throw new Error("AI provider returned no message");

    const parsed = parseAiSummary(JSON.parse(content), model);
    return NextResponse.json(parsed ?? fallback);
  } catch {
    return NextResponse.json(fallback);
  }
}