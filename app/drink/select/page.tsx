"use client";
// [역산 초안] 이 화면은 docs/scenarios.yaml(S1~S7)에서 거꾸로 뽑은 최소 버전이다. 디자인 프레임이 나오면 프레임이 기준이다.
// 고정 문구(lib/copy.ts)와 버튼 이동은 바꾸지 않는다. 배치·디자인·상태 화면은 담당이 새로 만든다.
// 담당: ⑥ 음료 고르기 (F2·F3·F4 · S2~S5). mode=before|already|cafe
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/client";
import { BTN } from "@/lib/copy";

type Drink = { id: string; brand: string; menu: string; size: string; caffeineMg: number; estimated: boolean };

function Select() {
  const router = useRouter();
  const mode = useSearchParams().get("mode") ?? "before";
  const [drinks, setDrinks] = useState<Drink[] | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [picked, setPicked] = useState<Drink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Drink[]>("/api/drinks").then(setDrinks).catch((e: Error) => setError(e.message));
  }, []);
  const menus = useMemo(() => [...new Set((drinks ?? []).map((d) => `${d.brand} ${d.menu}`))], [drinks]);
  const sizes = (drinks ?? []).filter((d) => `${d.brand} ${d.menu}` === menu);

  function pickSize(d: Drink) {
    setPicked(d);
    if (mode !== "already") router.push(`/drink/situation?mode=${mode}&drinkId=${d.id}`);
  }

  async function recordAlready() {
    if (!picked) return;
    setBusy(true);
    setError(null);
    try {
      const { usualBedtime } = await api<{ usualBedtime: string }>("/api/profile");
      await api("/api/records", { body: { drinkId: picked.id, option: "already", bedtime: usualBedtime } });
      router.push("/home?notice=recorded");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  if (!drinks) return <main className="screen"><p className="muted">{error ?? "음료를 불러오는 중이에요…"}</p></main>;
  return (
    <main className="screen">
      <h1 className="title">어떤 커피야?</h1>
      <div className="stack" role="group" aria-label="음료 목록">
        {menus.map((m) => (
          <button key={m} className="chip" aria-pressed={m === menu} onClick={() => { setMenu(m); setPicked(null); }}>{m}</button>
        ))}
      </div>
      {menu ? (
        <div className="row" role="group" aria-label="사이즈">
          {sizes.map((d) => (
            <button key={d.id} className="chip" aria-pressed={picked?.id === d.id} onClick={() => pickSize(d)}>{d.size}</button>
          ))}
        </div>
      ) : null}
      {error ? <p className="error" role="alert">{error}</p> : null}
      {mode === "already" ? (
        <div className="bottom"><div>
          <button className="btn primary" disabled={!picked || busy} onClick={recordAlready}>{BTN.record}</button>
        </div></div>
      ) : null}
    </main>
  );
}

export default function Page() {
  return <Suspense><Select /></Suspense>;
}
