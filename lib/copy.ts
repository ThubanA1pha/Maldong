// [공통] 고정 문구. docs/scenarios.yaml과 E2E가 이 글자를 그대로 찾는다.
// 바꾸려면 팀 합의 후 통합 담당이 scenarios.yaml·spec과 같은 커밋에서 바꾼다.

import type { Band, Option, SleepAnswer } from "./caffeine";

export const SERVICE_NAME = "커피 한 모금 전";
export const SERVICE_ONE_LINER = "시험 기간, 커피를 마시기 직전에 캐릭터가 오늘 밤 잠에 남을 카페인을 먼저 알려 줘요.";

export const BTN = {
  start: "시작하기",
  login: "로그인",
  signup: "가입하기",
  save: "저장",
  profile: "프로필",
  beforeDrink: "마시기 전 확인",
  alreadyDrank: "이미 마신 음료 기록",
  have: "이미 음료가 있어요",
  changeable: "아직 바꿀 수 있어요",
  changeBedtime: "바꾸기",
  startDrinking: "이 양으로 마시기 시작",
  skip: "이번에는 마시지 않기",
  record: "기록하기",
  cancel: "취소",
  confirmDelete: "지우기",
  no: "아니",
  answer: "답하기",
  cafeLook: "뭐 마실지 볼래",
} as const;

export const bedtimeButton = (hhmm: string) => `오늘도 ${hhmm}`;
export const todayLink = (n: number) => `오늘 커피 ${n}잔 ›`;
export const checkCard = (drinkLabel: string) => `어제 ${drinkLabel} 어땠어?`;

export const OPTION_LABEL: Record<Option, string> = {
  full: "그대로",
  half: "반만",
  third: "3분의 1만",
  original: "원래대로",
  small: "작은 사이즈",
  halfshot: "하프샷",
  decaf: "디카페인",
  already: "다 마심",
};

export const Q = {
  bedtime: "이번에는 몇 시에 잘 예정이야?",
  deleteConfirm: "이 기록을 지울까?",
  howMuch: "아까 커피 얼마나 마셨어?",
  sleep: "잘 잤어?",
  situation: "지금 이 커피는?",
} as const;

export const PORTION_ANSWER = { all: "다", half: "반", little: "조금", none: "안 마심" } as const;
export const SLEEP_ANSWER: Record<SleepAnswer, string> = { great: "푹", ok: "그럭저럭", tossed: "뒤척임", barely: "거의 못 잠" };

export const SAY = {
  compare: (hhmm: string) => `${hhmm.slice(0, 2)}시에 남을 양을 같이 비교해 보자.`,
  recalculated: "바꾼 양으로 다시 계산했어.",
  skipped: "이번 음료는 마신 기록에 넣지 않을게.",
  cafe: "카페 앞이네?",
  again: "또 마시는 거야…?",
  sensitiveUp: (label: string) => `요즘 커피에 좀 예민한 것 같아. 앞으로 ${label}으로 계산할게.`,
  sensitiveDown: (label: string) => `커피가 생각보다 괜찮았구나. 앞으로 ${label}으로 계산할게.`,
  recorded: "기록했어. 다음에 얼마나 마셨는지 알려 줘.",
  deleted: "기록을 지웠어요",
  empty: "아직 오늘 커피 기록이 없어요",
  recommendStop: "오늘은 여기까지",
  thanks: "알려 줘서 고마워. 다음 계산에 반영할게.",
  recommend: (label: string) => `${label} 마시는 걸 추천해.`,
} as const;

export const BAND_TEXT: Record<Band, string> = {
  ok: "잠에 거의 영향 없음",
  mid: "조금 늦게 잠들 수 있음",
  high: "많이 남음",
};

export const SENSITIVITY_LABEL = { dull: "둔한 편", normal: "보통", sensitive: "민감한 편" } as const;

export function drinkLabel(d: { brand: string; menu: string; size: string }) {
  return `${d.brand} ${d.menu} ${d.size}`;
}
export function recordLabel(d: { brand: string; menu: string; size: string }, option: Option) {
  return `${drinkLabel(d)} · ${OPTION_LABEL[option]}`;
}
