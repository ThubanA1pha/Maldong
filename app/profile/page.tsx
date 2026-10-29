// 담당: ④ 프로필 (F1·F6 · S1, S7). 하단 내비, 뒤로 가기, 로그아웃.
import { BottomNav } from "@/components/BottomNav";
import { TopBar } from "@/components/Scene";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/service";
import s from "../auth.module.css";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function Profile() {
  const userId = await requireUser();
  return (
    <main className={`${s.page} ${s.withNav}`}>
      <TopBar title="프로필" back="/home" />
      <ProfileForm initial={await getProfile(userId)} />
      <BottomNav active="profile" />
    </main>
  );
}
