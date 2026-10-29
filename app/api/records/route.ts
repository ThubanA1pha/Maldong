// 담당: ⑨ 오늘 기록(GET), ⑧ 미리 보기·⑥ 이미 마신 기록(POST)이 함께 쓴다 → [공통]
import { readJson, withUser } from "@/lib/api";
import { createRecord, listToday } from "@/lib/service";

export async function GET() {
  return withUser((id) => listToday(id));
}

export async function POST(req: Request) {
  return withUser(async (id) => {
    const { drinkId, option, bedtime } = await readJson(req);
    return createRecord(id, { drinkId: String(drinkId), option, bedtime: String(bedtime) });
  });
}
