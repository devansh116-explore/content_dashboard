import { describe, expect, it, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

const item = {
  id: "news-1",
  source: "news",
  category: "technology",
  title: "A useful technology update",
  description: "A concise description of the selected technology story.",
  imageUrl: "https://example.com/image.jpg",
  url: "https://example.com/story",
  author: "Example News",
  publishedAt: "2026-09-30T00:00:00.000Z",
  ctaLabel: "Read More",
};

describe("AI summary route", () => {
  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  it("returns a labeled fallback when no provider key is configured", async () => {
    const response = await POST(new NextRequest("http://localhost/api/ai/summary", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ item }),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.provider).toBe("fallback");
    expect(body.summary).toContain(item.description);
    expect(body.takeaways.length).toBeGreaterThan(0);
  });

  it("rejects malformed content input", async () => {
    const response = await POST(new NextRequest("http://localhost/api/ai/summary", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ item: { title: "not enough data" } }),
    }));

    expect(response.status).toBe(400);
  });
});