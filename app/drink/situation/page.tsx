"use client";
// [역산 초안] 이 화면은 docs/scenarios.yaml(S1~S7)에서 거꾸로 뽑은 최소 버전이다. 디자인 프레임이 나오면 프레임이 기준이다.
// 고정 문구(lib/copy.ts)와 버튼 이동은 바꾸지 않는다. 배치·디자인·상태 화면은 담당이 새로 만든다.
// 담당: ⑦ 상황·잘 시각 (F2 · S2~S4). mode=cafe면 상황 질문을 건너뛰고 "아직 바꿀 수 있어요"로 본다.
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api } from "@/lib/client";
import { BTN, Q, bedtimeButton } from "@/lib/copy";

function Situation() {
  const router = useRouter();
  const params = useSearchParams();
  const drinkId = params.get("drinkId") ?? "";
  const mode = params.get("mode");
  const [situation, setSituation] = useState<"have" | "changeable" | null>(mode === "cafe" ? "changeable" : null);
  const [bedtime, setBedtime] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    api<{ usualBedtime: string }>("/api/profile").then((p) => setBedtime(p.usualBedtime));
  }, []);
  const go = (b: string) => router.push(`/drink/preview?drinkId=${drinkId}&situation=${situation}&bedtime=${b}`);

  if (!situation) {
    return (
      <main className="screen">
        <h1 className="title">{Q.situation}</h1>
        <button className="btn primary" onClick={() => setSituation("have")}>{BTN.have}</button>
        <button className="btn" onClick={() => setSituation("changeable")}>{BTN.changeable}</button>
      </main>
    );
  }
  if (!bedtime) return <main className="screen"><p className="muted">불러오는 중이에요…</p></main>;
  return (
    <main className="screen">
      <h1 className="title">{Q.bedtime}</h1>
      <button className="btn primary" onClick={() => go(bedtime)}>{bedtimeButton(bedtime)}</button>
      {editing ? (
        <label className="field">오늘 잘 시각<input id="today-bedtime" type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} /></label>
      ) : (
        <button className="btn" onClick={() => setEditing(true)}>{BTN.changeBedtime}</button>
      )}
    </main>
  );
}

export default function Page() {
  return <Suspense><Situation /></Suspense>;
}
