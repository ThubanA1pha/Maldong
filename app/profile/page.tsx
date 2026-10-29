// [역산 초안] 이 화면은 docs/scenarios.yaml(S1~S7)에서 거꾸로 뽑은 최소 버전이다. 디자인 프레임이 나오면 프레임이 기준이다.
// 고정 문구(lib/copy.ts)와 버튼 이동은 바꾸지 않는다. 배치·디자인·상태 화면은 담당이 새로 만든다.
// 담당: ④ 프로필 (F1·F6 · S1, S7)
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/service";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function Profile() {
  const userId = await requireUser();
  return (
    <main className="screen">
      <h1 className="title">프로필</h1>
      <ProfileForm initial={await getProfile(userId)} />
    </main>
  );
}
