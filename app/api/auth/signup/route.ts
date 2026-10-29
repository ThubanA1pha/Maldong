// 담당: ② 가입 화면 담당
import { handle, readJson } from "@/lib/api";
import { setSession } from "@/lib/auth";
import { signup } from "@/lib/service";

export async function POST(req: Request) {
  return handle(async () => {
    const { email = "", password = "" } = await readJson(req);
    await setSession(await signup(String(email), String(password)));
  });
}
