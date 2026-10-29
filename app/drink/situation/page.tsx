/// <reference types="next" />
/// <reference types="next/image-types/global" />
"use client";
// 담당: ⑦ 상황·잘 시각 (F2 · S2~S4). Figma 3-2 지금 상황(6:299), 3-3 오늘 잘 시각(6:433).
// mode=cafe면 상황 질문을 건너뛰고 "아직 바꿀 수 있어요"로 본다.
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api } from "@/lib/client";
import { BTN, Q, bedtimeButton, drinkLabel } from "@/lib/copy";
import back from "./assets/back.svg";
import sceneSituation from "./assets/scene-situation.svg";
import sceneBedtime from "./assets/scene-bedtime.svg";
import somiCalm from "./assets/somi-calm.svg";
import chevronAccent from "./assets/chevron-accent.svg";
import chevron from "./assets/chevron.svg";
import { SleepySomi } from "./SleepySomi";
import s from "./situation.module.css";

type Drink = { id: string; brand: string; menu: string; size: string };

// [바꾸기]를 누르면 보이는 잘 시각. 고르면 확인 버튼 없이 바로 미리 보기로 간다(S3 steps).
const BEDTIMES = ["22:00", "23:00", "00:00", "01:00", "02:00", "03:00"];

function Situation() {
  const router = useRouter();
  const params = useSearchParams();
  const drinkId = params.get("drinkId") ?? "";
  const mode = params.get("mode");
  const [situation, setSituation] = useState<"have" | "changeable" | null>(mode === "cafe" ? "changeable" : null);
  const [bedtime, setBedtime] = useState<string | null>(null);
  const [drink, setDrink] = useState<Drink | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ usualBedtime: string }>("/api/profile").then((p) => setBedtime(p.usualBedtime)).catch((e: Error) => setError(e.message));
    api<Drink[]>("/api/drinks").then((ds) => setDrink(ds.find((d) => d.id === drinkId) ?? null)).catch(() => {});
  }, [drinkId]);
  const go = (b: string) => router.push(`/drink/preview?drinkId=${drinkId}&situation=${situation}&bedtime=${b}`);
  const goBack = () => (situation && mode !== "cafe" ? setSituation(null) : router.back());

  const top = (
    <div className={s.top}>
      <button className={s.back} aria-label="뒤로" onClick={goBack}><img src={back.src} alt="" /></button>
    </div>
  );

  if (!situation) {
    return (
      <main className={s.root}>
        {top}
        <div className={s.hero} style={{ height: 220 }}>
          <img className={s.scene} src={sceneSituation.src} alt="" />
          <img className={s.somi} src={somiCalm.src} alt="" style={{ left: 48.8, top: 124.8, width: 78.4, height: 84.8 }} />
          <h1 className={s.bubble} style={{ left: 150, top: 60, maxWidth: "calc(100% - 170px)" }}>
            {drink ? <>{drinkLabel(drink)}!<br /></> : null}
            지금 어떤 상황이야?
          </h1>
        </div>
        <div className={s.options}>
          <button className={`${s.option} ${s.primary}`} aria-label={BTN.have} aria-describedby="have-sub" onClick={() => setSituation("have")}>
            <span>
              <span className={s.optionTitle}>{BTN.have}</span>
              <span id="have-sub" className={s.optionSub}>사서 들고 있어요 · 마실 양을 골라요</span>
            </span>
            <img src={chevronAccent.src} alt="" />
          </button>
          <button className={s.option} aria-label={BTN.changeable} aria-describedby="changeable-sub" onClick={() => setSituation("changeable")}>
            <span>
              <span className={s.optionTitle}>{BTN.changeable}</span>
              <span id="changeable-sub" className={s.optionSub}>주문 전 · 사이즈·샷·디카페인을 바꿔요</span>
            </span>
            <img src={chevron.src} alt="" />
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={s.root}>
      {top}
      <div className={s.hero} style={{ height: 260 }}>
        <img className={s.scene} src={sceneBedtime.src} alt="" />
        <h1 className={s.bubble} style={{ left: 40, top: 56 }}>{Q.bedtime}</h1>
        <SleepySomi />
      </div>
      {!bedtime ? (
        error ? <p className={s.error} role="alert">{error}</p> : <p className={s.status}>불러오는 중이에요…</p>
      ) : (
        <div className={s.actions}>
          <button className={`${s.btn} ${s.btnPrimary}`} aria-label={bedtimeButton(bedtime)} onClick={() => go(bedtime)}>
            오늘도 <span className={s.num}>{bedtime}</span>
          </button>
          {editing ? (
            <div className={s.times} role="group" aria-label="잘 시각">
              {BEDTIMES.map((t) => (
                <button key={t} className={s.time} aria-pressed={t === bedtime} onClick={() => go(t)}>{t}</button>
              ))}
            </div>
          ) : (
            <button className={`${s.btn} ${s.btnSoft}`} onClick={() => setEditing(true)}>{BTN.changeBedtime}</button>
          )}
          <p className={s.hint}>{editing ? "고르면 그 시각으로 바로 계산해요" : "프로필의 평소 잠드는 시각이 미리 채워져 있어요"}</p>
        </div>
      )}
    </main>
  );
}

export default function Page() {
  return <Suspense><Situation /></Suspense>;
}
