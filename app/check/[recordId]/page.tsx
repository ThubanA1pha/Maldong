"use client";
// [역산 초안] 이 화면은 docs/scenarios.yaml(S1~S7)에서 거꾸로 뽑은 최소 버전이다. 디자인 프레임이 나오면 프레임이 기준이다.
// 고정 문구(lib/copy.ts)와 버튼 이동은 바꾸지 않는다. 배치·디자인·상태 화면은 담당이 새로 만든다.
// 담당: ⑩ 확인 질문 (F6 · S7). 답하면 홈으로 돌아가 캐릭터가 결과를 말한다.
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import type { SleepAnswer } from "@/lib/caffeine";
import { api } from "@/lib/client";
import { PORTION_ANSWER, Q, SLEEP_ANSWER } from "@/lib/copy";

type Portion = keyof typeof PORTION_ANSWER;

export default function Check() {
  const router = useRouter();
  const { recordId } = useParams<{ recordId: string }>();
  const [portion, setPortion] = useState<Portion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function answer(sleep: SleepAnswer) {
    if (!portion) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ moved: "up" | "down" | null }>("/api/checks", { body: { recordId, portion, sleep } });
      router.push(`/home?notice=${r.moved === "up" ? "sens_up" : r.moved === "down" ? "sens_down" : "checked"}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <main className="screen">
      <h1 className="title">{Q.howMuch}</h1>
      <div className="row" role="group" aria-label="마신 양">
        {(Object.keys(PORTION_ANSWER) as Portion[]).map((p) => (
          <button key={p} className="chip" aria-pressed={p === portion} onClick={() => setPortion(p)}>{PORTION_ANSWER[p]}</button>
        ))}
      </div>
      {portion ? (
        <>
          <h2 className="title">{Q.sleep}</h2>
          <div className="row" role="group" aria-label="잠">
            {(Object.keys(SLEEP_ANSWER) as SleepAnswer[]).map((s) => (
              <button key={s} className="chip" disabled={busy} onClick={() => answer(s)}>{SLEEP_ANSWER[s]}</button>
            ))}
          </div>
        </>
      ) : null}
      {error ? <p className="error" role="alert">{error}</p> : null}
    </main>
  );
}
