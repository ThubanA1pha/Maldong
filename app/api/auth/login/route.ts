// 담당: ③ 로그인 화면 담당
import { handle } from "@/lib/api";
import { setSession } from "@/lib/auth";
import { login } from "@/lib/service";

export async function POST(req: Request) {
  return handle(async () => {
    const { email = "", password = "" } = await req.json();
    await setSession(await login(String(email), String(password)));
  });
}
