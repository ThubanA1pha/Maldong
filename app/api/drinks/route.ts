// 담당: ⑥ 음료 고르기 화면 담당
import { withUser } from "@/lib/api";
import { listDrinks } from "@/lib/service";

export async function GET() {
  return withUser(() => listDrinks());
}
