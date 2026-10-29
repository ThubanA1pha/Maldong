"use client";
// 담당: ⑧ 미리 보기 (F2·F3 · S2~S4·S8). 피그마 3-4 · 3-4b · 3-4c 프레임 기준.
// 말풍선은 항상 "{시}시에 남을 양을 같이 비교해 보자"와 추천 양(또는 "오늘은 여기까지")을 함께 말한다(예정 변경 A·B).
// 고정 문구(lib/copy.ts)와 버튼 이동은 바꾸지 않는다. 비교는 저장하지 않고, [이 양으로 마시기 시작]을 눌러야 기록한다.
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Scene, TopBar } from "@/components/Scene";
import { type Band, type Option } from "@/lib/caffeine";
import { ErrorNotice } from "@/components/ErrorNotice";
import { api } from "@/lib/client";
import { BAND_TEXT, BTN, HOME, OPTION_LABEL, PREVIEW, SAY } from "@/lib/copy";
import s from "./preview.module.css";

type Preview = {
  drink: string;
  estimated: boolean;
  bedtime: string;
  late: boolean;
  beforeMg: number;
  beforeBand: Band;
  recommend: "full" | "half" | "third" | "stop" | null;
  options: { option: Option; drinkId: string; addedMg: number; totalMg: number; band: Band }[];
};

// 직전 입력을 URL에 남겨 직접 열었을 때도 같은 선택에서 다시 시작한다.
function Header({ back }: { back: string }) {
  return <div className={s.topbar}><TopBar title={PREVIEW.title} back={back} /></div>;
}

function PreviewScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const drinkId = params.get("drinkId") ?? "";
  const situation = params.get("situation") === "changeable" ? "changeable" : "have";
  const bedtime = params.get("bedtime") ?? "01:00";
  const mode = params.get("mode") === "cafe" ? "cafe" : "before";
  const back = drinkId ? `/drink/situation?${new URLSearchParams({ drinkId, situation, bedtime, mode })}` : `/drink/select?mode=${mode}`;
  const [data, setData] = useState<Preview | null>(null);
  const [selected, setSelected] = useState<Option | null>(null);
  const [changed, setChanged] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setChanged(false);
    setError(null);
    if (!drinkId) {
      setLoadError(PREVIEW.noDrink);
      return;
    }
    setLoadError(null);
    api<Preview>("/api/preview", { body: { drinkId, situation, bedtime } })
      .then((p) => {
        if (cancelled) return;
        setData(p);
        const first = p.recommend === "stop" ? null : p.recommend ?? p.options[0]?.option ?? null;
        setSelected(first);
      })
      .catch((e: Error) => { if (!cancelled) setLoadError(e.message); });
    return () => { cancelled = true; };
  }, [drinkId, situation, bedtime, attempt]);

  if (!data) {
    return (
      <main className="screen">
        <Header back={back} />
        {loadError ? (
          <div className={s.state}>
            <ErrorNotice message={loadError} />
            {drinkId ? (
              <button className="btn" onClick={() => setAttempt((n) => n + 1)}>{PREVIEW.retry}</button>
            ) : (
              <button className="btn" onClick={() => router.push(`/drink/select?mode=${mode}`)}>{PREVIEW.pickDrink}</button>
            )}
          </div>
        ) : (
          <>
            <p className="muted" role="status">{PREVIEW.calculating}</p>
            <div className={s.skeleton} />
            <div className={s.skeleton} />
            <div className={s.skeleton} />
          </>
        )}
      </main>
    );
  }

  const stop = data.recommend === "stop";
  const current = data.options.find((o) => o.option === selected) ?? null;
  const maxMg = Math.max(1, ...data.options.map((o) => o.addedMg));
  // 말풍선은 한 마디만 한다: 처음엔 비교(이미 많이 남았으면 "또 마시는 거야…?"), 선택지를 바꾸면 "다시 계산했어".
  // "또 마시는 거야…?"는 이번 음료를 더하기 전에 이미 많이 남았을 때만 말한다(오늘 0잔이면 큰 음료여도 "또"가 아니다).
  const again = data.beforeBand === "high";
  const late = data.late;
  const line = changed ? SAY.recalculated : again ? SAY.again : SAY.compare(data.bedtime, late);
  // 추천 양(오늘 이미 마신 기록까지 더한 계산, lib/service preview)은 말풍선 아래 줄에 따로 둔다.
  // "오늘은 여기까지"는 아래 띠가 말하므로 이 줄에 넣지 않는다. "또"를 말한 경우 비교 문장도 이 줄로 옮긴다.
  const rec = data.recommend && data.recommend !== "stop" ? SAY.recommend(OPTION_LABEL[data.recommend]) : null;
  const subLine = [!changed && again ? SAY.compare(data.bedtime, late) : null, rec].filter(Boolean).join(" ");
  // 선택지 사이 차이: 첫 선택지(그대로·원래대로)보다 몇 mg 덜 더해지는지
  const baseMg = data.options[0]?.addedMg ?? 0;
  const band = current?.band ?? data.beforeBand;
  const canSkip = situation === "have";
  // 잘 시각이 이미 지난 새벽이면 계산은 "지금" 기준이다(lib/caffeine nextBedtime). 홈처럼 그 사실을 함께 알린다.

  async function start() {
    if (!current || busy) return;
    setBusy(true);
    setError(null);
    try {
      await api("/api/records", { body: { drinkId: drinkId, option: current.option, bedtime: data!.bedtime } });
      router.push("/home?notice=recorded");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  function skip() {
    setBusy(true);
    router.push("/home?notice=skipped");
  }

  const startBtn = (
    <button key="start" className={`btn ${stop && canSkip ? s.secondary : "primary"}`} disabled={busy || !current} onClick={start}>
      {busy ? PREVIEW.recording : BTN.startDrinking}
    </button>
  );
  const skipBtn = canSkip ? (
    <button key="skip" className={`btn${stop ? " primary" : " link"}`} disabled={busy} onClick={skip}>{BTN.skip}</button>
  ) : null;

  return (
    <main className={`screen ${s.screen}`}>
      <Header back={back} />
      <div className={s.scene}><Scene scene="night" height={145} logo={false} band={band} line={line} /></div>
      {subLine ? <p className={s.recLine} role="status">{subLine}</p> : null}
      <p className={s.meta}>
        {data.drink}{data.estimated ? " (함량 추정)" : ""} · {late ? PREVIEW.late(data.bedtime) : PREVIEW.plan(data.bedtime)}
      </p>
      {stop ? (
        <div className={s.stopBanner} role="status">
          <span>{PREVIEW.recommendStopTag}</span>
          {/* beforeMg는 지금이 아니라 잘 시각에 남을 양이다. 잘 시각이 지났으면 지금 기준 */}
          <span className={s.stopBadge}>{HOME.bedtimeCaption(data.bedtime, late)} {data.beforeMg}mg</span>
        </div>
      ) : null}
      <div className={s.options} role="group" aria-label="선택지">
        {data.options.map((o) => {
          const isRec = !stop && data.recommend === o.option;
          return (
            <button
              key={o.option}
              className={s.option}
              aria-pressed={o.option === current?.option}
              aria-label={`${OPTION_LABEL[o.option]}${isRec ? ` (${PREVIEW.recommendTag})` : ""} · ${PREVIEW.addedCaption(data.bedtime, late)} ${o.addedMg}mg · ${BAND_TEXT[o.band]}`}
              disabled={busy}
              onClick={() => { setSelected(o.option); setChanged(true); setError(null); }}
              data-added-mg={o.addedMg}
            >
              <span className={s.optTop}>
                <span className={s.optName}>{OPTION_LABEL[o.option]}</span>
                {isRec ? <span className={s.recBadge}>{PREVIEW.recommendTag}</span> : null}
                {baseMg - o.addedMg > 0 ? <span className={s.delta}>−{baseMg - o.addedMg}mg</span> : null}
                <span className={s.radio} aria-hidden />
              </span>
              <span className={s.optSub}>
                {o.option === "original" ? data.drink : PREVIEW.optionSub[o.option]}
              </span>
              <span className={s.bar} aria-hidden>
                <span className={s.barFill} style={{ width: `${Math.round((o.addedMg / maxMg) * 100)}%` }} />
              </span>
              <span className={s.optBottom}>
                <span>{PREVIEW.addedCaption(data.bedtime, late)} <span className={s.mg}>+{o.addedMg}mg</span></span>
                <span className={`${s.pill} ${s[`pill_${o.band}`]}`}>{BAND_TEXT[o.band]}</span>
              </span>
            </button>
          );
        })}
      </div>
      {!current ? <p className={s.hint}>{stop ? PREVIEW.pickBeforeDrink : PREVIEW.pickOption}</p> : null}
      {error ? <ErrorNotice message={error} onRetry={start} busy={busy} /> : null}
      <div className="bottom"><div>
        {stop && canSkip ? [skipBtn, startBtn] : [startBtn, skipBtn]}
      </div></div>
    </main>
  );
}

export default function Page() {
  return <Suspense><PreviewScreen /></Suspense>;
}
