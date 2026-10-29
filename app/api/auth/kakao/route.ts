import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.KAKAO_CLIENT_ID;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return new Response("카카오 로그인 설정이 필요해요. 관리자에게 문의해 주세요.", { status: 503 });
  }
  const state = randomBytes(32).toString("hex");
  (await cookies()).set("kakao_state", state, {
    httpOnly: true, sameSite: "lax", secure: redirectUri.startsWith("https:"),
    path: "/api/auth/kakao", maxAge: 600,
  });
  const query = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: "code", state });
  return NextResponse.redirect(`https://kauth.kakao.com/oauth/authorize?${query}`);
}
