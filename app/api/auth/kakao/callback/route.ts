import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth";
import { loginWithKakao } from "@/lib/service";

export async function GET(req: Request) {
  const query = new URL(req.url).searchParams;
  const jar = await cookies();
  const expected = jar.get("kakao_state")?.value;
  jar.delete("kakao_state");
  const state = query.get("state");
  if (!expected || !state || !/^[a-f0-9]{64}$/.test(state) || expected.length !== state.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(state))) {
    return new Response("로그인 요청이 만료됐어요. 돌아가서 다시 시도해 주세요.", { status: 400 });
  }
  if (query.has("error") || !query.get("code")) {
    return new Response("카카오 로그인이 취소됐어요. 돌아가서 다시 시도해 주세요.", { status: 400 });
  }
  const clientId = process.env.KAKAO_CLIENT_ID;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;
  if (!clientId || !redirectUri) return new Response("카카오 로그인 설정이 필요해요.", { status: 503 });
  try {
    const body = new URLSearchParams({ grant_type: "authorization_code", client_id: clientId, redirect_uri: redirectUri, code: query.get("code")! });
    if (process.env.KAKAO_CLIENT_SECRET) body.set("client_secret", process.env.KAKAO_CLIENT_SECRET);
    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST", body, cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (!tokenResponse.ok) throw new Error("token");
    const token = await tokenResponse.json();
    if (typeof token.access_token !== "string") throw new Error("token");
    const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${token.access_token}` }, cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (!userResponse.ok) throw new Error("user");
    const user = await userResponse.json();
    if (!Number.isSafeInteger(user.id) || user.id <= 0) throw new Error("user");
    const result = await loginWithKakao(String(user.id));
    await setSession(result.userId);
    return NextResponse.redirect(new URL(result.isNew ? "/profile?first=1" : "/home", redirectUri));
  } catch {
    return new Response("카카오 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.", { status: 502 });
  }
}
