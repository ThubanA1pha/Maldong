// 담당: ⑧ 미리 보기 화면 담당. 저장하지 않는다.
// 잘못된 값은 서비스로 넘기기 전에 막아 400과 한국어 안내로 돌려준다(빈 숫자·500 방지).
import { withUser } from "@/lib/api";
import { API_ERROR } from "@/lib/copy";
import { UserError, listDrinks, preview } from "@/lib/service";

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function POST(req: Request) {
  return withUser(async (id) => {
    const body = await req.json().catch(() => null);
    const drinkId = typeof body?.drinkId === "string" ? body.drinkId : "";
    const situation = body?.situation;
    const bedtime = typeof body?.bedtime === "string" ? body.bedtime : "";
    if (!drinkId) throw new UserError(API_ERROR.pickDrink);
    if (situation !== "have" && situation !== "changeable") throw new UserError(API_ERROR.pickSituation);
    if (!HHMM.test(bedtime)) throw new UserError(API_ERROR.pickBedtime);
    const drinks = await listDrinks();
    if (!drinks.some((d) => d.id === drinkId)) throw new UserError(API_ERROR.unknownDrink);
    return preview(id, drinkId, situation, bedtime);
  });
}
