// 담당: ⑩ 확인 질문 화면 담당
import { withUser } from "@/lib/api";
import { submitCheck } from "@/lib/service";

export async function POST(req: Request) {
  return withUser(async (id) => {
    const { recordId, portion, sleep } = await req.json();
    return submitCheck(id, String(recordId), portion, sleep);
  });
}
