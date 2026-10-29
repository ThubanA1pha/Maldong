"use client";
// 담당: ⑩ 확인 질문의 답하기 부분. 마신 양 → 잠 순서로 고르고, 잠을 고르는 순간 저장한 뒤 홈으로 돌아간다.
// 홈에서 캐릭터가 결과(고마워 / 민감도 바뀜)를 말한다 (S7: 답한 뒤 바로 홈에서 [프로필]을 누른다).
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SleepAnswer } from "@/lib/caffeine";
import { api } from "@/lib/client";
import { CHECK, PORTION_ANSWER, Q, SLEEP_ANSWER } from "@/lib/copy";
import s from "./check.module.css";

type Portion = keyof typeof PORTION_ANSWER;

export function CheckForm({ recordId }: { recordId: string }) {
  const router = useRouter();
  const [portion, setPortion] = useState<Portion | null>(null);
  const [sleep, setSleep] = useState<SleepAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function answer(next: SleepAnswer) {
    if (!portion || busy) return;
    setSleep(next);
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ moved: "up" | "down" | null }>("/api/checks", { body: { recordId, portion, sleep: next } });
      router.replace(`/home?notice=${r.moved === "up" ? "sens_up" : r.moved === "down" ? "sens_down" : "checked"}`);
    } catch (e) {
      setError((e as Error).message);
      setSleep(null);
      setBusy(false);
    }
  }

  return (
    <>
      <section className={s.card} aria-labelledby="q-portion">
        <h2 className={s.q} id="q-portion">{Q.howMuch}</h2>
        <div className={s.seg} role="group" aria-label="마신 양">
          {(Object.keys(PORTION_ANSWER) as Portion[]).map((p) => (
            <button key={p} className={s.segBtn} aria-pressed={p === portion} disabled={busy} onClick={() => { setPortion(p); setError(null); }}>
              {PORTION_ANSWER[p]}
            </button>
          ))}
        </div>
      </section>

      {portion ? (
        <section className={s.card} aria-labelledby="q-sleep">
          <h2 className={s.q} id="q-sleep">{Q.sleep}</h2>
          <div className={s.grid} role="group" aria-label="잠">
            {(Object.keys(SLEEP_ANSWER) as SleepAnswer[]).map((a) => (
              <button key={a} className={s.sleepBtn} aria-pressed={a === sleep} disabled={busy} onClick={() => answer(a)}>
                {SLEEP_ANSWER[a]}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <p className={s.hint}>{CHECK.afterPortion}</p>
      )}

      {busy ? <p className="muted" role="status">{CHECK.saving}</p> : null}
      {error ? <p className="error" role="alert">{error}</p> : null}
    </>
  );
}
