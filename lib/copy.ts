// [공통] 고정 문구. docs/scenarios.yaml과 E2E가 이 글자를 그대로 찾는다.
// 바꾸려면 팀 합의 후 통합 담당이 scenarios.yaml·spec과 같은 커밋에서 바꾼다.

import type { Band, Option, SleepAnswer } from "./caffeine";

export const SERVICE_NAME = "말똥"; // Figma 로고 (이전: "커피 한 모금 전")
export const SERVICE_ONE_LINER = "시험 기간, 커피를 마시기 직전에 캐릭터가 오늘 밤 잠에 남을 카페인을 먼저 알려 줘요.";

export const BTN = {
  start: "시작하기",
  login: "로그인",
  logout: "로그아웃",
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
  undo: "되돌리기",
  cafeDismiss: "괜찮아",
} as const;

// 하단 내비 탭 이름 ([마시기 전 확인]·[프로필]은 BTN을 쓴다)
export const NAV = { home: "초원", today: "오늘 기록", cafe: "카페" } as const;

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
  cafeAsk: "주문 전에 뭐 마실지 같이 볼래?",
} as const;

// 홈 말풍선 (Figma "홈 상태 3단계 기준 표"). 줄바꿈은 말풍선에서 그대로 보인다.
// late: 잘 시각이 이미 지난 새벽(isPastBedtime)이면 "오늘 밤 1시에…" 대신 지금 기준으로 말한다.
const hourText = (hhmm: string) => { const h = Number(hhmm.slice(0, 2)); return h === 0 ? "자정" : `${h}시`; };
export const HOME_LINE: Record<Band, (hhmm: string, late?: boolean) => string> = {
  ok: (hhmm, late) => late ? `벌써 ${hourText(hhmm) === "자정" ? "자정이" : `${hourText(hhmm)}가`} 지났어.\n이제 같이 자러 갈까?` : `오늘 밤 ${hourText(hhmm)}에 같이 자는 거지?\n지금까진 아주 좋아`,
  mid: (_hhmm, late) => late ? "아직 조금 남아 있어.\n다음 잔은 내일 마시자" : "조금 남겠다.\n다음 잔은 반만 어때?",
  high: () => "양 312마리… 왜 안 졸리지…?\n오늘은 여기까지 어때?",
};

export const HOME = {
  bedtimeCaption: (hhmm: string, late?: boolean) => (late ? "지금 몸에 남은 카페인" : `${hhmm}에 남을 카페인`),
  lastRecord: (time: string, drink: string) => `마지막 ${time} · ${drink}`,
  checkSub: "마신 양이랑 잠만 · 10초",
  cafeNear: (name: string) => `${name} · 50m 안`,
  sheepCount: "× 312",
} as const;

export const TODAY = {
  title: "오늘 기록",
  count: (n: number) => `오늘 커피 ${n}잔`,
  countNote: "반만 마셔도 1잔으로 세어요",
  deleteNote: "지우면 오늘 계산이 다시 바뀌어요",
} as const;

// ①~④ 첫 화면·가입·로그인·프로필 말풍선과 안내
export const AUTH = {
  landingLine: "안녕! 나는 솜이야.\n네 잠을 지켜 줄게", // Figma 1-1
  landingTagline: "마시기 전에, 3초만 솜이랑 보자",
  signupLine: "반가워!\n이메일이면 충분해",
  loginLine: "다시 왔구나!",
  profileLine: "잘 시각이랑 민감도로\n오늘 밤을 계산해",
  sensitivityHelp: "담배를 피우거나 복용 중인 약이 있으면 카페인이 몸에 남는 시간이 달라질 수 있어요.",
  sensitivityNow: "현재 민감도",
  saved: "저장했어요",
} as const;

// ⑧ 미리 보기 (p5 요청 문구)
export const PREVIEW = {
  title: "미리 보기",
  recommendTag: "추천 양",
  recommendStopTag: "추천 양 · 오늘은 여기까지",
  optionSub: {
    full: "한 잔 다",
    half: "나머지는 내일 아침에",
    third: "몇 모금만",
    small: "한 단계 작은 사이즈로",
    halfshot: "샷 절반 · 원래대로의 절반",
    decaf: "디카페인 원두로",
  } as Partial<Record<Option, string>>,
  plan: (hhmm: string) => `이번에는 ${hhmm}에 잘 예정`,
  late: (hhmm: string) => `${hhmm}이 지나서 지금 몸에 남은 카페인으로 비교해요`,
  calculating: "계산하는 중이에요…",
  recording: "기록하는 중이에요…",
  retry: "다시 계산하기",
  pickDrink: "음료 고르기",
  noDrink: "고른 음료가 없어요. 음료부터 다시 골라 주세요.",
  pickOption: "선택지를 하나 골라 주세요",
  pickBeforeDrink: "그래도 마신다면 선택지를 먼저 골라 주세요",
} as const;

// ⑩ 확인 질문 (p5 요청 문구)
export const CHECK = {
  title: "확인 질문",
  bubble: "하나씩 물어볼게",
  loading: "어제 기록을 불러오는 중이에요…",
  saving: "답을 저장하는 중이에요…",
  afterPortion: "마신 양을 고르면 잠에 대해 물어볼게요.",
  gone: "이 기록은 이미 답했거나 찾을 수 없어요.",
  goneHelp: "홈에서 남아 있는 확인 카드를 다시 골라 주세요.",
  home: "홈으로",
} as const;

// API 오류 안내 (서버가 400과 함께 돌려주는 문장)
export const API_ERROR = {
  pickDrink: "음료를 먼저 골라 주세요.",
  pickSituation: "지금 상황을 먼저 골라 주세요.",
  pickBedtime: "잘 시각을 다시 골라 주세요.",
  unknownDrink: "없는 음료예요. 음료를 다시 골라 주세요.",
  unknownRecord: "없는 기록이에요.",
  pickPortion: "마신 양을 골라 주세요.",
  pickSleep: "잠을 어떻게 잤는지 골라 주세요.",
  pickOption: "고를 수 없는 선택지예요.",
  cannotRestore: "되돌릴 수 있는 시간이 지났거나 없는 기록이에요.",
} as const;

// 화면에서 API 오류가 났을 때 캐릭터 말풍선 (features F5: 오류도 같은 말투로)
export const ERROR_SAY = {
  general: "앗, 잠깐 문제가 생겼어. 다시 한 번 눌러 줄래?",
  offline: "인터넷이 잠깐 끊긴 것 같아. 연결되면 다시 해 보자.",
  restored: "되돌렸어. 기록이 다시 생겼어.",
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
