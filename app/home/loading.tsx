// 담당: ⑤ 홈. 서버에서 오늘 상태를 계산하는 동안 보이는 화면.
import s from "./home.module.css";

export default function HomeLoading() {
  return (
    <main className={s.home} aria-busy="true">
      <div className={s.panel} style={{ marginTop: 0, paddingTop: 24 }}>
        <p className="muted" role="status">오늘 상태를 불러오는 중이에요…</p>
        <div className={s.skeleton} />
        <div className={s.skeleton} />
      </div>
    </main>
  );
}
