import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

describe("social API route", () => {
  it("normalizes invalid pages and preserves search filtering", async () => {
    const request = new NextRequest(
      "http://localhost/api/social?page=invalid&categories=technology&search=technology"
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items.every((item: { title: string }) => item.title.toLowerCase().includes("technology"))).toBe(true);
  });
});