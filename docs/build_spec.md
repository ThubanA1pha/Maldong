# 구현 명세 (화면 10개 · 공통 스펙 · 담당 5명)

> 에이전트와 개발자가 화면을 나눠 만들 때 기준으로 삼는 문서다. 기능·흐름의 원본은 `docs/problem.yaml`(F1~F6)과 `docs/scenarios.yaml`(S1~S8), 용어·문구는 `lib/copy.ts`, 계산은 `lib/caffeine.ts`다. 팀 공지·점검 결과는 main이 아니라 `notes` 브랜치의 `NOTES.md`에 있다.
> 이 문서와 원본이 어긋나면 원본이 이긴다. 이 문서를 고칠 때는 원본도 같은 커밋에서 맞춘다.
> **[공통]** 표시가 붙은 파일은 통합 담당(팀장 PC)만 고친다. 바꿔야 하면 멈추고 요청한다.
> **[역산 초안]** 2절의 화면 10개는 디자인 프레임이 아니라 `scenarios.yaml`(S1~S8)에서 거꾸로 뽑은 것이다. 프레임이 나오면 프레임이 기준이고, 통합 담당이 이 표와 `OWNERS.json`을 고친다.
> **뼈대 상태**: DB·로그인·계산·모든 API·고정 문구·캐릭터·Docker가 완성돼 있고, 화면 10개는 흐름이 실제로 눌리는 최소 버전이다. 각 담당은 자기 화면의 디자인·배치·상태 화면을 새로 만든다.

## 0. 작업 방식

- 각자 자기 브랜치(`p1`~`p5`, OWNERS.json)에만 push한다. main에는 통합 담당만 merge한다.
- push 전에 `npm run scope -- p3`(자기 번호)로 담당 밖 파일을 건드리지 않았는지 검사한다.
- 시작 전과 merge 알림을 받을 때마다 `git pull --rebase origin main`.
- 자기 화면 폴더와 자기 API 폴더만 고친다. [공통] 파일이 필요하면 멈추고 요청한다.
- 버튼·문구는 아래 **고정 문구**를 한 글자도 바꾸지 않는다. E2E가 이 글자를 찾는다.
- push 전에 타입 검사와 빌드, 자기 화면의 단위 테스트를 통과시킨다.

## 1. 스택과 폴더 [공통]

| 항목 | 정한 것 |
| --- | --- |
| 앱 | Next.js (App Router), TypeScript |
| DB | PostgreSQL (docker-compose의 db 서비스), ORM은 Prisma |
| 인증 | 이메일·비밀번호(bcrypt 해시) + httpOnly 세션 쿠키. 가짜 성공 화면 금지 |
| 플랫폼 | mobile 390px 기준. 하단 고정 주 버튼, 엄지 영역 |
| 실행 | `docker compose up`으로 앱·DB·시드가 2분 안에. 서비스 이름 app, 포트 3000 |

```
app/page.tsx                   ① 첫 화면 /
app/signup/page.tsx            ② 가입
app/login/page.tsx             ③ 로그인
app/profile/                   ④ 프로필
app/home/                      ⑤ 홈 (CafeNotice.tsx 포함)
app/drink/select/page.tsx      ⑥ 음료 고르기
app/drink/situation/page.tsx   ⑦ 상황·잘 시각
app/drink/preview/page.tsx     ⑧ 미리 보기
app/today/page.tsx             ⑨ 오늘 기록
app/check/[recordId]/page.tsx  ⑩ 확인 질문
app/api/...                    화면별 API (2절 표, 이미 동작함)
app/%5F%5Fhealth/route.ts      [공통] /__health
app/layout.tsx, app/globals.css [공통] 바탕·색·글꼴·간격 토큰
lib/caffeine.ts (+ .test.ts)   [공통] 계산
lib/service.ts                 [공통] 데이터 처리. 화면·API는 이 함수만 부른다
lib/copy.ts                    [공통] 고정 문구
lib/auth.ts, lib/db.ts, lib/api.ts, lib/client.ts [공통]
components/Character.tsx       [공통] 캐릭터 (표정 3단계 + 말풍선)
components/AuthForm.tsx        [공통] 가입·로그인 폼
prisma/schema.prisma, prisma/seed.mjs, prisma/drinks.json [공통]
Dockerfile, docker-compose.yml [공통]
e2e/                           [공통] 키트 폴더, spec은 lead
OWNERS.json, scripts/check-scope.mjs [공통] 담당표와 범위 검사
```

## 2. 화면 10개

화면 사이에 넘기는 값은 쿼리 문자열로 넘긴다(`drinkId`, `situation`, `bedtime`). 흐름 중간에 주소를 직접 여는 테스트는 금지이므로, 모든 이동은 버튼으로 일어나야 한다.

| # | 화면 | 주소 | 기능 | 흐름 | 화면 요소와 버튼 | API |
| --- | --- | --- | --- | --- | --- | --- |
| ① | 첫 화면 | `/` | F1 | S1 | 서비스 이름, 한 줄 소개, 캐릭터, [시작하기], [로그인] | 없음 |
| ② | 가입 | `/signup` | F1 | S1 | 이메일, 비밀번호, [가입하기]. 빈 칸이면 칸 옆에 이유 | `POST /api/auth/signup` |
| ③ | 로그인 | `/login` | F1 | (E2E 사전 로그인) | 이메일, 비밀번호, [로그인]. 실패 문구 | `POST /api/auth/login`, `POST /api/auth/logout` |
| ④ | 프로필 | `/profile` | F1·F6 | S1·S7 | 평소 잠드는 시각(시각 선택, 기본 01:00), 민감도 3칩(둔한 편 / 보통 / 민감한 편), [저장] | `GET/PUT /api/profile` |
| ⑤ | 홈 | `/home` | F3·F5·F6 | S2~S7 시작점 | 캐릭터 표정·말풍선, "오늘 커피 N잔 ›", [마시기 전 확인], [이미 마신 음료 기록], [프로필], 확인 카드("어제 ○○ 어땠어?" + [답하기]), 카페 앞이면 말풍선 "카페 앞이네?" + [뭐 마실지 볼래] | `GET /api/home`, `GET /api/cafes/near?lat=&lng=` |
| ⑥ | 음료 고르기 | `/drink/select?mode=before\|already\|cafe` | F2·F3·F4 | S2~S5 | 브랜드별 메뉴 목록("메가커피 아이스 아메리카노" 형식), 사이즈 칩. already 모드면 [기록하기] | `GET /api/drinks`, already 모드 `POST /api/records` |
| ⑦ | 상황·잘 시각 | `/drink/situation` | F2 | S2~S4 | [이미 음료가 있어요] / [아직 바꿀 수 있어요] (cafe 모드면 바꿀 수 있음으로 건너뜀), "이번에는 몇 시에 잘 예정이야?" + [오늘도 01:00] / [바꾸기] | 없음 |
| ⑧ | 미리 보기 | `/drink/preview` | F2·F3 | S2~S4 | 캐릭터 반응, 선택지 칩(상황별 4개, 각 칩에 "이 음료로 01:00에 더해지는 카페인 Nmg"과 구간), 추천 표시, [이 양으로 마시기 시작], [이번에는 마시지 않기] | `POST /api/preview`(저장 없음), `POST /api/records` |
| ⑨ | 오늘 기록 | `/today` | F5 | S6 | 오늘 기록 목록(음료·사이즈·양·시각), 줄마다 [취소] → 화면 안 확인 "이 기록을 지울까?" [지우기] / [아니] | `GET /api/records?day=today`, `DELETE /api/records/:id` |
| ⑩ | 확인 질문 | `/check/[recordId]` | F6 | S7 | "아까 커피 얼마나 마셨어?" [다] [반] [조금] [안 마심] → "잘 잤어?" [푹] [그럭저럭] [뒤척임] [거의 못 잠] → 결과 말풍선 → 홈 | `POST /api/checks` |

## 3. 계산 규칙 `lib/caffeine.ts` [공통, 단위 테스트 필수]

```ts
type Sensitivity = "dull" | "normal" | "sensitive"
const HALF_LIFE_H = { dull: 3.5, normal: 5, sensitive: 7 }          // 근거: problem.yaml R8·R9
remaining(doseMg, takenAt, at, hl) = doseMg * 0.5 ** (hours(at - takenAt) / hl)   // 흡수 시간은 무시
nextBedtime(now, "01:00")        // now 이후 가장 가까운 그 시각
addedAtBedtime(doseMg, now, bedtime, hl) = round(remaining(doseMg, now, bedtime, hl))
totalAtBedtime(records, bedtime, hl) = round(Σ remaining(record.mg, record.startedAt, bedtime, hl))
band(mg): mg < 30 → "ok"(잠에 거의 영향 없음) / mg < 100 → "mid"(조금 늦게 잠들 수 있음) / 그 외 → "high"(많이 남음)
recommend(totalNow, drinkMg, ...): [1, 1/2, 1/3] 중 totalNow + added < 100 인 가장 큰 양. 없으면 "오늘은 여기까지"
```

- 화면 표시는 mg 정수 반올림. "절반" 비교는 1mg 차이까지 같다고 본다.
- 선택지 배수: [그대로]·[원래대로] 1, [반만] 1/2, [3분의 1만] 1/3, [하프샷] 1/2 [가설: 샷 절반 = 카페인 절반], [작은 사이즈]는 같은 메뉴에서 sizeRank가 바로 아래인 행, [디카페인]은 같은 메뉴의 디카페인 행. 해당 행이 없으면 칩을 숨긴다. 지금 데이터는 메뉴마다 공식 용량이 하나(전부 sizeRank 1)라서 [작은 사이즈]는 보이지 않고, [디카페인]은 스타벅스 아메리카노 톨에서만 보인다.
- 캐릭터 표정 = `band(totalAtBedtime(오늘 기록 + 미리 보기 선택))`.
- 잔 수 = 오늘 기록 건수. 반만 마셔도 1잔.
- 민감도 조정: 확인 질문의 잠 답과 기록 당시 예측 구간을 비교한다.
  - "더 못 잤다": 예측이 ok·mid인데 [뒤척임]·[거의 못 잠]
  - "더 잘 잤다": 예측이 high인데 [푹]
  - 같은 방향이 2번 쌓이면 민감도를 한 단계 옮기고 카운터를 0으로. 반대 방향이 오면 카운터를 0으로.
  - 끝 단계(민감한 편에서 더 못 잤다)면 바뀌지 않는다.

## 4. 데이터 모양 `prisma/schema.prisma` [공통]

| 모델 | 필드 |
| --- | --- |
| User | id, email(고유), passwordHash, createdAt |
| Profile | userId, usualBedtime("HH:MM"), sensitivity(dull·normal·sensitive), mismatchDirection(worse·better·null), mismatchCount(int) |
| Drink | id, brand, menu, size, caffeineMg, isDecaf, sourceUrl |
| Cafe | id, name, lat, lng, radiusM(기본 50) |
| Record | id, userId, drinkId, option(full·half·third·original·small·halfshot·decaf·already), plannedMg, startedAt, bedtime("HH:MM"), predictedBand(ok·mid·high), confirmedPortion(all·half·little·none·null), sleepAnswer(great·ok·tossed·barely·null), answeredAt |

- [이번에는 마시지 않기]는 Record를 만들지 않는다. 미리 보기도 만들지 않는다.
- 확인 카드는 `startedAt`이 오늘보다 이전이고 `answeredAt`이 없는 Record마다 생긴다.

## 5. 고정 문구 `lib/copy.ts` [공통]

scenarios.yaml이 확인하는 글자다. 바꾸려면 팀 합의 후 통합 담당이 scenarios.yaml·spec과 같은 커밋에서 바꾼다.

| 위치 | 문구 |
| --- | --- |
| 버튼 | 시작하기 · 로그인 · 가입하기 · 저장 · 프로필 · 마시기 전 확인 · 이미 마신 음료 기록 · 이미 음료가 있어요 · 아직 바꿀 수 있어요 · 오늘도 01:00 (시각은 프로필 값) · 바꾸기 · 그대로 · 반만 · 3분의 1만 · 원래대로 · 작은 사이즈 · 하프샷 · 디카페인 · 이 양으로 마시기 시작 · 이번에는 마시지 않기 · 기록하기 · 취소 · 지우기 · 아니 · 답하기 · 뭐 마실지 볼래 · 다 · 반 · 조금 · 안 마심 · 푹 · 그럭저럭 · 뒤척임 · 거의 못 잠 |
| 링크 | 오늘 커피 N잔 › |
| 질문 | 이번에는 몇 시에 잘 예정이야? · 이 기록을 지울까? · 아까 커피 얼마나 마셨어? · 잘 잤어? · 어제 {음료} 어땠어? |
| 캐릭터 | 01시에 남을 양을 같이 비교해 보자. · 바꾼 양으로 다시 계산했어. · 이번 음료는 마신 기록에 넣지 않을게. · 카페 앞이네? · 또 마시는 거야…? · 요즘 커피에 좀 예민한 것 같아. 앞으로 민감한 편으로 계산할게. |
| 안내 | 아직 오늘 커피 기록이 없어요 · 기록을 지웠어요 |
| 기록 표시 | `{브랜드} {메뉴} {사이즈} · {반만·하프샷·다 마심 …}` |

## 6. 시드 `prisma/seed.mjs` [공통]

- 계정 "학생": `SEED_USER_EMAIL`, `SEED_USER_PASSWORD` (docker-compose.yml에 값 그대로)
- 프로필: 평소 01:00, 보통, 못 잤다 카운터 1(worse)
- 오늘 기록: "컴포즈커피 I-카페라떼 591ml · 다 마심" 1건 (이 이름은 오늘 하나뿐)
- 어제 기록: "스타벅스 아이스 카페 아메리카노 Tall 355ml", 확인 전 1건
- 지난 5일 기록 여러 건(확인 완료)
- 음료: `prisma/drinks.json` 공식 23개 메뉴(메가커피·컴포즈커피·빽다방·스타벅스 아메리카노·라떼, ICE/HOT, 대용량은 별도 메뉴, 공식 이름·용량·함량·출처 링크)
- 계정 "피곤한 학생"(S8): `SEED_TIRED_EMAIL`, `SEED_TIRED_PASSWORD`. 평소 잠드는 시각 = 시드 시각 + 2시간, 민감도 보통, 1시간 전에 "메가커피 메가리카노 (ICE) 946ml · 다 마심"(354mg) 1건 → 언제 테스트해도 잘 때 남을 카페인이 "많이 남음"에서 시작
- 카페: 대회장 1곳(광주 북구 자미로6번길 45, 35.165706, 126.907069, 반경 50m)

## 7. 담당 (5명 · 화면 2개씩) — 원본은 `OWNERS.json`

| 담당 | 브랜치 | 화면 | 흐름 | 고칠 수 있는 파일 |
| --- | --- | --- | --- | --- |
| p1 | `p1` | ① 첫 화면, ② 가입 | S1 | `app/page.tsx`, `app/signup/`, `app/api/auth/signup/` |
| p2 | `p2` | ③ 로그인, ④ 프로필 | S1, S7 끝 | `app/login/`, `app/profile/`, `app/api/auth/login·logout/`, `app/api/profile/` |
| p3 | `p3` | ⑤ 홈, ⑨ 오늘 기록 | S2~S7 시작점, S6 | `app/home/`, `app/today/`, `app/api/home/`, `app/api/cafes/`, `app/api/records/[id]/` |
| p4 | `p4` | ⑥ 음료 고르기, ⑦ 상황·잘 시각 | S2~S5 | `app/drink/select/`, `app/drink/situation/`, `app/api/drinks/` |
| p5 | `p5` | ⑧ 미리 보기, ⑩ 확인 질문 | S2~S4, S7 | `app/drink/preview/`, `app/check/`, `app/api/preview/`, `app/api/checks/` |
| lead | main | [공통] 전부, E2E spec 8개(S1~S8), merge·모의 채점 | 전체 | 전부 |

- 화면은 [역산 초안]의 최소 버전이 이미 동작한다. 담당은 그 위에 디자인·배치·로딩·빈 상태·오류 문구를 만든다.
- `app/api/records/route.ts`(기록 만들기·오늘 목록)는 ⑥·⑧·⑨가 함께 쓰므로 [공통]이다.
- 화면 사이의 이음새(버튼이 가는 주소, 쿼리 이름)는 2절 표와 지금 코드가 약속이다. 바꾸려면 lead에게 요청한다.
- 사람 이름은 팀이 정해 OWNERS.json에 적는다.

## 8. 화면별 완료 조건 (merge 받는 기준)

- 고정 문구가 그대로 보이고, 2절의 버튼이 모두 동작한다(빈 onClick, `href="#"`, "준비 중" 없음).
- 로딩 표시, 빈 상태 안내, 이해할 수 있는 오류 문구, 저장 후 확인, 처리 중 버튼 잠금.
- 390px에서 가로 넘침 없음, 주 버튼은 하단 엄지 영역.
- 색·글꼴·간격은 `app/globals.css`의 토큰만 쓴다. 기본 shadcn 모양 그대로 두지 않는다.
- 자기 API는 로그인 사용자만, 남의 기록은 읽거나 지울 수 없다(서버에서 소유자 확인).
