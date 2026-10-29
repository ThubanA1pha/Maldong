"use client";
// [공통] 화면에서 예상하지 못한 오류가 났을 때. Next.js 기본 화면 대신 솜이 말풍선으로 알리고 다시 해 볼 수 있게 한다(내부 오류 내용은 보이지 않는다).
import { ErrorNotice } from "@/components/ErrorNotice";
import { ERROR_SAY } from "@/lib/copy";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="stack" style={{ minHeight: "100dvh", justifyContent: "center", padding: "24px 16px" }}>
      <ErrorNotice message={ERROR_SAY.general} onRetry={reset} />
    </main>
  );
}
