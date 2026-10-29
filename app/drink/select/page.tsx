/// <reference types="next" />
/// <reference types="next/image-types/global" />
"use client";
// 담당: ⑥ 음료 고르기 (F2·F3·F4 · S2~S5). mode=before|already|cafe
// Figma 3-1 음료 고르기 하단 시트(6:32, 밤), 4-3 이미 마신 음료 기록(7:375, 낮).
// 시나리오는 "음료 목록에서 '{브랜드} {메뉴}'를 고른다"를 한 번에 누르므로, 브랜드 탭은 거르지 않고 목록의 해당 브랜드로 스크롤한다.
// 사이즈를 고르면 바로 다음 화면으로 간다(시나리오에 [다음] 단계가 없다).
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/client";
import { BTN } from "@/lib/copy";
import { CharacterFace } from "@/components/Character";
import bellNight from "./assets/bell-night.svg";
import bellDay from "./assets/bell-day.svg";
import check from "./assets/check.svg";
import s from "./select.module.css";

type Drink = { id: string; brand: string; menu: string; size: string; caffeineMg: number; estimated: boolean };

const isNight = (d: Date) => d.getHours() >= 19 || d.getHours() < 6;
const BRAND_ORDER = ["메가커피", "컴포즈커피", "빽다방", "스타벅스"]; // Figma 탭 순서
const rank = (b: string) => (BRAND_ORDER.indexOf(b) + BRAND_ORDER.length + 1) % (BRAND_ORDER.length + 1);

function Select() {
  const router = useRouter();
  const mode = useSearchParams().get("mode") ?? "before";
  const [drinks, setDrinks] = useState<Drink[] | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [picked, setPicked] = useState<Drink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [night, setNight] = useState(true);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNight(isNight(new Date()));
    api<Drink[]>("/api/drinks").then(setDrinks).catch((e: Error) => setError(e.message));
  }, []);
  const brands = useMemo(() => [...new Set((drinks ?? []).map((d) => d.brand))].sort((a, b) => rank(a) - rank(b)), [drinks]);
  const menusOf = (b: string) => [...new Set((drinks ?? []).filter((d) => d.brand === b).map((d) => d.menu))];
  const sizes = (drinks ?? []).filter((d) => `${d.brand} ${d.menu}` === menu);
  const currentBrand = activeBrand ?? brands[0];

  function scrollToBrand(b: string) {
    setActiveBrand(b);
    const el = listRef.current?.querySelector<HTMLElement>(`[data-brand="${b}"]`);
    if (el && listRef.current) listRef.current.scrollTop = el.offsetTop - listRef.current.offsetTop;
  }

  function onListScroll() {
    const list = listRef.current;
    if (!list) return;
    let current = brands[0];
    for (const el of list.querySelectorAll<HTMLElement>("[data-brand]")) {
      if (el.offsetTop - list.offsetTop <= list.scrollTop + list.clientHeight / 3) current = el.dataset.brand ?? current;
    }
    setActiveBrand(current);
  }

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

  return (
    <main className={`${s.root} ${night ? s.night : s.day}`}>
      <div className={s.backdrop} aria-hidden>
        <img className={s.scene} src={night ? "/home/night.svg" : "/home/day.svg"} alt="" />
        <div className={s.somi} style={{ left: "calc(50% - 45px)", top: 310 }}><CharacterFace band="ok" size={120} /></div>
        <div className={s.brand}>
          <span className={s.logo}><img src={night ? "/character/head-night.svg" : "/character/head.svg"} alt="" />말똥</span>
          <img src={(night ? bellNight : bellDay).src} alt="" />
        </div>
      </div>
      <div className={s.scrim} aria-hidden />

      <section className={`${s.sheet} ${mode === "already" ? s.already : ""}`} aria-labelledby="sheet-title">
        <div className={s.handle} aria-hidden />
        <h1 id="sheet-title" className={s.title}>{mode === "already" ? BTN.alreadyDrank : "뭐 마시려고?"}</h1>
        {mode === "already" ? <p className={s.sub}>다 마신 것으로 저장돼요</p> : null}

        {!drinks ? (
          error ? <p className={s.error} role="alert">{error}</p> : <p className={s.status}>음료를 불러오는 중이에요…</p>
        ) : drinks.length === 0 ? (
          <p className={s.status}>고를 수 있는 음료가 아직 없어요</p>
        ) : (
          <>
            <div className={s.tabs} role="tablist" aria-label="브랜드">
              {brands.map((b) => (
                <button key={b} role="tab" className={s.tab} aria-selected={b === currentBrand} onClick={() => scrollToBrand(b)}>{b}</button>
              ))}
            </div>
            <div className={s.list} ref={listRef} onScroll={onListScroll} role="group" aria-label="음료 목록">
              {brands.map((b) => (
                <div key={b} style={{ display: "contents" }}>
                  <p className={s.group} data-brand={b}>{b}</p>
                  {menusOf(b).map((m) => {
                    const key = `${b} ${m}`;
                    const on = key === menu;
                    return (
                      <button key={key} className={s.item} aria-label={key} aria-pressed={on} onClick={() => { setMenu(key); setPicked(null); setActiveBrand(b); }}>
                        {m}
                        {on ? <img src={check.src} alt="" /> : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <p className={s.label}>사이즈</p>
            {menu ? (
              <div className={s.segment} role="group" aria-label="사이즈">
                {sizes.map((d) => (
                  <button key={d.id} className={s.size} aria-pressed={picked?.id === d.id} onClick={() => pickSize(d)}>{d.size}</button>
                ))}
              </div>
            ) : (
              <p className={`${s.segment} ${s.hint}`}>메뉴를 먼저 골라 줘</p>
            )}
            {picked?.estimated ? <p className={s.status}>공식 함량이 없어 추정값으로 계산해요</p> : null}
          </>
        )}

        {drinks && error ? <p className={s.error} role="alert">{error}</p> : null}
        {mode === "already" ? (
          <button className={s.primary} disabled={!picked || busy} onClick={recordAlready}>{busy ? "기록하는 중…" : BTN.record}</button>
        ) : null}
      </section>
    </main>
  );
}

export default function Page() {
  return <Suspense><Select /></Suspense>;
}
