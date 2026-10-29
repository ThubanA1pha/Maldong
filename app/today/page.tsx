"use client";
// [역산 초안] 이 화면은 docs/scenarios.yaml(S1~S7)에서 거꾸로 뽑은 최소 버전이다. 디자인 프레임이 나오면 프레임이 기준이다.
// 고정 문구(lib/copy.ts)와 버튼 이동은 바꾸지 않는다. 배치·디자인·상태 화면은 담당이 새로 만든다.
// 담당: ⑨ 오늘 기록 (F5 · S6). 지우기 전 확인은 브라우저 confirm이 아니라 화면 안의 버튼이다.
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { BTN, Q, SAY, todayLink } from "@/lib/copy";

type Item = { id: string; label: string; startedAt: string };

export default function Today() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => api<Item[]>("/api/records").then(setItems).catch((e: Error) => setMessage(e.message));
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    setBusy(true);
    try {
      await api(`/api/records/${id}`, { method: "DELETE" });
      setMessage(SAY.deleted);
      setConfirming(null);
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    }
    setBusy(false);
  }

  if (!items) return <main className="screen"><p className="muted">{message ?? "불러오는 중이에요…"}</p></main>;
  return (
    <main className="screen">
      <h1 className="title">{todayLink(items.length).replace(" ›", "")}</h1>
      {message ? <p className="card" role="status">{message}</p> : null}
      {items.length === 0 ? <p className="muted">{SAY.empty}</p> : null}
      <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((it) => (
          <li key={it.id} className="card stack">
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <span>{it.label}</span>
              <span className="muted">{new Date(it.startedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            {confirming === it.id ? (
              <div className="stack">
                <p style={{ margin: 0 }}>{Q.deleteConfirm}</p>
                <div className="row">
                  <button className="btn primary" style={{ flex: 1 }} disabled={busy} onClick={() => remove(it.id)}>{BTN.confirmDelete}</button>
                  <button className="btn" style={{ flex: 1 }} onClick={() => setConfirming(null)}>{BTN.no}</button>
                </div>
              </div>
            ) : (
              <button className="btn link" style={{ textAlign: "right" }} onClick={() => setConfirming(it.id)}>{BTN.cancel}</button>
            )}
          </li>
        ))}
      </ul>
      <Link className="btn" href="/home">홈으로</Link>
    </main>
  );
}
