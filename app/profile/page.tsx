// 담당: ④ 프로필 (F1·F6 · S1, S7). 하단 내비, 뒤로 가기, 로그아웃.
import { BottomNav } from "@/components/BottomNav";
import { TopBar } from "@/components/Scene";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/service";
import s from "../auth.module.css";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function Profile({ searchParams }: { searchParams: Promise<{ first?: string }> }) {
  const userId = await requireUser();
  const { first } = await searchParams;
  return (
    <main className={`${s.page} ${s.withNav}`}>
      <TopBar title="프로필" back="/home" />
      <ProfileForm initial={await getProfile(userId)} first={first === "1"} />
      <BottomNav active="profile" />
    </main>
  );
}
