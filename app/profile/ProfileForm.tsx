"use client";
// 담당: ④ 프로필
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Sensitivity } from "@/lib/caffeine";
import { api } from "@/lib/client";
import { BTN, SENSITIVITY_LABEL } from "@/lib/copy";

export function ProfileForm({ initial }: { initial: { usualBedtime: string; sensitivity: Sensitivity } }) {
  const router = useRouter();
  const [bedtime, setBedtime] = useState(initial.usualBedtime);
  const [sensitivity, setSensitivity] = useState<Sensitivity>(initial.sensitivity);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true); setError(null);
    try {
      await api("/api/profile", { method: "PUT", body: { usualBedtime: bedtime, sensitivity } });
      router.push("/home");
    } catch (err) {
      setError((err as Error).message); setBusy(false);
    }
  }

  return (
    <div className="stack">
      <label className="field">평소 잠드는 시각<input id="bedtime" type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} /></label>
      <p className="muted">현재 민감도: <strong data-testid="sensitivity">{SENSITIVITY_LABEL[sensitivity]}</strong></p>
      <div className="row" role="group" aria-label="민감도">
        {(Object.keys(SENSITIVITY_LABEL) as Sensitivity[]).map((s) => (
          <button key={s} type="button" className="chip" aria-pressed={s === sensitivity} onClick={() => setSensitivity(s)}>{SENSITIVITY_LABEL[s]}</button>
        ))}
      </div>
      <p className="muted">담배를 피우면 카페인이 더 빨리, 피임약을 먹으면 더 천천히 빠질 수 있어요.</p>
      {error ? <p className="error" role="alert">{error}</p> : null}
      <div className="bottom"><div><button className="btn primary" disabled={busy} onClick={save}>{BTN.save}</button></div></div>
    </div>
  );
}
