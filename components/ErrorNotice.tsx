"use client";

import { Bubble, CharacterFace } from "./Character";
import { BTN } from "@/lib/copy";
import s from "./ErrorNotice.module.css";

export function ErrorNotice({ message, onRetry, busy = false }: { message: string; onRetry?: () => void; busy?: boolean }) {
  return (
    <div className={s.notice} role="alert">
      <div className={s.row}>
        <CharacterFace band="mid" size={48} />
        <div className={s.message}><Bubble>{message}</Bubble></div>
      </div>
      {onRetry ? <button className="btn" type="button" disabled={busy} onClick={onRetry}>{BTN.retry}</button> : null}
    </div>
  );
}
