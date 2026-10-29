// [공통] 오늘 기록 [되돌리기]: [취소]로 지운 기록을 되살린다(⑨ 오늘 기록 화면이 부름).
import { withUser } from "@/lib/api";
import { restoreRecord } from "@/lib/service";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return withUser((userId) => restoreRecord(userId, id));
}
