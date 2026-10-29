// 담당: ⑤ 홈 화면 담당
import { withUser } from "@/lib/api";
import { home } from "@/lib/service";

export async function GET() {
  return withUser((id) => home(id));
}
