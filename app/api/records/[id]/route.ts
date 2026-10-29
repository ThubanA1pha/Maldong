// 담당: ⑨ 오늘 기록 화면 담당
import { withUser } from "@/lib/api";
import { deleteRecord } from "@/lib/service";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return withUser((userId) => deleteRecord(userId, id));
}
