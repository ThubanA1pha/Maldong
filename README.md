# Maldong

SUMTECH 2026 루프톤 팀 17 저장소예요.

## 문서

- 문제 정의와 기능 명세: [docs/problem.yaml](docs/problem.yaml) 
- 사용자 핵심 흐름: [docs/scenarios.yaml](docs/scenarios.yaml) 
- 진행 기록: [progress.md](progress.md)

## 설치·실행

| 하는 일 | 명령 |
| --- | --- |
| 채점기와 같은 방식으로 띄우기 | `docker compose down -v` → `docker compose up -d --build` → http://localhost:3000/__health |
| 개발 서버 | `npm install` → `.env`에 `DATABASE_URL`, `SESSION_SECRET` → `npx prisma db push` → `npm run db:seed` → `npm run dev` |
| 검사 | `npm run typecheck`, `npm test`, `npm run build` |
| 내 담당 범위 검사 | `npm run scope -- p3` (OWNERS.json의 번호) |

- 시드 계정(로컬 전용): `student@example.com` / `loopthon-2026`
- 구성: Next.js 16, PostgreSQL, Prisma, 이메일·비밀번호 로그인(서명한 httpOnly 쿠키)

## 함께 일하는 방법

- 문서: [docs/build_spec.md](docs/build_spec.md)(구현 명세), [CONTEXT.md](CONTEXT.md)(용어), [docs/user_flow.md](docs/user_flow.md)(흐름도), [OWNERS.json](OWNERS.json)(담당)
- 각자 `p1`~`p5` 브랜치에서 작업하고, 통합 담당이 모의 채점 후 main에 merge한다.
- 에이전트 지침: [AGENTS.md](AGENTS.md)

## 환경변수

| 이름 | 용도 | 설정 위치 |
| --- | --- | --- |
| `AI_GATEWAY_API_KEY` | 서비스 AI 기능 호출 (필요할 때만) | 로컬 `.env`, 배포 환경변수, GitHub Secrets |
| `DATABASE_URL` | PostgreSQL 주소 | docker-compose.yml(로컬 docker), 로컬 `.env`, 배포 환경변수 |
| `SESSION_SECRET` | 로그인 쿠키 서명 | docker-compose.yml(로컬 전용 값), 배포 환경변수 |
