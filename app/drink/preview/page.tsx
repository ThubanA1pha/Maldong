"use client";
// [역산 초안] 이 화면은 docs/scenarios.yaml(S1~S7)에서 거꾸로 뽑은 최소 버전이다. 디자인 프레임이 나오면 프레임이 기준이다.
// 고정 문구(lib/copy.ts)와 버튼 이동은 바꾸지 않는다. 배치·디자인·상태 화면은 담당이 새로 만든다.
// 담당: ⑧ 미리 보기 (F2·F3 · S2~S4). 비교는 저장하지 않고, [이 양으로 마시기 시작]을 눌러야 기록한다.
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Character } from "@/components/Character";
import type { Band, Option } from "@/lib/caffeine";
import { api } from "@/lib/client";
import { BAND_TEXT, BTN, OPTION_LABEL, SAY } from "@/lib/copy";

type Preview = {
  drink: string;
  estimated: boolean;
  bedtime: string;
  beforeBand: Band;
  recommend: "full" | "half" | "third" | "stop" | null;
  options: { option: Option; drinkId: string; addedMg: number; totalMg: number; band: Band }[];
};

function PreviewScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const drinkId = params.get("drinkId") ?? "";
  const situation = params.get("situation") === "changeable" ? "changeable" : "have";
  const bedtime = params.get("bedtime") ?? "01:00";
  const [data, setData] = useState<Preview | null>(null);
  const [selected, setSelected] = useState<Option | null>(null);
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Preview>("/api/preview", { body: { drinkId, situation, bedtime } })
      .then((p) => {
        setData(p);
        const first = p.recommend && p.recommend !== "stop" ? p.recommend : p.options[0]?.option;
        setSelected(first ?? null);
      })
      .catch((e: Error) => setError(e.message));
  }, [drinkId, situation, bedtime]);

  if (!data) return <main className="screen"><p className="muted">{error ?? "계산하는 중이에요…"}</p></main>;
  const current = data.options.find((o) => o.option === selected) ?? data.options[0];
  const rec = data.recommend === "stop" ? SAY.recommendStop : data.recommend ? SAY.recommend(OPTION_LABEL[data.recommend]) : null;
  const line = changed ? SAY.recalculated : [SAY.compare(data.bedtime), rec].filter(Boolean).join(" ");

  async function start() {
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

  return (
    <main className="screen">
      <p className="muted">{data.drink}{data.estimated ? " (함량 추정)" : ""} · 이번에는 {data.bedtime}에 잘 예정</p>
      <Character band={current.band} line={line} />
      <div className="stack" role="group" aria-label="선택지">
        {data.options.map((o) => (
          <button
            key={o.option}
            className="chip"
            aria-pressed={o.option === current.option}
            onClick={() => { setSelected(o.option); setChanged(true); }}
            data-added-mg={o.addedMg}
          >
            {OPTION_LABEL[o.option]}{data.recommend === o.option ? " ★" : ""} · 이 음료로 {data.bedtime}에 더해지는 카페인 {o.addedMg}mg · {BAND_TEXT[o.band]}
          </button>
        ))}
      </div>
      {error ? <p className="error" role="alert">{error}</p> : null}
      <div className="bottom"><div>
        <button className="btn primary" disabled={busy} onClick={start}>{BTN.startDrinking}</button>
        {situation === "have" ? (
          <button className="btn link" onClick={() => router.push("/home?notice=skipped")}>{BTN.skip}</button>
        ) : null}
      </div></div>
    </main>
  );
}

export default function Page() {
  return <Suspense><PreviewScreen /></Suspense>;
}
