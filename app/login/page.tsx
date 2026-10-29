// [역산 초안] 이 화면은 docs/scenarios.yaml(S1~S7)에서 거꾸로 뽑은 최소 버전이다. 디자인 프레임이 나오면 프레임이 기준이다.
// 고정 문구(lib/copy.ts)와 버튼 이동은 바꾸지 않는다. 배치·디자인·상태 화면은 담당이 새로 만든다.
// 담당: ③ 로그인 (F1 · E2E가 S2~S7 전에 시드 계정으로 들어오는 곳)
import { AuthForm } from "@/components/AuthForm";
import { BTN } from "@/lib/copy";

export default function Login() {
  return (
    <main className="screen">
      <h1 className="title">로그인</h1>
      <a className="btn" href="/api/auth/kakao">{BTN.kakao}</a>
      <AuthForm endpoint="/api/auth/login" submitLabel={BTN.login} next="/home" />
    </main>
  );
}
