// 담당: ① 첫 화면 (F1 · S1). 로그인하지 않은 사람에게 서비스 이름과 하는 일을 보여 준다.
import Link from "next/link";
import { Scene } from "@/components/Scene";
import { AUTH, BTN, SERVICE_NAME, SERVICE_ONE_LINER } from "@/lib/copy";
import s from "./auth.module.css";

export default function Landing() {
  return (
    <main className={s.page}>
      <Scene scene="night" height={420} line={AUTH.landingLine} />
      <div className={s.body}>
        <h1 className={s.headline}>{SERVICE_NAME}</h1>
        <p className={s.lead}>{SERVICE_ONE_LINER}</p>
      </div>
      <div className={s.actions}>
        <Link className="btn primary" href="/signup">{BTN.start}</Link>
        <Link className="btn" href="/login">{BTN.login}</Link>
      </div>
    </main>
  );
}
