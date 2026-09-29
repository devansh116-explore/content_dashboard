import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

describe("more-info API route", () => {
  it("returns a full detail payload for an item lookup", async () => {
    const request = new NextRequest(
      "http://localhost/api/more-info?id=news-technology-2&source=news&category=technology"
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty("id");
    expect(body).toHaveProperty("moreInfo");
    expect(body.moreInfo).toHaveProperty("content");
    expect(body.moreInfo.content.length).toBeGreaterThan(body.moreInfo.summary.length);
    expect(body.category).toBe("technology");
  });

  it("builds details for the exact content item submitted by the client", async () => {
    const item = {
      id: "tmdb-42",
      source: "recommendation",
      category: "entertainment",
      title: "A specific film",
      description: "The selected film description.",
      imageUrl: "https://example.com/poster.jpg",
      url: "https://example.com/film",
      author: "TMDB",
      publishedAt: "2026-09-29T00:00:00.000Z",
      ctaLabel: "Play Now",
    };
    const request = new NextRequest("http://localhost/api/more-info", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(item),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe(item.id);
    expect(body.moreInfo.title).toBe(item.title);
    expect(body.moreInfo.summary).toBe(item.description);
    expect(body.moreInfo.content).toContain(item.description);
  });

  it("rejects malformed detail requests", async () => {
    const request = new NextRequest("http://localhost/api/more-info", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: "missing-fields" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
