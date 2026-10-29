// [공통] 세션. 서명한 httpOnly 쿠키에 사용자 id를 담는다.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "session";
const secret = () => process.env.SESSION_SECRET ?? "dev-only-session-secret";

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export async function setSession(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE, `${userId}.${sign(userId)}`, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function currentUserId(): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [id, sig] = raw.split(".");
  if (!id || !sig) return null;
  const expected = Buffer.from(sign(id));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return id;
}

// 로그인이 필요한 화면의 맨 위에서 부른다. 없으면 로그인 화면으로 보낸다.
export async function requireUser(): Promise<string> {
  const id = await currentUserId();
  if (!id) redirect("/login");
  return id;
}
