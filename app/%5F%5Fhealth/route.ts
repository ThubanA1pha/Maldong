// [공통] 채점기가 앱이 떴는지 보는 경로. 로그인·리다이렉트 없이 200.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok", releaseId: process.env.RELEASE_ID ?? "dev" });
}
