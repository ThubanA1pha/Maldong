// [공통] 채점기가 앱이 떴는지 보는 경로. 로그인·리다이렉트 없이 200.
// releaseId: docker는 RELEASE_ID, Vercel 배포는 VERCEL_GIT_COMMIT_SHA(배포한 커밋 SHA).
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok", releaseId: process.env.RELEASE_ID ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "dev" });
}
