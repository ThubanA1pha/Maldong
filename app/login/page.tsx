// 담당: ③ 로그인 (F1 · E2E가 S2~S7 전에 시드 계정으로 들어오는 곳). [로그인]은 입력칸 바로 아래.
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { Scene, TopBar } from "@/components/Scene";
import { AUTH, BTN } from "@/lib/copy";
import s from "../auth.module.css";

export default function Login() {
  return (
    <main className={s.page}>
      <TopBar title="로그인" back="/" />
      <Scene scene="night" height={200} logo={false} line={AUTH.loginLine} />
      <div className={s.body}>
        <section className={s.card} aria-label="이메일로 로그인">
          <AuthForm endpoint="/api/auth/login" submitLabel={BTN.login} next="/home" />
        </section>
        <p className={s.switch}>처음 왔나요? <Link href="/signup">{BTN.signup}</Link></p>
      </div>
    </main>
  );
}
