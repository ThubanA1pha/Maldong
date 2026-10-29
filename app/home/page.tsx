// [역산 초안] 이 화면은 docs/scenarios.yaml(S1~S7)에서 거꾸로 뽑은 최소 버전이다. 디자인 프레임이 나오면 프레임이 기준이다.
// 고정 문구(lib/copy.ts)와 버튼 이동은 바꾸지 않는다. 배치·디자인·상태 화면은 담당이 새로 만든다.
// 담당: ⑤ 홈 (F3·F5·F6 · S2~S7의 출발점)
import Link from "next/link";
import { Character } from "@/components/Character";
import { requireUser } from "@/lib/auth";
import { BAND_TEXT, BTN, SAY, SENSITIVITY_LABEL, checkCard, todayLink } from "@/lib/copy";
import { getProfile, home } from "@/lib/service";
import { CafeNotice } from "./CafeNotice";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const userId = await requireUser();
  const [data, profile, { notice }] = await Promise.all([home(userId), getProfile(userId), searchParams]);
  const label = SENSITIVITY_LABEL[profile.sensitivity];
  const NOTICE: Record<string, string> = {
    recorded: SAY.recorded,
    skipped: SAY.skipped,
    checked: SAY.thanks,
    sens_up: SAY.sensitiveUp(label),
    sens_down: SAY.sensitiveDown(label),
  };
  const line = (notice && NOTICE[notice]) || (data.todayCount === 0 ? SAY.empty : BAND_TEXT[data.band]);

  return (
    <main className="screen">
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <Link className="btn link" style={{ width: "auto" }} href="/profile">{BTN.profile}</Link>
      </div>
      <Character band={data.band} line={line} />
      <Link className="muted" href="/today">{todayLink(data.todayCount)}</Link>
      <CafeNotice band={data.band} />
      {data.pendingChecks.map((c) => (
        <div key={c.recordId} className="card stack">
          <p style={{ margin: 0 }}>{checkCard(c.drink)}</p>
          <Link className="btn" href={`/check/${c.recordId}`}>{BTN.answer}</Link>
        </div>
      ))}
      <div className="bottom"><div>
        <Link className="btn primary" href="/drink/select?mode=before">{BTN.beforeDrink}</Link>
        <Link className="btn link" href="/drink/select?mode=already">{BTN.alreadyDrank}</Link>
      </div></div>
    </main>
  );
}
