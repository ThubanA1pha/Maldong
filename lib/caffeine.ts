// [공통] 카페인 계산. 근거와 규칙은 docs/build_spec.md 3절, docs/problem.yaml solution_paths.
// 순수 함수만 둔다(DB·화면 없음). 바꾸면 caffeine.test.ts도 함께 고친다.

export type Sensitivity = "dull" | "normal" | "sensitive";
export type Band = "ok" | "mid" | "high";
export type Option = "full" | "half" | "third" | "original" | "small" | "halfshot" | "decaf" | "already";
export type Situation = "have" | "changeable";
export type SleepAnswer = "great" | "ok" | "tossed" | "barely";

export const HALF_LIFE_H: Record<Sensitivity, number> = { dull: 3.5, normal: 5, sensitive: 7 };
export const BAND_OK_BELOW = 30;
export const BAND_MID_BELOW = 100;

// 선택지가 음료 한 잔의 카페인에 곱하는 값. small·decaf는 다른 음료 행을 쓰므로 1이다.
export const OPTION_FACTOR: Record<Option, number> = {
  full: 1, half: 1 / 2, third: 1 / 3, original: 1, small: 1, halfshot: 1 / 2, decaf: 1, already: 1,
};

export const OPTIONS_BY_SITUATION: Record<Situation, Option[]> = {
  have: ["full", "half", "third"],
  changeable: ["original", "small", "halfshot", "decaf"],
};

const HOUR_MS = 3_600_000;

export function remaining(doseMg: number, takenAt: Date, at: Date, halfLifeH: number): number {
  const hours = (at.getTime() - takenAt.getTime()) / HOUR_MS;
  if (hours < 0) return 0;
  return doseMg * 0.5 ** (hours / halfLifeH);
}

// now 이후 가장 가까운 "HH:MM" 시각. 같은 시각이면 다음 날로 본다.
export function nextBedtime(now: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const t = new Date(now);
  t.setHours(h, m, 0, 0);
  if (t.getTime() <= now.getTime()) t.setDate(t.getDate() + 1);
  return t;
}

export function totalAtBedtime(
  records: { mg: number; startedAt: Date }[],
  bedtime: Date,
  halfLifeH: number,
): number {
  return Math.round(records.reduce((sum, r) => sum + remaining(r.mg, r.startedAt, bedtime, halfLifeH), 0));
}

export function addedAtBedtime(doseMg: number, now: Date, bedtime: Date, halfLifeH: number): number {
  return Math.round(remaining(doseMg, now, bedtime, halfLifeH));
}

export function band(mg: number): Band {
  if (mg < BAND_OK_BELOW) return "ok";
  if (mg < BAND_MID_BELOW) return "mid";
  return "high";
}

// 이미 음료가 있을 때 권할 양. 잘 때 합계가 100mg 아래에 머무는 가장 큰 양, 없으면 "stop"(오늘은 여기까지).
export function recommend(totalBeforeMg: number, fullAddedMg: number): "full" | "half" | "third" | "stop" {
  for (const option of ["full", "half", "third"] as const) {
    if (totalBeforeMg + fullAddedMg * OPTION_FACTOR[option] < BAND_MID_BELOW) return option;
  }
  return "stop";
}

const ORDER: Sensitivity[] = ["dull", "normal", "sensitive"];

// 확인 질문의 잠 답으로 민감도를 조정한다. 같은 방향이 2번 쌓이면 한 단계 옮기고 0으로 되돌린다.
export function adjustSensitivity(
  state: { sensitivity: Sensitivity; direction: "worse" | "better" | null; count: number },
  predicted: Band,
  sleep: SleepAnswer,
): { sensitivity: Sensitivity; direction: "worse" | "better" | null; count: number; changed: boolean } {
  let dir: "worse" | "better" | null = null;
  if (predicted !== "high" && (sleep === "tossed" || sleep === "barely")) dir = "worse";
  else if (predicted === "high" && sleep === "great") dir = "better";
  if (!dir) return { ...state, direction: null, count: 0, changed: false };

  const count = state.direction === dir ? state.count + 1 : 1;
  if (count < 2) return { sensitivity: state.sensitivity, direction: dir, count, changed: false };

  const i = ORDER.indexOf(state.sensitivity) + (dir === "worse" ? 1 : -1);
  const next = ORDER[Math.min(Math.max(i, 0), ORDER.length - 1)];
  return { sensitivity: next, direction: null, count: 0, changed: next !== state.sensitivity };
}
