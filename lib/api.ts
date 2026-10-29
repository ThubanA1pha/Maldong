// [공통] API 응답 도우미. 사용자가 고칠 수 있는 오류는 400과 한국어 문장, 나머지는 500과 일반 문장(내부 정보 노출 금지).
import { NextResponse } from "next/server";
import { currentUserId } from "./auth";
import { UserError } from "./service";

export async function handle(fn: () => Promise<unknown>) {
  try {
    return NextResponse.json((await fn()) ?? { ok: true });
  } catch (e) {
    if (e instanceof UserError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("api error:", e instanceof Error ? e.message : "unknown");
    return NextResponse.json({ error: "잠시 문제가 생겼어요. 다시 시도해 주세요." }, { status: 500 });
  }
}

export async function withUser(fn: (userId: string) => Promise<unknown>) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  return handle(() => fn(userId));
}

// 본문이 깨진 JSON이거나 객체가 아니면 400과 한국어 문장으로 돌려보낸다(500 대신).
export async function readJson(req: Request): Promise<Record<string, any>> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new UserError("요청 내용을 읽지 못했어요. 다시 시도해 주세요.");
  return body as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}
