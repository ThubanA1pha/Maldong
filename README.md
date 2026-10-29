# Maldong

SUMTECH 2026 루프톤 팀 17 저장소예요.

## 문서

- 문제 정의와 기능 명세: [docs/problem.yaml](docs/problem.yaml) (2단계에서 작성)
- 사용자 핵심 흐름: [docs/scenarios.yaml](docs/scenarios.yaml) (2단계에서 작성)
- 진행 기록: [progress.md](progress.md)

## 설치·실행

3단계에서 기술 구성을 정한 뒤 채워요. 앱은 `docker compose up --build`로 띄울 예정이에요.

## 환경변수

| 이름 | 용도 | 설정 위치 |
| --- | --- | --- |
| `AI_GATEWAY_API_KEY` | 서비스 AI 기능 호출 (필요할 때만) | 로컬 `.env`, 배포 환경변수, GitHub Secrets |
