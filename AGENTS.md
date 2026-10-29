# 에이전트 작업 지침 (팀 17 · 모든 노트북 공통)

이 저장소에서 일하는 코딩 에이전트는 작업 전에 이 파일을 읽는다.

## 0. 작업 시작할 때마다 (가장 먼저)

1. `git pull --rebase origin main`
2. **`docs/review/LATEST.md`(최신 점검 결과)를 읽고, 내 담당(p1~p5) 항목을 먼저 처리한다.** 순서는 `docs/review/README.md`.
3. 커밋 메시지에 처리한 점검 항목 번호를 적는다. 예: `p1: review#1-3 프로필 로그아웃 버튼`

## 1. 내 담당 확인

1. 사람에게 받은 담당 번호(`p1`~`p5`)를 확인한다. 모르면 묻고 멈춘다.
2. `OWNERS.json`에서 내 화면, 흐름, **고칠 수 있는 파일(paths)**을 확인한다.
3. 그 밖의 파일은 [공통]이다. 고쳐야 하면 고치지 말고, 무엇을 왜 바꿔야 하는지 적어 사람에게 알리고 멈춘다.

## 2. 읽는 순서

1. `docs/build_spec.md`: 화면 10개, 계산 규칙, 데이터 모양, 고정 문구, 담당, 완료 조건
2. `CONTEXT.md`: 용어 (잘 때 남는 카페인, 추천 양, 확인 질문 …)
3. `docs/scenarios.yaml`: 내 흐름의 steps와 expected. 버튼 이름은 여기와 `lib/copy.ts`가 같아야 한다
4. 필요할 때만 `docs/problem.yaml`(기능 F1~F6), `docs/user_flow.md`(흐름도·계산 근거)

## 3. 지킬 것

- **브랜치:** 내 브랜치(`p1`~`p5`)에서만 커밋·push한다. main에 push하지 않는다. force push 금지.
- **시작 전·merge 알림 뒤:** `git pull --rebase origin main`
- **고정 문구:** `lib/copy.ts`의 문구를 그대로 쓴다. 화면에 새 글자를 하드코딩해서 버튼 이름을 바꾸지 않는다.
- **데이터:** 화면과 API는 `lib/service.ts` 함수만 부른다. Prisma를 직접 부르거나 DB 구조를 바꾸지 않는다.
- **계산:** `lib/caffeine.ts`만 쓴다. 화면에서 따로 계산하지 않는다.
- **이동:** 화면 사이 이동은 버튼·링크로. 버튼이 가는 주소와 쿼리 이름은 바꾸지 않는다(E2E가 그 순서대로 누른다).
- **기능 범위:** `docs/problem.yaml`의 features에 없는 기능은 만들지 않는다.
- **디자인:** 색·글꼴·간격은 `app/globals.css` 토큰만. 기본 템플릿 모양, 보라·파랑 그라데이션, 이모지 제목, 빈 홍보 문구, "준비 중" 버튼, 영어 기본 문구 금지. 390px 휴대폰 화면 기준, 주 버튼은 하단.
- **상태 화면:** 로딩, 빈 목록 안내, 이해할 수 있는 오류 문구, 저장 후 확인, 처리 중 버튼 잠금.
- **비밀값:** `.env`를 커밋하지 않는다. 키를 코드에 쓰지 않는다. `AI_GATEWAY_API_KEY`를 코딩 에이전트에 연결하지 않는다.

## 4. push 전 검사 (모두 통과해야 push)

```bash
npm run typecheck
npm test
npm run build
npm run scope -- p3      # 내 번호
```

## 5. 실행

- 개발: `npm install` → `.env`에 `DATABASE_URL`(로컬 Postgres)과 `SESSION_SECRET` → `npx prisma db push` → `npm run db:seed` → `npm run dev`
- 채점기와 같은 방식: `docker compose down -v` → `docker compose up -d --build` → `http://localhost:3000/__health`
- 시드 계정: `student@example.com` / `loopthon-2026` (로컬 전용)

## 6. 기록

- 작업이 끝나면 커밋 메시지에 화면 번호를 적는다. 예: `p3: 홈 캐릭터 배치와 빈 상태`
- 확인하지 못한 것은 "미확인"이라고 사람에게 알린다. 확인했다고 말하지 않는다.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
