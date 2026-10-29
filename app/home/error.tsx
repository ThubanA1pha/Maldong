"use client";
// 담당: ⑤ 홈. 서버 계산이 실패했을 때 솜이 말풍선과 다시 불러오기를 보여 준다(내부 오류 내용은 보이지 않는다).
import { ErrorNotice } from "@/components/ErrorNotice";
import { BTN, ERROR_SAY } from "@/lib/copy";
import s from "./home.module.css";

export default function HomeError() {
  return (
    <main className={s.home}>
      <div className={s.panel} style={{ marginTop: 0, paddingTop: 24 }}>
        <ErrorNotice message={ERROR_SAY.general} />
        <button className="btn primary" type="button" onClick={() => window.location.reload()}>{BTN.reload}</button>
      </div>
    </main>
  );
}
