"use client";
// 담당: ④ 프로필
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Character } from "@/components/Character";
import { ErrorNotice } from "@/components/ErrorNotice";
import type { Sensitivity } from "@/lib/caffeine";
import { api } from "@/lib/client";
import { AUTH, BTN, SENSITIVITY_LABEL } from "@/lib/copy";
import s from "../auth.module.css";

export function ProfileForm({ initial, first = false }: { initial: { usualBedtime: string; sensitivity: Sensitivity }; first?: boolean }) {
  const router = useRouter();
  const [bedtime, setBedtime] = useState(initial.usualBedtime);
  const [sensitivity, setSensitivity] = useState<Sensitivity>(initial.sensitivity);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!bedtime) return setError("평소 잠드는 시각을 골라 주세요.");
    setBusy(true);
    setError(null);
    try {
      await api("/api/profile", { method: "PUT", body: { usualBedtime: bedtime, sensitivity } });
      router.replace("/home?notice=saved");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      await api("/api/auth/logout", { body: {} });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className={s.body}>
      <Character band="ok" line={first ? AUTH.firstProfileLine : AUTH.profileLine} size={96} />
      <section className={s.card}>
        <label className={s.label} htmlFor="bedtime">평소 잠드는 시각</label>
        <input id="bedtime" className={s.time} type="time" disabled={busy} value={bedtime} onChange={(e) => setBedtime(e.target.value)} />
      </section>
      <section className={s.card}>
        <p className={s.label}>민감도</p>
        <p className={s.now}>{AUTH.sensitivityNow}: <strong data-testid="sensitivity">{SENSITIVITY_LABEL[sensitivity]}</strong></p>
        <div className={s.segment} role="group" aria-label="민감도">
          {(Object.keys(SENSITIVITY_LABEL) as Sensitivity[]).map((k) => (
            <button key={k} type="button" disabled={busy} aria-pressed={k === sensitivity} onClick={() => setSensitivity(k)}>{SENSITIVITY_LABEL[k]}</button>
          ))}
        </div>
        <p className={s.help}>{AUTH.sensitivityHelp}</p>
      </section>
      {error ? <ErrorNotice message={error} /> : null}
      <button className="btn primary" disabled={busy} aria-busy={busy} onClick={save}>{BTN.save}</button>
      <button className={s.logout} type="button" disabled={busy} onClick={logout}>{BTN.logout}</button>
    </div>
  );
}
