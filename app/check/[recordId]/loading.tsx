// 담당: ⑩ 확인 질문을 서버에서 불러오는 동안 보이는 화면.
import { TopBar } from "@/components/Scene";
import s from "./check.module.css";

export default function Loading() {
  return (
    <main className="screen">
      <div className={s.topbar}><TopBar title="확인 질문" back="/home" /></div>
      <p className="muted" role="status">어제 기록을 불러오는 중이에요…</p>
      <div className={s.skeleton} />
      <div className={s.skeleton} />
    </main>
  );
}
