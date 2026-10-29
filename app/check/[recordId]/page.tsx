// 담당: ⑩ 확인 질문 (F6 · S7). 피그마 4-5 프레임 기준.
// 고정 문구(lib/copy.ts)와 버튼 이동은 바꾸지 않는다. 답하면 홈으로 돌아가 캐릭터가 결과를 말한다.
import Link from "next/link";
import { Bubble, CharacterFace } from "@/components/Character";
import { requireUser } from "@/lib/auth";
import { home } from "@/lib/service";
import { CheckForm } from "./CheckForm";
import s from "./check.module.css";

export const dynamic = "force-dynamic";

export default async function Check({ params }: { params: Promise<{ recordId: string }> }) {
  const userId = await requireUser();
  const [{ recordId }, data] = await Promise.all([params, home(userId)]);
  const pending = data.pendingChecks.find((c) => c.recordId === recordId);

  return (
    <main className="screen">
      <div className={s.header}>
        <Link className={s.back} href="/home" aria-label="홈으로">‹</Link>
        <h1 className={s.headerTitle}>{pending ? `어제 ${pending.drink}` : "확인 질문"}</h1>
        <span />
      </div>

      <div className={s.scene}>
        <img className={s.bg} src="/home/day.svg" alt="" />
        <div className={s.char}><CharacterFace band="mid" mood="tired" size={92} /></div>
        <div className={s.talk}><Bubble>{pending ? "하나씩 물어볼게" : "이 기록은 이미 답했거나 찾을 수 없어요."}</Bubble></div>
      </div>

      {pending ? (
        <CheckForm recordId={recordId} />
      ) : (
        <div className={s.state}>
          <p className="muted" style={{ margin: 0 }}>홈에서 남아 있는 확인 카드를 다시 골라 주세요.</p>
          <Link className="btn" href="/home">홈으로</Link>
        </div>
      )}
    </main>
  );
}
