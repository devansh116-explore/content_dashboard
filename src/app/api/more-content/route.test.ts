import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

describe("more-content API route", () => {
  it("returns a paged list of available content across sources", async () => {
    const request = new NextRequest("http://localhost/api/more-content?page=1&categories=technology,finance");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.totalAvailable).toBeGreaterThanOrEqual(body.items.length);
    expect(body).toHaveProperty("nextPage");
  });

  it("returns distinct stable pages for source-filtered requests", async () => {
    const firstResponse = await GET(
      new NextRequest("http://localhost/api/more-content?page=1&source=news")
    );
    const secondResponse = await GET(
      new NextRequest("http://localhost/api/more-content?page=2&source=news")
    );
    const first = await firstResponse.json();
    const second = await secondResponse.json();

    expect(first.items).toHaveLength(12);
    expect(second.items).toHaveLength(12);
    expect(first.items.every((item: { source: string }) => item.source === "news")).toBe(true);
    expect(second.items.every((item: { source: string }) => item.source === "news")).toBe(true);
    expect(first.items.map((item: { id: string }) => item.id)).not.toEqual(
      second.items.map((item: { id: string }) => item.id)
    );
    expect(second.nextPage).toBe(3);
  });
});
