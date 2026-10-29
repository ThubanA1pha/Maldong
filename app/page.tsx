// [역산 초안] 이 화면은 docs/scenarios.yaml(S1~S7)에서 거꾸로 뽑은 최소 버전이다. 디자인 프레임이 나오면 프레임이 기준이다.
// 고정 문구(lib/copy.ts)와 버튼 이동은 바꾸지 않는다. 배치·디자인·상태 화면은 담당이 새로 만든다.
// 담당: ① 첫 화면 (F1 · S1)
import Link from "next/link";
import { Character } from "@/components/Character";
import { BTN, SERVICE_NAME, SERVICE_ONE_LINER } from "@/lib/copy";

export default function Landing() {
  return (
    <main className="screen">
      <h1 className="title">{SERVICE_NAME}</h1>
      <p className="muted">{SERVICE_ONE_LINER}</p>
      <Character band="ok" />
      <div className="bottom"><div>
        <Link className="btn primary" href="/signup">{BTN.start}</Link>
        <Link className="btn" href="/login">{BTN.login}</Link>
      </div></div>
    </main>
  );
}
