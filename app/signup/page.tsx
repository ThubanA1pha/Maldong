// [역산 초안] 이 화면은 docs/scenarios.yaml(S1~S7)에서 거꾸로 뽑은 최소 버전이다. 디자인 프레임이 나오면 프레임이 기준이다.
// 고정 문구(lib/copy.ts)와 버튼 이동은 바꾸지 않는다. 배치·디자인·상태 화면은 담당이 새로 만든다.
// 담당: ② 가입 (F1 · S1)
import { AuthForm } from "@/components/AuthForm";
import { BTN } from "@/lib/copy";
import Link from "next/link";

export default function Signup() {
  return (
    <main className="screen">
      <h1 className="title">가입</h1>
      <section className="card stack" aria-label="이메일로 가입">
        <h2 className="title">이메일로 가입</h2>
        <AuthForm endpoint="/api/auth/signup" submitLabel={BTN.signup} next="/profile?first=1" />
      </section>
      <p className="muted">이미 가입하셨나요?</p>
      <Link className="btn link" href="/login">{BTN.login}</Link>
    </main>
  );
}
