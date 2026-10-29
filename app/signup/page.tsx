// 담당: ② 가입 (F1 · S1)
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { Scene, TopBar } from "@/components/Scene";
import { AUTH, BTN } from "@/lib/copy";
import s from "../auth.module.css";

export default function Signup() {
  return (
    <main className={s.page}>
      <TopBar title="가입" back="/" />
      <Scene scene="day" height={200} logo={false} line={AUTH.signupLine} />
      <div className={s.body}>
        <section className={s.card} aria-label="이메일로 가입">
          <AuthForm endpoint="/api/auth/signup" submitLabel={BTN.signup} next="/profile?first=1" />
        </section>
        <p className={s.switch}>이미 가입했나요? <Link href="/login">{BTN.login}</Link></p>
      </div>
    </main>
  );
}
