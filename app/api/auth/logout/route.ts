// 담당: ③ 로그인 화면 담당
import { handle } from "@/lib/api";
import { clearSession } from "@/lib/auth";

export async function POST() {
  return handle(() => clearSession());
}
