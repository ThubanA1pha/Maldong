// 담당: ⑩ 확인 질문 화면 담당
// 잘못된 답은 서비스로 넘기기 전에 막아 400과 한국어 안내로 돌려준다(500 방지).
import { withUser } from "@/lib/api";
import type { SleepAnswer } from "@/lib/caffeine";
import { API_ERROR, PORTION_ANSWER, SLEEP_ANSWER } from "@/lib/copy";
import { UserError, submitCheck } from "@/lib/service";

export async function POST(req: Request) {
  return withUser(async (id) => {
    const body = await req.json().catch(() => null);
    const recordId = typeof body?.recordId === "string" ? body.recordId : "";
    const portion = body?.portion;
    const sleep = body?.sleep;
    if (!recordId) throw new UserError(API_ERROR.unknownRecord);
    if (typeof portion !== "string" || !Object.hasOwn(PORTION_ANSWER, portion)) throw new UserError(API_ERROR.pickPortion);
    if (typeof sleep !== "string" || !Object.hasOwn(SLEEP_ANSWER, sleep)) throw new UserError(API_ERROR.pickSleep);
    return submitCheck(id, recordId, portion as keyof typeof PORTION_ANSWER, sleep as SleepAnswer);
  });
}
