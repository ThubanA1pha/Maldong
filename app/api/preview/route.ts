// 담당: ⑧ 미리 보기 화면 담당. 저장하지 않는다.
import { withUser } from "@/lib/api";
import { preview } from "@/lib/service";

export async function POST(req: Request) {
  return withUser(async (id) => {
    const { drinkId, situation, bedtime } = await req.json();
    return preview(id, String(drinkId), situation === "changeable" ? "changeable" : "have", String(bedtime));
  });
}
