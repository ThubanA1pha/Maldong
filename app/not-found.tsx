// [공통] 없는 주소(404). 영어 기본 화면 대신 솜이가 안내하고, 로그인했으면 홈, 아니면 첫 화면으로 보낸다.
import Link from "next/link";
import { Character } from "@/components/Character";
import { currentUserId } from "@/lib/auth";
import { NOT_FOUND } from "@/lib/copy";

export default async function NotFound() {
  const signedIn = Boolean(await currentUserId());
  return (
    <main className="stack" style={{ minHeight: "100dvh", justifyContent: "center", alignItems: "center", padding: "24px 16px", gap: 24 }}>
      <Character band="mid" line={NOT_FOUND.line} size={120} />
      <Link className="btn primary" href={signedIn ? "/home" : "/"} style={{ width: "100%", maxWidth: 358 }}>
        {signedIn ? NOT_FOUND.home : NOT_FOUND.start}
      </Link>
    </main>
  );
}
