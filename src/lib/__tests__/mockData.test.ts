import { describe, expect, it } from "vitest";
import { generateMockItems } from "@/lib/mockData";

describe("mock data", () => {
  it("generates stable content including publication timestamps", () => {
    const first = generateMockItems("social", ["technology"], 1, 3, true);
    const second = generateMockItems("social", ["technology"], 1, 3, true);

    expect(second).toEqual(first);
  });
});