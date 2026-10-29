// 담당: ⑩ 확인 질문 화면 담당
// 잘못된 답은 서비스로 넘기기 전에 막아 400과 한국어 안내로 돌려준다(500 방지).
import { withUser } from "@/lib/api";
import type { SleepAnswer } from "@/lib/caffeine";
import { PORTION_ANSWER, SLEEP_ANSWER } from "@/lib/copy";
import { UserError, submitCheck } from "@/lib/service";

export async function POST(req: Request) {
  return withUser(async (id) => {
    const body = await req.json().catch(() => null);
    const recordId = typeof body?.recordId === "string" ? body.recordId : "";
    const portion = body?.portion;
    const sleep = body?.sleep;
    if (!recordId) throw new UserError("없는 기록이에요.");
    if (typeof portion !== "string" || !Object.hasOwn(PORTION_ANSWER, portion)) throw new UserError("마신 양을 골라 주세요.");
    if (typeof sleep !== "string" || !Object.hasOwn(SLEEP_ANSWER, sleep)) throw new UserError("잠을 어떻게 잤는지 골라 주세요.");
    return submitCheck(id, recordId, portion as keyof typeof PORTION_ANSWER, sleep as SleepAnswer);
  });
}
