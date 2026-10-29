"use client";
// 담당: ⑨ 오늘 기록 (F5 · S6). [취소] → 화면 안 시트 "이 기록을 지울까?" → [지우기] / [아니].
// 브라우저 confirm을 쓰지 않는다. 지운 뒤 목록은 서버에서 다시 받아 잔 수와 함께 맞춘다.
// 줄마다 음료 이름과 양을 두 줄로 보이되, 글자로는 "{음료} · {양}" 한 덩어리로 읽히게 둔다(E2E·화면 읽기 프로그램).
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CharacterFace } from "@/components/Character";
import { ErrorNotice } from "@/components/ErrorNotice";
import { api } from "@/lib/client";
import { API_ERROR, BTN, ERROR_SAY, Q, SAY, TODAY } from "@/lib/copy";
import s from "./today.module.css";

export type Item = { id: string; label: string; startedAt: string };

const hhmm = (iso: string) =>
  new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Seoul" }).format(new Date(iso));

function splitLabel(label: string) {
  const i = label.lastIndexOf(" · ");
  return i < 0 ? { drink: label, portion: "" } : { drink: label.slice(0, i), portion: label.slice(i + 3) };
}

export function TodayList({ initial }: { initial: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(initial);
  const [confirming, setConfirming] = useState<Item | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState<Item | null>(null);
  const [retryRestore, setRetryRestore] = useState(false);
  const noRef = useRef<HTMLButtonElement>(null);

  async function reload() {
    setRetryRestore(false);
    try {
      setItems(await api<Item[]>("/api/records"));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function remove(item: Item) {
    if (busy) return;
    setBusy(true);
    setError(null);
    setRetryRestore(false);
    try {
      await api(`/api/records/${item.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      setConfirming(null);
      setMessage(SAY.deleted);
      setDeleted(item);
      await reload();
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    if (!deleted || busy) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/api/records/${deleted.id}/restore`, { method: "POST" });
      setItems((prev) => [...prev.filter((it) => it.id !== deleted.id), deleted].sort((a, b) => b.startedAt.localeCompare(a.startedAt)));
      setDeleted(null);
      setMessage(ERROR_SAY.restored);
      await reload();
      router.refresh();
    } catch (e) {
      const message = (e as Error).message;
      setError(message);
      setRetryRestore(true);
      if (message === API_ERROR.cannotRestore) {
        setDeleted(null);
        setMessage(null);
        setRetryRestore(false);
      }
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
    if (!message || deleted) return;
    const t = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(t);
  }, [message, deleted]);

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

      {message ? (
        <div className={s.toast} role="status">
          <span>{message}</span>
          {deleted ? <button className={s.cancel} type="button" disabled={busy} onClick={restore}>{BTN.undo}</button> : null}
        </div>
      ) : null}
      {error && !confirming ? <ErrorNotice message={error} onRetry={retryRestore ? restore : reload} busy={busy} /> : null}

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
            {error ? <ErrorNotice message={error} /> : null}
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
