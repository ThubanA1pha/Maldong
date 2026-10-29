import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "./client";
import { ERROR_SAY } from "./copy";

afterEach(() => vi.unstubAllGlobals());

describe("api recovery messages", () => {
  it("turns a network failure into the Korean offline message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(api("/api/profile")).rejects.toThrow(ERROR_SAY.offline);
  });
  it("preserves an actionable server error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "잘 시각을 다시 골라 주세요." }, { status: 400 })));
    await expect(api("/api/profile")).rejects.toThrow("잘 시각을 다시 골라 주세요.");
  });
  it("handles an HTML error response without exposing parser errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>Bad gateway</html>", { status: 502 })));
    await expect(api("/api/profile")).rejects.toThrow(ERROR_SAY.general);
  });
});
