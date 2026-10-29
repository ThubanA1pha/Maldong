"use client";
// 담당: ⑧ 미리 보기 (F2·F3 · S2~S4·S8). 피그마 3-4 · 3-4b · 3-4c 프레임 기준.
// 말풍선은 항상 "{시}시에 남을 양을 같이 비교해 보자"와 추천 양(또는 "오늘은 여기까지")을 함께 말한다(예정 변경 A·B).
// 고정 문구(lib/copy.ts)와 버튼 이동은 바꾸지 않는다. 비교는 저장하지 않고, [이 양으로 마시기 시작]을 눌러야 기록한다.
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Bubble, CharacterFace } from "@/components/Character";
import type { Band, Option } from "@/lib/caffeine";
import { api } from "@/lib/client";
import { BAND_TEXT, BTN, OPTION_LABEL, SAY } from "@/lib/copy";
import s from "./preview.module.css";

type Preview = {
  drink: string;
  estimated: boolean;
  bedtime: string;
  beforeMg: number;
  beforeBand: Band;
  recommend: "full" | "half" | "third" | "stop" | null;
  options: { option: Option; drinkId: string; addedMg: number; totalMg: number; band: Band }[];
};

// 선택지 아래 한 줄 설명 (피그마 문구)
const OPTION_SUB: Partial<Record<Option, string>> = {
  full: "한 잔 다",
  half: "나머지는 내일 아침에",
  third: "몇 모금만",
  small: "한 단계 작은 사이즈로",
  halfshot: "샷 절반 · 원래대로의 절반",
  decaf: "디카페인 원두로",
};

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className={s.header}>
      <button className={s.back} onClick={onBack} aria-label="뒤로">‹</button>
      <h1 className={s.headerTitle}>미리 보기</h1>
      <span />
    </div>
  );
}

function Scene({ band, line }: { band: Band; line: string }) {
  return (
    <div className={s.scene}>
      <img className={s.bg} src="/home/night.svg" alt="" />
      <div className={s.talk}><Bubble>{line}</Bubble></div>
      <div className={s.char}><CharacterFace band={band} size={92} /></div>
    </div>
  );
}

function PreviewScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const drinkId = params.get("drinkId") ?? "";
  const situation = params.get("situation") === "changeable" ? "changeable" : "have";
  const bedtime = params.get("bedtime") ?? "01:00";
  const [data, setData] = useState<Preview | null>(null);
  const [selected, setSelected] = useState<Option | null>(null);
  const [changed, setChanged] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!drinkId) {
      setLoadError("고른 음료가 없어요. 음료부터 다시 골라 주세요.");
      return;
    }
    setLoadError(null);
    api<Preview>("/api/preview", { body: { drinkId, situation, bedtime } })
      .then((p) => {
        setData(p);
        const first = p.recommend === "stop" ? null : p.recommend ?? p.options[0]?.option ?? null;
        setSelected(first);
      })
      .catch((e: Error) => setLoadError(e.message));
  }, [drinkId, situation, bedtime, attempt]);

  const back = () => router.back();

  if (!data) {
    return (
      <main className="screen">
        <Header onBack={back} />
        {loadError ? (
          <div className={s.state}>
            <p className="error" role="alert" style={{ margin: 0 }}>{loadError}</p>
            {drinkId ? (
              <button className="btn" onClick={() => setAttempt((n) => n + 1)}>다시 계산하기</button>
            ) : (
              <button className="btn" onClick={() => router.push("/drink/select?mode=before")}>음료 고르기</button>
            )}
          </div>
        ) : (
          <>
            <p className="muted" role="status">계산하는 중이에요…</p>
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
  // 추천 양은 오늘 이미 마신 기록까지 더한 계산(lib/service preview)에서 온다. 선택지를 바꿔도 말풍선에 남긴다.
  const rec = data.recommend === "stop" ? SAY.recommendStop : data.recommend ? SAY.recommend(OPTION_LABEL[data.recommend]) : null;
  const line = (changed ? [SAY.recalculated, rec] : [stop ? SAY.again : null, SAY.compare(data.bedtime), rec])
    .filter(Boolean)
    .join(" ");
  const band = current?.band ?? data.beforeBand;
  const canSkip = situation === "have";

  async function start() {
    if (!current) return;
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
    <button key="start" className={`btn${stop && canSkip ? " link" : " primary"}`} disabled={busy || !current} onClick={start}>
      {busy ? "기록하는 중이에요…" : BTN.startDrinking}
    </button>
  );
  const skipBtn = canSkip ? (
    <button key="skip" className={`btn${stop ? " primary" : " link"}`} disabled={busy} onClick={skip}>{BTN.skip}</button>
  ) : null;

  return (
    <main className={`screen ${s.screen}`}>
      <Header onBack={back} />
      <Scene band={band} line={line} />
      <p className={s.meta}>
        {data.drink}{data.estimated ? " (함량 추정)" : ""} · 이번에는 {data.bedtime}에 잘 예정
      </p>
      {stop ? (
        <div className={s.stopBanner}>
          <span>추천 양 · {SAY.recommendStop}</span>
          <span className={s.stopBadge}>지금 약 {data.beforeMg}mg</span>
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
              aria-label={`${OPTION_LABEL[o.option]}${isRec ? " (추천 양)" : ""} · 이 음료로 ${data.bedtime}에 더해지는 카페인 ${o.addedMg}mg · ${BAND_TEXT[o.band]}`}
              disabled={busy}
              onClick={() => { setSelected(o.option); setChanged(true); setError(null); }}
              data-added-mg={o.addedMg}
            >
              <span className={s.optTop}>
                <span className={s.optName}>{OPTION_LABEL[o.option]}</span>
                {isRec ? <span className={s.recBadge}>추천 양</span> : null}
                <span className={s.radio} aria-hidden />
              </span>
              <span className={s.optSub}>
                {o.option === "original" ? data.drink : OPTION_SUB[o.option]}
              </span>
              <span className={s.bar} aria-hidden>
                <span className={s.barFill} style={{ width: `${Math.round((o.addedMg / maxMg) * 100)}%` }} />
              </span>
              <span className={s.optBottom}>
                <span>이 음료로 {data.bedtime}에 더해지는 카페인 <span className={s.mg}>+{o.addedMg}mg</span></span>
                <span className={`${s.pill} ${s[`pill_${o.band}`]}`}>{BAND_TEXT[o.band]}</span>
              </span>
            </button>
          );
        })}
      </div>
      {!current ? <p className={s.hint}>{stop ? "그래도 마신다면 선택지를 먼저 골라 주세요" : "선택지를 하나 골라 주세요"}</p> : null}
      {error ? <p className="error" role="alert">{error}</p> : null}
      <div className="bottom"><div>
        {stop && canSkip ? [skipBtn, startBtn] : [startBtn, skipBtn]}
      </div></div>
    </main>
  );
}

export default function Page() {
  return <Suspense><PreviewScreen /></Suspense>;
}
