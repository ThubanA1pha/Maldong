"use client";
// 담당: ⑤ 홈. 서버 계산이 실패했을 때 이해할 수 있는 문장과 다시 불러오기를 보여 준다(내부 오류 내용은 보이지 않는다).
import s from "./home.module.css";

export default function HomeError() {
  return (
    <main className={s.home}>
      <div className={s.panel} style={{ marginTop: 0, paddingTop: 24 }}>
        <p className="card error" role="alert">홈을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.</p>
        <button className="btn primary" type="button" onClick={() => window.location.reload()}>다시 불러오기</button>
      </div>
    </main>
  );
}
