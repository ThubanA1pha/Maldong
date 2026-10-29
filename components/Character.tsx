// [공통] 캐릭터 솜이. 표정 3단계(band)와 말풍선. 그림은 Figma "00 솜이 · 로고"의 상태 표정(public/character/*.svg).
// band: ok 평온 · mid 멈칫 · high 과각성. mood를 주면 band 대신 그 표정을 쓴다(tired 지침 · relieved 회복).
// 말풍선은 머리 위에 뜬다. 화면이 말풍선과 그림을 따로 놓아야 하면 CharacterFace·Bubble을 각각 쓴다.
import type { Band } from "@/lib/caffeine";

export type Mood = Band | "tired" | "relieved";

const FACE: Record<Mood, { label: string; src: string; w: number }> = {
  ok: { label: "평온", src: "/character/ok.svg", w: 98 },
  mid: { label: "멈칫", src: "/character/mid.svg", w: 98.5 },
  high: { label: "과각성", src: "/character/high.svg", w: 111.669 },
  tired: { label: "지침", src: "/character/tired.svg", w: 98 },
  relieved: { label: "회복", src: "/character/relieved.svg", w: 102 },
};

// size = 그림 칸의 너비(px). Figma 기준 칸은 120×128이고 발끝을 칸 아래에 맞춘다.
export function CharacterFace({ band, mood, size = 120, flip = false }: { band: Band; mood?: Mood; size?: number; flip?: boolean }) {
  const face = FACE[mood ?? band];
  return (
    <div
      role="img"
      aria-label={`캐릭터 표정: ${face.label}`}
      data-band={band}
      style={{ width: size, height: Math.round((size * 128) / 120), display: "flex", alignItems: "flex-end", justifyContent: "center", flex: "none" }}
    >
      <img
        src={face.src}
        alt=""
        width={Math.round((size * face.w) / 120)}
        style={{ display: "block", height: "auto", transform: flip ? "scaleX(-1)" : undefined }}
      />
    </div>
  );
}

export function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="card"
      role="status"
      style={{
        margin: 0,
        maxWidth: 300,
        padding: "13px 15px",
        border: 0,
        borderRadius: "var(--radius)",
        boxShadow: "0 4px 0 var(--shadow)",
        fontFamily: "var(--font-display)",
        fontSize: 16.5,
        lineHeight: 1.35,
        color: "var(--fg)",
        wordBreak: "keep-all",
        whiteSpace: "pre-line",
      }}
    >
      {children}
    </p>
  );
}

export function Character({ band, line, mood, size }: { band: Band; line?: string | null; mood?: Mood; size?: number }) {
  return (
    <div className="stack" style={{ alignItems: "center", gap: 10 }} data-band={band}>
      {line ? <Bubble>{line}</Bubble> : null}
      <CharacterFace band={band} mood={mood} size={size} />
    </div>
  );
}
