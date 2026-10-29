// [공통] 캐릭터. 표정 3단계(band)와 말풍선. 그림은 디자인 담당이 이 컴포넌트 안에서만 바꾼다.
import type { Band } from "@/lib/caffeine";

const FACE: Record<Band, string> = { ok: "편안", mid: "말똥", high: "못 잠" };

export function Character({ band, line }: { band: Band; line?: string | null }) {
  return (
    <div className="stack" style={{ alignItems: "center" }} data-band={band}>
      <div
        aria-label={`캐릭터 표정: ${FACE[band]}`}
        className={`band-${band}`}
        style={{ width: 112, height: 112, borderRadius: "50%", border: "3px solid currentColor", display: "grid", placeItems: "center", fontWeight: 700, background: "var(--surface)" }}
      >
        {FACE[band]}
      </div>
      {line ? <p className="card" role="status" style={{ margin: 0, width: "100%" }}>{line}</p> : null}
    </div>
  );
}
