"use client";
// 담당: ⑨ 오늘 기록 (F5 · S6). [취소] → 화면 안 시트 "이 기록을 지울까?" → [지우기] / [아니].
// 브라우저 confirm을 쓰지 않는다. 지운 뒤 목록은 서버에서 다시 받아 잔 수와 함께 맞춘다.
// 줄마다 음료 이름과 양을 두 줄로 보이되, 글자로는 "{음료} · {양}" 한 덩어리로 읽히게 둔다(E2E·화면 읽기 프로그램).
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CharacterFace } from "@/components/Character";
import { api } from "@/lib/client";
import { BTN, Q, SAY, TODAY } from "@/lib/copy";
import s from "./today.module.css";

export type Item = { id: string; label: string; startedAt: string };

const hhmm = (iso: string) =>
  new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Seoul" }).format(new Date(iso));

function splitLabel(label: string) {
  const i = label.lastIndexOf(" · ");
  return i < 0 ? { drink: label, portion: "" } : { drink: label.slice(0, i), portion: label.slice(i + 3) };
}

export function TodayList({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial);
  const [confirming, setConfirming] = useState<Item | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const noRef = useRef<HTMLButtonElement>(null);

  async function reload() {
    try {
      setItems(await api<Item[]>("/api/records"));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function remove(item: Item) {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/records/${item.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      setConfirming(null);
      setMessage(SAY.deleted);
      await reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!confirming) return;
    noRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !busy) setConfirming(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming, busy]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(t);
  }, [message]);

  const [countPre, countPost] = TODAY.count(items.length).split(String(items.length));

  return (
    <>
      <section className={s.summary} aria-label="오늘 커피 잔 수">
        <div>
          <p className={s.count} data-testid="today-count">
            {countPre}<span className="mono">{items.length}</span>{countPost}
          </p>
          <p className={s.sub}>{TODAY.countNote}</p>
        </div>
        <CharacterFace band="ok" size={56} />
      </section>

      {message ? <p className={s.toast} role="status">{message}</p> : null}
      {error ? (
        <div className={s.errorBox} role="alert">
          <p className="error" style={{ margin: 0 }}>{error}</p>
          <button className={s.cancel} type="button" onClick={reload}>다시 불러오기</button>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className={s.empty}>
          <p className={s.emptyText}>{SAY.empty}</p>
          <div className={s.emptyActions}>
            <Link className="btn primary" href="/drink/select?mode=before">{BTN.beforeDrink}</Link>
            <Link className="btn" href="/drink/select?mode=already">{BTN.alreadyDrank}</Link>
          </div>
        </div>
      ) : (
        <ul className={s.list}>
          {items.map((it) => {
            const { drink, portion } = splitLabel(it.label);
            return (
              <li key={it.id} className={s.item} data-confirming={confirming?.id === it.id ? "true" : undefined}>
                <div className={s.itemText}>
                  <time className={`${s.time} mono`} dateTime={it.startedAt}>{hhmm(it.startedAt)}</time>
                  <span className={s.label}>
                    <span className={s.drink}>{drink}</span>
                    {portion ? <><span className="sr-only"> · </span><span className={s.portion}>{portion}</span></> : null}
                  </span>
                </div>
                <button className={s.cancel} type="button" disabled={busy} onClick={() => { setError(null); setConfirming(it); }}>
                  {BTN.cancel}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {confirming ? (
        <div className={s.backdrop} onClick={() => { if (!busy) setConfirming(null); }}>
          <div
            className={s.sheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <span className={s.grip} aria-hidden="true" />
            <CharacterFace band="mid" size={80} />
            <h2 id="delete-title" className={s.sheetTitle}>{Q.deleteConfirm}</h2>
            <p id="delete-desc" className={s.sheetDesc}>
              {splitLabel(confirming.label).drink} · {hhmm(confirming.startedAt)}
              <br />
              {TODAY.deleteNote}
            </p>
            <div className={s.sheetBtns}>
              <button ref={noRef} className="btn" type="button" disabled={busy} onClick={() => setConfirming(null)}>{BTN.no}</button>
              <button className="btn primary" type="button" disabled={busy} aria-busy={busy} onClick={() => remove(confirming)}>{BTN.confirmDelete}</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
