// 담당: ⑤ 홈 화면 담당 (카페 앞 알림)
import { withUser } from "@/lib/api";
import { nearCafe } from "@/lib/service";

export async function GET(req: Request) {
  const url = new URL(req.url);
  return withUser(async () => ({ cafe: await nearCafe(Number(url.searchParams.get("lat")), Number(url.searchParams.get("lng"))) }));
}
