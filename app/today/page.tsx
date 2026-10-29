// 담당: ⑨ 오늘 기록 (F5 · S6). 기준: Figma 04 4-1 오늘 기록 탭, 4-2 지우기 확인.
// 로그인하지 않았으면 로그인 화면으로 보낸다. 첫 목록은 서버에서 그려 로딩 깜빡임 없이 보이고, 지우기부터는 화면에서 처리한다.
import { BottomNav } from "@/components/BottomNav";
import { requireUser } from "@/lib/auth";
import { TODAY } from "@/lib/copy";
import { listToday } from "@/lib/service";
import { TodayList } from "./TodayList";
import s from "./today.module.css";

export const dynamic = "force-dynamic";

export default async function Today() {
  const userId = await requireUser();
  const items = await listToday(userId);
  return (
    <main className={s.today}>
      <h1 className={s.title}>{TODAY.title}</h1>
      <TodayList initial={items} />
      <BottomNav active="today" />
    </main>
  );
}
