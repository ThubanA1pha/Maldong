import { afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  get: vi.fn(), delete: vi.fn(), setSession: vi.fn(), login: vi.fn(),
}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: mocks.get, delete: mocks.delete }) }));
vi.mock("@/lib/auth", () => ({ setSession: mocks.setSession }));
vi.mock("@/lib/service", () => ({ loginWithKakao: mocks.login }));
import { GET } from "@/app/api/auth/kakao/callback/route";
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetAllMocks(); });
it("rejects forged state before contacting Kakao", async () => {
  mocks.get.mockReturnValue({ value: "a".repeat(64) });
  const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
  const response = await GET(new Request("http://localhost/api/auth/kakao/callback?state=forged&code=x"));
  expect(response.status).toBe(400);
  expect(fetcher).not.toHaveBeenCalled();
  expect(mocks.setSession).not.toHaveBeenCalled();
});
it("creates a session only after verified Kakao user information", async () => {
  const state = "a".repeat(64);
  mocks.get.mockReturnValue({ value: state });
  vi.stubEnv("KAKAO_CLIENT_ID", "test");
  vi.stubEnv("KAKAO_REDIRECT_URI", "http://localhost:3000/api/auth/kakao/callback");
  vi.stubGlobal("fetch", vi.fn()
    .mockResolvedValueOnce(Response.json({ access_token: "test-token" }))
    .mockResolvedValueOnce(Response.json({ id: 123 })));
  mocks.login.mockResolvedValue({ userId: "user-1", isNew: true });
  const response = await GET(new Request(`http://localhost/api/auth/kakao/callback?state=${state}&code=x`));
  expect(mocks.login).toHaveBeenCalledWith("123");
  expect(mocks.setSession).toHaveBeenCalledWith("user-1");
  expect(response.headers.get("location")).toBe("http://localhost:3000/profile?first=1");
});
it("does not create a session when token exchange fails", async () => {
  const state = "a".repeat(64);
  mocks.get.mockReturnValue({ value: state });
  vi.stubEnv("KAKAO_CLIENT_ID", "test");
  vi.stubEnv("KAKAO_REDIRECT_URI", "http://localhost:3000/api/auth/kakao/callback");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
  expect((await GET(new Request(`http://localhost/api/auth/kakao/callback?state=${state}&code=x`))).status).toBe(502);
  expect(mocks.setSession).not.toHaveBeenCalled();
});

